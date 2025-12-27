'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/lib/store';
import { CLIENT_EVENTS, SERVER_EVENTS } from 'shared/events';
import type { TeamId, Player } from 'shared/types';
import { Users, Crown, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.code as string;
  
  const { room, playerId, updateTeams, isHost, getMyTeam } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on(SERVER_EVENTS.TEAM_UPDATED, (data) => {
      updateTeams(data.teams, data.unassignedPlayers);
    });

    socket.on(SERVER_EVENTS.GAME_STARTING, () => {
      setIsStarting(true);
      setTimeout(() => {
        router.push(`/game/${roomCode}`);
      }, 500);
    });

    return () => {
      socket.off(SERVER_EVENTS.TEAM_UPDATED);
      socket.off(SERVER_EVENTS.GAME_STARTING);
    };
  }, [roomCode, router, updateTeams]);

  const handleJoinTeam = (teamId: TeamId) => {
    const socket = getSocket();
    socket.emit(CLIENT_EVENTS.TEAM_JOIN, { teamId });
  };

  const handleLeaveTeam = () => {
    const socket = getSocket();
    socket.emit(CLIENT_EVENTS.TEAM_LEAVE);
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit(CLIENT_EVENTS.GAME_START);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const myTeam = getMyTeam();
  const canStart = room.teams.red.players.length >= 2 && room.teams.blue.players.length >= 2;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Game Lobby</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-400">Room Code:</span>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <span className="text-2xl font-mono font-bold text-white tracking-widest">
                {roomCode}
              </span>
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <TeamCard team={room.teams.red} teamId="red" myTeam={myTeam} playerId={playerId} hostId={room.hostId} onJoin={() => handleJoinTeam('red')} onLeave={handleLeaveTeam} />
          <TeamCard team={room.teams.blue} teamId="blue" myTeam={myTeam} playerId={playerId} hostId={room.hostId} onJoin={() => handleJoinTeam('blue')} onLeave={handleLeaveTeam} />
        </div>

        {room.unassignedPlayers.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-8">
            <h3 className="text-slate-400 text-sm mb-2">Waiting to join a team:</h3>
            <div className="flex flex-wrap gap-2">
              {room.unassignedPlayers.map((player) => (
                <span key={player.id} className={clsx("px-3 py-1 rounded-full text-sm", player.id === playerId ? "bg-slate-600 text-white" : "bg-slate-700 text-slate-300")}>
                  {player.name}
                  {player.id === room.hostId && <Crown className="w-3 h-3 inline ml-1 text-yellow-400" />}
                </span>
              ))}
            </div>
          </div>
        )}

        {isHost() ? (
          <div className="text-center">
            <button onClick={handleStartGame} disabled={!canStart || isStarting} className={clsx("px-8 py-4 rounded-xl font-bold text-lg transition-all", canStart && !isStarting ? "bg-green-600 hover:bg-green-500 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed")}>
              {isStarting ? 'Starting...' : 'Start Game'}
            </button>
            {!canStart && <p className="text-slate-400 text-sm mt-2">Each team needs at least 2 players</p>}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-slate-400">Waiting for host to start the game...</p>
          </div>
        )}
      </div>
    </main>
  );
}

function TeamCard({ team, teamId, myTeam, playerId, hostId, onJoin, onLeave }: { team: { players: Player[]; name: string }; teamId: TeamId; myTeam: TeamId | null; playerId: string | null; hostId: string; onJoin: () => void; onLeave: () => void; }) {
  const isMyTeam = myTeam === teamId;
  const colors = teamId === 'red' 
    ? { bg: 'bg-red-900/30', border: 'border-red-500', text: 'text-red-400', btn: 'bg-red-600 hover:bg-red-500' }
    : { bg: 'bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-400', btn: 'bg-blue-600 hover:bg-blue-500' };

  return (
    <div className={clsx("rounded-xl p-4 border-2", colors.bg, colors.border)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={clsx("text-xl font-bold", colors.text)}>{team.name}</h2>
        <div className="flex items-center gap-1 text-slate-400">
          <Users className="w-4 h-4" />
          <span>{team.players.length}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 min-h-[100px]">
        {team.players.map((player) => (
          <div key={player.id} className={clsx("px-3 py-2 rounded-lg flex items-center justify-between", player.id === playerId ? "bg-white/10" : "bg-black/20")}>
            <span className="text-white">
              {player.name}
              {player.id === playerId && <span className="text-slate-400 text-sm ml-1">(you)</span>}
            </span>
            {player.id === hostId && <Crown className="w-4 h-4 text-yellow-400" />}
          </div>
        ))}
        {team.players.length === 0 && <p className="text-slate-500 text-center py-4">No players yet</p>}
      </div>

      {!myTeam && <button onClick={onJoin} className={clsx("w-full py-2 rounded-lg text-white font-medium transition-colors", colors.btn)}>Join {team.name}</button>}
      {isMyTeam && <button onClick={onLeave} className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">Leave Team</button>}
    </div>
  );
}
