import { PrismaClient, Difficulty } from '@prisma/client';
import type { Word } from '../shared.js';
import { WORD_DISTRIBUTION, GAME_CONFIG } from '../shared.js';

const prisma = new PrismaClient();

interface DBWord {
  id: string;
  text: string;
  points: number;
  difficulty: Difficulty;
}

export class WordManager {
  private wordCache: Map<string, DBWord[]> = new Map();
  private usedWordsPerRoom: Map<string, Set<string>> = new Map();
  // Also track by word TEXT to prevent duplicates even with different IDs
  private usedWordTextsPerRoom: Map<string, Set<string>> = new Map();

  async loadWordPack(packId?: string): Promise<void> {
    const where = packId ? { packId } : {};
    
    const words = await prisma.word.findMany({
      where: {
        ...where,
        pack: { isActive: true },
      },
      select: {
        id: true,
        text: true,
        points: true,
        difficulty: true,
      },
    });

    // Deduplicate words by text (case-insensitive) - keep only first occurrence
    const seenTexts = new Set<string>();
    const uniqueWords: DBWord[] = [];
    
    for (const word of words) {
      const normalizedText = word.text.toLowerCase().trim();
      if (!seenTexts.has(normalizedText)) {
        seenTexts.add(normalizedText);
        uniqueWords.push(word);
      }
    }

    const grouped = new Map<string, DBWord[]>();
    for (const word of uniqueWords) {
      const key = packId || 'all';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(word);
    }

    for (const [key, wordList] of grouped) {
      this.wordCache.set(key, wordList);
    }
    
    console.log(`📚 Loaded ${uniqueWords.length} unique words`);
  }

  async getWordsForRound(roomCode: string, count: number = GAME_CONFIG.WORDS_PER_ROUND): Promise<Word[]> {
    if (this.wordCache.size === 0) {
      await this.loadWordPack();
    }

    const allWords = this.wordCache.get('all') || [];
    if (allWords.length === 0) {
      throw new Error('No words available in database');
    }

    // Initialize tracking sets for this room
    if (!this.usedWordsPerRoom.has(roomCode)) {
      this.usedWordsPerRoom.set(roomCode, new Set());
    }
    if (!this.usedWordTextsPerRoom.has(roomCode)) {
      this.usedWordTextsPerRoom.set(roomCode, new Set());
    }
    
    const usedWordIds = this.usedWordsPerRoom.get(roomCode)!;
    const usedWordTexts = this.usedWordTextsPerRoom.get(roomCode)!;

    // Filter out already used words (by ID and by text)
    const availableWords = allWords.filter(w => 
      !usedWordIds.has(w.id) && 
      !usedWordTexts.has(w.text.toLowerCase().trim())
    );

    // If not enough words available, we've used them all - this shouldn't happen with 200+ words for 12 rounds of 20
    if (availableWords.length < count) {
      console.warn(`⚠️ Running low on words for room ${roomCode}. Available: ${availableWords.length}, needed: ${count}`);
      // Don't reset - just use what we have
      if (availableWords.length === 0) {
        throw new Error('No more unique words available');
      }
    }

    const selectedWords: DBWord[] = [];
    const selectedTexts = new Set<string>(); // Track within this round too
    const wordsByDifficulty = this.groupByDifficulty(availableWords);

    const distribution = {
      EASY: WORD_DISTRIBUTION.EASY,
      MEDIUM: WORD_DISTRIBUTION.MEDIUM,
      HARD: WORD_DISTRIBUTION.HARD,
      EXPERT: WORD_DISTRIBUTION.EXPERT,
    };

    // Pick words by difficulty distribution
    for (const [difficulty, targetCount] of Object.entries(distribution)) {
      const available = (wordsByDifficulty.get(difficulty as Difficulty) || [])
        .filter(w => !selectedTexts.has(w.text.toLowerCase().trim()));
      const shuffled = this.shuffle([...available]);
      
      for (const word of shuffled) {
        if (selectedWords.length >= count) break;
        if (selectedTexts.has(word.text.toLowerCase().trim())) continue;
        
        selectedWords.push(word);
        selectedTexts.add(word.text.toLowerCase().trim());
        
        if (selectedWords.filter(w => 
          (wordsByDifficulty.get(difficulty as Difficulty) || []).includes(w)
        ).length >= targetCount) {
          break;
        }
      }
    }

    // Fill remaining slots if needed
    while (selectedWords.length < count && selectedWords.length < availableWords.length) {
      const remaining = availableWords.filter(w => 
        !selectedTexts.has(w.text.toLowerCase().trim())
      );
      if (remaining.length === 0) break;
      
      const randomWord = remaining[Math.floor(Math.random() * remaining.length)];
      selectedWords.push(randomWord);
      selectedTexts.add(randomWord.text.toLowerCase().trim());
    }

    // Shuffle final selection
    const finalWords = this.shuffle(selectedWords).slice(0, count);

    // Mark all selected words as used (by both ID and text)
    finalWords.forEach(w => {
      usedWordIds.add(w.id);
      usedWordTexts.add(w.text.toLowerCase().trim());
    });

    console.log(`🎯 Round words for ${roomCode}: ${finalWords.length} words selected, ${availableWords.length - finalWords.length} remaining`);

    return finalWords.map(w => ({
      id: w.id,
      text: w.text,
      points: w.points,
    }));
  }

  /**
   * Get additional words mid-round (for replenishing when words are guessed)
   */
  async getAdditionalWords(roomCode: string, count: number): Promise<Word[]> {
    if (this.wordCache.size === 0) {
      await this.loadWordPack();
    }

    const allWords = this.wordCache.get('all') || [];
    if (allWords.length === 0) {
      return [];
    }

    // Initialize tracking sets for this room if not exists
    if (!this.usedWordsPerRoom.has(roomCode)) {
      this.usedWordsPerRoom.set(roomCode, new Set());
    }
    if (!this.usedWordTextsPerRoom.has(roomCode)) {
      this.usedWordTextsPerRoom.set(roomCode, new Set());
    }
    
    const usedWordIds = this.usedWordsPerRoom.get(roomCode)!;
    const usedWordTexts = this.usedWordTextsPerRoom.get(roomCode)!;

    // Filter out already used words
    const availableWords = allWords.filter(w => 
      !usedWordIds.has(w.id) && 
      !usedWordTexts.has(w.text.toLowerCase().trim())
    );

    if (availableWords.length === 0) {
      console.warn(`⚠️ No more words available for room ${roomCode}`);
      return [];
    }

    // Shuffle and pick the requested count
    const shuffled = this.shuffle([...availableWords]);
    const selectedWords = shuffled.slice(0, Math.min(count, availableWords.length));

    // Mark selected words as used
    selectedWords.forEach(w => {
      usedWordIds.add(w.id);
      usedWordTexts.add(w.text.toLowerCase().trim());
    });

    console.log(`➕ Added ${selectedWords.length} words for ${roomCode}, ${availableWords.length - selectedWords.length} remaining`);

    return selectedWords.map(w => ({
      id: w.id,
      text: w.text,
      points: w.points,
    }));
  }

  clearRoomWords(roomCode: string): void {
    this.usedWordsPerRoom.delete(roomCode);
    this.usedWordTextsPerRoom.delete(roomCode);
    console.log(`🧹 Cleared word history for room ${roomCode}`);
  }

  private groupByDifficulty(words: DBWord[]): Map<Difficulty, DBWord[]> {
    const grouped = new Map<Difficulty, DBWord[]>();
    
    for (const word of words) {
      if (!grouped.has(word.difficulty)) {
        grouped.set(word.difficulty, []);
      }
      grouped.get(word.difficulty)!.push(word);
    }

    return grouped;
  }

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
