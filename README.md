# Draw & Guess

A real-time multiplayer drawing and guessing game built with React, Node.js, Socket.io, and MongoDB.

## Features

- Guest login with nickname — no registration required
- Private lobbies with shareable room codes
- Public quick-match queue
- Real-time canvas synchronization with normalized coordinates
- Live chat with guess filtering and scoring
- Configurable rounds, draw time, and word categories
- Drawer disconnect handling and in-memory game state

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, HTML5 Canvas, Socket.io Client
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB (optional — falls back to in-memory word bank)


## How to Play

1. Enter a nickname on the home screen
2. Create a private lobby, join with a room code, or use Quick Match
3. Wait for at least 2 players (up to 8)
4. Host starts the game and configures settings
5. Each turn, the drawer picks from 3 words and draws on the canvas
6. Other players guess in chat — faster guesses earn more points
7. After all rounds, the highest score wins

## Project Structure

```
backend/
  config/         Database connection
  models/         Mongoose schemas (Word, UserStat)
  game/           In-memory room and game state machine
  socket/         Socket.io event handlers
  services/       Word bank service

frontend/
  src/
    pages/        Home, Matchmaking, GameRoom
    components/   LobbyView, ArenaView, Canvas, Chat
    context/      Socket.io provider
```
