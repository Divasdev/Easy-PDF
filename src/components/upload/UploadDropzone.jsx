import { useRef, useState } from 'react';

export default function UploadDropzone({ onOpen }) {
  const input = useRef();
  const [dragging, setDragging] = useState(false);
  const choose = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return;
    onOpen(file);
  };
  return <>
    <button
      className={`dropzone ${dragging ? 'is-dragging' : ''}`}
      onClick={() => input.current?.click()}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }}
      aria-label="Choose a PDF to read"
    >
      <span className="upload-icon" aria-hidden="true">↥</span>
      <span className="dropzone-title">Drop a PDF here</span>
      <span className="dropzone-copy">or choose a file from your device</span>
      <span className="dropzone-button">Read a PDF</span>
    </button>
    <input ref={input} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => choose(event.target.files[0])} />
  </>;
}
