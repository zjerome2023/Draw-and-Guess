import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { drawStroke, redrawCanvas, toNormalized } from '../../utils/canvas';
import ToolBar from './ToolBar';

const THROTTLE_MS = 16;
const EMPTY_STROKES = [];

export default function GameCanvas({ isDrawer, initialStrokes = EMPTY_STROKES }) {
  const { socket } = useSocket();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const strokesRef = useRef([...initialStrokes]);
  const lastSyncedStrokes = useRef(initialStrokes);
  const lastEmit = useRef(0);

  const [color, setColor] = useState('#190029');
  const [size, setSize] = useState(6);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    redrawCanvas(ctx, canvas, strokesRef.current);
  }, []);

  useEffect(() => {
    if (initialStrokes === lastSyncedStrokes.current) return;
    lastSyncedStrokes.current = initialStrokes;
    strokesRef.current = [...initialStrokes];
    resizeCanvas();
  }, [initialStrokes, resizeCanvas]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const onStroke = (stroke) => {
      strokesRef.current.push(stroke);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) drawStroke(ctx, stroke, canvas);
    };

    const onClear = () => {
      strokesRef.current = [];
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const { width, height } = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
    };

    const onSync = ({ strokes }) => {
      strokesRef.current = strokes || [];
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) redrawCanvas(ctx, canvas, strokesRef.current);
    };

    socket.on('draw_stroke', onStroke);
    socket.on('clear_canvas', onClear);
    socket.on('canvas_sync', onSync);

    return () => {
      socket.off('draw_stroke', onStroke);
      socket.off('clear_canvas', onClear);
      socket.off('canvas_sync', onSync);
    };
  }, [socket]);

  const emitStroke = (x, y, prevX, prevY) => {
    const now = Date.now();
    if (now - lastEmit.current < THROTTLE_MS) return;
    lastEmit.current = now;

    const stroke = { x, y, prevX, prevY, color, size };
    strokesRef.current.push(stroke);
    socket.emit('draw_stroke', stroke);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) drawStroke(ctx, stroke, canvas);
  };

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return toNormalized(clientX, clientY, canvas);
  };

  const startDraw = (e) => {
    if (!isDrawer) return;
    e.preventDefault();
    drawing.current = true;
    const point = getPoint(e);
    if (point) lastPoint.current = point;
  };

  const moveDraw = (e) => {
    if (!isDrawer || !drawing.current || !lastPoint.current) return;
    e.preventDefault();
    const point = getPoint(e);
    if (!point) return;

    emitStroke(point.x, point.y, lastPoint.current.x, lastPoint.current.y);
    lastPoint.current = point;
  };

  const endDraw = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const handleUndo = () => socket.emit('undo_stroke');
  const handleClear = () => socket.emit('clear_canvas');

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-lg">
      <div ref={containerRef} className="flex-1 relative min-h-[300px]">
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 touch-none ${isDrawer ? 'cursor-crosshair' : 'cursor-default'}`}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />
      </div>
      {isDrawer && (
        <ToolBar
          color={color}
          size={size}
          onColorChange={setColor}
          onSizeChange={setSize}
          onUndo={handleUndo}
          onClear={handleClear}
        />
      )}
    </div>
  );
}
