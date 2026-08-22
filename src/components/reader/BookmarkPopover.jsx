/**
 * Bookmark popover: a small list of bookmarked pages with jump-on-click.
 * No notes or labels — just the page jump, per the research finding that
 * controls should be dependable, not feature-heavy.
 */
export default function BookmarkPopover({ bookmarks, onJump, onClose }) {
  return <aside className="bookmark-popover" aria-label="Bookmarked pages">
    <div className="bookmark-heading"><strong>Bookmarks</strong><button onClick={onClose} aria-label="Close bookmarks">×</button></div>
    {bookmarks.length === 0
      ? <p className="bookmark-empty">No bookmarks yet. Tap the bookmark icon to save a page.</p>
      : <div className="bookmark-list">{bookmarks.map((pageNumber) => <button key={pageNumber} onClick={() => { onJump(pageNumber); onClose(); }}>Page {pageNumber}</button>)}</div>}
  </aside>;
}
