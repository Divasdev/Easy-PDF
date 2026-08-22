import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import ReaderPage from './pages/ReaderPage';

export default function App() {
  const [file, setFile] = useState(null);
  return file ? <ReaderPage file={file} onClose={() => setFile(null)} /> : <LandingPage onOpen={setFile} />;
}
