// ============================================
// GAME CONSTANTS
// ============================================

export const GAME_CONFIG = {
  // Room
  ROOM_CODE_LENGTH: 6,
  MAX_PLAYERS_PER_ROOM: 20,
  MIN_PLAYERS_PER_TEAM: 2,
  
  // Timing
  DEFAULT_ROUND_DURATION: 80,
  ROUND_TRANSITION_DURATION: 5, // Seconds between rounds
  GAME_START_COUNTDOWN: 3,
  
  // Game Structure
  ROUNDS_PER_TEAM: 6,
  TOTAL_ROUNDS: 12,
  WORDS_PER_ROUND: 10, // 8-10 words per round as per game design
  
  // Points
  MIN_WORD_POINTS: 5,
  MAX_WORD_POINTS: 60,
} as const;

// Point tiers based on word difficulty
export const POINT_TIERS = {
  EASY: { min: 5, max: 10 },      // Common words: "bad", "eye", "sea"
  MEDIUM: { min: 10, max: 20 },   // Moderate: "tokyo", "jordan", "brand"
  HARD: { min: 20, max: 35 },     // Harder: "snl", "babylon", "jack frost"
  EXPERT: { min: 35, max: 60 },   // Very hard: "limerence", "zeitgeist"
} as const;

// Word distribution per round (out of 10 words)
export const WORD_DISTRIBUTION = {
  EASY: 3,      // 3 easy words
  MEDIUM: 4,    // 4 medium words
  HARD: 2,      // 2 hard words
  EXPERT: 1,    // 1 expert word
} as const;

// Team colors for UI
export const TEAM_COLORS = {
  red: {
    primary: '#EF4444',
    secondary: '#FEE2E2',
    accent: '#DC2626',
    text: '#7F1D1D',
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#DBEAFE',
    accent: '#2563EB',
    text: '#1E3A8A',
  },
} as const;

// Error codes
export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
  NOT_ENOUGH_PLAYERS: 'NOT_ENOUGH_PLAYERS',
  NOT_HOST: 'NOT_HOST',
  INVALID_TEAM: 'INVALID_TEAM',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  ALREADY_IN_ROOM: 'ALREADY_IN_ROOM',
  INVALID_NAME: 'INVALID_NAME',
} as const;
