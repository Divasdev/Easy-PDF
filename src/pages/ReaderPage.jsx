import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APP_NAME } from '../lib/constants';
import { usePdfDocument } from '../hooks/usePdfDocument';
import { useReaderPreferences } from '../hooks/useReaderPreferences';
import PdfViewport from '../components/reader/PdfViewport';
import ReaderToolbar from '../components/reader/ReaderToolbar';
import SearchPanel from '../components/reader/SearchPanel';
import TocDrawer from '../components/reader/TocDrawer';
import { getProgress, saveProgress } from '../lib/storage/progress';
import { getTheme } from '../lib/themes/themeDefinitions';

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
      if (event.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); if (document.fullscreenElement) document.exitFullscreen(); }
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
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToPage, page, setSettings]);

  if (loading) return <div className="reader-state"><div className="loader" /><p>Opening your PDF…</p></div>;
  if (error) return <div className="reader-state"><h1>We couldn’t open that PDF.</h1><p>{error.message || 'The file may be damaged or password protected.'}</p><button onClick={onClose}>Choose another PDF</button></div>;

  return <main ref={reader} className={`reader-shell ${focus ? 'focus-mode' : ''}`}>
    <header className="reader-header"><button className="back-button" onClick={onClose}>← <span>Library</span></button><div className="reader-file"><span>{file.name}</span><small>{APP_NAME} · private on-device reading</small></div><div className="header-progress">Page {page} / {pages}<span>{Math.round((page / pages) * 100)}%</span></div></header>
    {searchOpen && <SearchPanel pdf={pdf} onJump={(next) => { goToPage(next); }} onClose={() => { setSearchOpen(false); setSearchQuery(''); }} onQueryChange={setSearchQuery} />}
    {tocOpen && <TocDrawer pdf={pdf} onJump={(next) => { goToPage(next); setTocOpen(false); }} onClose={() => setTocOpen(false)} onOutlineAvailable={setHasOutline} />}
    <PdfViewport pdf={pdf} settings={settings} onPageChange={setPage} startPage={targetPage} searchQuery={searchQuery} />
    <ReaderToolbar settings={settings} setSettings={setSettings} page={page} pages={pages} goToPage={goToPage} toggleFocus={() => setFocus((value) => !value)} focus={focus} toggleFullscreen={toggleFullscreen} searchOpen={searchOpen} setSearchOpen={setSearchOpen} onPreview={applyPreview} hasOutline={hasOutline} tocOpen={tocOpen} setTocOpen={setTocOpen} />
  </main>;
}
