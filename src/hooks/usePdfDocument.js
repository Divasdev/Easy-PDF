import { useEffect, useState } from 'react';
import { loadPdf } from '../lib/pdf/pdfLoader';

export function usePdfDocument(file) {
  const [state, setState] = useState({ document: null, error: null, loading: true });
  useEffect(() => {
    let live = true;
    setState({ document: null, error: null, loading: true });
    loadPdf(file)
      .then((document) => live && setState({ document, error: null, loading: false }))
      .catch((error) => live && setState({ document: null, error, loading: false }));
    return () => { live = false; };
  }, [file]);
  return state;
}
