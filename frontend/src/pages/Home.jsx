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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Draw & Guess</h1>
        <p className="text-purple-200 text-center text-sm mb-8">
          Draw, guess, and compete with friends in real time
        </p>

        <label className="block text-purple-100 text-sm mb-1">Nickname</label>
        <input
          type="text"
          maxLength={20}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a nickname"
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
        />

        <button
          onClick={handleCreate}
          disabled={!canSubmit || loading}
          className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition mb-3"
        >
          Create Private Lobby
        </button>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            maxLength={6}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
          />
          <button
            onClick={handleJoin}
            disabled={!canSubmit || !roomCode.trim() || loading}
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
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
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
        >
          Quick Match
        </button>

        {error && <p className="mt-4 text-red-300 text-sm text-center">{error}</p>}
        {!connected && (
          <p className="mt-4 text-amber-300 text-sm text-center">Connecting to server...</p>
        )}
      </div>
    </div>
  );
}
