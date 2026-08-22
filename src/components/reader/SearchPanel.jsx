import { useEffect, useState } from 'react';

export default function SearchPanel({ pdf, onJump, onClose, onQueryChange }) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* Emit query to parent so text-layer highlighting can follow. */
  useEffect(() => { onQueryChange?.(query); }, [query, onQueryChange]);

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) { setMatches([]); setCurrentIndex(0); return undefined; }
    setSearching(true);
    const timer = setTimeout(async () => {
      const needle = query.toLocaleLowerCase();
      const found = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items.map((item) => item.str).join(' ');
        const occurrences = text.toLocaleLowerCase().split(needle).length - 1;
        if (occurrences) found.push({ pageNumber, occurrences, excerpt: text.slice(Math.max(0, text.toLocaleLowerCase().indexOf(needle) - 36), text.toLocaleLowerCase().indexOf(needle) + 96) });
      }
      if (!cancelled) { setMatches(found); setCurrentIndex(0); setSearching(false); }
    }, 280);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [pdf, query]);

  const total = matches.reduce((sum, match) => sum + match.occurrences, 0);
  const jumpToIndex = (index) => {
    const clamped = ((index % matches.length) + matches.length) % matches.length;
    setCurrentIndex(clamped);
    onJump(matches[clamped].pageNumber);
  };
  const handleClose = () => { onQueryChange?.(''); onClose(); };

  return <aside className="search-panel" aria-label="Search PDF">
    <div className="search-heading"><strong>Search document</strong><button onClick={handleClose} aria-label="Close search">×</button></div>
    <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search text…" aria-label="Search text" onKeyDown={(event) => { if (event.key === 'Enter' && matches.length) { event.preventDefault(); jumpToIndex(event.shiftKey ? currentIndex - 1 : currentIndex + 1); } }} />
    {searching && <p className="search-muted">Searching pages…</p>}
    {!searching && query && <div className="search-nav-row"><span className="search-muted">{total} match{total !== 1 ? 'es' : ''} on {matches.length} page{matches.length !== 1 ? 's' : ''}</span>{matches.length > 1 && <span className="search-nav-buttons"><button onClick={() => jumpToIndex(currentIndex - 1)} aria-label="Previous match" className="search-nav-btn">▲</button><button onClick={() => jumpToIndex(currentIndex + 1)} aria-label="Next match" className="search-nav-btn">▼</button></span>}</div>}
    <div className="search-results">{matches.map((match, index) => <button key={match.pageNumber} onClick={() => { setCurrentIndex(index); onJump(match.pageNumber); }} className={index === currentIndex ? 'active-match' : ''}><b>Page {match.pageNumber}</b><span>{match.excerpt}…</span></button>)}</div>
  </aside>;
}
