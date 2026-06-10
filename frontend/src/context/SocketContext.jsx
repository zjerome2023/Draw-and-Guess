import { useEffect, useState } from 'react';
import { SocketContext } from './socket-store';
import { getSocket } from './socket-client';

export function SocketProvider({ children }) {
  const socket = getSocket();
  const [connected, setConnected] = useState(() => socket.connected);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
