'use client';

import type { Round } from 'shared/types';
import { useGameStore } from '@/lib/store';
import { Trophy } from 'lucide-react';
import clsx from 'clsx';

interface ContributionsProps {
  round: Round;
}

export default function Contributions({ round }: ContributionsProps) {
  const { guessHistory, playerId } = useGameStore();

  const contributionMap = new Map<string, { 
    playerName: string; 
    words: { text: string; points: number }[];
    totalPoints: number;
  }>();

  for (const guess of guessHistory) {
    if (guess.correct && guess.word) {
      const existing = contributionMap.get(guess.playerId) || {
        playerName: guess.playerName,
        words: [],
        totalPoints: 0,
      };
      existing.words.push({ text: guess.word.text, points: guess.word.points });
      existing.totalPoints += guess.word.points;
      contributionMap.set(guess.playerId, existing);
    }
  }

  const contributions = Array.from(contributionMap.entries())
    .map(([id, data]) => ({ playerId: id, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  if (contributions.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <h3 className="text-slate-400 text-sm mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" />
        Contributions
      </h3>
      
      <div className="space-y-2">
        {contributions.map((contrib, index) => (
          <div key={contrib.playerId} className={clsx("flex items-center justify-between px-3 py-2 rounded-lg", contrib.playerId === playerId ? "bg-blue-900/30" : "bg-slate-700/30")}>
            <div className="flex items-center gap-3">
              <span className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", index === 0 ? "bg-yellow-500 text-black" : "bg-slate-600 text-white")}>
                {index + 1}
              </span>
              <span className="text-white font-medium">
                {contrib.playerName}
                {contrib.playerId === playerId && <span className="text-slate-400 text-sm ml-1">(you)</span>}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1">
                {contrib.words.slice(0, 5).map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">{w.text}</span>
                ))}
                {contrib.words.length > 5 && <span className="px-2 py-0.5 bg-slate-600 text-white text-xs rounded">+{contrib.words.length - 5}</span>}
              </div>
              <span className="text-green-400 font-bold min-w-[60px] text-right">{contrib.totalPoints} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
