import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { registerSocketHandlers } from './socket/index.js';
import { setDbAvailable, seedWords } from './services/wordService.js';
import { gameManager } from './game/GameManager.js';
import UserStat from './models/UserStat.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stats/:username', async (req, res) => {
  try {
    const stat = await UserStat.findOne({ username: req.params.username.toLowerCase() });
    res.json(stat || { username: req.params.username, gamesPlayed: 0 });
  } catch {
    res.json({ username: req.params.username, gamesPlayed: 0 });
  }
});

registerSocketHandlers(io);

async function start() {
  const dbConnected = await connectDB();
  setDbAvailable(dbConnected);
  gameManager.setDbAvailable(dbConnected);

  if (dbConnected) {
    await seedWords();
  }

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
