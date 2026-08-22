import { useCallback, useEffect, useState } from 'react';

/**
 * Table of Contents drawer. Uses pdf.getOutline() which returns a tree of
 * { title, dest, items } nodes, or null when the PDF has no outline.
 */
export default function TocDrawer({ pdf, onJump, onClose, onOutlineAvailable }) {
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    pdf.getOutline().then((result) => {
      if (!live) return;
      const hasOutline = Array.isArray(result) && result.length > 0;
      setOutline(hasOutline ? result : null);
      setLoading(false);
      onOutlineAvailable?.(hasOutline);
    }).catch(() => {
      if (live) { setOutline(null); setLoading(false); onOutlineAvailable?.(false); }
    });
    return () => { live = false; };
  }, [pdf, onOutlineAvailable]);

  const resolve = useCallback(async (dest) => {
    try {
      /* dest can be a string (named destination) or an array (explicit destination). */
      const resolved = typeof dest === 'string' ? await pdf.getDestination(dest) : dest;
      if (!resolved) return;
      const pageIndex = await pdf.getPageIndex(resolved[0]);
      onJump(pageIndex + 1); // pdf.js page indices are 0-based; our pages are 1-based
    } catch { /* ignore unresolvable destinations */ }
  }, [pdf, onJump]);

  if (loading) return null;
  if (!outline) return null;

  return <aside className="toc-drawer" aria-label="Table of contents">
    <div className="toc-heading"><strong>Contents</strong><button onClick={onClose} aria-label="Close table of contents">×</button></div>
    <nav className="toc-tree">
      <OutlineList items={outline} resolve={resolve} depth={0} />
    </nav>
  </aside>;
}

function OutlineList({ items, resolve, depth }) {
  if (!items || items.length === 0) return null;
  return <ul className={`toc-level toc-level-${Math.min(depth, 3)}`}>
    {items.map((item, index) => <li key={`${depth}-${index}`}>
      <button onClick={() => resolve(item.dest)} className="toc-item">{item.title || '(untitled)'}</button>
      {item.items && item.items.length > 0 && <OutlineList items={item.items} resolve={resolve} depth={depth + 1} />}
    </li>)}
  </ul>;
}
