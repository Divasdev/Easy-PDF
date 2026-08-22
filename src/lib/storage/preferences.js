const KEY = 'easyreadpdf:prefs';
const defaults = { theme: 'warm', brightness: 72, contrast: 55, temperature: 62, zoom: 1, fitMode: 'width' };

export function getPreferences() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return defaults; }
}

export function savePreferences(preferences) {
  localStorage.setItem(KEY, JSON.stringify(preferences));
}
