const MAX_CONNECTIONS_PER_IP = 10;

const connectionsByIp = new Map();
const eventCounts = new Map();

const EVENT_LIMITS = {
  draw_stroke: { max: 120, windowMs: 1000 },
  submit_guess: { max: 10, windowMs: 1000 },
  create_room: { max: 5, windowMs: 60_000 },
  join_room: { max: 20, windowMs: 60_000 },
  join_queue: { max: 10, windowMs: 60_000 },
  undo_stroke: { max: 30, windowMs: 1000 },
  clear_canvas: { max: 10, windowMs: 1000 },
};

export function getClientIp(socket) {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return socket.handshake.address || 'unknown';
}

export function trackConnection(ip) {
  const count = connectionsByIp.get(ip) || 0;
  if (count >= MAX_CONNECTIONS_PER_IP) return false;
  connectionsByIp.set(ip, count + 1);
  return true;
}

export function untrackConnection(ip) {
  const count = connectionsByIp.get(ip) || 0;
  if (count <= 1) {
    connectionsByIp.delete(ip);
  } else {
    connectionsByIp.set(ip, count - 1);
  }
}

export function checkRateLimit(socketId, event) {
  const limit = EVENT_LIMITS[event];
  if (!limit) return true;

  const key = `${socketId}:${event}`;
  const now = Date.now();
  let entry = eventCounts.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + limit.windowMs };
    eventCounts.set(key, entry);
  }

  entry.count += 1;
  return entry.count <= limit.max;
}

export function clearSocketRateLimits(socketId) {
  for (const key of eventCounts.keys()) {
    if (key.startsWith(`${socketId}:`)) {
      eventCounts.delete(key);
    }
  }
}
