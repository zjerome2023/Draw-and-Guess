export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export function toNormalized(x, y, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (x - rect.left) / rect.width,
    y: (y - rect.top) / rect.height,
  };
}

export function fromNormalized(nx, ny, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: nx * rect.width,
    y: ny * rect.height,
  };
}

export function drawStroke(ctx, stroke, canvas) {
  const start = fromNormalized(stroke.prevX, stroke.prevY, canvas);
  const end = fromNormalized(stroke.x, stroke.y, canvas);

  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

export function redrawCanvas(ctx, canvas, strokes) {
  const { width, height } = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  for (const stroke of strokes) {
    drawStroke(ctx, stroke, canvas);
  }
}
