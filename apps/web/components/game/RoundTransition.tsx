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
}

export default function RoundTransition({ data, room }: RoundTransitionProps) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
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

        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 max-w-md mx-auto">
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

        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center">
            <div className="text-red-400 text-sm">Red Team</div>
            <div className="text-2xl font-bold text-white">{room.teams.red.score}</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-sm">Blue Team</div>
            <div className="text-2xl font-bold text-white">{room.teams.blue.score}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
