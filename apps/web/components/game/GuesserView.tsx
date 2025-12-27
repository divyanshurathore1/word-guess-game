'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import { CLIENT_EVENTS } from '../../../../packages/shared/src/events';
import { TEAM_COLORS } from '../../../../packages/shared/src/constants';
import Timer from './Timer';
import Contributions from './Contributions';
import clsx from 'clsx';
import { Send, Check, X } from 'lucide-react';

export default function GuesserView() {
  const { room, currentRound, timeLeft, guessHistory, playerId } = useGameStore();
  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!room || !currentRound) return null;

  const teamColor = TEAM_COLORS[currentRound.teamId];
  const describerName = currentRound.describerName;
  const currentTeam = room.teams[currentRound.teamId];

  // Round score from current guess history
  const roundScore = guessHistory
    .filter(g => g.correct && g.word)
    .reduce((sum, g) => sum + (g.word?.points || 0), 0);

  // Total team score (from previous rounds, not including current)
  const totalScore = currentTeam.score;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;

    const socket = getSocket();
    socket.emit(CLIENT_EVENTS.GUESS_SUBMIT, { guess: guess.trim() });
    setGuess('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <header className="max-w-2xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full font-bold text-white text-sm" style={{ backgroundColor: teamColor.primary }}>
              {currentRound.teamId.toUpperCase()} TEAM'S TURN
            </div>
            <span className="text-slate-400">Round {currentRound.number} of 12</span>
          </div>
          <Timer seconds={timeLeft} teamColor={teamColor.primary} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-8">
          <p className="text-slate-400 mb-2">🎯 Describing:</p>
          <h1 className="text-3xl font-bold text-white">{describerName}</h1>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your guess..."
              className="flex-1 px-4 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:border-blue-500"
              autoComplete="off"
              autoCapitalize="off"
            />
            <button type="submit" disabled={!guess.trim()} className="px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl transition-colors">
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
        </form>

        {/* Score Display - Round Score + Total Score */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm">This Round</p>
            <p className="text-3xl font-bold text-green-400">+{roundScore}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm">Total Score</p>
            <p className="text-3xl font-bold text-white">{totalScore + roundScore}</p>
          </div>
        </div>

        <div className="flex-1 bg-slate-800/50 rounded-xl p-4 overflow-y-auto">
          <h3 className="text-slate-400 text-sm mb-3">Recent Guesses:</h3>
          <div className="space-y-2">
            {guessHistory.map((g, i) => (
              <div key={i} className={clsx("flex items-center justify-between px-3 py-2 rounded-lg", g.correct ? "bg-green-900/30" : "bg-slate-700/50")}>
                <div className="flex items-center gap-2">
                  {g.correct ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
                  <span className="text-white">"{g.guess}"</span>
                  {g.correct && g.word && <span className="text-green-400 font-bold">+{g.word.points} pts</span>}
                </div>
                <span className={clsx("text-sm", g.playerId === playerId ? "text-blue-400" : "text-slate-400")}>
                  {g.playerId === playerId ? "You" : g.playerName}
                </span>
              </div>
            ))}
            {guessHistory.length === 0 && <p className="text-slate-500 text-center py-4">No guesses yet...</p>}
          </div>
        </div>

        <div className="mt-4">
          <Contributions round={currentRound} />
        </div>
      </div>
    </div>
  );
}
