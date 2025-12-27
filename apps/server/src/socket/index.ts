import { Server, Socket } from 'socket.io';
import { RoomManager } from '../game/RoomManager.js';
import { WordManager } from '../game/WordManager.js';
import { 
  CLIENT_EVENTS, SERVER_EVENTS, ERROR_CODES, GAME_CONFIG,
  CreateRoomPayload, JoinRoomPayload, JoinTeamPayload, 
  SubmitGuessPayload, RoundStartingPayload 
} from '../shared.js';

export function setupSocketHandlers(
  io: Server,
  roomManager: RoomManager,
  wordManager: WordManager
) {
  const socketToPlayer = new Map<string, { id: string; roomCode: string }>();
  const roomTimers = new Map<string, NodeJS.Timeout>(); // Track timer intervals per room

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Create Room
    socket.on(CLIENT_EVENTS.ROOM_CREATE, async (payload: CreateRoomPayload) => {
      const { playerName } = payload;

      if (!playerName || playerName.trim().length < 2) {
        socket.emit(SERVER_EVENTS.ERROR, {
          code: ERROR_CODES.INVALID_NAME,
          message: 'Name must be at least 2 characters',
        });
        return;
      }

      const playerId = socket.id;
      const room = roomManager.createRoom(playerId, playerName.trim());

      socketToPlayer.set(socket.id, { id: playerId, roomCode: room.code });
      socket.join(room.code);

      socket.emit(SERVER_EVENTS.ROOM_CREATED, {
        roomCode: room.code,
        playerId,
      });

      socket.emit(SERVER_EVENTS.ROOM_STATE, { room });

      console.log(`🏠 Room ${room.code} created by ${playerName}`);
    });

    // Join Room
    socket.on(CLIENT_EVENTS.ROOM_JOIN, async (payload: JoinRoomPayload) => {
      const { roomCode, playerName } = payload;

      if (!playerName || playerName.trim().length < 2) {
        socket.emit(SERVER_EVENTS.ERROR, {
          code: ERROR_CODES.INVALID_NAME,
          message: 'Name must be at least 2 characters',
        });
        return;
      }

      const playerId = socket.id;
      const room = roomManager.joinRoom(roomCode, playerId, playerName.trim());

      if (!room) {
        const existingRoom = roomManager.getRoom(roomCode);
        let errorCode = ERROR_CODES.ROOM_NOT_FOUND;
        let message = 'Room not found';

        if (existingRoom) {
          if (existingRoom.status !== 'waiting') {
            errorCode = ERROR_CODES.GAME_ALREADY_STARTED;
            message = 'Game has already started';
          } else {
            errorCode = ERROR_CODES.ROOM_FULL;
            message = 'Room is full';
          }
        }

        socket.emit(SERVER_EVENTS.ERROR, { code: errorCode, message });
        return;
      }

      socketToPlayer.set(socket.id, { id: playerId, roomCode: room.code });
      socket.join(room.code);

      socket.emit(SERVER_EVENTS.ROOM_JOINED, { room, playerId });

      const newPlayer = room.unassignedPlayers.find(p => p.id === playerId);
      socket.to(room.code).emit(SERVER_EVENTS.ROOM_PLAYER_JOINED, { 
        player: newPlayer 
      });

      console.log(`👤 ${playerName} joined room ${room.code}`);
    });

    // Leave Room
    socket.on(CLIENT_EVENTS.ROOM_LEAVE, () => {
      handlePlayerLeave(socket);
    });

    // Join Team
    socket.on(CLIENT_EVENTS.TEAM_JOIN, (payload: JoinTeamPayload) => {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const room = roomManager.joinTeam(playerInfo.roomCode, playerInfo.id, payload.teamId);
      if (!room) return;

      io.to(room.code).emit(SERVER_EVENTS.TEAM_UPDATED, {
        teams: room.teams,
        unassignedPlayers: room.unassignedPlayers,
      });
    });

    // Leave Team
    socket.on(CLIENT_EVENTS.TEAM_LEAVE, () => {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const room = roomManager.leaveTeam(playerInfo.roomCode, playerInfo.id);
      if (!room) return;

      io.to(room.code).emit(SERVER_EVENTS.TEAM_UPDATED, {
        teams: room.teams,
        unassignedPlayers: room.unassignedPlayers,
      });
    });

    // Start Game
    socket.on(CLIENT_EVENTS.GAME_START, async () => {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const room = roomManager.getRoom(playerInfo.roomCode);
      if (!room) return;

      if (room.hostId !== playerInfo.id) {
        socket.emit(SERVER_EVENTS.ERROR, {
          code: ERROR_CODES.NOT_HOST,
          message: 'Only the host can start the game',
        });
        return;
      }

      const { canStart, reason } = roomManager.canStartGame(room);
      if (!canStart) {
        socket.emit(SERVER_EVENTS.ERROR, {
          code: ERROR_CODES.NOT_ENOUGH_PLAYERS,
          message: reason,
        });
        return;
      }

      roomManager.startGame(playerInfo.roomCode);

      io.to(room.code).emit(SERVER_EVENTS.GAME_STARTING, {
        startsIn: GAME_CONFIG.GAME_START_COUNTDOWN,
      });

      // After countdown, show transition screen (don't auto-start)
      setTimeout(() => {
        const nextInfo = roomManager.getNextRoundInfo(room);
        if (nextInfo) {
          const roundStarting: RoundStartingPayload = {
            roundNumber: 1,
            teamId: nextInfo.teamId,
            describerName: nextInfo.describer.name,
            startsIn: 0, // Manual start
          };
          io.to(room.code).emit(SERVER_EVENTS.ROUND_STARTING, roundStarting);
        }
      }, GAME_CONFIG.GAME_START_COUNTDOWN * 1000);

      console.log(`🎮 Game starting in room ${room.code}`);
    });

    // Submit Guess
    socket.on(CLIENT_EVENTS.GUESS_SUBMIT, (payload: SubmitGuessPayload) => {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const room = roomManager.getRoom(playerInfo.roomCode);
      if (!room || !room.currentRound) return;

      const currentTeam = room.teams[room.currentRound.teamId];
      const isGuesser = currentTeam.players.some(p => 
        p.id === playerInfo.id && p.id !== room.currentRound!.describerId
      );

      if (!isGuesser) {
        return;
      }

      const player = currentTeam.players.find(p => p.id === playerInfo.id);
      if (!player) return;

      const result = roomManager.processGuess(
        playerInfo.roomCode,
        playerInfo.id,
        player.name,
        payload.guess
      );

      io.to(room.code).emit(SERVER_EVENTS.GUESS_RESULT, {
        playerId: playerInfo.id,
        playerName: player.name,
        guess: payload.guess,
        correct: result.correct,
        word: result.word,
        timestamp: Date.now(),
      });

      if (result.correct && result.word) {
        io.to(room.code).emit(SERVER_EVENTS.WORD_GUESSED, {
          word: result.word,
          guessedBy: playerInfo.id,
          guessedByName: player.name,
          newRoundScore: room.currentRound!.roundScore,
        });

        // Add new words when a word is guessed (keep ~10 words on screen)
        const currentWordCount = room.currentRound!.words.filter(w => !w.guessedBy).length;
        if (currentWordCount < 8) {
          // Add 2 new words when we have less than 8 words remaining
          wordManager.getAdditionalWords(room.code, 2).then(newWords => {
            if (newWords.length > 0) {
              const addedWords = roomManager.addWordsToRound(room.code, newWords);
              
              // Send new words to describer and all spectators
              const describerSocket = [...io.sockets.sockets.values()]
                .find(s => socketToPlayer.get(s.id)?.id === room.currentRound!.describerId);
              
              if (describerSocket) {
                describerSocket.emit(SERVER_EVENTS.WORDS_ADDED, { words: addedWords });
              }
              
              // Also send to all spectators (opposing team)
              io.to(room.code).emit(SERVER_EVENTS.WORDS_ADDED, { words: addedWords });
            }
          }).catch(err => {
            console.error('Error adding words:', err);
          });
        }
      }
    });

    // End Round Early (by describer)
    socket.on(CLIENT_EVENTS.ROUND_END_EARLY, () => {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const room = roomManager.getRoom(playerInfo.roomCode);
      if (!room || !room.currentRound) return;

      // Only the describer can end the round early
      if (room.currentRound.describerId !== playerInfo.id) {
        return;
      }

      // Clear the timer
      clearRoomTimer(playerInfo.roomCode);
      
      // End the round
      endCurrentRound(playerInfo.roomCode, false); // false = not automatic, manual end
    });

    // Start Next Round (after transition screen)
    socket.on(CLIENT_EVENTS.ROUND_START_NEXT, () => {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const room = roomManager.getRoom(playerInfo.roomCode);
      if (!room) return;

      // Only the describer of the next round can start it
      const nextInfo = roomManager.getNextRoundInfo(room);
      if (!nextInfo) return;

      if (nextInfo.describer.id !== playerInfo.id) {
        socket.emit(SERVER_EVENTS.ERROR, {
          code: ERROR_CODES.NOT_HOST,
          message: 'Only the describer can start the round',
        });
        return;
      }

      // Allow starting if:
      // 1. Round ended (normal flow)
      // 2. Game just started and no current round yet (round 1)
      // 3. Status is waiting (shouldn't happen but just in case)
      if (room.status === 'round-end' || room.status === 'waiting' || 
          (room.status === 'playing' && !room.currentRound)) {
        console.log(`🎮 Starting round ${room.roundHistory.length + 1} in room ${room.code}`);
        startNewRound(room.code);
      } else {
        console.log(`⚠️ Cannot start round: status=${room.status}, hasCurrentRound=${!!room.currentRound}`);
        socket.emit(SERVER_EVENTS.ERROR, {
          code: ERROR_CODES.GAME_ALREADY_STARTED,
          message: 'Round cannot be started at this time',
        });
      }
    });

    // Disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      handlePlayerLeave(socket);
    });

    // Helper Functions
    function handlePlayerLeave(socket: Socket) {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const { room, newHostId } = roomManager.removePlayer(
        playerInfo.roomCode,
        playerInfo.id
      );

      socketToPlayer.delete(socket.id);
      socket.leave(playerInfo.roomCode);

      if (room) {
        io.to(room.code).emit(SERVER_EVENTS.ROOM_PLAYER_LEFT, {
          playerId: playerInfo.id,
          newHostId,
        });

        io.to(room.code).emit(SERVER_EVENTS.TEAM_UPDATED, {
          teams: room.teams,
          unassignedPlayers: room.unassignedPlayers,
        });
      }
    }

    function clearRoomTimer(roomCode: string) {
      const existingTimer = roomTimers.get(roomCode);
      if (existingTimer) {
        clearInterval(existingTimer);
        roomTimers.delete(roomCode);
      }
      roomManager.clearRoundTimer(roomCode);
    }

    function startRoundTimer(roomCode: string, duration: number) {
      // Clear any existing timer for this room first
      clearRoomTimer(roomCode);

      let secondsLeft = duration;

      // Send initial timer value
      io.to(roomCode).emit(SERVER_EVENTS.TIMER_TICK, { secondsLeft });

      const timerInterval = setInterval(() => {
        secondsLeft--;

        io.to(roomCode).emit(SERVER_EVENTS.TIMER_TICK, { secondsLeft });

        if (secondsLeft <= 0) {
          clearRoomTimer(roomCode);
          endCurrentRound(roomCode);
        }
      }, 1000);

      // Store the interval so we can clear it later
      roomTimers.set(roomCode, timerInterval);

      // Also set a backup timeout in RoomManager
      roomManager.setRoundTimer(roomCode, () => {
        clearRoomTimer(roomCode);
      }, duration * 1000 + 1000);
    }

    async function startNewRound(roomCode: string) {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const nextInfo = roomManager.getNextRoundInfo(room);
      if (!nextInfo) return;

      // Clear any existing timer first
      clearRoomTimer(roomCode);

      try {
        const words = await wordManager.getWordsForRound(roomCode);
        const round = roomManager.startRound(roomCode, words);
        
        if (!round) return;

        // Calculate actual start time for the round
        const roundStartTime = Date.now();
        const roundEndTime = roundStartTime + (room.settings.roundDurationSeconds * 1000);

        io.to(roomCode).emit(SERVER_EVENTS.ROUND_STARTED, { 
          round: { ...round, words: [], startedAt: roundStartTime, endsAt: roundEndTime }
        });

        // Send words to describer and all spectators (opposing team)
        // Everyone in the room gets the words so spectators can see them
        io.to(roomCode).emit(SERVER_EVENTS.WORDS_ASSIGNED, { words });

        // Start timer from now (when round actually starts)
        startRoundTimer(roomCode, room.settings.roundDurationSeconds);

      } catch (error) {
        console.error('Error starting round:', error);
      }
    }

    function endCurrentRound(roomCode: string, autoStart: boolean = true) {
      const result = roomManager.endRound(roomCode);
      if (!result) return;

      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const nextInfo = roomManager.getNextRoundInfo(room);

      io.to(roomCode).emit(SERVER_EVENTS.ROUND_ENDED, {
        round: result.round,
        teamScores: {
          red: room.teams.red.score,
          blue: room.teams.blue.score,
        },
        nextRound: nextInfo ? {
          number: room.roundHistory.length + 1,
          teamId: nextInfo.teamId,
          describerName: nextInfo.describer.name,
        } : undefined,
      });

      if (result.isGameOver) {
        endGame(roomCode);
      } else if (autoStart) {
        // Auto-start after 3 seconds (timer expired)
        setTimeout(() => {
          startNewRound(roomCode);
        }, 3000);
      }
      // If autoStart is false, wait for manual "Start Next Round" button
    }

    function endGame(roomCode: string) {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const redScore = room.teams.red.score;
      const blueScore = room.teams.blue.score;
      const winner = redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'tie';

      const allContributions = room.roundHistory.flatMap(r => r.contributions);
      const playerTotals = new Map<string, { name: string; points: number }>();
      
      for (const contrib of allContributions) {
        const existing = playerTotals.get(contrib.playerId) || { name: contrib.playerName, points: 0 };
        existing.points += contrib.totalPoints;
        playerTotals.set(contrib.playerId, existing);
      }

      let mvp = { playerId: '', playerName: 'N/A', totalPoints: 0 };
      for (const [playerId, data] of playerTotals) {
        if (data.points > mvp.totalPoints) {
          mvp = { playerId, playerName: data.name, totalPoints: data.points };
        }
      }

      io.to(roomCode).emit(SERVER_EVENTS.GAME_ENDED, {
        winner,
        finalScores: { red: redScore, blue: blueScore },
        mvp,
        roundHistory: room.roundHistory,
      });

      wordManager.clearRoomWords(roomCode);
      
      console.log(`🏆 Game ended in room ${roomCode}. Winner: ${winner}`);
    }
  });
}
