/**
 * Browser-only autosave for the current draft (spec: no server, no accounts).
 *
 * Keeps just the one in-progress document so a refresh or accidental tab close
 * doesn't lose work. Not a version history — deliberately. Everything is wrapped
 * in try/catch because localStorage throws in private mode / when storage is
 * disabled, and the app must work regardless.
 */

import type { RequirementsDoc } from "./types";

const KEY = "amadursinsight:draft:v1";

interface StoredDraft {
  savedAt: string;
  doc: RequirementsDoc;
}

export function loadDraft(): RequirementsDoc | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed?.doc || !Array.isArray(parsed.doc.requirements)) return null;
    return parsed.doc;
  } catch {
    return null;
  }
}

export function saveDraft(doc: RequirementsDoc): void {
  try {
    const payload: StoredDraft = { savedAt: new Date().toISOString(), doc };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable — the app still works, it just won't persist */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
