const KEY = 'easyreadpdf:progress';

export const fileFingerprint = (file) => `${file.name}::${file.size}::${file.lastModified}`;

function allProgress() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

export function getProgress(file) { return allProgress()[fileFingerprint(file)] || null; }

export function saveProgress(file, progress) {
  const records = allProgress();
  const existing = records[fileFingerprint(file)] || {};
  records[fileFingerprint(file)] = { ...existing, ...progress, updatedAt: Date.now(), fileName: file.name };
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getLatestProgress() {
  return Object.values(allProgress()).sort((a, b) => b.updatedAt - a.updatedAt)[0] || null;
}

export function getBookmarks(file) {
  const record = getProgress(file);
  return Array.isArray(record?.bookmarks) ? record.bookmarks : [];
}

export function toggleBookmark(file, pageNumber) {
  const current = getBookmarks(file);
  const next = current.includes(pageNumber)
    ? current.filter((p) => p !== pageNumber)
    : [...current, pageNumber].sort((a, b) => a - b);
  saveProgress(file, { bookmarks: next });
  return next;
}
