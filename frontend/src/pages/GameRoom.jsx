import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useGameState } from '../hooks/useGameState';
import LobbyView from '../components/LobbyView/LobbyView';
import ArenaView from '../components/ArenaView/ArenaView';
import WordSelection from '../components/WordSelection';
import RoundEnd from '../components/RoundEnd';

export default function GameRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { gameState, messages } = useGameState();
  const username = sessionStorage.getItem('username') || '';

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    socket.emit('join_room', { roomId, username }, (res) => {
      if (res?.error) {
        navigate('/');
      }
    });
  }, [socket, roomId, username, navigate]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-midnight-violet flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-hyper-magenta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { phase } = gameState;

  if (phase === 'LOBBY') {
    return <LobbyView gameState={gameState} roomId={roomId} />;
  }

  if (phase === 'WORD_SELECT') {
    return <WordSelection gameState={gameState} />;
  }

  if (phase === 'ROUND_END' || phase === 'GAME_END') {
    return <RoundEnd gameState={gameState} messages={messages} />;
  }

  return <ArenaView gameState={gameState} messages={messages} />;
}
