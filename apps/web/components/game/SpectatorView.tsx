'use client';

import { useGameStore } from '@/lib/store';
import { TEAM_COLORS } from '../../../../packages/shared/src/constants';
import Timer from './Timer';
import WordCard from './WordCard';
import clsx from 'clsx';
import { Eye, Check, X } from 'lucide-react';

export default function SpectatorView() {
  const { room, words, currentRound, timeLeft, guessHistory, getMyTeam, getRoundScore } = useGameStore();

  if (!room || !currentRound) return null;

  const teamColor = TEAM_COLORS[currentRound.teamId];
  const myTeam = getMyTeam();
  const isMyTeamPlaying = currentRound.teamId === myTeam;

  // Round score from guessed words (starts at 0 for new round)
  const roundScore = getRoundScore();
  const guessedCount = words.filter(w => w.guessedBy).length;

  // Team scores from room - these are totals BEFORE this round
  const redTotalBefore = room.teams.red.score;
  const blueTotalBefore = room.teams.blue.score;

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full font-bold text-white text-sm" style={{ backgroundColor: teamColor.primary }}>
              {currentRound.teamId.toUpperCase()} TEAM'S TURN
            </div>
            <span className="text-slate-400">Round {currentRound.number} of 12</span>
          </div>
          <Timer seconds={timeLeft} teamColor={teamColor.primary} />
        </div>

        {/* Both Team Scores */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className={clsx(
            "rounded-xl p-3 border",
            currentRound.teamId === 'red' ? 'bg-red-900/30 border-red-500' : 'bg-red-900/20 border-red-500/30'
          )}>
            <div className="flex justify-between items-center">
              <span className="text-red-400 text-sm font-medium">Red Team</span>
              {currentRound.teamId === 'red' && (
                <span className="text-green-400 text-sm font-bold">+{roundScore} this round</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {redTotalBefore}{currentRound.teamId === 'red' && roundScore > 0 ? ` → ${redTotalBefore + roundScore}` : ''}
            </p>
          </div>
          <div className={clsx(
            "rounded-xl p-3 border",
            currentRound.teamId === 'blue' ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-900/20 border-blue-500/30'
          )}>
            <div className="flex justify-between items-center">
              <span className="text-blue-400 text-sm font-medium">Blue Team</span>
              {currentRound.teamId === 'blue' && (
                <span className="text-green-400 text-sm font-bold">+{roundScore} this round</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {blueTotalBefore}{currentRound.teamId === 'blue' && roundScore > 0 ? ` → ${blueTotalBefore + roundScore}` : ''}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Status Banner */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 font-medium">
              {isMyTeamPlaying ? "Your teammate is describing!" : "Opponent's turn - Spectating"}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {currentRound.describerName} is describing • {guessedCount}/{words.length} guessed
          </p>
        </div>

        {/* Words Grid - Same as Describer View */}
        <div className="mb-6">
          <h2 className="text-center text-lg text-slate-300 mb-4">WORDS:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {words.map((word) => (
              <WordCard key={word.id} word={word} teamColor={teamColor.primary} />
            ))}
          </div>
        </div>

        {/* Live Guesses Feed */}
        <div className="bg-slate-800/50 rounded-xl p-4 max-h-64 overflow-y-auto">
          <h3 className="text-slate-400 text-sm mb-3">Live Activity:</h3>
          <div className="space-y-2">
            {guessHistory.slice(0, 15).map((g, i) => (
              <div key={i} className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", g.correct ? "bg-green-900/30" : "bg-slate-700/30")}>
                {g.correct ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
                <span className="text-slate-300">{g.playerName}</span>
                <span className="text-slate-500">guessed "{g.guess}"</span>
                {g.correct && g.word && <span className="text-green-400 ml-auto">+{g.word.points}</span>}
              </div>
            ))}
            {guessHistory.length === 0 && <p className="text-slate-500 text-center py-2">Waiting for guesses...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
