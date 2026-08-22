import { useEffect, useRef, useState } from 'react';
import { paintReadingCanvas } from '../../lib/pdf/colorRemap';

const MAX_SOURCE_CACHE = 12;
const sourceCache = new Map();
function readSource(key) {
  const source = sourceCache.get(key);
  if (source) { sourceCache.delete(key); sourceCache.set(key, source); }
  return source;
}
function rememberSource(key, source) {
  sourceCache.set(key, source);
  if (sourceCache.size > MAX_SOURCE_CACHE) sourceCache.delete(sourceCache.keys().next().value);
}

/** Mark matching text spans with highlight classes. */
function applyHighlights(container, query) {
  if (!container) return;
  const spans = container.querySelectorAll('span');
  const needle = query?.trim().toLocaleLowerCase();
  spans.forEach((span) => {
    span.classList.remove('text-layer-highlight');
    if (needle && span.textContent.toLocaleLowerCase().includes(needle)) {
      span.classList.add('text-layer-highlight');
    }
  });
}

export default function PdfCanvasPage({ pdf, pageNumber, settings, onVisible, searchQuery }) {
  const host = useRef(null);
  const canvas = useRef(null);
  const textLayer = useRef(null);
  const [inView, setInView] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1.414);
  const lastCssScale = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); onVisible(pageNumber); }
    }, { rootMargin: '900px 0px' });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, [pageNumber, onVisible]);

  useEffect(() => {
    if (!inView || !host.current || !canvas.current) return undefined;
    let cancelled = false;
    const render = async () => {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      setAspectRatio(base.height / base.width);
      const width = Math.min(host.current.clientWidth, 1100);
      const cssScale = (width / base.width) * settings.zoom;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: cssScale * dpr });
      const sourceKey = `${pdf.fingerprints?.[0] || 'document'}-${pageNumber}-${Math.round(viewport.width)}-${Math.round(viewport.height)}`;
      let source = readSource(sourceKey);
      if (!source) {
        source = document.createElement('canvas');
        source.width = Math.ceil(viewport.width); source.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: source.getContext('2d', { alpha: false }), viewport }).promise;
        rememberSource(sourceKey, source);
      }
      if (cancelled || !canvas.current) return;
      const key = `${pageNumber}-${settings.theme}-${settings.brightness}-${settings.contrast}-${settings.temperature}-${Math.round(viewport.width)}`;
      paintReadingCanvas(source, canvas.current, settings, key);
      canvas.current.style.width = `${viewport.width / dpr}px`;
      canvas.current.style.height = `${viewport.height / dpr}px`;

      /* Build the text layer overlay for selection and highlighting. */
      if (textLayer.current && cssScale !== lastCssScale.current) {
        lastCssScale.current = cssScale;
        textLayer.current.innerHTML = '';
        textLayer.current.style.width = `${viewport.width / dpr}px`;
        textLayer.current.style.height = `${viewport.height / dpr}px`;
        const content = await page.getTextContent();
        if (cancelled) return;
        const cssViewport = page.getViewport({ scale: cssScale });
        content.items.forEach((item) => {
          if (!item.str) return;
          const tx = item.transform;
          const span = document.createElement('span');
          span.textContent = item.str;
          const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
          const scaledFontSize = fontSize * cssScale;
          /* tx[4],tx[5] are the x,y in unscaled page coordinates.
             PDF y-axis is bottom-up; CSS is top-down, so we flip. */
          const left = tx[4] * cssScale;
          const top = cssViewport.height - tx[5] * cssScale - scaledFontSize;
          span.style.cssText = `position:absolute;left:${left}px;top:${top}px;font-size:${scaledFontSize}px;transform:scaleX(${item.width ? (item.width * cssScale) / (item.str.length * scaledFontSize * 0.5) : 1});transform-origin:left bottom;`;
          textLayer.current.appendChild(span);
        });
        applyHighlights(textLayer.current, searchQuery);
      }
    };
    render().catch(() => {});
    return () => { cancelled = true; };
  }, [pdf, pageNumber, inView, settings.theme, settings.brightness, settings.contrast, settings.temperature, settings.zoom]);

  /* Re-apply highlights when searchQuery changes (without re-rendering the text layer). */
  useEffect(() => {
    applyHighlights(textLayer.current, searchQuery);
  }, [searchQuery]);

  return <article ref={host} id={`page-${pageNumber}`} className="pdf-page" style={{ aspectRatio: 1 / (aspectRatio * settings.zoom) }} aria-label={`PDF page ${pageNumber}`}>
    {inView ? <>
      <canvas ref={canvas} />
      <div ref={textLayer} className="text-layer" />
    </> : <div className="page-skeleton">Page {pageNumber}</div>}
    <span className="page-number">{pageNumber}</span>
  </article>;
}
