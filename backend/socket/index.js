import { gameManager } from '../game/GameManager.js';

export function registerSocketHandlers(io) {
  gameManager.setIO(io);

  io.on('connection', (socket) => {
    socket.on('create_room', ({ username, settings }, cb) => {
      if (!username?.trim()) {
        cb?.({ error: 'Username is required' });
        return;
      }
      const result = gameManager.createRoom(socket, username.trim(), settings);
      cb?.(result);
      gameManager.getRoom(result.roomId)?.broadcastState();
    });

    socket.on('join_room', ({ roomId, username }, cb) => {
      if (!username?.trim()) {
        cb?.({ error: 'Username is required' });
        return;
      }
      const result = gameManager.joinRoom(socket, roomId, username.trim());
      cb?.(result);
    });

    socket.on('join_queue', ({ username }) => {
      if (!username?.trim()) return;
      gameManager.joinQueue(socket, username.trim());
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

      room.startGame(settings).then((result) => {
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
      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.handleStroke(socket.id, data);
    });

    socket.on('undo_stroke', () => {
      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.undoStroke(socket.id);
    });

    socket.on('clear_canvas', () => {
      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.clearCanvas(socket.id);
    });

    socket.on('submit_guess', ({ message }) => {
      const roomId = gameManager.playerRooms.get(socket.id);
      const room = gameManager.getRoom(roomId);
      room?.handleChat(socket.id, message);
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

    socket.on('disconnect', () => {
      gameManager.handleDisconnect(socket);
    });
  });
}
