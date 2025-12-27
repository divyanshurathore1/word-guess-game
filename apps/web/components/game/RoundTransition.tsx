'use client';

import { useState } from 'react';
import type { Room } from 'shared/types';
import type { RoundStartingPayload } from 'shared/events';
import { TEAM_COLORS } from 'shared/constants';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import { CLIENT_EVENTS, SERVER_EVENTS } from 'shared/events';
import clsx from 'clsx';

interface RoundTransitionProps {
  data: RoundStartingPayload;
  room: Room;
  lastRoundScore?: { teamId: string; score: number } | null;
}

export default function RoundTransition({ data, room, lastRoundScore }: RoundTransitionProps) {
  const { playerId } = useGameStore();
  const [isStarting, setIsStarting] = useState(false);
  
  const teamColor = TEAM_COLORS[data.teamId];
  const isDescriber = room.teams[data.teamId].players.find(p => p.name === data.describerName)?.id === playerId;
  const isMyTeam = room.teams[data.teamId].players.some(p => p.id === playerId);

  const handleStartNext = () => {
    if (isStarting) return;
    setIsStarting(true);
    const socket = getSocket();
    
    // Listen for errors
    const errorHandler = (data: { code: string; message: string }) => {
      console.error('Error starting round:', data.message);
      setIsStarting(false);
      socket.off(SERVER_EVENTS.ERROR, errorHandler);
    };
    
    socket.once(SERVER_EVENTS.ERROR, errorHandler);
    socket.emit(CLIENT_EVENTS.ROUND_START_NEXT);
  };

  // Team scores already include the last round's score (updated via ROUND_ENDED)
  const redScore = room.teams.red.score;
  const blueScore = room.teams.blue.score;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-lg w-full">
        {/* Last Round Summary (if not first round) */}
        {lastRoundScore && data.roundNumber > 1 && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <p className="text-slate-400 text-sm mb-2">Round {data.roundNumber - 1} Complete!</p>
            <p className="text-lg">
              <span className={lastRoundScore.teamId === 'red' ? 'text-red-400' : 'text-blue-400'}>
                {lastRoundScore.teamId.toUpperCase()} Team
              </span>
              <span className="text-green-400 font-bold ml-2">+{lastRoundScore.score} points</span>
            </p>
          </div>
        )}

        <div className="mb-6">
          <span className="text-slate-400 text-lg">Round</span>
          <h1 className="text-7xl font-bold text-white">{data.roundNumber}</h1>
          <span className="text-slate-400">of 12</span>
        </div>

        <div className="inline-block px-6 py-3 rounded-full font-bold text-white text-xl mb-8" style={{ backgroundColor: teamColor.primary }}>
          {data.teamId.toUpperCase()} TEAM'S TURN
        </div>

        <div className="mb-8">
          <p className="text-slate-400 mb-2">Describer:</p>
          <p className={clsx("text-3xl font-bold", isDescriber ? "text-yellow-400" : "text-white")}>
            {data.describerName}
            {isDescriber && " (You!)"}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
          {isDescriber ? (
            <div className="text-yellow-400">
              <p className="text-lg font-bold mb-2">🎤 You're describing!</p>
              <p className="text-slate-300 text-sm">Words will appear on your screen. Describe them without saying the word itself!</p>
            </div>
          ) : isMyTeam ? (
            <div className="text-green-400">
              <p className="text-lg font-bold mb-2">🎯 You're guessing!</p>
              <p className="text-slate-300 text-sm">Listen to {data.describerName} and type your guesses as fast as you can!</p>
            </div>
          ) : (
            <div className="text-slate-400">
              <p className="text-lg font-bold mb-2">👀 Spectating</p>
              <p className="text-slate-300 text-sm">Watch the {data.teamId} team play. Your turn is coming up!</p>
            </div>
          )}
        </div>

        {isDescriber && (
          <button
            onClick={handleStartNext}
            disabled={isStarting}
            className="px-12 py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl transition-colors mb-8"
          >
            {isStarting ? 'Starting...' : 'Start Round'}
          </button>
        )}

        {!isDescriber && (
          <div className="text-slate-400 mb-8">
            {isMyTeam 
              ? `Waiting for ${data.describerName} to start the round...`
              : `Waiting for ${data.teamId} team to start...`
            }
          </div>
        )}

        {/* Team Scores - Both teams with totals */}
        <div className="grid grid-cols-2 gap-4">
          <div className={clsx(
            "rounded-xl p-4 border",
            data.teamId === 'red' ? "bg-red-900/30 border-red-500" : "bg-red-900/20 border-red-500/30"
          )}>
            <p className="text-red-400 text-sm font-medium">Red Team</p>
            <p className="text-3xl font-bold text-white">{redScore}</p>
            <p className="text-slate-500 text-xs">Total Score</p>
          </div>
          <div className={clsx(
            "rounded-xl p-4 border",
            data.teamId === 'blue' ? "bg-blue-900/30 border-blue-500" : "bg-blue-900/20 border-blue-500/30"
          )}>
            <p className="text-blue-400 text-sm font-medium">Blue Team</p>
            <p className="text-3xl font-bold text-white">{blueScore}</p>
            <p className="text-slate-500 text-xs">Total Score</p>
          </div>
        </div>
      </div>
    </main>
  );
}
