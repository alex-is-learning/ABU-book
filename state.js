// state.js — sole interface to localStorage for abu_state
// Schema: { currentSection: string, history: { [id]: "A"|"B"|"U" }, visitedStack: string[] }

const KEY = 'abu_state';

export function getState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setState(patch) {
  try {
    const current = getState() ?? { currentSection: null, history: {}, visitedStack: [] };
    const next = { ...current, ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded): app continues without persistence
  }
}
