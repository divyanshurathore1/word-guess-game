// ============================================
// SHARED TYPES FOR WORD GUESS GAME
// ============================================

// Player & Team Types
export type TeamColor = 'red' | 'blue';

export interface Player {
  id: string;
  name: string;
  team: TeamColor | null;
  isHost: boolean;
  isConnected: boolean;
}

// Word Types
export interface Word {
  id: string;
  text: string;
  points: number;
  guessedBy: string | null; // playerId who guessed it
  guessedAt: number | null; // timestamp
}

// Team State
export interface TeamState {
  players: Player[];
  score: number;
  describerIndex: number; // which player is describing (rotates)
  roundsPlayed: number;
}

// Room Status
export type RoomStatus = 'waiting' | 'playing' | 'round-end' | 'finished';

// Game State
export interface GameState {
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  teams: {
    red: TeamState;
    blue: TeamState;
  };
  currentTurn: TeamColor;
  currentRound: number; // 1-12
  totalRounds: number; // 12
  roundsPerTeam: number; // 6
  roundDuration: number; // 80 seconds
  roundTimeLeft: number;
  wordsOnScreen: Word[]; // 8 words visible
  roundScore: number; // points scored this round
  wordPoolIndex: number; // track which words have been used
}

// Guess Result
export interface GuessResult {
  playerId: string;
  playerName: string;
  guess: string;
  correct: boolean;
  points: number;
  wordId: string | null;
  timestamp: number;
}

// ============================================
// SOCKET EVENTS
// ============================================

// Client -> Server Events
export interface ClientToServerEvents {
  // Room Management
  'room:create': (data: { playerName: string }) => void;
  'room:join': (data: { roomCode: string; playerName: string }) => void;
  'room:leave': () => void;
  
  // Team Management
  'team:join': (data: { team: TeamColor }) => void;
  'team:leave': () => void;
  
  // Game Actions
  'game:start': () => void;
  'game:guess': (data: { guess: string }) => void;
  'game:ready-next-round': () => void;
}

// Server -> Client Events
export interface ServerToClientEvents {
  // Room Events
  'room:created': (data: { roomCode: string; gameState: GameState }) => void;
  'room:joined': (data: { gameState: GameState; playerId: string }) => void;
  'room:error': (data: { message: string }) => void;
  'room:player-joined': (data: { player: Player }) => void;
  'room:player-left': (data: { playerId: string }) => void;
  'room:state': (data: { gameState: GameState }) => void;
  
  // Team Events
  'team:updated': (data: { teams: GameState['teams'] }) => void;
  
  // Game Events
  'game:started': (data: { gameState: GameState }) => void;
  'game:round-started': (data: { gameState: GameState }) => void;
  'game:timer-tick': (data: { timeLeft: number }) => void;
  'game:guess-result': (data: GuessResult) => void;
  'game:word-guessed': (data: { wordId: string; guessedBy: string; newWord: Word }) => void;
  'game:words-updated': (data: { words: Word[] }) => void;
  'game:round-ended': (data: { gameState: GameState; roundSummary: RoundSummary }) => void;
  'game:finished': (data: { gameState: GameState; winner: TeamColor | 'tie' }) => void;
}

// Round Summary
export interface RoundSummary {
  team: TeamColor;
  describer: string;
  roundNumber: number;
  wordsGuessed: number;
  pointsScored: number;
  guesses: GuessResult[];
}

// ============================================
// UTILITY TYPES
// ============================================

export interface RoomInfo {
  code: string;
  playerCount: number;
  status: RoomStatus;
}

// View type for rendering different screens
export type PlayerView = 'describer' | 'guesser' | 'spectator';

export function getPlayerView(
  gameState: GameState,
  playerId: string
): PlayerView {
  const player = findPlayer(gameState, playerId);
  if (!player || !player.team) return 'spectator';
  
  const currentTeam = gameState.currentTurn;
  const team = gameState.teams[player.team];
  
  // If not the playing team, they're spectators
  if (player.team !== currentTeam) return 'spectator';
  
  // If this player is the current describer
  const describerIndex = team.describerIndex % team.players.length;
  const describer = team.players[describerIndex];
  
  if (describer && describer.id === playerId) return 'describer';
  
  return 'guesser';
}

export function findPlayer(
  gameState: GameState,
  playerId: string
): Player | undefined {
  const redPlayer = gameState.teams.red.players.find(p => p.id === playerId);
  if (redPlayer) return redPlayer;
  return gameState.teams.blue.players.find(p => p.id === playerId);
}

export function getCurrentDescriber(gameState: GameState): Player | null {
  const team = gameState.teams[gameState.currentTurn];
  if (team.players.length === 0) return null;
  const describerIndex = team.describerIndex % team.players.length;
  return team.players[describerIndex] || null;
}
