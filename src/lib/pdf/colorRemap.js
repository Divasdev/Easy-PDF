import { getTheme } from '../themes/themeDefinitions';

const MAX_CACHE = 36;
const cache = new Map();

const hexToRgb = (hex) => hex.match(/\w\w/g).map((value) => parseInt(value, 16));
const clamp = (value) => Math.max(0, Math.min(255, value));

function cacheGet(key) {
  const value = cache.get(key);
  if (value) { cache.delete(key); cache.set(key, value); }
  return value;
}

function cacheSet(key, value) {
  cache.set(key, value);
  if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
}

export function paintReadingCanvas(source, target, settings, cacheKey) {
  const ctx = target.getContext('2d', { alpha: false });
  const cached = cacheGet(cacheKey);
  target.width = source.width;
  target.height = source.height;
  if (cached) { ctx.drawImage(cached, 0, 0); return; }

  if (settings.theme === 'original') {
    ctx.drawImage(source, 0, 0);
    cacheSet(cacheKey, source);
    return;
  }

  const theme = getTheme(settings.theme);
  const bg = hexToRgb(theme.bg);
  const ink = hexToRgb(theme.ink);
  const sourceCtx = source.getContext('2d', { willReadFrequently: true });
  const image = sourceCtx.getImageData(0, 0, source.width, source.height);
  const { data } = image;
  const brightness = settings.brightness / 100;
  const contrast = 0.35 + (settings.contrast / 100) * 0.95;
  const temperature = ((settings.temperature ?? 50) - 50) / 50;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
    const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    const blend = Math.min(1, Math.max(0, (saturation - 0.025) / 0.12));
    const structural = [
      bg[0] + (ink[0] - bg[0]) * (1 - lum),
      bg[1] + (ink[1] - bg[1]) * (1 - lum),
      bg[2] + (ink[2] - bg[2]) * (1 - lum),
    ];
    const mixed = [
      structural[0] * (1 - blend) + r * blend,
      structural[1] * (1 - blend) + g * blend,
      structural[2] * (1 - blend) + b * blend,
    ];
    // Temperature is weighted toward structural pixels; coloured diagrams only get a gentle nudge.
    const temperatureWeight = 1 - blend * 0.72;
    const warm = temperature * temperatureWeight;
    const adjusted = [mixed[0] + warm * 16, mixed[1] + warm * 3, mixed[2] - warm * 22];
    data[i] = clamp(((adjusted[0] / 255 - 0.5) * contrast + 0.5) * 255 * brightness);
    data[i + 1] = clamp(((adjusted[1] / 255 - 0.5) * contrast + 0.5) * 255 * brightness);
    data[i + 2] = clamp(((adjusted[2] / 255 - 0.5) * contrast + 0.5) * 255 * brightness);
  }
  ctx.putImageData(image, 0, 0);
  const snapshot = document.createElement('canvas');
  snapshot.width = target.width; snapshot.height = target.height;
  snapshot.getContext('2d').drawImage(target, 0, 0);
  cacheSet(cacheKey, snapshot);
}

export function clearRenderCache() { cache.clear(); }
