# EasyReadPDF — qualitative user research

Date: 2026-08-22. This is directional product research, not prevalence data.
Public forum posts are anecdotes; accessibility guidance is used for technical
constraints and not as evidence of student prevalence.

## Ten recurring problems

| Problem | Signal and evidence | EasyReadPDF opportunity |
|---|---|---|
| White PDF pages are harsh at night | A reader seeking an iPad PDF night mode described the page as too bright after trying device brightness and dark appearance; another student-side project was motivated by class PDFs at night. [iPad discussion](https://www.reddit.com/r/ipad/comments/19dy3il/pdf_reader_where_i_can_switch_the_background/), [class-PDF discussion](https://www.reddit.com/r/SideProject/comments/1liiqgc) | Warm/Dark modes plus independent brightness and temperature. Avoid health claims. |
| Inversion damages visual material | A recent PDF-reader discussion explicitly asks for dark mode that does not invert images; the iPad discussion calls browser-extension results suboptimal. [discussion](https://www.reddit.com/r/pdf/comments/1uzy34u/anyone_else_annoyed_by_pdf_dark_mode_inverting/) | Saturation-aware remapping; keep a one-click Original view. |
| Zoom is repeatedly lost | Users report PDF readers resetting zoom on every page and ask for zoom lock. [iPad](https://www.reddit.com/r/ipad/comments/1r0ur45/does_anyone_else_hate_how_pdf_readers_zoom_out/), [Supernote](https://www.reddit.com/r/Supernote/comments/1ico7lt) | Persist zoom across pages and sessions; make fit width predictable. |
| Zoomed scrolling is imprecise | Android and e-ink readers report accidental lateral movement or jumpy framing while zoomed. [Android](https://www.reddit.com/r/pdf/comments/mvedz8), [Supernote](https://www.reddit.com/r/Supernote/comments/1uxj19i/pdf_zooming_precision/) | Keep zoom controls subtle, preserve scale, and avoid gesture conflicts. |
| Mobile PDF reading is awkward | A phone user says reading PDFs is only possible “in theory”; another describes accidentally triggering rapid scroll and losing their place. [RemNote](https://www.reddit.com/r/remNote/comments/195veid), [Android](https://www.reddit.com/r/androidapps/comments/r0i3h9) | Phone-friendly default width, minimal controls, and reliable progress restore. |
| Returning to a place matters | A user contrasts Firefox favourably for gestures but notes it does not retain the last page. [Android discussion](https://www.reddit.com/r/AndroidQuestions/comments/1u5prmw/drives_pdf_reader_glitch_zooming_outin/) | Save lightweight reading progress, then ask the reader to reopen the same local file. |
| Reflow cannot be assumed safe | W3C notes that diagrams and data tables can require two-dimensional layout; tagged PDFs may reflow, but that depends on document quality. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Preserve page fidelity by default; do not rebuild technical PDFs as plain text. |
| Complex PDFs need visual integrity | PDF accessibility guidance explains that document semantics and visual layout are separate, and that reflow capability depends on tags. [PDF Association](https://pdfa.org/techniques-for-accessible-pdf-background/) | Keep equations, figures, code, tables, and scans visually recognisable. |
| Reader controls can get in the way | The zoom and accidental-scroll reports show that reading controls and gestures must be dependable rather than feature-heavy. | Minimized upper-corner comfort panel; persistent but unobtrusive navigation. |
| Accessibility needs an intentional UI | WCAG requires keyboard-operable content and visible focus, while its reflow exception explicitly recognises meaningful two-dimensional content. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Keyboard shortcuts, labelled controls, focus styles, tooltips, and reduced motion. |

## Ranked feature opportunities

| Rank | Feature | User value | Build cost | Why now |
|---:|---|---|---|---|
| 1 | Smooth brightness/contrast controls | High | Medium | Directly supports the core comfort loop. |
| 2 | Warm/dark modes and temperature | High | Medium | Addresses harsh-paper feedback without a blunt overlay. |
| 3 | Stable zoom + fit width | High | Medium | Repeated forum frustration. |
| 4 | Reading progress and reopen-to-resume | High | Low | Solves a concrete interruption problem privately. |
| 5 | Focus mode | High | Low | Reduces interface friction in long sessions. |
| 6 | Search with match navigation/highlight | High | Medium | Important for technical reference reading; highlighting remains next. |
| 7 | Document outline / table of contents | Medium | Medium | Useful when an outline exists. |
| 8 | Bookmark page | Medium | Low | A small, focused productivity feature. |
| 9 | Pinch zoom refinement | Medium | Medium | Valuable mobile work, best validated on devices. |
| 10 | Single-page mode | Medium | Medium | Helpful preference, not needed for the core loop. |

## Landing-page direction

- **Strongest pain:** “Your PDFs are fine. Reading them for hours isn’t.”
- **Promise:** Same PDF, better reading environment.
- **CTA:** “Read a PDF” — immediately opens the local file picker.
- **Trust message:** “Your PDF stays on your device. No account, no upload.”
- **Proof:** Interactive page preview that switches themes rather than relying on a marketing screenshot.

## Explicit non-goals

Do not add accounts, cloud uploads, AI summaries/chat, payment flows,
collaboration, social features, or a full annotation suite. They weaken the
focused loop: upload → adjust → focus → read.
