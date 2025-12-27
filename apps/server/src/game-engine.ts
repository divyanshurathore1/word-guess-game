// ============================================
// GAME ENGINE - Core game logic
// ============================================

import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  TeamColor,
  Player,
  Word,
  GuessResult,
  RoundSummary,
} from '../../packages/shared/types';
import { getShuffledWordPool, WordEntry } from './words';

// Generate 6-character room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create initial game state
export function createGameState(roomCode: string, hostId: string): GameState {
  return {
    roomCode,
    hostId,
    status: 'waiting',
    teams: {
      red: { players: [], score: 0, describerIndex: 0, roundsPlayed: 0 },
      blue: { players: [], score: 0, describerIndex: 0, roundsPlayed: 0 },
    },
    currentTurn: 'red',
    currentRound: 0,
    totalRounds: 12,
    roundsPerTeam: 6,
    roundDuration: 80,
    roundTimeLeft: 80,
    wordsOnScreen: [],
    roundScore: 0,
    wordPoolIndex: 0,
  };
}

// Create a player
export function createPlayer(id: string, name: string, isHost: boolean): Player {
  return {
    id,
    name,
    team: null,
    isHost,
    isConnected: true,
  };
}

// Add player to team
export function addPlayerToTeam(
  gameState: GameState,
  playerId: string,
  team: TeamColor
): GameState {
  const newState = { ...gameState };
  
  // Remove from current team if any
  newState.teams.red.players = newState.teams.red.players.filter(p => p.id !== playerId);
  newState.teams.blue.players = newState.teams.blue.players.filter(p => p.id !== playerId);
  
  // Find player from either team (they might have been on the other team)
  let player = [...gameState.teams.red.players, ...gameState.teams.blue.players]
    .find(p => p.id === playerId);
  
  if (player) {
    player = { ...player, team };
    newState.teams[team].players.push(player);
  }
  
  return newState;
}

// Room class to manage word pool per room
export class GameRoom {
  public state: GameState;
  private wordPool: WordEntry[];
  private roundGuesses: GuessResult[] = [];
  
  constructor(roomCode: string, hostId: string) {
    this.state = createGameState(roomCode, hostId);
    this.wordPool = getShuffledWordPool();
  }
  
  // Add player to room
  addPlayer(player: Player): void {
    // Check if player already exists
    const existsInRed = this.state.teams.red.players.some(p => p.id === player.id);
    const existsInBlue = this.state.teams.blue.players.some(p => p.id === player.id);
    
    if (!existsInRed && !existsInBlue) {
      // Add to no team initially - they'll pick
      // Store player temporarily - they need to join a team
      // For now, auto-assign to balance teams
    }
  }
  
  // Join team
  joinTeam(playerId: string, playerName: string, team: TeamColor): boolean {
    // Remove from other team if present
    this.state.teams.red.players = this.state.teams.red.players.filter(p => p.id !== playerId);
    this.state.teams.blue.players = this.state.teams.blue.players.filter(p => p.id !== playerId);
    
    // Check if game already started
    if (this.state.status !== 'waiting') {
      return false;
    }
    
    // Add to requested team
    const player: Player = {
      id: playerId,
      name: playerName,
      team,
      isHost: this.state.hostId === playerId,
      isConnected: true,
    };
    
    this.state.teams[team].players.push(player);
    return true;
  }
  
  // Leave team
  leaveTeam(playerId: string): void {
    this.state.teams.red.players = this.state.teams.red.players.filter(p => p.id !== playerId);
    this.state.teams.blue.players = this.state.teams.blue.players.filter(p => p.id !== playerId);
  }
  
  // Remove player completely
  removePlayer(playerId: string): void {
    this.leaveTeam(playerId);
    
    // If host left, assign new host
    if (this.state.hostId === playerId) {
      const allPlayers = [...this.state.teams.red.players, ...this.state.teams.blue.players];
      if (allPlayers.length > 0) {
        this.state.hostId = allPlayers[0].id;
        allPlayers[0].isHost = true;
      }
    }
  }
  
  // Check if game can start
  canStart(): { canStart: boolean; reason?: string } {
    const redCount = this.state.teams.red.players.length;
    const blueCount = this.state.teams.blue.players.length;
    
    if (redCount < 2) {
      return { canStart: false, reason: 'Red team needs at least 2 players' };
    }
    if (blueCount < 2) {
      return { canStart: false, reason: 'Blue team needs at least 2 players' };
    }
    
    return { canStart: true };
  }
  
  // Start the game
  startGame(): boolean {
    const check = this.canStart();
    if (!check.canStart) return false;
    
    this.state.status = 'playing';
    this.state.currentRound = 1;
    this.state.currentTurn = 'red'; // Red starts first
    this.state.roundTimeLeft = this.state.roundDuration;
    this.state.roundScore = 0;
    this.roundGuesses = [];
    
    // Load initial 8 words
    this.loadWords(8);
    
    return true;
  }
  
  // Load N words onto the screen
  private loadWords(count: number): void {
    const newWords: Word[] = [];
    
    for (let i = 0; i < count && this.state.wordPoolIndex < this.wordPool.length; i++) {
      const wordEntry = this.wordPool[this.state.wordPoolIndex];
      newWords.push({
        id: uuidv4(),
        text: wordEntry.text,
        points: wordEntry.points,
        guessedBy: null,
        guessedAt: null,
      });
      this.state.wordPoolIndex++;
    }
    
    this.state.wordsOnScreen = [...this.state.wordsOnScreen, ...newWords];
  }
  
  // Process a guess
  processGuess(playerId: string, playerName: string, guess: string): GuessResult {
    const normalizedGuess = guess.toLowerCase().trim();
    
    // Find matching word (exact match only)
    const matchedWord = this.state.wordsOnScreen.find(
      w => w.guessedBy === null && w.text.toLowerCase() === normalizedGuess
    );
    
    const result: GuessResult = {
      playerId,
      playerName,
      guess: guess.trim(),
      correct: !!matchedWord,
      points: matchedWord?.points || 0,
      wordId: matchedWord?.id || null,
      timestamp: Date.now(),
    };
    
    if (matchedWord) {
      // Mark word as guessed
      matchedWord.guessedBy = playerId;
      matchedWord.guessedAt = Date.now();
      
      // Add points to round score
      this.state.roundScore += matchedWord.points;
      
      // Add points to team score
      this.state.teams[this.state.currentTurn].score += matchedWord.points;
    }
    
    this.roundGuesses.push(result);
    return result;
  }
  
  // Get new word to replace guessed one
  getReplacementWord(): Word | null {
    if (this.state.wordPoolIndex >= this.wordPool.length) {
      // Reshuffle if we run out (unlikely in a normal game)
      this.wordPool = getShuffledWordPool();
      this.state.wordPoolIndex = 0;
    }
    
    const wordEntry = this.wordPool[this.state.wordPoolIndex];
    this.state.wordPoolIndex++;
    
    return {
      id: uuidv4(),
      text: wordEntry.text,
      points: wordEntry.points,
      guessedBy: null,
      guessedAt: null,
    };
  }
  
  // Replace guessed word with new one
  replaceGuessedWord(wordId: string): Word | null {
    const index = this.state.wordsOnScreen.findIndex(w => w.id === wordId);
    if (index === -1) return null;
    
    const newWord = this.getReplacementWord();
    if (newWord) {
      this.state.wordsOnScreen[index] = newWord;
    }
    
    return newWord;
  }
  
  // Timer tick
  tick(): number {
    if (this.state.status !== 'playing') return this.state.roundTimeLeft;
    
    this.state.roundTimeLeft--;
    return this.state.roundTimeLeft;
  }
  
  // End current round
  endRound(): RoundSummary {
    const team = this.state.currentTurn;
    const teamState = this.state.teams[team];
    
    const describer = teamState.players[teamState.describerIndex % teamState.players.length];
    
    const summary: RoundSummary = {
      team,
      describer: describer?.name || 'Unknown',
      roundNumber: this.state.currentRound,
      wordsGuessed: this.state.wordsOnScreen.filter(w => w.guessedBy !== null).length,
      pointsScored: this.state.roundScore,
      guesses: [...this.roundGuesses],
    };
    
    // Update team state
    teamState.roundsPlayed++;
    teamState.describerIndex++;
    
    // Move to next round
    this.state.currentRound++;
    
    // Check if game is finished
    if (this.state.currentRound > this.state.totalRounds) {
      this.state.status = 'finished';
    } else {
      this.state.status = 'round-end';
    }
    
    return summary;
  }
  
  // Start next round
  startNextRound(): void {
    // Switch teams
    this.state.currentTurn = this.state.currentTurn === 'red' ? 'blue' : 'red';
    
    // Reset round state
    this.state.status = 'playing';
    this.state.roundTimeLeft = this.state.roundDuration;
    this.state.roundScore = 0;
    this.roundGuesses = [];
    
    // Clear and load new words
    this.state.wordsOnScreen = [];
    this.loadWords(8);
  }
  
  // Get winner
  getWinner(): TeamColor | 'tie' {
    const redScore = this.state.teams.red.score;
    const blueScore = this.state.teams.blue.score;
    
    if (redScore > blueScore) return 'red';
    if (blueScore > redScore) return 'blue';
    return 'tie';
  }
  
  // Get all players
  getAllPlayers(): Player[] {
    return [...this.state.teams.red.players, ...this.state.teams.blue.players];
  }
  
  // Find player
  findPlayer(playerId: string): Player | undefined {
    return this.getAllPlayers().find(p => p.id === playerId);
  }
  
  // Check if room is empty
  isEmpty(): boolean {
    return this.getAllPlayers().length === 0;
  }
  
  // Update player connection status
  setPlayerConnected(playerId: string, connected: boolean): void {
    const player = this.findPlayer(playerId);
    if (player) {
      player.isConnected = connected;
    }
  }
}
