import { useEffect, useState } from 'react';

export default function SearchPanel({ pdf, onJump, onClose }) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) { setMatches([]); return undefined; }
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
      if (!cancelled) { setMatches(found); setSearching(false); }
    }, 280);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [pdf, query]);
  return <aside className="search-panel" aria-label="Search PDF">
    <div className="search-heading"><strong>Search document</strong><button onClick={onClose} aria-label="Close search">×</button></div>
    <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search text…" aria-label="Search text" />
    {searching && <p className="search-muted">Searching pages…</p>}
    {!searching && query && <p className="search-muted">{matches.reduce((sum, match) => sum + match.occurrences, 0)} matches on {matches.length} pages</p>}
    <div className="search-results">{matches.map((match) => <button key={match.pageNumber} onClick={() => onJump(match.pageNumber)}><b>Page {match.pageNumber}</b><span>{match.excerpt}…</span></button>)}</div>
  </aside>;
}
