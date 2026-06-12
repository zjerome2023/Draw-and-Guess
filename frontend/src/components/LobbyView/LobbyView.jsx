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
    <div className="min-h-screen bg-midnight-violet p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-titan-one text-platinum">Lobby</h1>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-hyper-magenta hover:text-platinum transition"
          >
            Leave
          </button>
        </div>

        <div className="bg-hyper-magenta/10 border border-hyper-magenta/30 rounded-xl p-4 mb-6">
          <p className="text-platinum/80 text-sm">Room Code</p>
          <p className="text-3xl font-mono font-bold text-platinum tracking-widest">{roomId}</p>
          <p className="text-xs text-cool-horizon mt-2 break-all">Share: {shareUrl}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <PlayerList players={gameState.scores} />
          {gameState.isHost ? (
            <GameSettings settings={settings} onChange={setSettings} />
          ) : (
            <div className="bg-midnight-violet rounded-xl p-4 flex items-center justify-center border border-platinum/10">
              <p className="text-platinum/70 text-sm">Waiting for host to configure settings...</p>
            </div>
          )}
        </div>

        {gameState.isHost && (
          <button
            onClick={handleStart}
            disabled={gameState.scores.length < 2}
            className="mt-6 w-full py-4 rounded-xl bg-neon-ice hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-midnight-violet font-bold text-lg transition"
          >
            Start Game ({gameState.scores.length}/2 min)
          </button>
        )}

        {!gameState.isHost && (
          <p className="mt-6 text-center text-cool-horizon">
            Waiting for the host to start the game...
          </p>
        )}

        {error && <p className="mt-4 text-hyper-magenta text-center">{error}</p>}
      </div>
    </div>
  );
}
