// ============== PLAYER ==============
export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isConnected: boolean;
}

// ============== TEAM ==============
export type TeamId = 'red' | 'blue';

export interface Team {
  id: TeamId;
  name: string;
  players: Player[];
  score: number;
  describerIndex: number; // Which player is describing (rotates)
}

// ============== WORD ==============
export interface Word {
  id: string;
  text: string;
  points: number;
  guessedBy?: string; // Player ID who guessed it
  guessedAt?: number; // Timestamp
}

// ============== CONTRIBUTION ==============
export interface Contribution {
  playerId: string;
  playerName: string;
  words: {
    text: string;
    points: number;
  }[];
  totalPoints: number;
}

// ============== ROUND ==============
export interface Round {
  number: number; // 1-12
  teamId: TeamId;
  describerId: string;
  describerName: string;
  words: Word[];
  contributions: Contribution[];
  roundScore: number;
  startedAt: number;
  endsAt: number;
}

// ============== ROOM ==============
export type RoomStatus = 'waiting' | 'playing' | 'round-end' | 'finished';

export interface Room {
  code: string;
  hostId: string;
  status: RoomStatus;
  teams: {
    red: Team;
    blue: Team;
  };
  unassignedPlayers: Player[];
  currentRound: Round | null;
  roundHistory: Round[];
  settings: GameSettings;
  createdAt: number;
}

// ============== SETTINGS ==============
export interface GameSettings {
  roundDurationSeconds: number; // Default: 80
  totalRoundsPerTeam: number;   // Default: 6
  wordsPerRound: number;        // Default: 20
  startingTeam: TeamId;         // Default: 'red'
}

export const DEFAULT_SETTINGS: GameSettings = {
  roundDurationSeconds: 80,
  totalRoundsPerTeam: 6,
  wordsPerRound: 20,
  startingTeam: 'red',
};

// ============== GAME STATE (Client View) ==============
export type PlayerRole = 'describer' | 'guesser' | 'spectator';

export interface GameState {
  room: Room;
  myId: string;
  myRole: PlayerRole;
  myTeam: TeamId | null;
}

// ============== GUESS RESULT ==============
export interface GuessResult {
  playerId: string;
  playerName: string;
  guess: string;
  correct: boolean;
  word?: Word; // If correct, which word was matched
  timestamp: number;
}
