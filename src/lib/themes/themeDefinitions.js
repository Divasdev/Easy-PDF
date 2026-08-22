export const themes = [
  { id: 'original', name: 'Original', bg: '#ffffff', ink: '#171719', brightness: 100, contrast: 100 },
  { id: 'warm', name: 'Warm', bg: '#F5EFE3', ink: '#3A3226', brightness: 72, contrast: 55 },
  { id: 'sepia', name: 'Sepia', bg: '#F1E4CF', ink: '#4B3B2A', brightness: 76, contrast: 58 },
  { id: 'dark', name: 'Dark', bg: '#1B1B1F', ink: '#D8D8DC', brightness: 45, contrast: 60 },
  { id: 'soft-blue', name: 'Soft Blue', bg: '#EAF0F5', ink: '#29323A', brightness: 74, contrast: 56 },
];

export const getTheme = (id) => themes.find((theme) => theme.id === id) || themes[1];
