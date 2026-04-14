// router.js — fetches content.json once, manages navigation logic
import { getState, setState } from './state.js';
import * as renderer from './renderer.js';

let content = null; // cached content.json

export async function init() {
  const res = await fetch('content.json');
  if (!res.ok) throw new Error(`content.json fetch failed: ${res.status}`);
  content = await res.json();
}

export function getContent() {
  return content;
}

export async function navigate(id) {
  const section = content.sections[id];
  if (!section) {
    renderer.showError(`Section "${id}" not found.`);
    return;
  }

  // Push the previous section onto visitedStack (not the destination)
  const state = getState() ?? { currentSection: null, history: {}, visitedStack: [] };
  const prev = state.currentSection;
  const newStack = prev ? [...(state.visitedStack ?? []), prev] : (state.visitedStack ?? []);

  setState({ currentSection: id, visitedStack: newStack });

  // If this is a stub section, render stub regardless of button state
  if (section.stub) {
    let md = '';
    try {
      const res = await fetch(section.file);
      if (!res.ok) throw new Error('fetch failed');
      md = await res.text();
    } catch {
      renderer.showError('This section could not be loaded.');
      renderer.updateBackButton(newStack.length > 0);
      return;
    }
    if (!window.marked) {
      renderer.showError('Content renderer unavailable. Please refresh.');
      renderer.updateBackButton(newStack.length > 0);
      return;
    }
    const html = window.marked.parse(md);
    renderer.renderSection(section, html);
    renderer.showStub();
    renderer.updateBackButton(newStack.length > 0);
    return;
  }

  let md = '';
  try {
    const res = await fetch(section.file);
    if (!res.ok) throw new Error('fetch failed');
    md = await res.text();
  } catch {
    renderer.showError('This section could not be loaded.');
    renderer.updateBackButton(newStack.length > 0);
    return;
  }

  if (!window.marked) {
    renderer.showError('Content renderer unavailable. Please refresh.');
    renderer.updateBackButton(newStack.length > 0);
    return;
  }
  const html = window.marked.parse(md);
  renderer.renderSection(section, html);
  renderer.updateBackButton(newStack.length > 0);
}

export async function navigateU() {
  const state = getState();
  const currentId = state?.currentSection;
  if (!currentId) return;

  const section = content.sections[currentId];
  if (!section) return;

  if (section.u !== null && section.u !== undefined) {
    await navigate(section.u);
  } else {
    renderer.showStub();
  }
}

export async function back() {
  const state = getState();
  const stack = state?.visitedStack ?? [];
  if (stack.length === 0) return;

  const prev = stack[stack.length - 1];
  const newStack = stack.slice(0, -1);
  const savedCurrentId = state.currentSection;

  // Pre-set currentSection to null to prevent navigate() from pushing it back onto the stack.
  setState({ currentSection: null, visitedStack: newStack });
  try {
    await navigate(prev);
  } catch {
    // Restore state so the user isn't stuck with currentSection: null
    setState({ currentSection: savedCurrentId, visitedStack: stack });
    renderer.showError('Navigation failed. Please try again.');
  }
}
