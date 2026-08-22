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

export default function PdfCanvasPage({ pdf, pageNumber, settings, onVisible }) {
  const host = useRef(null);
  const canvas = useRef(null);
  const [inView, setInView] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1.414);

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
    };
    render().catch(() => {});
    return () => { cancelled = true; };
  }, [pdf, pageNumber, inView, settings.theme, settings.brightness, settings.contrast, settings.temperature, settings.zoom]);

  return <article ref={host} id={`page-${pageNumber}`} className="pdf-page" style={{ aspectRatio: 1 / (aspectRatio * settings.zoom) }} aria-label={`PDF page ${pageNumber}`}>
    {inView ? <canvas ref={canvas} /> : <div className="page-skeleton">Page {pageNumber}</div>}
    <span className="page-number">{pageNumber}</span>
  </article>;
}
