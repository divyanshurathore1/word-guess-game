'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/lib/store';
import { SERVER_EVENTS } from 'shared/events';
import DescriberView from '@/components/game/DescriberView';
import GuesserView from '@/components/game/GuesserView';
import SpectatorView from '@/components/game/SpectatorView';
import RoundTransition from '@/components/game/RoundTransition';
import GameOver from '@/components/game/GameOver';
import type { RoundStartingPayload, GameEndedPayload } from 'shared/events';

type GamePhase = 'transition' | 'playing' | 'round-end' | 'game-over';

export default function GamePage() {
  const params = useParams();
  const roomCode = params.code as string;
  
  const { 
    room, getMyRole,
    setWords, addWords, updateWord, setCurrentRound, setTimeLeft, 
    addGuess, clearGuesses 
  } = useGameStore();

  const [phase, setPhase] = useState<GamePhase>('transition');
  const [transitionData, setTransitionData] = useState<RoundStartingPayload | null>(null);
  const [gameEndData, setGameEndData] = useState<GameEndedPayload | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on(SERVER_EVENTS.ROUND_STARTING, (data: RoundStartingPayload) => {
      setTransitionData(data);
      setPhase('transition');
      clearGuesses();
      setTimeLeft(0); // Clear timer during transition
    });

    socket.on(SERVER_EVENTS.ROUND_STARTED, (data) => {
      setCurrentRound(data.round);
      // Timer will be set by TIMER_TICK event from server
      setPhase('playing');
    });

    socket.on(SERVER_EVENTS.WORDS_ASSIGNED, (data) => {
      setWords(data.words);
    });

    socket.on(SERVER_EVENTS.WORDS_ADDED, (data) => {
      // Add new words to existing words
      addWords(data.words);
    });

    socket.on(SERVER_EVENTS.TIMER_TICK, (data) => {
      setTimeLeft(data.secondsLeft);
    });

    socket.on(SERVER_EVENTS.GUESS_RESULT, (data) => {
      addGuess(data);
    });

    socket.on(SERVER_EVENTS.WORD_GUESSED, (data) => {
      updateWord(data.word);
    });

    socket.on(SERVER_EVENTS.ROUND_ENDED, (data) => {
      // Show transition screen for next round
      if (data.nextRound) {
        setTransitionData({
          roundNumber: data.nextRound.number,
          teamId: data.nextRound.teamId,
          describerName: data.nextRound.describerName,
          startsIn: 0, // Manual start now
        });
        setPhase('transition');
      } else {
        setPhase('round-end');
      }
    });

    socket.on(SERVER_EVENTS.GAME_ENDED, (data: GameEndedPayload) => {
      setGameEndData(data);
      setPhase('game-over');
    });

    return () => {
      socket.off(SERVER_EVENTS.ROUND_STARTING);
      socket.off(SERVER_EVENTS.ROUND_STARTED);
      socket.off(SERVER_EVENTS.WORDS_ASSIGNED);
      socket.off(SERVER_EVENTS.WORDS_ADDED);
      socket.off(SERVER_EVENTS.TIMER_TICK);
      socket.off(SERVER_EVENTS.GUESS_RESULT);
      socket.off(SERVER_EVENTS.WORD_GUESSED);
      socket.off(SERVER_EVENTS.ROUND_ENDED);
      socket.off(SERVER_EVENTS.GAME_ENDED);
    };
  }, [addGuess, clearGuesses, setCurrentRound, setTimeLeft, setWords, updateWord]);

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (phase === 'game-over' && gameEndData) {
    return <GameOver data={gameEndData} room={room} />;
  }

  if (phase === 'transition' && transitionData) {
    return <RoundTransition data={transitionData} room={room} />;
  }

  const role = getMyRole();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {role === 'describer' && <DescriberView />}
      {role === 'guesser' && <GuesserView />}
      {role === 'spectator' && <SpectatorView />}
    </main>
  );
}
