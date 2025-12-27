import type { 
  Room, Player, TeamId, Word, Round, GameSettings, Contribution 
} from '../shared.js';
import { DEFAULT_SETTINGS, GAME_CONFIG } from '../shared.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();
  private roundTimers: Map<string, NodeJS.Timeout> = new Map();

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = Array.from({ length: GAME_CONFIG.ROOM_CODE_LENGTH }, 
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostId: string, hostName: string): Room {
    const code = this.generateRoomCode();
    
    const host: Player = {
      id: hostId,
      name: hostName,
      isHost: true,
      isConnected: true,
    };

    const room: Room = {
      code,
      hostId,
      status: 'waiting',
      teams: {
        red: { id: 'red', name: 'Red Team', players: [], score: 0, describerIndex: 0 },
        blue: { id: 'blue', name: 'Blue Team', players: [], score: 0, describerIndex: 0 },
      },
      unassignedPlayers: [host],
      currentRound: null,
      roundHistory: [],
      settings: { ...DEFAULT_SETTINGS },
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.playerRooms.set(hostId, code);
    
    return room;
  }

  joinRoom(roomCode: string, playerId: string, playerName: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;
    if (room.status !== 'waiting') return null;

    const totalPlayers = this.getPlayerCount(room);
    if (totalPlayers >= GAME_CONFIG.MAX_PLAYERS_PER_ROOM) return null;

    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isConnected: true,
    };

    room.unassignedPlayers.push(player);
    this.playerRooms.set(playerId, roomCode);
    
    return room;
  }

  joinTeam(roomCode: string, playerId: string, teamId: TeamId): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = this.removePlayerFromAllLocations(room, playerId);
    if (!player) return null;

    room.teams[teamId].players.push(player);
    
    return room;
  }

  leaveTeam(roomCode: string, playerId: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = this.removePlayerFromAllLocations(room, playerId);
    if (!player) return null;

    room.unassignedPlayers.push(player);
    
    return room;
  }

  removePlayer(roomCode: string, playerId: string): { room: Room | null; newHostId?: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { room: null };

    this.removePlayerFromAllLocations(room, playerId);
    this.playerRooms.delete(playerId);

    let newHostId: string | undefined;
    if (room.hostId === playerId) {
      const allPlayers = this.getAllPlayers(room);
      if (allPlayers.length > 0) {
        newHostId = allPlayers[0].id;
        allPlayers[0].isHost = true;
        room.hostId = newHostId;
      }
    }

    if (this.getPlayerCount(room) === 0) {
      this.deleteRoom(roomCode);
      return { room: null };
    }

    return { room, newHostId };
  }

  canStartGame(room: Room): { canStart: boolean; reason?: string } {
    const redCount = room.teams.red.players.length;
    const blueCount = room.teams.blue.players.length;

    if (redCount < GAME_CONFIG.MIN_PLAYERS_PER_TEAM) {
      return { canStart: false, reason: `Red team needs at least ${GAME_CONFIG.MIN_PLAYERS_PER_TEAM} players` };
    }
    if (blueCount < GAME_CONFIG.MIN_PLAYERS_PER_TEAM) {
      return { canStart: false, reason: `Blue team needs at least ${GAME_CONFIG.MIN_PLAYERS_PER_TEAM} players` };
    }

    return { canStart: true };
  }

  startGame(roomCode: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const { canStart } = this.canStartGame(room);
    if (!canStart) return null;

    room.status = 'playing';
    room.teams.red.describerIndex = 0;
    room.teams.blue.describerIndex = 0;

    return room;
  }

  startRound(roomCode: string, words: Word[]): Round | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const roundNumber = room.roundHistory.length + 1;
    const teamId = this.getTeamForRound(roundNumber, room.settings.startingTeam);
    const team = room.teams[teamId];
    const describer = team.players[team.describerIndex];

    if (!describer) return null;

    const round: Round = {
      number: roundNumber,
      teamId,
      describerId: describer.id,
      describerName: describer.name,
      words: words.map(w => ({ ...w, guessedBy: undefined, guessedAt: undefined })),
      contributions: [],
      roundScore: 0,
      startedAt: Date.now(),
      endsAt: Date.now() + (room.settings.roundDurationSeconds * 1000),
    };

    room.currentRound = round;
    
    return round;
  }

  processGuess(roomCode: string, playerId: string, playerName: string, guess: string): {
    correct: boolean;
    word?: Word;
    alreadyGuessed?: boolean;
  } {
    const room = this.rooms.get(roomCode);
    if (!room || !room.currentRound) {
      return { correct: false };
    }

    const normalizedGuess = this.normalizeWord(guess);
    
    const word = room.currentRound.words.find(w => 
      this.normalizeWord(w.text) === normalizedGuess && !w.guessedBy
    );

    if (!word) {
      const alreadyGuessed = room.currentRound.words.some(w =>
        this.normalizeWord(w.text) === normalizedGuess && w.guessedBy
      );
      return { correct: false, alreadyGuessed };
    }

    word.guessedBy = playerId;
    word.guessedAt = Date.now();

    this.updateContributions(room.currentRound, playerId, playerName, word);
    room.currentRound.roundScore += word.points;

    return { correct: true, word };
  }

  addWordsToRound(roomCode: string, words: Word[]): Word[] {
    const room = this.rooms.get(roomCode);
    if (!room || !room.currentRound) return [];

    // Add new words to the round
    room.currentRound.words.push(...words);
    return words;
  }

  endRound(roomCode: string): { round: Round; isGameOver: boolean } | null {
    const room = this.rooms.get(roomCode);
    if (!room || !room.currentRound) return null;

    const round = room.currentRound;
    
    room.teams[round.teamId].score += round.roundScore;

    const team = room.teams[round.teamId];
    team.describerIndex = (team.describerIndex + 1) % team.players.length;

    room.roundHistory.push(round);
    room.currentRound = null;

    const isGameOver = room.roundHistory.length >= GAME_CONFIG.TOTAL_ROUNDS;
    
    if (isGameOver) {
      room.status = 'finished';
    } else {
      room.status = 'round-end';
    }

    return { round, isGameOver };
  }

  getNextRoundInfo(room: Room): { teamId: TeamId; describer: Player } | null {
    const nextRoundNumber = room.roundHistory.length + 1;
    if (nextRoundNumber > GAME_CONFIG.TOTAL_ROUNDS) return null;

    const teamId = this.getTeamForRound(nextRoundNumber, room.settings.startingTeam);
    const team = room.teams[teamId];
    const describer = team.players[team.describerIndex];

    if (!describer) return null;

    return { teamId, describer };
  }

  private normalizeWord(word: string): string {
    return word.toLowerCase().replace(/\s+/g, '').trim();
  }

  private getTeamForRound(roundNumber: number, startingTeam: TeamId): TeamId {
    const isStartingTeamTurn = roundNumber % 2 === 1;
    return isStartingTeamTurn ? startingTeam : (startingTeam === 'red' ? 'blue' : 'red');
  }

  private updateContributions(round: Round, playerId: string, playerName: string, word: Word) {
    let contribution = round.contributions.find(c => c.playerId === playerId);
    
    if (!contribution) {
      contribution = {
        playerId,
        playerName,
        words: [],
        totalPoints: 0,
      };
      round.contributions.push(contribution);
    }

    contribution.words.push({ text: word.text, points: word.points });
    contribution.totalPoints += word.points;
  }

  private removePlayerFromAllLocations(room: Room, playerId: string): Player | null {
    const unassignedIndex = room.unassignedPlayers.findIndex(p => p.id === playerId);
    if (unassignedIndex !== -1) {
      return room.unassignedPlayers.splice(unassignedIndex, 1)[0];
    }

    for (const team of [room.teams.red, room.teams.blue]) {
      const index = team.players.findIndex(p => p.id === playerId);
      if (index !== -1) {
        return team.players.splice(index, 1)[0];
      }
    }

    return null;
  }

  private getAllPlayers(room: Room): Player[] {
    return [
      ...room.unassignedPlayers,
      ...room.teams.red.players,
      ...room.teams.blue.players,
    ];
  }

  private getPlayerCount(room: Room): number {
    return this.getAllPlayers(room).length;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getRoomByPlayerId(playerId: string): Room | undefined {
    const roomCode = this.playerRooms.get(playerId);
    return roomCode ? this.rooms.get(roomCode) : undefined;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  deleteRoom(code: string) {
    const room = this.rooms.get(code);
    if (room) {
      this.getAllPlayers(room).forEach(p => this.playerRooms.delete(p.id));
      this.rooms.delete(code);
      this.clearRoundTimer(code);
    }
  }

  setRoundTimer(roomCode: string, callback: () => void, duration: number) {
    this.clearRoundTimer(roomCode);
    const timer = setTimeout(callback, duration);
    this.roundTimers.set(roomCode, timer);
  }

  clearRoundTimer(roomCode: string) {
    const timer = this.roundTimers.get(roomCode);
    if (timer) {
      clearTimeout(timer);
      this.roundTimers.delete(roomCode);
    }
  }
}
