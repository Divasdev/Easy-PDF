import { useCallback, useEffect, useRef } from 'react';
import PdfCanvasPage from './PdfCanvasPage';

export default function PdfViewport({ pdf, settings, onPageChange, startPage = 1, searchQuery, annotating, annoTool, annoColor, annoStrokeWidth, allAnnotations, onStrokeComplete, onEraseStroke }) {
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
      {Array.from({ length: pdf.numPages }, (_, index) => {
        const pageNum = index + 1;
        return <PdfCanvasPage key={pageNum} pdf={pdf} pageNumber={pageNum} settings={settings} onVisible={visible} searchQuery={searchQuery} annotating={annotating} annoTool={annoTool} annoColor={annoColor} annoStrokeWidth={annoStrokeWidth} strokes={allAnnotations[pageNum] || []} onStrokeComplete={onStrokeComplete} onEraseStroke={onEraseStroke} />;
      })}
    </div>
  </section>;
}
