// app.js — bootstrap and event delegation
import * as router from './router.js';
import { getState, setState } from './state.js';

async function boot() {
  try {
    await router.init();
  } catch {
    document.getElementById('content-area').innerHTML =
      '<p class="error-message">Could not load content. Please refresh.</p>';
    return;
  }

  const content = router.getContent();
  const startId = content.start;
  const savedId = getState()?.currentSection ?? null;

  // Reset visitedStack to empty on fresh boot so Back is disabled initially.
  // If there is a saved currentSection we restore it but don't reconstruct history.
  const initialId = savedId ?? startId;
  setState({ currentSection: null, visitedStack: [] });
  await router.navigate(initialId);
}

document.addEventListener('DOMContentLoaded', () => {
  const navControls = document.getElementById('nav-controls');

  navControls.addEventListener('click', async (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;

    const state = getState();
    const currentId = state?.currentSection ?? null;
    const content = router.getContent();
    if (!content) return; // init not yet complete
    const section = currentId ? content.sections[currentId] : null;

    switch (btn.id) {
      case 'btn-a':
      case 'btn-b': {
        if (!section || section.stub) {
          // Stub section: show stub message, no navigation
          const { showStub } = await import('./renderer.js');
          showStub();
          return;
        }
        const label = btn.id === 'btn-a' ? 'A' : 'B';
        const existing = state?.history ?? {};
        setState({ history: { ...existing, [currentId]: label } });
        await router.navigate(section.ab);
        break;
      }
      case 'btn-u': {
        if (!section || section.stub) {
          const { showStub } = await import('./renderer.js');
          showStub();
          return;
        }
        await router.navigateU();
        break;
      }
      case 'btn-back': {
        await router.back();
        break;
      }
    }
  });

  boot().catch(() => {
    // boot() handles its own errors; this prevents unhandled rejection warnings
  });
});
