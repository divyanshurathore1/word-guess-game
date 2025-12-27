// ============================================
// SOCKET EVENT NAMES
// ============================================

// Client → Server Events
export const CLIENT_EVENTS = {
  // Room Management
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',

  // Lobby
  TEAM_JOIN: 'team:join',
  TEAM_LEAVE: 'team:leave',
  GAME_START: 'game:start',

  // Game Actions
  GUESS_SUBMIT: 'guess:submit',
  
  // Settings
  SETTINGS_UPDATE: 'settings:update',
  
  // Round Control
  ROUND_END_EARLY: 'round:end-early',
  ROUND_START_NEXT: 'round:start-next',
} as const;

// Server → Client Events
export const SERVER_EVENTS = {
  // Connection
  CONNECTED: 'connected',
  ERROR: 'error',

  // Room
  ROOM_CREATED: 'room:created',
  ROOM_JOINED: 'room:joined',
  ROOM_STATE: 'room:state',
  ROOM_PLAYER_JOINED: 'room:player-joined',
  ROOM_PLAYER_LEFT: 'room:player-left',
  ROOM_CLOSED: 'room:closed',

  // Lobby
  TEAM_UPDATED: 'team:updated',

  // Game Flow
  GAME_STARTING: 'game:starting',       // Countdown before game
  ROUND_STARTING: 'round:starting',     // Transition screen
  ROUND_STARTED: 'round:started',       // Round begins
  ROUND_ENDED: 'round:ended',           // Round time up
  GAME_ENDED: 'game:ended',             // All 12 rounds done

  // During Round
  TIMER_TICK: 'timer:tick',
  GUESS_RESULT: 'guess:result',
  WORD_GUESSED: 'word:guessed',         // Broadcast when word is guessed
  WORDS_ADDED: 'words:added',           // New words added during round
  
  // Words
  WORDS_ASSIGNED: 'words:assigned',     // Sent to describer and spectators
} as const;

// ============================================
// EVENT PAYLOADS
// ============================================

import type { 
  Room, Player, TeamId, Word, GuessResult, 
  GameSettings, Round, Contribution 
} from './types';

// Client → Server Payloads
export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface JoinTeamPayload {
  teamId: TeamId;
}

export interface SubmitGuessPayload {
  guess: string;
}

export interface UpdateSettingsPayload {
  settings: Partial<GameSettings>;
}

// Server → Client Payloads
export interface RoomCreatedPayload {
  roomCode: string;
  playerId: string;
}

export interface RoomJoinedPayload {
  room: Room;
  playerId: string;
}

export interface RoomStatePayload {
  room: Room;
}

export interface PlayerJoinedPayload {
  player: Player;
}

export interface PlayerLeftPayload {
  playerId: string;
  newHostId?: string;
}

export interface TeamUpdatedPayload {
  teams: Room['teams'];
  unassignedPlayers: Player[];
}

export interface RoundStartingPayload {
  roundNumber: number;
  teamId: TeamId;
  describerName: string;
  startsIn: number; // Countdown seconds
}

export interface RoundStartedPayload {
  round: Round;
}

export interface WordsAssignedPayload {
  words: Word[];
}

export interface TimerTickPayload {
  secondsLeft: number;
}

export interface GuessResultPayload extends GuessResult {}

export interface WordGuessedPayload {
  word: Word;
  guessedBy: string;
  guessedByName: string;
  newRoundScore: number;
}

export interface RoundEndedPayload {
  round: Round;
  teamScores: {
    red: number;
    blue: number;
  };
  nextRound?: {
    number: number;
    teamId: TeamId;
    describerName: string;
  };
}

export interface GameEndedPayload {
  winner: TeamId | 'tie';
  finalScores: {
    red: number;
    blue: number;
  };
  mvp: {
    playerId: string;
    playerName: string;
    totalPoints: number;
  };
  roundHistory: Round[];
}

export interface ErrorPayload {
  code: string;
  message: string;
}
