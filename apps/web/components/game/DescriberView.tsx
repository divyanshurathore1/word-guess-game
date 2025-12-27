'use client';

import { useGameStore } from '@/lib/store';
import { TEAM_COLORS } from '../../../../packages/shared/src/constants';
import Timer from './Timer';
import WordCard from './WordCard';
import Contributions from './Contributions';

export default function DescriberView() {
  const { room, words, currentRound, timeLeft } = useGameStore();

  if (!room || !currentRound) return null;

  const teamColor = TEAM_COLORS[currentRound.teamId];
  const currentTeam = room.teams[currentRound.teamId];
  
  // Round score from guessed words in current round
  const roundScore = words.filter(w => w.guessedBy).reduce((sum, w) => sum + w.points, 0);
  const guessedCount = words.filter(w => w.guessedBy).length;
  
  // Total team score (from previous rounds)
  const totalScore = currentTeam.score;

  return (
    <div className="min-h-screen p-4">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full font-bold text-white text-sm" style={{ backgroundColor: teamColor.primary }}>
              {currentRound.teamId.toUpperCase()} TEAM'S TURN
            </div>
            <span className="text-slate-400">Round {currentRound.number} of 12</span>
          </div>
          <Timer seconds={timeLeft} teamColor={teamColor.primary} />
          
          {/* Score Display - Round Score + Total Score */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-slate-400 text-sm">This Round</div>
              <div className="text-2xl font-bold text-green-400">+{roundScore}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-sm">Total</div>
              <div className="text-2xl font-bold text-white">{totalScore + roundScore}</div>
            </div>
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

        <Contributions round={currentRound} />
      </div>
    </div>
  );
}
