import { state, save, load } from './state.js';
import { render as renderHome }    from './views/home.js';
import { render as renderRunning } from './views/running.js';
import { render as renderCycling } from './views/cycling.js';
import { render as renderOutdoor } from './views/outdoor.js';
import { render as renderSwim }    from './views/swim.js';
import { render as renderStreet }  from './views/street.js';
import { bindPress } from './ui/press.js';

const MODES = ['running', 'cycling', 'outdoor', 'swim', 'street'];
const VIEW_IDS = ['home-view', 'running-view', 'cycling-view', 'outdoor-view', 'swim-view', 'street-view'];

function applyMode(mode) {
  document.body.className = mode === 'home' ? '' : `mode-${mode}`;
  VIEW_IDS.forEach(id => {
    document.getElementById(id).hidden = true;
  });
  const viewId = mode === 'home' ? 'home-view' : `${mode}-view`;
  const el = document.getElementById(viewId);
  if (el) el.hidden = false;
}

function navigate(mode) {
  state.mode = mode;
  save();
  applyMode(mode);
  renderView(mode);
  updateNav(mode);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderView(mode) {
  const lang = state.lang;
  if (mode === 'home')     renderHome(lang, navigate);
  if (mode === 'running')  renderRunning(lang);
  if (mode === 'cycling')  renderCycling(lang);
  if (mode === 'outdoor')  renderOutdoor(lang);
  if (mode === 'swim')     renderSwim(lang);
  if (mode === 'street')   renderStreet(lang);
}

function updateNav(activeMode) {
  document.querySelectorAll('.mode-switch button[data-nav]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === activeMode);
  });
  const brandBtn = document.querySelector('.brand[data-nav="home"]');
  if (brandBtn) brandBtn.classList.toggle('active', activeMode === 'home');
  document.querySelectorAll('.lang-toggle button[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });
}

function buildNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = `
    <div class="nav-inner">
      <button class="brand" data-nav="home">
        <div class="brand-mark">SC</div>
        <div class="brand-name">Sport<em>Calc</em></div>
      </button>
      <div class="mode-switch">
        <button data-nav="running">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0M6 20l4-8 2 2 3-6"/></svg>
          <span>Laufen</span>
        </button>
        <button data-nav="cycling">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M10 13l1.5-4 2 3 1.5-3.5"/></svg>
          <span>Zwift</span>
        </button>
        <button data-nav="outdoor">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M5.5 17.5 10 8l2 4 2-3h2"/></svg>
          <span>Fahrrad</span>
        </button>
        <button data-nav="street">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="1.5"/><path d="M9 8.5h6M10 8.5l-2 7M14 8.5l2 7M8 21l2-5.5M16 21l-2-5.5"/></svg>
          <span>Freizeit</span>
        </button>
        <button data-nav="swim">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 8l-4 8-3-4-3 4"/></svg>
          <span>Schwimmen</span>
        </button>
      </div>
      <div class="nav-spacer"></div>
      <div class="lang-toggle">
        <button data-lang="de">DE</button>
        <button data-lang="en">EN</button>
        <button data-lang="fr">FR</button>
      </div>
    </div>
  `;

  nav.querySelectorAll('[data-nav]').forEach(btn => {
    bindPress(btn, () => navigate(btn.dataset.nav));
  });

  nav.querySelectorAll('[data-lang]').forEach(btn => {
    bindPress(btn, () => {
      state.lang = btn.dataset.lang;
      save();
      updateNav(state.mode);
      renderView(state.mode);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  buildNav();
  navigate('home'); // always land on home; sets state.mode so lang selector stays in sync
});
