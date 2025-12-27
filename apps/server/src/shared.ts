// ============== TYPES ==============
export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isConnected: boolean;
}

export type TeamId = 'red' | 'blue';

export interface Team {
  id: TeamId;
  name: string;
  players: Player[];
  score: number;
  describerIndex: number;
}

export interface Word {
  id: string;
  text: string;
  points: number;
  guessedBy?: string;
  guessedAt?: number;
}

export interface Contribution {
  playerId: string;
  playerName: string;
  words: { text: string; points: number }[];
  totalPoints: number;
}

export interface Round {
  number: number;
  teamId: TeamId;
  describerId: string;
  describerName: string;
  words: Word[];
  contributions: Contribution[];
  roundScore: number;
  startedAt: number;
  endsAt: number;
}

export type RoomStatus = 'waiting' | 'playing' | 'round-end' | 'finished';

export interface Room {
  code: string;
  hostId: string;
  status: RoomStatus;
  teams: { red: Team; blue: Team };
  unassignedPlayers: Player[];
  currentRound: Round | null;
  roundHistory: Round[];
  settings: GameSettings;
  createdAt: number;
}

export interface GameSettings {
  roundDurationSeconds: number;
  totalRoundsPerTeam: number;
  wordsPerRound: number;
  startingTeam: TeamId;
}

export const DEFAULT_SETTINGS: GameSettings = {
  roundDurationSeconds: 80,
  totalRoundsPerTeam: 6,
  wordsPerRound: 10, // 8-10 words per round as per game design
  startingTeam: 'red',
};

export type PlayerRole = 'describer' | 'guesser' | 'spectator';

export interface GuessResult {
  playerId: string;
  playerName: string;
  guess: string;
  correct: boolean;
  word?: Word;
  timestamp: number;
}

// ============== EVENTS ==============
export const CLIENT_EVENTS = {
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  TEAM_JOIN: 'team:join',
  TEAM_LEAVE: 'team:leave',
  GAME_START: 'game:start',
  GUESS_SUBMIT: 'guess:submit',
  SETTINGS_UPDATE: 'settings:update',
  ROUND_END_EARLY: 'round:end-early',
  ROUND_START_NEXT: 'round:start-next',
} as const;

export const SERVER_EVENTS = {
  CONNECTED: 'connected',
  ERROR: 'error',
  ROOM_CREATED: 'room:created',
  ROOM_JOINED: 'room:joined',
  ROOM_STATE: 'room:state',
  ROOM_PLAYER_JOINED: 'room:player-joined',
  ROOM_PLAYER_LEFT: 'room:player-left',
  ROOM_CLOSED: 'room:closed',
  TEAM_UPDATED: 'team:updated',
  GAME_STARTING: 'game:starting',
  ROUND_STARTING: 'round:starting',
  ROUND_STARTED: 'round:started',
  ROUND_ENDED: 'round:ended',
  GAME_ENDED: 'game:ended',
  TIMER_TICK: 'timer:tick',
  GUESS_RESULT: 'guess:result',
  WORD_GUESSED: 'word:guessed',
  WORDS_ASSIGNED: 'words:assigned',
  WORDS_ADDED: 'words:added',
} as const;

// ============== CONSTANTS ==============
export const GAME_CONFIG = {
  ROOM_CODE_LENGTH: 6,
  MAX_PLAYERS_PER_ROOM: 20,
  MIN_PLAYERS_PER_TEAM: 2,
  DEFAULT_ROUND_DURATION: 80,
  ROUND_TRANSITION_DURATION: 5,
  GAME_START_COUNTDOWN: 3,
  ROUNDS_PER_TEAM: 6,
  TOTAL_ROUNDS: 12,
  WORDS_PER_ROUND: 10, // 8-10 words per round as per game design
} as const;

export const WORD_DISTRIBUTION = {
  EASY: 3,      // 3 easy words
  MEDIUM: 4,    // 4 medium words
  HARD: 2,      // 2 hard words
  EXPERT: 1,    // 1 expert word
} as const;

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

// ============== PAYLOADS ==============
export interface CreateRoomPayload { playerName: string; }
export interface JoinRoomPayload { roomCode: string; playerName: string; }
export interface JoinTeamPayload { teamId: TeamId; }
export interface SubmitGuessPayload { guess: string; }

export interface RoomCreatedPayload { roomCode: string; playerId: string; }
export interface RoomJoinedPayload { room: Room; playerId: string; }
export interface RoundStartingPayload { roundNumber: number; teamId: TeamId; describerName: string; startsIn: number; }
export interface GameEndedPayload { 
  winner: TeamId | 'tie'; 
  finalScores: { red: number; blue: number }; 
  mvp: { playerId: string; playerName: string; totalPoints: number }; 
  roundHistory: Round[]; 
}
export interface ErrorPayload { code: string; message: string; }
