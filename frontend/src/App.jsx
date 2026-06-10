import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import Matchmaking from './pages/Matchmaking';
import GameRoom from './pages/GameRoom';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/room/:roomId" element={<GameRoom />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
