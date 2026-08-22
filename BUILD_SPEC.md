# EasyReadPDF — build progress

The product is an entirely client-side, eye-friendly PDF reader. The PDF must
never leave the user’s device. It uses React 18, Vite, Tailwind CSS, and raw
`pdfjs-dist` canvas rendering.

## Locked decisions

- Product name: **EasyReadPDF** (not CalmPDF).
- Reading modes: Original, Warm, Sepia, Dark, and Soft Blue.
- Brightness and contrast are independent *reading* controls. They change the
  rendered pixels; they are not display-brightness controls or an opacity layer.
- The themed render cache is bounded LRU, never an unbounded per-document cache.
- Persist only lightweight preferences and progress. To resume, a person opens
  the same PDF again; PDF bytes are not retained.

## Progress Log

### Phase Checklist

- [x] Phase 0 — Vite React scaffold and project identity
- [x] Phase 1 — Local PDF upload and canvas rendering
- [x] Phase 2 — Page navigation, zoom, fullscreen, and shortcuts
- [x] Phase 3 — Adaptive reading engine: themes, brightness, contrast, LRU cache
- [x] Phase 4 — Text search by PDF page
- [x] Phase 5 — Preferences and reading progress
- [x] Phase 6 — Responsive UI, focus mode, reduced motion, errors, README

### Session Notes

- 2026-08-22: Built the first EasyReadPDF version. Next up: verify with a real
  technical PDF and deploy the Vite site from this repository.
