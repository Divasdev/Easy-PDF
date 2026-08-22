const KEY = 'easyreadpdf:progress';

export const fileFingerprint = (file) => `${file.name}::${file.size}::${file.lastModified}`;

function allProgress() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

export function getProgress(file) { return allProgress()[fileFingerprint(file)] || null; }

export function saveProgress(file, progress) {
  const records = allProgress();
  records[fileFingerprint(file)] = { ...progress, updatedAt: Date.now(), fileName: file.name };
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getLatestProgress() {
  return Object.values(allProgress()).sort((a, b) => b.updatedAt - a.updatedAt)[0] || null;
}
