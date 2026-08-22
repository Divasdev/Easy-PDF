import { useCallback, useEffect, useRef } from 'react';
import PdfCanvasPage from './PdfCanvasPage';

export default function PdfViewport({ pdf, settings, onPageChange, startPage = 1, searchQuery }) {
  const viewport = useRef(null);
  const current = useRef(startPage);
  const visible = useCallback((page) => {
    if (page !== current.current) { current.current = page; onPageChange(page); }
  }, [onPageChange]);

  useEffect(() => {
    const target = document.getElementById(`page-${startPage}`);
    if (target) target.scrollIntoView({ block: 'start' });
  }, [startPage]);

  return <section ref={viewport} className="pdf-viewport" aria-label="PDF document">
    <div className="pdf-pages">
      {Array.from({ length: pdf.numPages }, (_, index) => <PdfCanvasPage key={index + 1} pdf={pdf} pageNumber={index + 1} settings={settings} onVisible={visible} searchQuery={searchQuery} />)}
    </div>
  </section>;
}
