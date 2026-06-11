import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import PlayerList from './PlayerList';
import GameSettings from './GameSettings';

export default function LobbyView({ gameState, roomId }) {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [settings, setSettings] = useState(gameState.settings);
  const [error, setError] = useState('');

  const handleStart = () => {
    socket.emit('start_game', { roomId, settings }, (res) => {
      if (res?.error) setError(res.error);
    });
  };

  const shareUrl = `${window.location.origin}/room/${roomId}`;

  return (
    <div className="min-h-screen bg-shadow-gray p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-titan-one text-white">Lobby</h1>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-razzmatazz hover:text-white transition"
          >
            Leave
          </button>
        </div>

        <div className="bg-razzmatazz/10 border border-razzmatazz/30 rounded-xl p-4 mb-6">
          <p className="text-alabaster-gray text-sm">Room Code</p>
          <p className="text-3xl font-mono font-bold text-white tracking-widest">{roomId}</p>
          <p className="text-xs text-cool-horizon mt-2 break-all">Share: {shareUrl}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <PlayerList players={gameState.scores} />
          {gameState.isHost ? (
            <GameSettings settings={settings} onChange={setSettings} />
          ) : (
            <div className="bg-alabaster-gray/5 rounded-xl p-4 flex items-center justify-center border border-alabaster-gray/10">
              <p className="text-alabaster-gray/70 text-sm">Waiting for host to configure settings...</p>
            </div>
          )}
        </div>

        {gameState.isHost && (
          <button
            onClick={handleStart}
            disabled={gameState.scores.length < 2}
            className="mt-6 w-full py-4 rounded-xl bg-radioactive-grass hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-shadow-gray font-bold text-lg transition"
          >
            Start Game ({gameState.scores.length}/2 min)
          </button>
        )}

        {!gameState.isHost && (
          <p className="mt-6 text-center text-cool-horizon">
            Waiting for the host to start the game...
          </p>
        )}

        {error && <p className="mt-4 text-razzmatazz text-center">{error}</p>}
      </div>
    </div>
  );
}
