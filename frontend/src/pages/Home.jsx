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
    <div className="min-h-screen bg-shadow-gray flex flex-col gap-4 items-center justify-center p-4">
      <h1 className="text-6xl font-titan-one text-alabaster-gray text-center mb-2 ">
        <span className="text-cool-horizon">Draw </span>
        <span className="text-alabaster-gray">&</span>
        <span className="text-radioactive-grass"> Guess</span>
      </h1>
      <p className="text-alabaster-gray text-center text-lg mb-8"> Gather your friends and guess what they're drawing!</p>
      <div className="max-w-md bg-dark-indigo rounded-2xl shadow-2xl border border-alabaster-gray/10 p-8">
        <label className="block text-alabaster-gray text-sm mb-1">Nickname</label>
        <input
          type="text"
          maxLength={20}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a nickname"
          className="w-full px-4 py-3 rounded-xl bg-alabaster-gray/10 border border-alabaster-gray/20 text-white placeholder-alabaster-gray/60 focus:outline-none focus:ring-2 focus:ring-razzmatazz mb-4"
        />

        <button
          onClick={handleCreate}
          disabled={!canSubmit || loading}
          className="w-full py-3 rounded-xl bg-razzmatazz hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition mb-3"
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
            className="flex-1 px-4 py-3 rounded-xl bg-alabaster-gray/10 border border-alabaster-gray/20 text-white placeholder-alabaster-gray/60 focus:outline-none focus:ring-2 focus:ring-cool-horizon uppercase"
          />
          <button
            onClick={handleJoin}
            disabled={!canSubmit || !roomCode.trim() || loading}
            className="px-6 py-3 rounded-xl bg-cool-horizon hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
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
          className="w-full py-3 rounded-xl bg-radioactive-grass hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-shadow-gray font-semibold transition"
        >
          Quick Match
        </button>

        {error && <p className="mt-4 text-razzmatazz text-sm text-center">{error}</p>}
        {!connected && (
          <p className="mt-4 text-bright-gold text-sm text-center">Connecting to server...</p>
        )}
      </div>
    </div>
  );
}
