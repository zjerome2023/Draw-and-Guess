import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { registerSocketHandlers } from './socket/index.js';
import { setDbAvailable, seedWords } from './services/wordService.js';
import { gameManager } from './game/GameManager.js';
import UserStat from './models/UserStat.js';
import { validateUsername } from './utils/validation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const userResult = validateUsername(req.params.username);
  if (!userResult.ok) {
    res.status(400).json({ error: userResult.error });
    return;
  }

  try {
    const stat = await UserStat.findOne({ username: userResult.value.toLowerCase() });
    res.json(stat || { username: userResult.value, gamesPlayed: 0 });
  } catch {
    res.json({ username: userResult.value, gamesPlayed: 0 });
  }
});

registerSocketHandlers(io);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get(/^(?!\/api|\/socket\.io).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

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
