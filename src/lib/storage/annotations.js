/**
 * Annotation storage using IndexedDB via the `idb` wrapper.
 *
 * Stroke data can grow large (many pages × many strokes × many points),
 * so we use IndexedDB rather than localStorage. The same file fingerprint
 * pattern from progress.js is used as the key.
 *
 * Schema: object store "annotations", keyed by fingerprint string.
 * Each value is { [pageNumber]: Stroke[] }.
 */
import { openDB } from 'idb';

const DB_NAME = 'easyreadpdf';
const DB_VERSION = 1;
const STORE = 'annotations';

function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

/**
 * Load all annotations for a document.
 * @param {string} fingerprint — file fingerprint from progress.js
 * @returns {Promise<Object>} — { [pageNumber]: Stroke[] } or empty object
 */
export async function loadAnnotations(fingerprint) {
  const db = await getDb();
  const data = await db.get(STORE, fingerprint);
  return data || {};
}

/**
 * Save (overwrite) all annotations for a document.
 * @param {string} fingerprint
 * @param {Object} data — { [pageNumber]: Stroke[] }
 */
export async function saveAnnotations(fingerprint, data) {
  const db = await getDb();
  await db.put(STORE, data, fingerprint);
}

/**
 * Delete all annotations for a document.
 * @param {string} fingerprint
 */
export async function deleteAnnotations(fingerprint) {
  const db = await getDb();
  await db.delete(STORE, fingerprint);
}

/** Generate a short unique id for strokes. */
export function strokeId() {
  return `s${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
