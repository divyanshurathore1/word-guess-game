'use client';

import { useGameStore } from '@/lib/store';
import { TEAM_COLORS } from '../../../../packages/shared/src/constants';
import Timer from './Timer';
import clsx from 'clsx';
import { Eye, Check, X } from 'lucide-react';

export default function SpectatorView() {
  const { room, currentRound, timeLeft, guessHistory, getMyTeam } = useGameStore();

  if (!room || !currentRound) return null;

  const teamColor = TEAM_COLORS[currentRound.teamId];
  const myTeam = getMyTeam();
  const isMyTeamPlaying = currentRound.teamId === myTeam;
  const playingTeam = room.teams[currentRound.teamId];

  // Round score from guess history
  const roundScore = guessHistory
    .filter(g => g.correct && g.word)
    .reduce((sum, g) => sum + (g.word?.points || 0), 0);

  // Total score (previous rounds)
  const totalScore = playingTeam.score;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <header className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between">
          <div className="px-4 py-2 rounded-full font-bold text-white text-sm" style={{ backgroundColor: teamColor.primary }}>
            {currentRound.teamId.toUpperCase()} TEAM'S TURN
          </div>
          <Timer seconds={timeLeft} teamColor={teamColor.primary} />
        </div>
      </header>

      <div className="max-w-md w-full text-center">
        <div className="bg-slate-800/50 rounded-2xl p-8 mb-6">
          <Eye className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {isMyTeamPlaying ? "Your teammate is describing!" : "Opponent's turn"}
          </h1>
          <p className="text-slate-400 mb-4">{currentRound.describerName} is describing</p>
          
          {/* Score Display - Round Score + Total Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400 text-sm">This Round</p>
              <p className="text-2xl font-bold text-green-400">+{roundScore}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{totalScore + roundScore}</p>
            </div>
          </div>
        </div>

        {/* Both Team Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={clsx(
            "rounded-xl p-4 border",
            currentRound.teamId === 'red' ? "bg-red-900/30 border-red-500" : "bg-red-900/20 border-red-500/30"
          )}>
            <p className="text-red-400 text-sm">Red Team</p>
            <p className="text-2xl font-bold text-white">
              {room.teams.red.score}{currentRound.teamId === 'red' ? ` + ${roundScore}` : ''}
            </p>
          </div>
          <div className={clsx(
            "rounded-xl p-4 border",
            currentRound.teamId === 'blue' ? "bg-blue-900/30 border-blue-500" : "bg-blue-900/20 border-blue-500/30"
          )}>
            <p className="text-blue-400 text-sm">Blue Team</p>
            <p className="text-2xl font-bold text-white">
              {room.teams.blue.score}{currentRound.teamId === 'blue' ? ` + ${roundScore}` : ''}
            </p>
          </div>
        </div>

        {/* Live Guesses Feed */}
        <div className="bg-slate-800/50 rounded-xl p-4 max-h-48 overflow-y-auto">
          <h3 className="text-slate-400 text-sm mb-3">Live Activity:</h3>
          <div className="space-y-2">
            {guessHistory.slice(0, 10).map((g, i) => (
              <div key={i} className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", g.correct ? "bg-green-900/30" : "bg-slate-700/30")}>
                {g.correct ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
                <span className="text-slate-300">{g.playerName}</span>
                {g.correct && g.word && <span className="text-green-400">+{g.word.points}</span>}
              </div>
            ))}
            {guessHistory.length === 0 && <p className="text-slate-500 text-center py-2">Waiting for guesses...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
