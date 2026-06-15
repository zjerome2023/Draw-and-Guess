import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

export default function Home() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim().length >= 2 && connected;

  const handleCreate = () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    socket.emit('create_room', { username: username.trim() }, (res) => {
      setLoading(false);
      if (res?.error) {
        setError(res.error);
        return;
      }
      sessionStorage.setItem('username', username.trim());
      navigate(`/room/${res.roomId}`);
    });
  };

  const handleJoin = () => {
    if (!canSubmit || !roomCode.trim()) return;
    setLoading(true);
    setError('');

    socket.emit('join_room', { roomId: roomCode.trim(), username: username.trim() }, (res) => {
      setLoading(false);
      if (res?.error) {
        setError(res.error);
        return;
      }
      sessionStorage.setItem('username', username.trim());
      navigate(`/room/${res.roomId}`);
    });
  };

  return (
    <div className="min-h-screen bg-midnight-violet flex flex-col gap-6 items-center justify-center py-12 px-4">
      <h1 className="text-6xl font-titan-one text-platinum text-center mb-2 ">
        <span className="text-hot-fuschia">D</span>
        <span className="text-canary-yellow">r</span>
        <span className="text-neon-ice">a</span>
        <span className="text-cool-horizon">w</span>
        <span className="text-platinum"> & </span>
        <span className="text-hyper-magenta">G</span>
        <span className="text-hot-fuschia">u</span>
        <span className="text-canary-yellow">e</span>
        <span className="text-neon-ice">s</span>
        <span className="text-cool-horizon">s</span>
      </h1>
      <p className="text-platinum/80 text-center text-lg mb-8"> Gather your friends and guess what they're drawing!</p>
      <div className="max-w-md bg-midnight-violet rounded-2xl shadow-2xl border border-platinum/15 p-8">
        <label className="block text-platinum text-sm mb-1">Nickname</label>
        <input
          type="text"
          maxLength={20}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a nickname"
          className="w-full px-4 py-3 rounded-xl bg-platinum/10 border border-platinum/20 text-white placeholder-platinum/50 focus:outline-none focus:ring-2 focus:ring-hyper-magenta mb-4"
        />

        <button
          onClick={handleCreate}
          disabled={!canSubmit || loading}
          className="w-full py-3 rounded-xl bg-hyper-magenta hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition mb-3"
        >
          Create Private Lobby
        </button>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            maxLength={8}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            className="flex-1 px-4 py-3 rounded-xl bg-platinum/10 border border-platinum/20 text-white placeholder-platinum/50 focus:outline-none focus:ring-2 focus:ring-cool-horizon uppercase"
          />
          <button
            onClick={handleJoin}
            disabled={!canSubmit || !roomCode.trim() || loading}
            className="px-6 py-3 rounded-xl bg-cool-horizon hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-midnight-violet font-semibold transition"
          >
            Join
          </button>
        </div>

        <button
          onClick={() => {
            sessionStorage.setItem('username', username.trim());
            navigate('/matchmaking');
          }}
          disabled={!canSubmit}
          className="w-full py-3 rounded-xl bg-neon-ice hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-midnight-violet font-semibold transition"
        >
          Quick Match
        </button>

        {error && <p className="mt-4 text-hyper-magenta text-sm text-center">{error}</p>}
        {!connected && (
          <p className="mt-4 text-canary-yellow text-sm text-center">Connecting to server...</p>
        )}
      </div>

      <section className="max-w-md w-full bg-midnight-violet rounded-2xl shadow-2xl border border-platinum/15 p-8">
        <h2 className="text-2xl font-titan-one text-platinum text-center mb-6">How to Play</h2>
        <ol className="space-y-4 text-platinum/80 text-sm">
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-hyper-magenta/20 text-hyper-magenta font-semibold flex items-center justify-center text-xs">1</span>
            <span>Enter a nickname and create a lobby, join with a room code, or use Quick Match.</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-cool-horizon/20 text-cool-horizon font-semibold flex items-center justify-center text-xs">2</span>
            <span>Wait for at least 2 players (up to 8). The host starts the game and sets rounds, draw time, and categories.</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-neon-ice/20 text-neon-ice font-semibold flex items-center justify-center text-xs">3</span>
            <span>Each turn, one player picks from 3 words and draws on the canvas while others guess in chat.</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-canary-yellow/20 text-canary-yellow font-semibold flex items-center justify-center text-xs">4</span>
            <span>Faster correct guesses earn more points. After all rounds, the highest score wins!</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
