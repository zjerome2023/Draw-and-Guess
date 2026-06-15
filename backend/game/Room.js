import crypto from 'crypto';
import { getRandomWords } from '../services/wordService.js';
import {
  MAX_STROKES_PER_ROUND,
  sanitizeSettings,
  validateMessage,
  validateWordChoice,
  validateStroke,
} from '../utils/validation.js';

const BASE_GUESS_POINTS = 100;
const DRAWER_POINTS_PER_GUESSER = 30;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const WORD_SELECT_SECONDS = 15;
const ROUND_END_SECONDS = 8;

function generateRoomId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function buildHiddenWord(word) {
  return word
    .split('')
    .map((ch) => (ch === ' ' ? ' ' : '_'))
    .join(' ');
}

export class Room {
  constructor(hostSocket, username, settings = {}, isPublic = false) {
    this.id = generateRoomId();
    this.hostId = hostSocket.id;
    this.isPublic = isPublic;
    this.players = new Map();
    this.settings = sanitizeSettings(settings);
    this.phase = 'LOBBY';
    this.currentRound = 0;
    this.currentDrawerIndex = 0;
    this.drawOrder = [];
    this.secretWord = '';
    this.wordChoices = [];
    this.timer = 0;
    this.timerInterval = null;
    this.strokes = [];
    this.roundPoints = new Map();
    this.messages = [];
    this.io = null;

    this.addPlayer(hostSocket, username, true);
  }

  setIO(io) {
    this.io = io;
  }

  setOnGameEnd(callback) {
    this.onGameEnd = callback;
  }

  addPlayer(socket, username, isHost = false) {
    const existing = this.players.get(socket.id);
    if (existing) {
      socket.join(this.id);
      return { success: true };
    }

    if (this.players.size >= MAX_PLAYERS) {
      return { error: 'Room is full (max 8 players)' };
    }
    if (this.phase !== 'LOBBY' && this.phase !== 'ROUND_END') {
      return { error: 'Game already in progress' };
    }

    this.players.set(socket.id, {
      id: socket.id,
      username,
      score: 0,
      hasGuessed: false,
      isHost: isHost || socket.id === this.hostId,
      roundPoints: 0,
    });

    socket.join(this.id);
    return { success: true };
  }

  removePlayer(socketId) {
    const wasDrawer = this.getDrawerId() === socketId;
    this.players.delete(socketId);

    if (this.players.size === 0) {
      this.clearTimer();
      return { empty: true, wasDrawer };
    }

    if (socketId === this.hostId) {
      const next = this.players.values().next().value;
      if (next) {
        this.hostId = next.id;
        next.isHost = true;
      }
    }

    this.drawOrder = this.drawOrder.filter((id) => this.players.has(id));

    if (wasDrawer && (this.phase === 'DRAWING' || this.phase === 'WORD_SELECT')) {
      return { wasDrawer: true, needsNewDrawer: true };
    }

    return { wasDrawer: false };
  }

  getDrawerId() {
    if (!this.drawOrder.length) return null;
    return this.drawOrder[this.currentDrawerIndex % this.drawOrder.length];
  }

  getPlayerList() {
    return Array.from(this.players.values()).map((p) => ({
      id: p.id,
      username: p.username,
      score: p.score,
      hasGuessed: p.hasGuessed,
      isHost: p.isHost,
      isDrawer: p.id === this.getDrawerId(),
    }));
  }

  canStart() {
    return this.players.size >= MIN_PLAYERS && this.phase === 'LOBBY';
  }

  async startGame(settings) {
    if (!this.canStart()) return { error: 'Need at least 2 players to start' };

    if (settings) {
      this.settings = sanitizeSettings({ ...this.settings, ...settings });
    }

    this.currentRound = 1;
    this.drawOrder = Array.from(this.players.keys());
    this.currentDrawerIndex = 0;
    await this.beginWordSelect();
    return { success: true };
  }

  async beginWordSelect() {
    this.clearTimer();
    this.strokes = [];
    this.secretWord = '';
    this.roundPoints = new Map();

    for (const p of this.players.values()) {
      p.hasGuessed = false;
      p.roundPoints = 0;
    }

    this.wordChoices = await getRandomWords(3, this.settings.categories);
    this.phase = 'WORD_SELECT';
    this.timer = WORD_SELECT_SECONDS;
    this.startTimer(() => {
      if (this.phase === 'WORD_SELECT') {
        this.selectWord(this.wordChoices[0]);
      }
    });
    this.broadcastState();
    this.broadcastCanvasClear();
  }

  selectWord(word) {
    if (this.phase !== 'WORD_SELECT') return { error: 'Not in word selection' };
    const drawerId = this.getDrawerId();
    if (!drawerId) return { error: 'No drawer assigned' };

    const wordResult = validateWordChoice(word, this.wordChoices);
    if (!wordResult.ok) return { error: wordResult.error };

    this.secretWord = wordResult.value.toLowerCase().trim();
    this.phase = 'DRAWING';
    this.strokes = [];
    this.timer = this.settings.drawTime;
    this.clearTimer();

    this.addSystemMessage(`Round ${this.currentRound}: drawing has started!`);
    this.broadcastCanvasClear();

    this.startTimer(() => this.endTurn('timeout'));
    this.broadcastState();
    return { success: true };
  }

  handleStroke(socketId, data) {
    if (this.phase !== 'DRAWING' || socketId !== this.getDrawerId()) return;
    if (this.strokes.length >= MAX_STROKES_PER_ROUND) return;

    const stroke = validateStroke(data);
    if (!stroke) return;

    this.strokes.push(stroke);
    this.io?.to(this.id).emit('draw_stroke', stroke);
  }

  undoStroke(socketId) {
    if (this.phase !== 'DRAWING' || socketId !== this.getDrawerId()) return;
    if (!this.strokes.length) return;

    this.strokes.pop();
    this.io?.to(this.id).emit('canvas_sync', { strokes: this.strokes });
  }

  clearCanvas(socketId) {
    if (this.phase !== 'DRAWING' || socketId !== this.getDrawerId()) return;
    this.strokes = [];
    this.broadcastCanvasClear();
  }

  broadcastCanvasClear() {
    this.io?.to(this.id).emit('clear_canvas', { roomId: this.id });
  }

  handleChat(socketId, message) {
    const player = this.players.get(socketId);
    if (!player) return;

    const messageResult = validateMessage(message);
    if (!messageResult.ok) return;

    const trimmed = messageResult.value;

    if (socketId === this.getDrawerId()) {
      this.addSystemMessage(`${player.username} tried to chat but the drawer cannot send messages.`);
      this.emitTo(socketId, 'chat_rejected', { reason: 'Drawer cannot chat during their turn' });
      return;
    }

    if (this.phase === 'DRAWING' && !player.hasGuessed) {
      const normalizedGuess = trimmed.toLowerCase();
      const normalizedWord = this.secretWord.toLowerCase();

      if (normalizedGuess === normalizedWord) {
        this.awardGuessPoints(socketId);
        return;
      }
    }

    this.addChatMessage(player.username, trimmed, 'chat');
    this.broadcastChat();
  }

  awardGuessPoints(socketId) {
    const player = this.players.get(socketId);
    if (!player || player.hasGuessed) return;

    const timeRatio = this.timer / this.settings.drawTime;
    const points = Math.round(BASE_GUESS_POINTS * timeRatio);
    player.hasGuessed = true;
    player.score += points;
    player.roundPoints += points;

    this.addSystemMessage(`${player.username} guessed the word! (+${points} pts)`);

    const drawer = this.players.get(this.getDrawerId());
    if (drawer) {
      drawer.score += DRAWER_POINTS_PER_GUESSER;
      drawer.roundPoints += DRAWER_POINTS_PER_GUESSER;
    }

    this.broadcastChat();
    this.broadcastState();

    const guessers = Array.from(this.players.values()).filter(
      (p) => p.id !== this.getDrawerId()
    );
    if (guessers.every((p) => p.hasGuessed)) {
      this.endTurn('all_guessed');
    }
  }

  endTurn(reason) {
    if (this.phase !== 'DRAWING' && this.phase !== 'WORD_SELECT') return;

    this.clearTimer();
    this.phase = 'ROUND_END';
    this.timer = ROUND_END_SECONDS;

    const drawer = this.players.get(this.getDrawerId());
    const word = this.secretWord;
    this.addSystemMessage(
      reason === 'timeout'
        ? `Time's up! The word was "${word}".`
        : `Round over! The word was "${word}".`
    );

    if (reason === 'drawer_disconnect' && drawer) {
      this.addSystemMessage(`${drawer.username} disconnected. Turn ended early.`);
    }

    this.broadcastChat();
    this.broadcastState();
    this.broadcastCanvasClear();

    this.startTimer(() => this.advanceAfterRound());
  }

  async advanceAfterRound() {
    this.clearTimer();
    this.currentDrawerIndex += 1;

    const roundsPerPlayer = this.settings.rounds;
    const totalTurns = this.drawOrder.length * roundsPerPlayer;
    const completedTurns =
      (this.currentRound - 1) * this.drawOrder.length + this.currentDrawerIndex;

    if (completedTurns >= totalTurns) {
      this.endGame((stats) => this.onGameEnd?.(stats));
      return;
    }

    if (this.currentDrawerIndex >= this.drawOrder.length) {
      this.currentDrawerIndex = 0;
      this.currentRound += 1;
    }

    await this.beginWordSelect();
  }

  endGame(onComplete) {
    this.phase = 'GAME_END';
    this.timer = 0;
    this.clearTimer();
    this.addSystemMessage('Game over! Check the final scores.');
    this.broadcastChat();
    this.broadcastState();
    const stats = this.getFinalStats();
    onComplete?.(stats);
    return stats;
  }

  getFinalStats() {
    const players = this.getPlayerList();
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    return {
      players,
      winner: winner?.username,
    };
  }

  addChatMessage(username, text, type = 'chat') {
    this.messages.push({
      id: `${Date.now()}-${Math.random()}`,
      username,
      text,
      type,
      timestamp: Date.now(),
    });
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
  }

  addSystemMessage(text) {
    this.addChatMessage('System', text, 'system');
  }

  getMessagesForPlayer(socketId) {
    const player = this.players.get(socketId);
    const hasGuessed = player?.hasGuessed;
    const isDrawer = socketId === this.getDrawerId();

    return this.messages.filter((msg) => {
      if (msg.type === 'system') return true;
      if (isDrawer || hasGuessed || this.phase !== 'DRAWING') return true;

      const normalizedMsg = msg.text.toLowerCase();
      const normalizedWord = this.secretWord.toLowerCase();
      return normalizedMsg !== normalizedWord;
    });
  }

  broadcastChat() {
    for (const [socketId] of this.players) {
      this.emitTo(socketId, 'chat_update', {
        messages: this.getMessagesForPlayer(socketId),
      });
    }
  }

  getStateForPlayer(socketId) {
    const player = this.players.get(socketId);
    const isDrawer = socketId === this.getDrawerId();

    return {
      roomId: this.id,
      phase: this.phase,
      timer: this.timer,
      scores: this.getPlayerList(),
      currentRound: this.currentRound,
      totalRounds: this.settings.rounds,
      drawTime: this.settings.drawTime,
      settings: this.settings,
      isHost: player?.isHost ?? false,
      isDrawer,
      hasGuessed: player?.hasGuessed ?? false,
      hiddenWord:
        this.phase === 'DRAWING' && !isDrawer && !player?.hasGuessed
          ? buildHiddenWord(this.secretWord)
          : this.phase === 'DRAWING'
            ? this.secretWord
            : null,
      wordChoices: this.phase === 'WORD_SELECT' && isDrawer ? this.wordChoices : null,
      secretWord:
        this.phase === 'ROUND_END' || this.phase === 'GAME_END' ? this.secretWord : null,
      drawerId: this.getDrawerId(),
      strokes: this.strokes,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
    };
  }

  broadcastState() {
    for (const [socketId] of this.players) {
      this.emitTo(socketId, 'game_state_update', this.getStateForPlayer(socketId));
    }
  }

  emitTo(socketId, event, payload) {
    this.io?.to(socketId).emit(event, payload);
  }

  startTimer(onComplete) {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timer -= 1;
      this.broadcastState();

      if (this.timer <= 0) {
        this.clearTimer();
        onComplete?.();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  destroy() {
    this.clearTimer();
  }
}

export { MIN_PLAYERS, MAX_PLAYERS, CANVAS_WIDTH, CANVAS_HEIGHT };
