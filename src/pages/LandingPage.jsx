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
      <h1>Your PDFs are fine.<br /><em>Reading them for hours isn’t.</em></h1>
      <p className="landing-intro">Textbooks, papers, lecture notes, and technical PDFs — in a reading environment made for the long session, not just the first page.</p>
      <UploadDropzone onOpen={onOpen} />
      <p className="privacy-line">◌ Your PDF stays on your device. No account, no upload.</p>
      {session && <div className="resume-note"><span>Last session</span><strong>{session.fileName}</strong><span>Page {session.lastPage} · {session.percentComplete}% complete</span><small>Open this PDF again to resume.</small></div>}
      <ThemePreviewStrip />
      <section className="landing-problem" aria-labelledby="problem-title"><p className="eyebrow">A familiar study problem</p><h2 id="problem-title">Stop fighting the page.<br />Start reading.</h2><div className="problem-grid"><article><strong>“The page is blinding me.”</strong><span>Bright paper is great for print. It can be a lot at 11pm.</span></article><article><strong>“I keep zooming in and out.”</strong><span>Small text, giant margins, then sideways scrolling. Again.</span></article><article><strong>“Dark mode didn’t fix it.”</strong><span>Your interface changed. The PDF was still a white rectangle.</span></article></div></section>
      <section className="landing-promise"><p className="eyebrow">Same PDF, better reading environment</p><h2>Keep the equations, tables, code, and diagrams.</h2><p>EasyReadPDF changes the reading environment — not the structure of your document. Choose a tone, adjust the light, then focus.</p><div className="study-list"><span>📐 Mathematics</span><span>💻 Computer science</span><span>⚙ Engineering</span><span>🔬 Research papers</span></div></section>
      <section className="landing-why"><h2>Why not just use dark mode?</h2><p>System dark mode changes the app around the PDF. EasyReadPDF is built around the page itself, while keeping coloured charts and diagrams recognisable.</p></section>
    </section>
  </main>;
}
