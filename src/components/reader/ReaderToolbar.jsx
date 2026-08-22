import { useEffect, useState } from 'react';
import { themes, getTheme } from '../../lib/themes/themeDefinitions';

function IconButton({ label, onClick, children, disabled = false, active = false }) {
  return <button className={`tool-icon ${active ? 'active' : ''}`} type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}>{children}</button>;
}

export default function ReaderToolbar({ settings, setSettings, page, pages, goToPage, toggleFocus, focus, toggleFullscreen, searchOpen, setSearchOpen }) {
  const [expanded, setExpanded] = useState(true);
  const [pageInput, setPageInput] = useState(String(page));
  useEffect(() => setPageInput(String(page)), [page]);
  const theme = getTheme(settings.theme);
  const custom = settings.theme !== 'original' && (settings.brightness !== theme.brightness || settings.contrast !== theme.contrast);
  const chooseTheme = (id) => {
    const selection = getTheme(id);
    setSettings((old) => ({ ...old, theme: id, brightness: selection.brightness, contrast: selection.contrast }));
  };
  const adjust = (key, value) => setSettings((old) => ({ ...old, [key]: Number(value) }));
  return <div className={`reader-toolbar ${expanded ? 'expanded' : ''}`}>
    <div className="toolbar-row primary-tools">
      <IconButton label="Previous page" onClick={() => goToPage(page - 1)} disabled={page <= 1}>←</IconButton>
      <form onSubmit={(event) => { event.preventDefault(); goToPage(Number(pageInput)); }} className="page-jump">
        <input aria-label="Go to page" value={pageInput} onChange={(event) => setPageInput(event.target.value)} inputMode="numeric" /> <span>/ {pages}</span>
      </form>
      <IconButton label="Next page" onClick={() => goToPage(page + 1)} disabled={page >= pages}>→</IconButton>
      <span className="tool-divider" />
      <IconButton label="Zoom out" onClick={() => adjust('zoom', Math.max(.6, +(settings.zoom - .1).toFixed(1)))}>−</IconButton>
      <span className="zoom-label">{Math.round(settings.zoom * 100)}%</span>
      <IconButton label="Zoom in" onClick={() => adjust('zoom', Math.min(2.2, +(settings.zoom + .1).toFixed(1)))}>+</IconButton>
      <span className="tool-divider" />
      <IconButton label="Search PDF" onClick={() => setSearchOpen(!searchOpen)} active={searchOpen}>⌕</IconButton>
      <IconButton label="Fullscreen" onClick={toggleFullscreen}>⛶</IconButton>
      <IconButton label="Focus mode" onClick={toggleFocus} active={focus}>◉</IconButton>
    </div>
    <button type="button" className="appearance-toggle" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
      <span>{theme.name}{custom ? ' · Custom' : ''}</span><span aria-hidden="true">{expanded ? '⌄' : '⌃'}</span>
    </button>
    {expanded && <div className="appearance-panel">
      <div className="theme-options" role="group" aria-label="Reading theme">
        {themes.map((item) => <button type="button" key={item.id} onClick={() => chooseTheme(item.id)} className={item.id === settings.theme ? 'selected' : ''}><i style={{ background: item.bg, borderColor: item.ink }} />{item.name}</button>)}
      </div>
      {settings.theme !== 'original' && <>
        <label className="reading-slider"><span>☼ Reading brightness <output>{settings.brightness}%</output></span><input type="range" min="25" max="115" value={settings.brightness} onChange={(event) => adjust('brightness', event.target.value)} /></label>
        <label className="reading-slider"><span>◐ Contrast <output>{settings.contrast}%</output></span><input type="range" min="25" max="115" value={settings.contrast} onChange={(event) => adjust('contrast', event.target.value)} /></label>
        {custom && <button type="button" className="reset-adjustments" onClick={() => chooseTheme(settings.theme)}>Reset adjustments</button>}
      </>}
    </div>}
  </div>;
}
