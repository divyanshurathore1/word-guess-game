'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { connectSocket, getSocket } from '@/lib/socket';
import { useGameStore } from '@/lib/store';
import { CLIENT_EVENTS, SERVER_EVENTS } from 'shared/events';
import type { RoomCreatedPayload, RoomJoinedPayload, ErrorPayload } from 'shared/events';

export default function HomePage() {
  const router = useRouter();
  const { setPlayer, setRoom, setConnected } = useGameStore();
  
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const socket = await connectSocket();
      setConnected(true);

      socket.emit(CLIENT_EVENTS.ROOM_CREATE, { playerName: playerName.trim() });

      socket.once(SERVER_EVENTS.ROOM_CREATED, (data: RoomCreatedPayload) => {
        setPlayer(data.playerId, playerName.trim());
      });

      socket.once(SERVER_EVENTS.ROOM_STATE, (data: { room: any }) => {
        setRoom(data.room);
        router.push(`/lobby/${data.room.code}`);
      });

      socket.once(SERVER_EVENTS.ERROR, (data: ErrorPayload) => {
        setError(data.message);
        setIsLoading(false);
      });
    } catch (err) {
      setError('Failed to connect to server');
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const socket = await connectSocket();
      setConnected(true);

      socket.emit(CLIENT_EVENTS.ROOM_JOIN, { 
        playerName: playerName.trim(),
        roomCode: roomCode.trim().toUpperCase(),
      });

      socket.once(SERVER_EVENTS.ROOM_JOINED, (data: RoomJoinedPayload) => {
        setPlayer(data.playerId, playerName.trim());
        setRoom(data.room);
        router.push(`/lobby/${data.room.code}`);
      });

      socket.once(SERVER_EVENTS.ERROR, (data: ErrorPayload) => {
        setError(data.message);
        setIsLoading(false);
      });
    } catch (err) {
      setError('Failed to connect to server');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Word<span className="text-blue-400">Guess</span>
          </h1>
          <p className="text-slate-400">The ultimate team word game</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700">
          {mode === 'select' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
              >
                Create New Room
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Join Room
              </button>
            </div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <div className="space-y-4">
              <button
                onClick={() => { setMode('select'); setError(''); }}
                className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
              >
                ← Back
              </button>

              <h2 className="text-xl font-semibold text-white">
                {mode === 'create' ? 'Create New Room' : 'Join Room'}
              </h2>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  maxLength={20}
                />
              </div>

              {mode === 'join' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Room Code</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase tracking-widest text-center text-xl"
                    maxLength={6}
                  />
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {isLoading ? 'Connecting...' : mode === 'create' ? 'Create Room' : 'Join Room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
