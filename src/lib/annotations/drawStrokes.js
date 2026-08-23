/**
 * Pure functions for rendering annotation strokes onto a 2D canvas context.
 * All stroke coordinates are in normalized 0–1 page space; rendering
 * converts to pixel coordinates using the canvas dimensions.
 */

/**
 * Render a single stroke onto the canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} stroke — { tool, color, strokeWidth, points }
 * @param {number} w — canvas pixel width
 * @param {number} h — canvas pixel height
 */
export function renderStroke(ctx, stroke, w, h) {
  if (!stroke.points || stroke.points.length === 0) return;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke.color;

  if (stroke.tool === 'highlighter') {
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineWidth = (stroke.strokeWidth || 4) * 3;
  } else {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = stroke.strokeWidth || 2;
  }

  if (stroke.tool === 'circle' && stroke.points.length >= 2) {
    /* Circle/ellipse: two points = center + corner of bounding box. */
    const cx = stroke.points[0].x * w;
    const cy = stroke.points[0].y * h;
    const rx = Math.abs(stroke.points[1].x * w - cx);
    const ry = Math.abs(stroke.points[1].y * h - cy);
    if (rx < 1 && ry < 1) return;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    /* Pen / highlighter: polyline through points. */
    ctx.beginPath();
    const p0 = stroke.points[0];
    ctx.moveTo(p0.x * w, p0.y * h);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
    }
    if (stroke.points.length === 1) {
      /* Single point: draw a dot. */
      ctx.lineTo(p0.x * w + 0.5, p0.y * h);
    }
    ctx.stroke();
  }

  /* Reset compositing. */
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Clear the canvas and redraw all strokes for a page.
 */
export function renderAllStrokes(ctx, strokes, w, h) {
  ctx.clearRect(0, 0, w, h);
  if (!strokes || strokes.length === 0) return;
  for (const stroke of strokes) {
    renderStroke(ctx, stroke, w, h);
  }
}

/**
 * Distance-threshold point decimation.
 * Filters out points that are closer than `threshold` (in normalized 0–1
 * space) to the last kept point. Always keeps the first and last point.
 */
export function simplifyPoints(points, threshold = 0.003) {
  if (points.length <= 2) return points;
  const result = [points[0]];
  let last = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const dx = points[i].x - last.x;
    const dy = points[i].y - last.y;
    if (dx * dx + dy * dy >= threshold * threshold) {
      result.push(points[i]);
      last = points[i];
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

/**
 * Hit-test: find the first stroke within `tolerance` (normalized 0–1 space)
 * of the given point. Returns the stroke id, or null.
 */
export function hitTestStroke(strokes, nx, ny, tolerance = 0.015) {
  if (!strokes) return null;
  const tSq = tolerance * tolerance;
  for (let i = strokes.length - 1; i >= 0; i--) {
    const s = strokes[i];
    if (s.tool === 'circle' && s.points.length >= 2) {
      /* For circles, test distance to the ellipse perimeter (approximation). */
      const cx = s.points[0].x;
      const cy = s.points[0].y;
      const rx = Math.abs(s.points[1].x - cx);
      const ry = Math.abs(s.points[1].y - cy);
      if (rx < 0.001 && ry < 0.001) continue;
      /* Normalize to unit circle space and check if point is near the perimeter. */
      const dx = (nx - cx) / (rx || 0.001);
      const dy = (ny - cy) / (ry || 0.001);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dist - 1) < tolerance / Math.min(rx || 0.01, ry || 0.01)) return s.id;
    } else {
      for (const p of s.points) {
        const dx = p.x - nx;
        const dy = p.y - ny;
        if (dx * dx + dy * dy < tSq) return s.id;
      }
    }
  }
  return null;
}
