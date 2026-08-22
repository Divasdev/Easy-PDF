import { useEffect, useRef, useState } from 'react';
import { getTheme, readingPresets, themes } from '../../lib/themes/themeDefinitions';

function IconButton({ label, onClick, children, disabled = false, active = false }) {
  return <button className={`tool-icon has-tooltip ${active ? 'active' : ''}`} type="button" onClick={onClick} disabled={disabled} aria-label={label} data-tooltip={label}>{children}</button>;
}

export default function ReaderToolbar({ settings, setSettings, page, pages, goToPage, toggleFocus, focus, toggleFullscreen, searchOpen, setSearchOpen, onPreview, hasOutline, tocOpen, setTocOpen }) {
  const [expanded, setExpanded] = useState(false);
  const [pageInput, setPageInput] = useState(String(page));
  const [draft, setDraft] = useState(settings);
  const commitTimer = useRef();
  useEffect(() => setPageInput(String(page)), [page]);
  useEffect(() => { setDraft(settings); onPreview?.(settings); }, [settings, onPreview]);
  useEffect(() => () => clearTimeout(commitTimer.current), []);

  const commit = (next) => { clearTimeout(commitTimer.current); commitTimer.current = setTimeout(() => setSettings((old) => ({ ...old, ...next })), 180); };
  const adjust = (key, value) => { const next = { ...draft, [key]: Number(value) }; setDraft(next); onPreview?.(next); commit(next); };
  const apply = (next) => { clearTimeout(commitTimer.current); setDraft(next); onPreview?.(next); setSettings((old) => ({ ...old, ...next })); };
  const chooseTheme = (id) => { const selection = getTheme(id); apply({ ...draft, theme: id, brightness: selection.brightness, contrast: selection.contrast, temperature: selection.temperature }); };
  const selectedPreset = readingPresets.find((preset) => ['theme', 'brightness', 'contrast', 'temperature'].every((key) => preset[key] === draft[key]));

  return <>
    <aside className={`reading-panel ${expanded ? 'is-expanded' : 'is-minimized'}`} aria-label="Reading controls">
      {!expanded ? <button type="button" className="reading-panel-launch has-tooltip" onClick={() => setExpanded(true)} aria-label="Open reading controls" data-tooltip="Reading controls">☼</button> : <>
        <div className="reading-panel-heading"><span>Reading comfort</span><button type="button" className="has-tooltip" onClick={() => setExpanded(false)} aria-label="Minimize reading controls" data-tooltip="Minimize controls">−</button></div>
        <div className="comfort-group"><span className="control-label">Quick preset <em>{selectedPreset ? selectedPreset.name : 'Custom'}</em></span><div className="preset-options">{readingPresets.map((preset) => <button type="button" key={preset.id} className={selectedPreset?.id === preset.id ? 'selected' : ''} onClick={() => apply({ ...draft, theme: preset.theme, brightness: preset.brightness, contrast: preset.contrast, temperature: preset.temperature })}>{preset.icon}<span>{preset.name}</span></button>)}</div></div>
        <div className="comfort-group"><span className="control-label">Theme</span><div className="theme-options" role="group" aria-label="Reading theme">{themes.map((item) => <button type="button" key={item.id} onClick={() => chooseTheme(item.id)} className={item.id === draft.theme ? 'selected' : ''}><i style={{ background: item.bg, borderColor: item.ink }} />{item.name}</button>)}</div></div>
        {draft.theme !== 'original' && <div className="comfort-group sliders">
          <label className="reading-slider"><span>☼ Brightness <output>{draft.brightness}%</output></span><input type="range" min="25" max="115" value={draft.brightness} onChange={(event) => adjust('brightness', event.target.value)} /></label>
          <label className="reading-slider"><span>◐ Contrast <output>{draft.contrast}%</output></span><input type="range" min="25" max="115" value={draft.contrast} onChange={(event) => adjust('contrast', event.target.value)} /></label>
          <label className="reading-slider"><span>◌ Color temperature <output>{draft.temperature < 50 ? 'Cool' : draft.temperature > 50 ? 'Warm' : 'Neutral'}</output></span><div className="temperature-range"><small>Cool</small><input aria-label="Color temperature" type="range" min="0" max="100" value={draft.temperature} onChange={(event) => adjust('temperature', event.target.value)} /><small>Warm</small></div></label>
          <button type="button" className="reset-adjustments" onClick={() => chooseTheme(draft.theme)}>Reset adjustments</button>
        </div>}
      </>}
    </aside>
    <nav className="reader-navigation" aria-label="Page controls">
      <IconButton label="Previous page · Left arrow" onClick={() => goToPage(page - 1)} disabled={page <= 1}>←</IconButton><form onSubmit={(event) => { event.preventDefault(); goToPage(Number(pageInput)); }} className="page-jump"><input aria-label="Go to page · G" value={pageInput} onChange={(event) => setPageInput(event.target.value)} inputMode="numeric" /> <span>/ {pages}</span></form><IconButton label="Next page · Right arrow" onClick={() => goToPage(page + 1)} disabled={page >= pages}>→</IconButton><span className="tool-divider" />
      <IconButton label="Zoom out · Minus" onClick={() => apply({ ...draft, zoom: Math.max(.6, +(draft.zoom - .1).toFixed(1)) })}>−</IconButton><span className="zoom-label">{Math.round(draft.zoom * 100)}%</span><IconButton label="Zoom in · Plus" onClick={() => apply({ ...draft, zoom: Math.min(2.2, +(draft.zoom + .1).toFixed(1)) })}>+</IconButton><span className="tool-divider" />
      <IconButton label="Search document · /" onClick={() => setSearchOpen(!searchOpen)} active={searchOpen}>⌕</IconButton>{hasOutline && <IconButton label="Table of contents" onClick={() => setTocOpen(!tocOpen)} active={tocOpen}>☰</IconButton>}<IconButton label="Fullscreen · F" onClick={toggleFullscreen}>⛶</IconButton><IconButton label="Focus mode · Shift F" onClick={toggleFocus} active={focus}>◉</IconButton>
    </nav>
  </>;
}
