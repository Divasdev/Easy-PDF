import UploadDropzone from '../components/upload/UploadDropzone';
import ThemePreviewStrip from '../components/landing/ThemePreviewStrip';
import { getLatestProgress } from '../lib/storage/progress';
import { APP_NAME } from '../lib/constants';

export default function LandingPage({ onOpen }) {
  const session = getLatestProgress();
  return <main className="landing-shell">
    <section className="landing-content">
      <div className="brand"><span className="brand-mark">e</span>{APP_NAME}</div>
      <p className="eyebrow">Private reading, gentler light</p>
      <h1>Read for hours.<br /><em>Comfortably.</em></h1>
      <p className="landing-intro">A quiet, eye-friendly space for textbooks, papers, and long PDFs. Your document stays on your device.</p>
      <UploadDropzone onOpen={onOpen} />
      {session && <div className="resume-note"><span>Last session</span><strong>{session.fileName}</strong><span>Page {session.lastPage} · {session.percentComplete}% complete</span><small>Open this PDF again to resume.</small></div>}
      <ThemePreviewStrip />
    </section>
  </main>;
}
