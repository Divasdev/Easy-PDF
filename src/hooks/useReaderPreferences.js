import { useEffect, useState } from 'react';
import { getPreferences, savePreferences } from '../lib/storage/preferences';

export function useReaderPreferences() {
  const [preferences, setPreferences] = useState(getPreferences);
  useEffect(() => { savePreferences(preferences); }, [preferences]);
  return [preferences, setPreferences];
}
