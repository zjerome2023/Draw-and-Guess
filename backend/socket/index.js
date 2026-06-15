import { gameManager } from '../game/GameManager.js';
import {
  sanitizeSettings,
  validateMessage,
  validateRoomId,
  validateUsername,
} from '../utils/validation.js';
import {
  checkRateLimit,
  clearSocketRateLimits,
  getClientIp,
  trackConnection,
  untrackConnection,
} from '../utils/rateLimit.js';

function isRateLimited(socket, event) {
  if (checkRateLimit(socket.id, event)) return false;
  return true;
}

export function registerSocketHandlers(io) {
  gameManager.setIO(io);

  io.on('connection', (socket) => {
    const ip = getClientIp(socket);
    if (!trackConnection(ip)) {
      socket.disconnect(true);
      return;
    }

    socket.on('disconnect', () => {
      untrackConnection(ip);
      clearSocketRateLimits(socket.id);
      gameManager.handleDisconnect(socket);
    });

    socket.on('create_room', ({ username, settings }, cb) => {
      if (isRateLimited(socket, 'create_room')) {
        cb?.({ error: 'Too many requests. Please wait and try again.' });
        return;
      }

      const userResult = validateUsername(username);
      if (!userResult.ok) {
        cb?.({ error: userResult.error });
        return;
      }

      const result = gameManager.createRoom(
        socket,
        userResult.value,
        sanitizeSettings(settings)
      );
      cb?.(result);
      gameManager.getRoom(result.roomId)?.broadcastState();
    });

    socket.on('join_room', ({ roomId, username }, cb) => {
      if (isRateLimited(socket, 'join_room')) {
        cb?.({ error: 'Too many requests. Please wait and try again.' });
        return;
      }

      const userResult = validateUsername(username);
      if (!userResult.ok) {
        cb?.({ error: userResult.error });
        return;
      }

      const roomResult = validateRoomId(roomId);
      if (!roomResult.ok) {
        cb?.({ error: roomResult.error });
        return;
      }

      const result = gameManager.joinRoom(socket, roomResult.value, userResult.value);
      cb?.(result);
    });

    socket.on('join_queue', ({ username }) => {
      if (isRateLimited(socket, 'join_queue')) return;

      const userResult = validateUsername(username);
      if (!userResult.ok) return;

      gameManager.joinQueue(socket, userResult.value);
    });

    socket.on('leave_queue', () => {
      gameManager.leaveQueue(socket.id);
    });

    socket.on('start_game', ({ roomId, settings }, cb) => {
      const room = gameManager.getRoom(roomId);
      if (!room) {
        cb?.({ error: 'Room not found' });
        return;
      }
      if (socket.id !== room.hostId) {
        cb?.({ error: 'Only the host can start the game' });
        return;
      }

      room.startGame(sanitizeSettings(settings)).then((result) => {
        cb?.(result);
        if (!result.error) {
          room.broadcastState();
          room.broadcastChat();
        }
      });
    });

    socket.on('word_chosen', ({ word }, cb) => {
      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      if (!room) {
        cb?.({ error: 'Not in a room' });
        return;
      }
      if (socket.id !== room.getDrawerId()) {
        cb?.({ error: 'Only the drawer can choose a word' });
        return;
      }

      const result = room.selectWord(word);
      cb?.(result);
    });

    socket.on('draw_stroke', (data) => {
      if (isRateLimited(socket, 'draw_stroke')) return;

      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.handleStroke(socket.id, data);
    });

    socket.on('undo_stroke', () => {
      if (isRateLimited(socket, 'undo_stroke')) return;

      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.undoStroke(socket.id);
    });

    socket.on('clear_canvas', () => {
      if (isRateLimited(socket, 'clear_canvas')) return;

      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.clearCanvas(socket.id);
    });

    socket.on('submit_guess', ({ message }) => {
      if (isRateLimited(socket, 'submit_guess')) return;

      const messageResult = validateMessage(message);
      if (!messageResult.ok) return;

      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.handleChat(socket.id, messageResult.value);
    });

    socket.on('request_state', () => {
      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      if (room) {
        socket.emit('game_state_update', room.getStateForPlayer(socket.id));
        socket.emit('chat_update', { messages: room.getMessagesForPlayer(socket.id) });
        socket.emit('canvas_sync', { strokes: room.strokes });
      }
    });
  });
}
