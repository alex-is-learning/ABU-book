// renderer.js — sole interface to DOM mutation

function getContentArea() {
  return document.getElementById('content-area');
}

function removeExistingIframe() {
  const existing = document.querySelector('#content-area iframe');
  if (existing) existing.remove();
}

export function buildSidebar(sections, orderedIds) {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  nav.innerHTML = '';
  orderedIds.forEach(id => {
    const section = sections[id];
    if (!section) return;
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = section.title;
    a.dataset.sectionId = id;
    a.className = 'sidebar-link';
    nav.appendChild(a);
  });
}

export function updateSidebarActive(id) {
  // For simpler variants (e.g. what-is-a-simpler), highlight the parent (what-is-a)
  const baseId = id.replace(/-simpler$/, '');
  document.querySelectorAll('.sidebar-link').forEach(a => {
    a.classList.toggle('sidebar-link--active', a.dataset.sectionId === baseId);
  });
}

export function renderSection(section, html) {
  const area = getContentArea();
  updateSidebarActive(section.id);

  // Remove any existing iframe before building new content
  removeExistingIframe();

  let markup = `<h2>${section.title}</h2>`;

  if (section.gif) {
    if (section.gifCaption) {
      markup += `<p class="gif-caption">${section.gifCaption}</p>`;
    }
    // iframe inserted separately after setting innerHTML to avoid iframe reset
    markup += `<div id="gif-slot"></div>`;
  }

  markup += `<div class="section-content">${html}</div>`;

  area.innerHTML = markup;

  // Insert iframe after innerHTML assignment so it is only ever one in DOM
  if (section.gif) {
    const iframe = document.createElement('iframe');
    iframe.className = 'gif-frame';
    iframe.src = section.gif;
    iframe.title = section.gifCaption ?? section.title;
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('frameborder', '0');
    const slot = document.getElementById('gif-slot');
    slot.replaceWith(iframe);
  }
}

export function showStub() {
  const area = getContentArea();
  removeExistingIframe();

  // Append stub message after existing content (or replace if area is empty)
  // Per spec: stub message renders in-place for U-null case; for stub:true sections
  // navigate() calls renderSection first then showStub appends the banner
  const existing = area.querySelector('.stub-message');
  if (existing) return; // already shown

  const msg = document.createElement('p');
  msg.className = 'stub-message';
  msg.textContent = "We haven\u2019t scaffolded this level yet \u2014 content stops here for now.";
  area.appendChild(msg);
}

export function showError(msg) {
  const area = getContentArea();
  removeExistingIframe();
  area.innerHTML = `<p class="error-message">${msg}</p>`;
}

export function updateBackButton(enabled) {
  const btn = document.getElementById('btn-back');
  if (!btn) return;
  btn.disabled = !enabled;
}
