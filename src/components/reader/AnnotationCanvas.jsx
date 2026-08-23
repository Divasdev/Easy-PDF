import { useCallback, useEffect, useRef } from 'react';
import { renderAllStrokes, renderStroke, simplifyPoints, hitTestStroke } from '../../lib/annotations/drawStrokes';
import { strokeId } from '../../lib/storage/annotations';

/**
 * Transparent canvas overlay for drawing annotations on a single PDF page.
 *
 * Coordinates are normalized 0–1 relative to the page's native size at
 * scale=1. Screen→page conversion happens on pointerdown/move; page→screen
 * conversion happens on every redraw.
 */
export default function AnnotationCanvas({
  pageNumber,
  annotating,
  tool,
  color,
  strokeWidth,
  strokes,
  onStrokeComplete,
  onEraseStroke,
  canvasWidth,
  canvasHeight,
}) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const currentPoints = useRef([]);
  const startPoint = useRef(null);
  const lastScreenPoint = useRef(null);

  /* Convert screen coordinates relative to the canvas to normalized 0–1. */
  const toNormalized = useCallback((clientX, clientY) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, []);

  /* Full redraw from stored strokes. */
  const redraw = useCallback(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    renderAllStrokes(ctx, strokes, cvs.width, cvs.height);
  }, [strokes]);

  /* Resize canvas pixels and redraw whenever dimensions or strokes change. */
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs || !canvasWidth || !canvasHeight) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = Math.ceil(canvasWidth * dpr);
    cvs.height = Math.ceil(canvasHeight * dpr);
    cvs.style.width = `${canvasWidth}px`;
    cvs.style.height = `${canvasHeight}px`;
    const ctx = cvs.getContext('2d');
    ctx.scale(dpr, dpr);
    renderAllStrokes(ctx, strokes, canvasWidth, canvasHeight);
  }, [canvasWidth, canvasHeight, strokes]);

  /* -------- Pointer handlers -------- */

  const handlePointerDown = useCallback((e) => {
    if (!annotating) return;
    /* Skip multi-touch (let two-finger scroll/pinch through). */
    if (e.pointerType === 'touch' && e.isPrimary === false) return;

    e.preventDefault();
    e.stopPropagation();
    ref.current?.setPointerCapture(e.pointerId);

    const norm = toNormalized(e.clientX, e.clientY);

    if (tool === 'eraser') {
      const id = hitTestStroke(strokes, norm.x, norm.y);
      if (id) onEraseStroke(pageNumber, id);
      return;
    }

    drawing.current = true;
    lastScreenPoint.current = { x: e.clientX, y: e.clientY };

    if (tool === 'circle') {
      startPoint.current = norm;
      currentPoints.current = [norm, norm];
    } else {
      currentPoints.current = [norm];
    }
  }, [annotating, tool, strokes, toNormalized, onEraseStroke, pageNumber]);

  const handlePointerMove = useCallback((e) => {
    if (!drawing.current || !annotating) return;
    e.preventDefault();
    e.stopPropagation();

    const norm = toNormalized(e.clientX, e.clientY);

    if (tool === 'circle') {
      /* Update the second point (corner) for live preview. */
      currentPoints.current = [startPoint.current, norm];
    } else {
      /* Distance-threshold decimation: skip points too close to last kept. */
      const last = lastScreenPoint.current;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (dx * dx + dy * dy < 4) return; /* 2px threshold */
      lastScreenPoint.current = { x: e.clientX, y: e.clientY };
      currentPoints.current.push(norm);
    }

    /* Live preview: redraw stored strokes + the in-progress stroke. */
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = canvasWidth;
    const h = canvasHeight;
    renderAllStrokes(ctx, strokes, w, h);
    renderStroke(ctx, { tool, color, strokeWidth, points: currentPoints.current }, w, h);
  }, [annotating, tool, color, strokeWidth, strokes, toNormalized, canvasWidth, canvasHeight]);

  const handlePointerUp = useCallback((e) => {
    if (!drawing.current) return;
    drawing.current = false;
    e.preventDefault();
    e.stopPropagation();

    const points = tool === 'circle'
      ? currentPoints.current
      : simplifyPoints(currentPoints.current);

    if (points.length === 0) return;
    /* For circles, need at least 2 distinct points. */
    if (tool === 'circle' && points.length < 2) return;

    const stroke = {
      id: strokeId(),
      tool,
      color,
      strokeWidth,
      points,
      createdAt: Date.now(),
    };
    onStrokeComplete(pageNumber, stroke);
    currentPoints.current = [];
    startPoint.current = null;
  }, [tool, color, strokeWidth, pageNumber, onStrokeComplete]);

  /* Cancel drawing if pointer leaves (e.g., finger slides off). */
  const handlePointerCancel = useCallback(() => {
    drawing.current = false;
    currentPoints.current = [];
    startPoint.current = null;
    redraw();
  }, [redraw]);

  return (
    <canvas
      ref={ref}
      className={`annotation-canvas ${annotating ? 'is-annotating' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: annotating ? 'none' : 'auto' }}
    />
  );
}
