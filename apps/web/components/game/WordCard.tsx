'use client';

import type { Word } from 'shared/types';
import clsx from 'clsx';

interface WordCardProps {
  word: Word;
  teamColor: string;
}

export default function WordCard({ word, teamColor }: WordCardProps) {
  const isGuessed = !!word.guessedBy;

  return (
    <div className={clsx(
      "relative rounded-xl p-4 transition-all duration-300",
      isGuessed 
        ? "bg-blue-600 shadow-lg shadow-blue-500/30 scale-[0.98]" 
        : "bg-slate-700/80 hover:bg-slate-700"
    )}>
      {isGuessed && (
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">✓</span>
        </div>
      )}

      <h3 className={clsx(
        "text-center font-bold text-sm sm:text-base uppercase tracking-wide mb-2",
        isGuessed ? "text-white" : "text-white"
      )}>
        {word.text}
      </h3>

      <p className={clsx(
        "text-center text-sm",
        isGuessed ? "text-blue-200" : "text-slate-400"
      )}>
        {word.points} points
      </p>
    </div>
  );
}
