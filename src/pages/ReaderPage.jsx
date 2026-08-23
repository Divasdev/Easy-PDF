import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APP_NAME } from '../lib/constants';
import { usePdfDocument } from '../hooks/usePdfDocument';
import { useReaderPreferences } from '../hooks/useReaderPreferences';
import PdfViewport from '../components/reader/PdfViewport';
import ReaderToolbar from '../components/reader/ReaderToolbar';
import SearchPanel from '../components/reader/SearchPanel';
import TocDrawer from '../components/reader/TocDrawer';
import BookmarkPopover from '../components/reader/BookmarkPopover';
import { getProgress, saveProgress, getBookmarks, toggleBookmark, fileFingerprint } from '../lib/storage/progress';
import { getTheme } from '../lib/themes/themeDefinitions';
import { loadAnnotations, saveAnnotations } from '../lib/storage/annotations';

export default function ReaderPage({ file, onClose }) {
  const { document: pdf, error, loading } = usePdfDocument(file);
  const [settings, setSettings] = useReaderPreferences();
  const saved = useMemo(() => getProgress(file), [file]);
  const [page, setPage] = useState(saved?.lastPage || 1);
  const [targetPage, setTargetPage] = useState(saved?.lastPage || 1);
  const [focus, setFocus] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const [hasOutline, setHasOutline] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => getBookmarks(file));
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  /* ── Annotation state ── */
  const [annotating, setAnnotating] = useState(false);
  const [annoTool, setAnnoTool] = useState('pen');
  const [annoColor, setAnnoColor] = useState('#E5484D');
  const [annoStrokeWidth, setAnnoStrokeWidth] = useState(2);
  const [allAnnotations, setAllAnnotations] = useState({});
  const [undoStack, setUndoStack] = useState([]);
  const annoSaveTimer = useRef(null);
  const fingerprint = useMemo(() => fileFingerprint(file), [file]);

  const reader = useRef(null);
  const settingsRef = useRef(settings);
  const previewFrame = useRef();
  const pages = pdf?.numPages || 0;
  settingsRef.current = settings;
  const applyPreview = useCallback((draft) => {
    cancelAnimationFrame(previewFrame.current);
    previewFrame.current = requestAnimationFrame(() => {
      const committed = settingsRef.current;
      reader.current?.style.setProperty('--preview-brightness', String(draft.brightness / committed.brightness));
      reader.current?.style.setProperty('--preview-contrast', String((0.35 + draft.contrast * .0095) / (0.35 + committed.contrast * .0095)));
    });
  }, []);

  /* Eagerly probe for an outline so the ToC button can show/hide immediately. */
  useEffect(() => {
    if (!pdf) return;
    pdf.getOutline().then((result) => {
      setHasOutline(Array.isArray(result) && result.length > 0);
    }).catch(() => setHasOutline(false));
  }, [pdf]);

  /* Load annotations from IndexedDB on mount. */
  useEffect(() => {
    loadAnnotations(fingerprint).then(setAllAnnotations).catch(() => {});
  }, [fingerprint]);

  /* Debounced save helper. */
  const scheduleSave = useCallback((data) => {
    clearTimeout(annoSaveTimer.current);
    annoSaveTimer.current = setTimeout(() => {
      saveAnnotations(fingerprint, data).catch(() => {});
    }, 300);
  }, [fingerprint]);

  /* Cleanup save timer on unmount. */
  useEffect(() => () => clearTimeout(annoSaveTimer.current), []);

  /* ── Annotation handlers ── */
  const onStrokeComplete = useCallback((pageNum, stroke) => {
    setAllAnnotations((prev) => {
      const pageStrokes = [...(prev[pageNum] || []), stroke];
      const next = { ...prev, [pageNum]: pageStrokes };
      scheduleSave(next);
      return next;
    });
    setUndoStack((prev) => [...prev, { action: 'add', page: pageNum, stroke }]);
  }, [scheduleSave]);

  const onEraseStroke = useCallback((pageNum, strokeId) => {
    setAllAnnotations((prev) => {
      const pageStrokes = prev[pageNum] || [];
      const target = pageStrokes.find((s) => s.id === strokeId);
      if (!target) return prev;
      const next = { ...prev, [pageNum]: pageStrokes.filter((s) => s.id !== strokeId) };
      scheduleSave(next);
      setUndoStack((old) => [...old, { action: 'erase', page: pageNum, stroke: target }]);
      return next;
    });
  }, [scheduleSave]);

  const onUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const entry = prev[prev.length - 1];
      setAllAnnotations((old) => {
        let next;
        if (entry.action === 'add') {
          const pageStrokes = (old[entry.page] || []).filter((s) => s.id !== entry.stroke.id);
          next = { ...old, [entry.page]: pageStrokes };
        } else if (entry.action === 'erase') {
          const pageStrokes = [...(old[entry.page] || []), entry.stroke];
          next = { ...old, [entry.page]: pageStrokes };
        } else if (entry.action === 'clear') {
          next = { ...old, [entry.page]: entry.strokes };
        } else {
          return old;
        }
        scheduleSave(next);
        return next;
      });
      return prev.slice(0, -1);
    });
  }, [scheduleSave]);

  const onClearPage = useCallback(() => {
    const currentPageStrokes = allAnnotations[page] || [];
    if (currentPageStrokes.length === 0) return;
    setUndoStack((prev) => [...prev, { action: 'clear', page, strokes: currentPageStrokes }]);
    setAllAnnotations((prev) => {
      const next = { ...prev, [page]: [] };
      scheduleSave(next);
      return next;
    });
  }, [page, allAnnotations, scheduleSave]);

  useEffect(() => {
    if (!pdf) return undefined;
    const timer = setTimeout(() => saveProgress(file, { lastPage: page, percentComplete: Math.round((page / pages) * 100) }), 450);
    return () => clearTimeout(timer);
  }, [file, page, pages, pdf]);

  const goToPage = useCallback((value) => {
    if (!pages) return;
    const next = Math.max(1, Math.min(pages, Number(value) || 1));
    setPage(next); setTargetPage(next);
    requestAnimationFrame(() => document.getElementById(`page-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [pages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) reader.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const onKey = (event) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (typing) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); goToPage(page + 1); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goToPage(page - 1); }
      if (event.key === '+' || event.key === '=') setSettings((value) => ({ ...value, zoom: Math.min(2.2, +(value.zoom + .1).toFixed(1)) }));
      if (event.key === '-') setSettings((value) => ({ ...value, zoom: Math.max(.6, +(value.zoom - .1).toFixed(1)) }));
      if (event.key === '0') setSettings((value) => ({ ...value, zoom: 1 }));
      if (event.key === '/') { event.preventDefault(); setSearchOpen(true); }
      if (event.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); setAnnotating(false); if (document.fullscreenElement) document.exitFullscreen(); }
      if (event.key === 'f') toggleFullscreen();
      if (event.key === 'F') setFocus((value) => !value);
      if (event.key === 't') setSettings((value) => {
        const next = ['original', 'warm', 'sepia', 'dark', 'soft-blue'][(['original', 'warm', 'sepia', 'dark', 'soft-blue'].indexOf(value.theme) + 1) % 5];
        const preset = getTheme(next); return { ...value, theme: next, brightness: preset.brightness, contrast: preset.contrast, temperature: preset.temperature };
      });
      if (event.key === 'o') setSettings((value) => {
        const next = value.theme === 'original' ? 'warm' : 'original'; const preset = getTheme(next);
        return { ...value, theme: next, brightness: preset.brightness, contrast: preset.contrast, temperature: preset.temperature };
      });
      if (/^[1-5]$/.test(event.key)) {
        const item = ['original', 'warm', 'sepia', 'dark', 'soft-blue'][Number(event.key) - 1];
        setSettings((value) => { const preset = getTheme(item); return { ...value, theme: item, brightness: preset.brightness, contrast: preset.contrast, temperature: preset.temperature }; });
      }
      if (event.key === 'g') document.querySelector('.page-jump input')?.focus();
      if (event.key === 'b') { setBookmarks(toggleBookmark(file, page)); }
      if (event.key === 'a') { setAnnotating((v) => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToPage, page, setSettings]);

  if (loading) return <div className="reader-state"><div className="loader" /><p>Opening your PDF…</p></div>;
  if (error) return <div className="reader-state"><h1>We couldn't open that PDF.</h1><p>{error.message || 'The file may be damaged or password protected.'}</p><button onClick={onClose}>Choose another PDF</button></div>;

  return <main ref={reader} className={`reader-shell ${focus ? 'focus-mode' : ''}`}>
    <header className="reader-header"><button className="back-button" onClick={onClose}>← <span>Library</span></button><div className="reader-file"><span>{file.name}</span><small>{APP_NAME} · private on-device reading</small></div><div className="header-progress">Page {page} / {pages}<span>{Math.round((page / pages) * 100)}%</span></div></header>
    {searchOpen && <SearchPanel pdf={pdf} onJump={(next) => { goToPage(next); }} onClose={() => { setSearchOpen(false); setSearchQuery(''); }} onQueryChange={setSearchQuery} />}
    {tocOpen && <TocDrawer pdf={pdf} onJump={(next) => { goToPage(next); setTocOpen(false); }} onClose={() => setTocOpen(false)} onOutlineAvailable={setHasOutline} />}
    {bookmarksOpen && <BookmarkPopover bookmarks={bookmarks} onJump={goToPage} onClose={() => setBookmarksOpen(false)} />}
    <PdfViewport pdf={pdf} settings={settings} onPageChange={setPage} startPage={targetPage} searchQuery={searchQuery} annotating={annotating} annoTool={annoTool} annoColor={annoColor} annoStrokeWidth={annoStrokeWidth} allAnnotations={allAnnotations} onStrokeComplete={onStrokeComplete} onEraseStroke={onEraseStroke} />
    <ReaderToolbar settings={settings} setSettings={setSettings} page={page} pages={pages} goToPage={goToPage} toggleFocus={() => setFocus((value) => !value)} focus={focus} toggleFullscreen={toggleFullscreen} searchOpen={searchOpen} setSearchOpen={setSearchOpen} onPreview={applyPreview} hasOutline={hasOutline} tocOpen={tocOpen} setTocOpen={setTocOpen} bookmarks={bookmarks} isPageBookmarked={bookmarks.includes(page)} onToggleBookmark={() => setBookmarks(toggleBookmark(file, page))} bookmarksOpen={bookmarksOpen} setBookmarksOpen={setBookmarksOpen} annotating={annotating} setAnnotating={setAnnotating} annoTool={annoTool} setAnnoTool={setAnnoTool} annoColor={annoColor} setAnnoColor={setAnnoColor} annoStrokeWidth={annoStrokeWidth} setAnnoStrokeWidth={setAnnoStrokeWidth} onUndo={onUndo} onClearPage={onClearPage} currentPageStrokes={allAnnotations[page] || []} undoStack={undoStack} />
  </main>;
}
