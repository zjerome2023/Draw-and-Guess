import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';

export function useGameState() {
  const { socket } = useSocket();
  const [gameState, setGameState] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const onState = (state) => setGameState(state);
    const onChat = ({ messages: msgs }) => setMessages(msgs || []);

    socket.on('game_state_update', onState);
    socket.on('chat_update', onChat);

    socket.emit('request_state');

    return () => {
      socket.off('game_state_update', onState);
      socket.off('chat_update', onChat);
    };
  }, [socket]);

  const refresh = useCallback(() => {
    socket.emit('request_state');
  }, [socket]);

  return { gameState, messages, setGameState, refresh };
}
