/**
 * Annotation sub-toolbar: tool selector, color palette, stroke width,
 * undo, and clear-page. Docked above the main floating toolbar.
 */

const COLORS = [
  { id: 'red', value: '#E5484D' },
  { id: 'green', value: '#2E9E6B' },
  { id: 'blue', value: '#3B82F6' },
  { id: 'yellow', value: '#F2B705' },
];

const WIDTHS = [
  { id: 'thin', value: 2, size: 4 },
  { id: 'medium', value: 4, size: 7 },
  { id: 'thick', value: 6, size: 10 },
];

export default function AnnotationToolbar({
  tool, setTool, color, setColor, strokeWidth, setStrokeWidth,
  onUndo, onClearPage, hasStrokes, canUndo,
}) {
  return (
    <div className="annotation-toolbar" aria-label="Annotation controls">
      {/* Tool selector */}
      <div className="anno-group" role="group" aria-label="Drawing tool">
        <button
          className={`anno-tool ${tool === 'pen' ? 'selected' : ''}`}
          onClick={() => setTool('pen')}
          aria-label="Pen"
          title="Pen"
        >✎</button>
        <button
          className={`anno-tool ${tool === 'highlighter' ? 'selected' : ''}`}
          onClick={() => { setTool('highlighter'); setColor('#F2B705'); }}
          aria-label="Highlighter"
          title="Highlighter"
        >▬</button>
        <button
          className={`anno-tool ${tool === 'circle' ? 'selected' : ''}`}
          onClick={() => setTool('circle')}
          aria-label="Circle"
          title="Circle / Ellipse"
        >○</button>
        <button
          className={`anno-tool ${tool === 'eraser' ? 'selected' : ''}`}
          onClick={() => setTool('eraser')}
          aria-label="Eraser"
          title="Eraser (tap a stroke)"
        >◌</button>
      </div>

      <span className="anno-divider" />

      {/* Color palette — hidden for eraser */}
      {tool !== 'eraser' && (
        <div className="anno-group" role="group" aria-label="Stroke color">
          {COLORS.map((c) => (
            <button
              key={c.id}
              className={`anno-color ${color === c.value ? 'selected' : ''}`}
              onClick={() => setColor(c.value)}
              aria-label={`Color: ${c.id}`}
              title={c.id}
            >
              <span className="anno-color-dot" style={{ background: c.value }} />
            </button>
          ))}
        </div>
      )}

      {/* Stroke width — hidden for eraser */}
      {tool !== 'eraser' && <>
        <span className="anno-divider" />
        <div className="anno-group" role="group" aria-label="Stroke width">
          {WIDTHS.map((w) => (
            <button
              key={w.id}
              className={`anno-width ${strokeWidth === w.value ? 'selected' : ''}`}
              onClick={() => setStrokeWidth(w.value)}
              aria-label={`Width: ${w.id}`}
              title={w.id}
            >
              <span className="anno-width-dot" style={{ width: w.size, height: w.size }} />
            </button>
          ))}
        </div>
      </>}

      <span className="anno-divider" />

      {/* Actions */}
      <div className="anno-group">
        <button
          className="anno-action"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last stroke"
          title="Undo"
        >↩</button>
        <button
          className="anno-action"
          onClick={onClearPage}
          disabled={!hasStrokes}
          aria-label="Clear all annotations on this page"
          title="Clear page"
        >✕</button>
      </div>
    </div>
  );
}
