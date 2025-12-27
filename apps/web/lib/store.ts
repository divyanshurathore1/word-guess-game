import { create } from 'zustand';
import type { Room, Player, TeamId, Word, Round, GuessResult, PlayerRole } from 'shared/types';

interface GameStore {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  playerId: string | null;
  playerName: string | null;
  setPlayer: (id: string, name: string) => void;

  room: Room | null;
  setRoom: (room: Room | null) => void;
  updateTeams: (teams: Room['teams'], unassigned: Player[]) => void;

  words: Word[];
  setWords: (words: Word[]) => void;
  addWords: (words: Word[]) => void;
  updateWord: (word: Word) => void;
  
  currentRound: Round | null;
  setCurrentRound: (round: Round | null) => void;
  
  timeLeft: number;
  setTimeLeft: (seconds: number) => void;

  guessHistory: GuessResult[];
  addGuess: (guess: GuessResult) => void;
  clearGuesses: () => void;

  getMyTeam: () => TeamId | null;
  getMyRole: () => PlayerRole;
  isHost: () => boolean;

  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  playerId: null,
  playerName: null,
  setPlayer: (id, name) => set({ playerId: id, playerName: name }),

  room: null,
  setRoom: (room) => set({ room }),
  updateTeams: (teams, unassigned) => set((state) => ({
    room: state.room ? { ...state.room, teams, unassignedPlayers: unassigned } : null
  })),

  words: [],
  setWords: (words) => set({ words }),
  addWords: (newWords) => set((state) => ({
    words: [...state.words, ...newWords]
  })),
  updateWord: (updatedWord) => set((state) => ({
    words: state.words.map(w => w.id === updatedWord.id ? updatedWord : w)
  })),

  currentRound: null,
  setCurrentRound: (round) => set({ currentRound: round }),

  timeLeft: 0,
  setTimeLeft: (seconds) => set({ timeLeft: seconds }),

  guessHistory: [],
  addGuess: (guess) => set((state) => ({
    guessHistory: [guess, ...state.guessHistory].slice(0, 50)
  })),
  clearGuesses: () => set({ guessHistory: [] }),

  getMyTeam: () => {
    const { room, playerId } = get();
    if (!room || !playerId) return null;

    if (room.teams.red.players.some(p => p.id === playerId)) return 'red';
    if (room.teams.blue.players.some(p => p.id === playerId)) return 'blue';
    return null;
  },

  getMyRole: () => {
    const { room, playerId, currentRound } = get();
    if (!room || !playerId) return 'spectator';

    const myTeam = get().getMyTeam();
    if (!myTeam) return 'spectator';

    if (!currentRound) return 'spectator';

    if (currentRound.teamId !== myTeam) return 'spectator';

    if (currentRound.describerId === playerId) return 'describer';

    return 'guesser';
  },

  isHost: () => {
    const { room, playerId } = get();
    return room?.hostId === playerId;
  },

  reset: () => set({
    room: null,
    words: [],
    currentRound: null,
    timeLeft: 0,
    guessHistory: [],
  }),
}));
