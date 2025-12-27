// ============================================
// WORD DATABASE - Words with difficulty-based points
// ============================================

export interface WordEntry {
  text: string;
  points: number;
}

// Points based on difficulty:
// Easy (5-8 pts): Common words
// Medium (10-15 pts): Moderately difficult
// Hard (18-25 pts): Uncommon or complex words

export const WORD_DATABASE: WordEntry[] = [
  // Easy words (5-8 points)
  { text: "elephant", points: 6 },
  { text: "pizza", points: 5 },
  { text: "guitar", points: 6 },
  { text: "rainbow", points: 5 },
  { text: "banana", points: 5 },
  { text: "hospital", points: 6 },
  { text: "birthday", points: 5 },
  { text: "football", points: 5 },
  { text: "ice cream", points: 5 },
  { text: "umbrella", points: 6 },
  { text: "butterfly", points: 6 },
  { text: "telephone", points: 5 },
  { text: "helicopter", points: 7 },
  { text: "strawberry", points: 6 },
  { text: "sunglasses", points: 6 },
  { text: "chocolate", points: 5 },
  { text: "basketball", points: 5 },
  { text: "watermelon", points: 6 },
  { text: "christmas", points: 5 },
  { text: "sandwich", points: 5 },
  { text: "fireworks", points: 6 },
  { text: "dinosaur", points: 6 },
  { text: "keyboard", points: 6 },
  { text: "popcorn", points: 5 },
  { text: "pineapple", points: 6 },
  
  // Medium words (10-15 points)
  { text: "escalator", points: 12 },
  { text: "astronaut", points: 10 },
  { text: "gymnastics", points: 12 },
  { text: "avalanche", points: 14 },
  { text: "earthquake", points: 10 },
  { text: "submarine", points: 10 },
  { text: "parachute", points: 11 },
  { text: "quicksand", points: 13 },
  { text: "xylophone", points: 14 },
  { text: "binoculars", points: 12 },
  { text: "compass", points: 10 },
  { text: "hibernate", points: 13 },
  { text: "origami", points: 12 },
  { text: "symphony", points: 14 },
  { text: "eclipse", points: 12 },
  { text: "volcano", points: 10 },
  { text: "penguin", points: 8 },
  { text: "glacier", points: 12 },
  { text: "pyramid", points: 10 },
  { text: "tornado", points: 10 },
  { text: "microscope", points: 11 },
  { text: "lighthouse", points: 10 },
  { text: "chameleon", points: 13 },
  { text: "jellyfish", points: 10 },
  { text: "kaleidoscope", points: 15 },
  
  // Hard words (18-25 points)
  { text: "czechoslovakia", points: 22 },
  { text: "onomatopoeia", points: 25 },
  { text: "supercalifragilistic", points: 25 },
  { text: "pneumonia", points: 20 },
  { text: "archaeological", points: 22 },
  { text: "entrepreneur", points: 20 },
  { text: "metamorphosis", points: 20 },
  { text: "photosynthesis", points: 18 },
  { text: "ventriloquist", points: 22 },
  { text: "hieroglyphics", points: 23 },
  { text: "schizophrenia", points: 24 },
  { text: "worcestershire", points: 25 },
  { text: "antidisestablishmentarianism", points: 25 },
  { text: "otorhinolaryngologist", points: 25 },
  { text: "serendipity", points: 18 },
  { text: "surveillance", points: 18 },
  { text: "conscientious", points: 20 },
  { text: "bureaucracy", points: 18 },
  { text: "phenomenon", points: 18 },
  { text: "quarantine", points: 15 },
  { text: "camouflage", points: 15 },
  { text: "labyrinth", points: 18 },
  { text: "silhouette", points: 18 },
  { text: "millennium", points: 18 },
  { text: "catastrophe", points: 16 },
  
  // Country & Place names
  { text: "switzerland", points: 15 },
  { text: "madagascar", points: 14 },
  { text: "liechtenstein", points: 22 },
  { text: "kyrgyzstan", points: 24 },
  { text: "azerbaijan", points: 22 },
  { text: "mozambique", points: 18 },
  { text: "kazakhstan", points: 20 },
  { text: "uzbekistan", points: 20 },
  { text: "tajikistan", points: 22 },
  { text: "turkmenistan", points: 22 },
  
  // Food & Cuisine
  { text: "guacamole", points: 12 },
  { text: "cappuccino", points: 14 },
  { text: "croissant", points: 14 },
  { text: "bruschetta", points: 16 },
  { text: "ratatouille", points: 18 },
  { text: "prosciutto", points: 18 },
  { text: "tiramisu", points: 14 },
  { text: "chimichanga", points: 16 },
  { text: "quesadilla", points: 14 },
  { text: "fettuccine", points: 16 },
  
  // Animals
  { text: "hippopotamus", points: 14 },
  { text: "chimpanzee", points: 12 },
  { text: "orangutan", points: 14 },
  { text: "platypus", points: 12 },
  { text: "armadillo", points: 12 },
  { text: "chinchilla", points: 14 },
  { text: "salamander", points: 12 },
  { text: "porcupine", points: 10 },
  { text: "tarantula", points: 12 },
  { text: "rhinoceros", points: 14 },
  
  // Technology & Science
  { text: "algorithm", points: 14 },
  { text: "bluetooth", points: 10 },
  { text: "cryptocurrency", points: 16 },
  { text: "hologram", points: 12 },
  { text: "bandwidth", points: 14 },
  { text: "megapixel", points: 14 },
  { text: "encryption", points: 16 },
  { text: "nanotechnology", points: 18 },
  { text: "quantum", points: 14 },
  { text: "satellite", points: 10 },
  
  // Sports & Games
  { text: "badminton", points: 10 },
  { text: "trampoline", points: 10 },
  { text: "boomerang", points: 12 },
  { text: "skateboard", points: 8 },
  { text: "volleyball", points: 8 },
  { text: "surfboard", points: 10 },
  { text: "archery", points: 10 },
  { text: "marathon", points: 10 },
  { text: "bobsled", points: 14 },
  { text: "lacrosse", points: 14 },
  
  // Misc challenging words
  { text: "adrenaline", points: 14 },
  { text: "archaeology", points: 16 },
  { text: "bankruptcy", points: 14 },
  { text: "cemetery", points: 12 },
  { text: "democracy", points: 12 },
  { text: "eloquent", points: 16 },
  { text: "fascinate", points: 12 },
  { text: "gorgeous", points: 10 },
  { text: "hypnotize", points: 14 },
  { text: "ignorance", points: 12 },
  { text: "jealousy", points: 12 },
  { text: "knowledge", points: 10 },
  { text: "melancholy", points: 16 },
  { text: "nostalgia", points: 14 },
  { text: "oblivious", points: 14 },
  { text: "parallel", points: 12 },
  { text: "questionnaire", points: 18 },
  { text: "rhapsody", points: 16 },
  { text: "spectacular", points: 12 },
  { text: "tremendous", points: 12 },
];

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get shuffled word pool for a game
export function getShuffledWordPool(): WordEntry[] {
  return shuffleArray(WORD_DATABASE);
}
