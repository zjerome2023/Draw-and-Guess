import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

export default function Matchmaking() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [position, setPosition] = useState(1);
  const username = sessionStorage.getItem('username') || '';

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    socket.emit('join_queue', { username });

    const onQueue = ({ position: pos }) => setPosition(pos);
    const onMatch = ({ roomId }) => navigate(`/room/${roomId}`);

    socket.on('queue_update', onQueue);
    socket.on('match_found', onMatch);

    return () => {
      socket.emit('leave_queue');
      socket.off('queue_update', onQueue);
      socket.off('match_found', onMatch);
    };
  }, [socket, username, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Finding a match...</h2>
        <p className="text-purple-200">Queue position: {position}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
