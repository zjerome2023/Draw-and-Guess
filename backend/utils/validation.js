export const ALLOWED_CATEGORIES = ['General', 'Animals', 'Food', 'Tech'];

export const MIN_USERNAME_LENGTH = 2;
export const MAX_USERNAME_LENGTH = 20;
export const MAX_MESSAGE_LENGTH = 100;
export const MAX_STROKES_PER_ROUND = 5000;
export const ROOM_ID_PATTERN = /^[A-F0-9]{8}$/;

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sanitizeCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.filter(
    (c) => typeof c === 'string' && ALLOWED_CATEGORIES.includes(c)
  );
}

export function sanitizeSettings(settings = {}) {
  return {
    rounds: clampInt(settings.rounds, 1, 5, 3),
    drawTime: clampInt(settings.drawTime, 30, 120, 60),
    categories: sanitizeCategories(settings.categories),
  };
}

export function validateUsername(username) {
  if (typeof username !== 'string') {
    return { ok: false, error: 'Username is required' };
  }
  const trimmed = username.trim();
  if (trimmed.length < MIN_USERNAME_LENGTH) {
    return { ok: false, error: `Username must be at least ${MIN_USERNAME_LENGTH} characters` };
  }
  if (trimmed.length > MAX_USERNAME_LENGTH) {
    return { ok: false, error: `Username must be at most ${MAX_USERNAME_LENGTH} characters` };
  }
  return { ok: true, value: trimmed };
}

export function validateMessage(message) {
  if (typeof message !== 'string') {
    return { ok: false, error: 'Message is required' };
  }
  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: 'Message is required' };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` };
  }
  return { ok: true, value: trimmed };
}

export function validateRoomId(roomId) {
  if (typeof roomId !== 'string') {
    return { ok: false, error: 'Room not found' };
  }
  const normalized = roomId.trim().toUpperCase();
  if (!ROOM_ID_PATTERN.test(normalized)) {
    return { ok: false, error: 'Room not found' };
  }
  return { ok: true, value: normalized };
}

export function validateWordChoice(word, wordChoices) {
  if (!Array.isArray(wordChoices) || !wordChoices.length) {
    return { ok: false, error: 'No words available' };
  }
  const normalized = typeof word === 'string' ? word.toLowerCase().trim() : '';
  const match = wordChoices.find((w) => w.toLowerCase() === normalized);
  if (!match) {
    return { ok: false, error: 'Invalid word choice' };
  }
  return { ok: true, value: match };
}

export function validateStroke(data) {
  if (!data || typeof data !== 'object') return null;

  for (const key of ['x', 'y', 'prevX', 'prevY']) {
    const value = data[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
      return null;
    }
  }

  const color =
    typeof data.color === 'string' && HEX_COLOR.test(data.color) ? data.color : '#000000';
  const size = clampInt(data.size, 2, 20, 4);

  return {
    x: data.x,
    y: data.y,
    prevX: data.prevX,
    prevY: data.prevY,
    color,
    size,
  };
}
