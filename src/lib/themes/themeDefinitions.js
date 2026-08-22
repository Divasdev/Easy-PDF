export const themes = [
  { id: 'original', name: 'Original', bg: '#ffffff', ink: '#171719', brightness: 100, contrast: 100, temperature: 50 },
  { id: 'warm', name: 'Warm', bg: '#F5EFE3', ink: '#3A3226', brightness: 72, contrast: 55, temperature: 62 },
  { id: 'sepia', name: 'Sepia', bg: '#F1E4CF', ink: '#4B3B2A', brightness: 76, contrast: 58, temperature: 70 },
  { id: 'dark', name: 'Dark', bg: '#1B1B1F', ink: '#D8D8DC', brightness: 45, contrast: 60, temperature: 58 },
  { id: 'soft-blue', name: 'Soft Blue', bg: '#EAF0F5', ink: '#29323A', brightness: 74, contrast: 56, temperature: 42 },
];

export const readingPresets = [
  { id: 'day', name: 'Day', icon: '☀', theme: 'soft-blue', brightness: 90, contrast: 56, temperature: 44 },
  { id: 'warm', name: 'Warm', icon: '◐', theme: 'warm', brightness: 72, contrast: 55, temperature: 62 },
  { id: 'night', name: 'Night', icon: '☾', theme: 'dark', brightness: 45, contrast: 60, temperature: 62 },
  { id: 'deep-night', name: 'Deep night', icon: '✦', theme: 'dark', brightness: 29, contrast: 54, temperature: 80 },
];

export const getTheme = (id) => themes.find((theme) => theme.id === id) || themes[1];
export const getPreset = (id) => readingPresets.find((preset) => preset.id === id) || readingPresets[1];
