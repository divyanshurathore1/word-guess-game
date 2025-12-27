'use client';

import { useRouter } from 'next/navigation';
import type { Room } from 'shared/types';
import type { GameEndedPayload } from 'shared/events';
import { useGameStore } from '@/lib/store';
import { Trophy, Medal, Home, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface GameOverProps {
  data: GameEndedPayload;
  room: Room;
}

export default function GameOver({ data, room }: GameOverProps) {
  const router = useRouter();
  const { playerId, reset } = useGameStore();
  
  const { winner, finalScores, mvp, roundHistory } = data;
  const isTie = winner === 'tie';
  const winnerColor = winner === 'red' ? 'text-red-400' : winner === 'blue' ? 'text-blue-400' : 'text-yellow-400';

  const playerStats = new Map<string, { name: string; points: number; wordsGuessed: number }>();
  for (const round of roundHistory) {
    for (const contrib of round.contributions) {
      const existing = playerStats.get(contrib.playerId) || { name: contrib.playerName, points: 0, wordsGuessed: 0 };
      existing.points += contrib.totalPoints;
      existing.wordsGuessed += contrib.words.length;
      playerStats.set(contrib.playerId, existing);
    }
  }

  const sortedPlayers = Array.from(playerStats.entries())
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.points - a.points);

  const handlePlayAgain = () => {
    router.push(`/lobby/${room.code}`);
  };

  const handleGoHome = () => {
    reset();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Trophy className={clsx("w-20 h-20 mx-auto mb-4", winnerColor)} />
          <h1 className="text-4xl font-bold text-white mb-2">
            {isTie ? "It's a Tie!" : `${winner?.toUpperCase()} TEAM WINS!`}
          </h1>
          <p className="text-slate-400">Game Over</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={clsx("rounded-xl p-6 text-center border-2", winner === 'red' ? "bg-red-900/30 border-red-500" : "bg-red-900/20 border-red-500/30")}>
            <p className="text-red-400 text-lg mb-1">Red Team</p>
            <p className="text-5xl font-bold text-white">{finalScores.red}</p>
            {winner === 'red' && <Trophy className="w-6 h-6 text-yellow-400 mx-auto mt-2" />}
          </div>
          <div className={clsx("rounded-xl p-6 text-center border-2", winner === 'blue' ? "bg-blue-900/30 border-blue-500" : "bg-blue-900/20 border-blue-500/30")}>
            <p className="text-blue-400 text-lg mb-1">Blue Team</p>
            <p className="text-5xl font-bold text-white">{finalScores.blue}</p>
            {winner === 'blue' && <Trophy className="w-6 h-6 text-yellow-400 mx-auto mt-2" />}
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3">
            <Medal className="w-8 h-8 text-yellow-400" />
            <div className="text-center">
              <p className="text-yellow-400 text-sm">MVP</p>
              <p className="text-2xl font-bold text-white">{mvp.playerName}</p>
              <p className="text-slate-400">{mvp.totalPoints} points</p>
            </div>
            <Medal className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-8">
          <h3 className="text-slate-400 text-sm mb-3">Final Leaderboard</h3>
          <div className="space-y-2">
            {sortedPlayers.slice(0, 10).map((player, index) => (
              <div key={player.id} className={clsx("flex items-center justify-between px-3 py-2 rounded-lg", player.id === playerId ? "bg-blue-900/30" : "bg-slate-700/30")}>
                <div className="flex items-center gap-3">
                  <span className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-yellow-500 text-black" :
                    index === 1 ? "bg-gray-400 text-black" :
                    index === 2 ? "bg-amber-600 text-white" :
                    "bg-slate-600 text-white"
                  )}>
                    {index + 1}
                  </span>
                  <span className="text-white">
                    {player.name}
                    {player.id === playerId && <span className="text-slate-400 text-sm ml-1">(you)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm">{player.wordsGuessed} words</span>
                  <span className="text-green-400 font-bold min-w-[60px] text-right">{player.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={handleGoHome} className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
            <Home className="w-5 h-5" />
            Home
          </button>
          <button onClick={handlePlayAgain} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    </main>
  );
}
