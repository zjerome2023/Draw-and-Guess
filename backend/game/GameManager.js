import { Room } from './Room.js';
import UserStat from '../models/UserStat.js';

class GameManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map();
    this.matchmakingQueue = [];
    this.io = null;
    this.dbAvailable = false;
  }

  setIO(io) {
    this.io = io;
  }

  setDbAvailable(available) {
    this.dbAvailable = available;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId?.toUpperCase());
  }

  createRoom(socket, username, settings, isPublic = false) {
    const existing = this.playerRooms.get(socket.id);
    if (existing) {
      this.leaveRoom(socket);
    }

    const room = new Room(socket, username, settings, isPublic);
    room.setIO(this.io);
    room.setOnGameEnd((stats) => this.persistGameStats(stats));
    this.rooms.set(room.id, room);
    this.playerRooms.set(socket.id, room.id);

    return { roomId: room.id, state: room.getStateForPlayer(socket.id) };
  }

  joinRoom(socket, roomId, username) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    const existing = this.playerRooms.get(socket.id);
    if (existing && existing !== room.id) {
      this.leaveRoom(socket);
    }

    const result = room.addPlayer(socket, username);
    if (result.error) return result;

    this.playerRooms.set(socket.id, room.id);
    room.broadcastState();
    room.broadcastChat();

    return { roomId: room.id, state: room.getStateForPlayer(socket.id) };
  }

  leaveRoom(socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const result = room.removePlayer(socket.id);
    this.playerRooms.delete(socket.id);
    socket.leave(roomId);

    if (result.empty) {
      room.destroy();
      this.rooms.delete(roomId);
    } else if (result.needsNewDrawer) {
      room.strokes = [];
      room.broadcastCanvasClear();
      room.endTurn('drawer_disconnect');
      room.broadcastState();
    } else {
      room.broadcastState();
    }
  }

  joinQueue(socket, username) {
    this.leaveQueue(socket.id);
    this.matchmakingQueue.push({ socketId: socket.id, username });

    if (this.matchmakingQueue.length >= 2) {
      const p1 = this.matchmakingQueue.shift();
      const p2 = this.matchmakingQueue.shift();

      const s1 = this.io.sockets.sockets.get(p1.socketId);
      if (!s1) {
        this.matchmakingQueue.unshift(p2);
        return;
      }

      const { roomId, state } = this.createRoom(s1, p1.username, {}, true);
      const room = this.getRoom(roomId);

      const s2 = this.io.sockets.sockets.get(p2.socketId);
      if (s2 && room) {
        room.addPlayer(s2, p2.username);
        this.playerRooms.set(s2.id, roomId);
        s2.emit('match_found', { roomId, state: room.getStateForPlayer(s2.id) });
      }

      s1.emit('match_found', { roomId, state });
    } else {
      socket.emit('queue_update', { position: this.matchmakingQueue.length });
    }
  }

  leaveQueue(socketId) {
    this.matchmakingQueue = this.matchmakingQueue.filter((p) => p.socketId !== socketId);
  }

  handleDisconnect(socket) {
    this.leaveQueue(socket.id);
    this.leaveRoom(socket);
  }

  async persistGameStats(finalStats) {
    if (!this.dbAvailable || !finalStats?.players) return;

    const winner = finalStats.winner;
    for (const player of finalStats.players) {
      try {
        await UserStat.findOneAndUpdate(
          { username: player.username },
          {
            $inc: {
              gamesPlayed: 1,
              totalWins: player.username === winner ? 1 : 0,
              totalGuesses: player.hasGuessed ? 1 : 0,
            },
            $max: { highestScore: player.score },
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('Failed to persist stats for', player.username, err.message);
      }
    }
  }
}

export const gameManager = new GameManager();
