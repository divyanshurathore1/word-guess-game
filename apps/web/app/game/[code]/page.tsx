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
import type { RoundStartingPayload, GameEndedPayload, RoundEndedPayload } from 'shared/events';

type GamePhase = 'transition' | 'playing' | 'round-end' | 'game-over';

export default function GamePage() {
  const params = useParams();
  const roomCode = params.code as string;
  
  const { 
    room, getMyRole,
    setWords, addWords, updateWord, clearWords,
    setCurrentRound, setTimeLeft,
    addGuess, clearGuesses, updateTeamScores
  } = useGameStore();

  const [phase, setPhase] = useState<GamePhase>('transition');
  const [transitionData, setTransitionData] = useState<RoundStartingPayload | null>(null);
  const [gameEndData, setGameEndData] = useState<GameEndedPayload | null>(null);
  // Store last round's score for transition screen
  const [lastRoundScore, setLastRoundScore] = useState<{ teamId: string; score: number } | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on(SERVER_EVENTS.ROUND_STARTING, (data: RoundStartingPayload) => {
      setTransitionData(data);
      setPhase('transition');
      // Don't clear data yet - wait until round actually starts
      setTimeLeft(0); // Clear timer during transition
    });

    socket.on(SERVER_EVENTS.ROUND_STARTED, (data) => {
      // Clear previous round data when new round starts
      clearGuesses();
      clearWords();
      setCurrentRound(data.round);
      setPhase('playing');
    });

    socket.on(SERVER_EVENTS.WORDS_ASSIGNED, (data) => {
      setWords(data.words);
    });

    socket.on(SERVER_EVENTS.WORDS_ADDED, (data) => {
      // Add new words to existing words (store handles deduplication)
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

    socket.on(SERVER_EVENTS.ROUND_ENDED, (data: RoundEndedPayload) => {
      // Store the round score for display on transition screen
      setLastRoundScore({
        teamId: data.round.teamId,
        score: data.round.roundScore
      });
      
      // Update team scores from server (this is the authoritative total including this round)
      updateTeamScores(data.teamScores.red, data.teamScores.blue);
      
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
  }, [addGuess, clearGuesses, clearWords, setCurrentRound, setTimeLeft, setWords, updateWord, updateTeamScores, addWords]);

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
    return <RoundTransition data={transitionData} room={room} lastRoundScore={lastRoundScore} />;
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
