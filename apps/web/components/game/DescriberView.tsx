'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import { CLIENT_EVENTS } from '../../../../packages/shared/src/events';
import { TEAM_COLORS } from '../../../../packages/shared/src/constants';
import Timer from './Timer';
import WordCard from './WordCard';
import Contributions from './Contributions';
import { StopCircle } from 'lucide-react';
import clsx from 'clsx';

export default function DescriberView() {
  const { room, words, currentRound, timeLeft, getRoundScore } = useGameStore();
  const [isEnding, setIsEnding] = useState(false);

  if (!room || !currentRound) return null;

  const teamColor = TEAM_COLORS[currentRound.teamId];
  
  // Round score from guessed words in current round (starts at 0 for new round)
  const roundScore = getRoundScore();
  const guessedCount = words.filter(w => w.guessedBy).length;
  
  // Team scores from room - these are totals BEFORE this round (updated at end of each round)
  const redTotalBefore = room.teams.red.score;
  const blueTotalBefore = room.teams.blue.score;

  const handleEndGuessing = () => {
    if (isEnding) return;
    setIsEnding(true);
    const socket = getSocket();
    socket.emit(CLIENT_EVENTS.ROUND_END_EARLY);
  };

  return (
    <div className="min-h-screen p-4">
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
        <div className="text-center mb-6">
          <h1 className="text-xl text-slate-300">YOUR WORDS:</h1>
          <p className="text-slate-500 text-sm">Describe these words without saying them! ({guessedCount}/{words.length} guessed)</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {words.map((word) => (
            <WordCard key={word.id} word={word} teamColor={teamColor.primary} />
          ))}
        </div>

        {/* End Guessing Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleEndGuessing}
            disabled={isEnding}
            className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors"
          >
            <StopCircle className="w-6 h-6" />
            {isEnding ? 'Ending...' : 'End Guessing'}
          </button>
        </div>

        <Contributions round={currentRound} />
      </div>
    </div>
  );
}
