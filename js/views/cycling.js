import { createT } from '../i18n.js';
import { state, save } from '../state.js';
import { fmtTime } from '../format.js';
import { ROUTES } from '../data/routes.js';
import { estimateTimeSeconds } from '../physics/cycling.js';
import { bindPress } from '../ui/press.js';

const WORLDS = ['Alle Welten', 'Watopia', 'London', 'Richmond', 'Innsbruck', 'New York', 'France', 'Makuri', 'Crit City', 'Scotland'];

function computeRoute(r, watts, weight) {
  const secs = estimateTimeSeconds(r.dist, r.elev, watts, weight);
  const speedKph = (r.dist / secs) * 3600;
  return { ...r, secs, speedKph };
}

export function render(lang) {
  const t = createT(lang);
  const el = document.getElementById('cycling-view');
  const { wkg, weight, mode } = state.cycling;
  const watts = wkg * weight;
  const filterWorld = state.cycling.filterWorld || 'Alle Welten';
  const sortBy = state.cycling.sortBy || 'dist';
  const searchQ = (state.cycling.search || '').toLowerCase();

  let routes = ROUTES.map(r => computeRoute(r, watts, weight));

  if (filterWorld && filterWorld !== 'Alle Welten') {
    routes = routes.filter(r => r.world === filterWorld);
  }
  if (searchQ) {
    routes = routes.filter(r => r.name.toLowerCase().includes(searchQ) || r.world.toLowerCase().includes(searchQ));
  }
  routes.sort((a, b) => {
    if (sortBy === 'time') return a.secs - b.secs;
    if (sortBy === 'elev') return a.elev - b.elev;
    return a.dist - b.dist;
  });

  const totalDist = routes.reduce((s, r) => s + r.dist, 0);
  const totalElev = routes.reduce((s, r) => s + r.elev, 0);

  el.innerHTML = `
    <div class="cyc-title-block">
      <div>
        <h1 class="cyc-title">${t('cyc_title')}</h1>
        <p class="cyc-sub">${t('cyc_sub')}</p>
      </div>
    </div>
    <div class="cyc-grid">
      <div class="sidebar">
        <div class="sidebar-section">
          <div class="cyc-mode-tabs">
            <button class="${mode === 'route' ? 'active' : ''}" data-mode="route">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              ${t('route_mode')}
            </button>
            <button class="${mode === 'wkg' ? 'active' : ''}" data-mode="wkg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              ${t('wkg_mode')}
            </button>
          </div>
          <div class="label">W/kg</div>
          <div class="wkg-row">
            <div>
              <input type="range" class="wkg-slider" id="cyc-wkg" min="1" max="6" step="0.05" value="${wkg}">
              <div class="watts-display">
                <span class="watts-big" id="cyc-wkg-val">${wkg.toFixed(2)}</span>
                <span class="watts-small">W/kg</span>
              </div>
            </div>
            <div>
              <div class="label">${t('weight')} (kg)</div>
              <input class="big-input sm" id="cyc-weight" type="number" min="40" max="150" value="${weight}">
              <div class="watts-display">
                <span class="watts-big">${Math.round(watts)}</span>
                <span class="watts-small">W</span>
              </div>
            </div>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="label">${t('cyc_search_label')}</div>
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input class="search-input" id="cyc-search" type="text" placeholder="${t('route_search')}" value="${state.cycling.search || ''}">
          </div>
        </div>
        <div class="sidebar-section">
          <div class="label">${t('cyc_world_label')}</div>
          <div class="world-pills">
            ${WORLDS.map(w => `<button class="world-pill ${filterWorld === w ? 'active' : ''}" data-world="${w}">${w} <span class="count">${w === 'Alle Welten' ? ROUTES.length : ROUTES.filter(r => r.world === w).length}</span></button>`).join('')}
          </div>
        </div>
      </div>

      <div>
        <div class="route-stats-strip">
          <div class="stat-chip"><span class="k">${t('cyc_routes')}</span><span class="v">${routes.length}</span></div>
          <div class="stat-chip"><span class="k">${t('cyc_avg_dist')}</span><span class="v">${routes.length ? (totalDist / routes.length).toFixed(1) : '--'} km</span></div>
          <div class="stat-chip"><span class="k">${t('cyc_avg_elev')}</span><span class="v">${routes.length ? Math.round(totalElev / routes.length) : '--'} m</span></div>
        </div>

        <div class="sort-bar">
          <span class="sort-left">${routes.length} ${t('cyc_routes')} · ${watts.toFixed(0)} W</span>
          <div class="sort-right">
            <span class="sort-label">${t('cyc_sort_label')}:</span>
            <button class="sort-btn ${sortBy === 'dist' ? 'active' : ''}" data-sort="dist">${t('sort_distance')}</button>
            <button class="sort-btn ${sortBy === 'elev' ? 'active' : ''}" data-sort="elev">${t('sort_elevation')}</button>
            <button class="sort-btn ${sortBy === 'time' ? 'active' : ''}" data-sort="time">${t('sort_time')}</button>
          </div>
        </div>

        ${routes.length === 0 ? `<div class="empty-state"><div class="big">${t('no_routes')}</div></div>` : `
        <div class="route-grid">
          ${routes.map(r => `
            <div class="route-card ${mode === 'wkg' ? 'wkg-mode' : ''}">
              <div class="accent-stripe" style="background:${worldColor(r.world)}"></div>
              <div>
                <h5>${r.name}</h5>
                <div class="route-meta"><span>${r.dist} km</span><span>${r.elev} m↑</span></div>
                <div class="route-world">${r.world}</div>
              </div>
              <div class="route-right">
                <div class="route-time">${fmtTime(r.secs)}</div>
                <div class="route-speed">${r.speedKph.toFixed(1)} km/h</div>
              </div>
            </div>`).join('')}
        </div>`}
      </div>
    </div>
  `;

  bind(el);
}

function worldColor(world) {
  const colors = {
    'Watopia': 'oklch(0.72 0.16 150)',
    'London': 'oklch(0.62 0.14 250)',
    'Richmond': 'oklch(0.68 0.15 30)',
    'Innsbruck': 'oklch(0.65 0.14 320)',
    'New York': 'oklch(0.72 0.14 210)',
    'France': 'oklch(0.68 0.14 60)',
    'Makuri': 'oklch(0.70 0.15 180)',
    'Crit City': 'oklch(0.65 0.18 10)',
    'Scotland': 'oklch(0.62 0.13 290)',
  };
  return colors[world] || 'var(--cyc-accent)';
}

function bind(el) {
  const wkgSlider = el.querySelector('#cyc-wkg');
  const wkgVal = el.querySelector('#cyc-wkg-val');
  const weightInput = el.querySelector('#cyc-weight');
  const searchInput = el.querySelector('#cyc-search');

  wkgSlider?.addEventListener('input', () => {
    state.cycling.wkg = parseFloat(wkgSlider.value);
    wkgVal.textContent = state.cycling.wkg.toFixed(2);
    save(); render(state.lang);
  });

  weightInput?.addEventListener('change', () => {
    state.cycling.weight = parseFloat(weightInput.value) || 75;
    save(); render(state.lang);
  });

  searchInput?.addEventListener('input', () => {
    state.cycling.search = searchInput.value;
    const val = searchInput.value;
    render(state.lang);
    const newInput = el.querySelector('#cyc-search');
    if (newInput) { newInput.focus(); newInput.setSelectionRange(val.length, val.length); }
  });

  el.querySelectorAll('[data-mode]').forEach(btn => {
    bindPress(btn, () => {
      state.cycling.mode = btn.dataset.mode;
      save(); render(state.lang);
    });
  });

  el.querySelectorAll('[data-world]').forEach(btn => {
    bindPress(btn, () => {
      state.cycling.filterWorld = btn.dataset.world;
      render(state.lang);
    });
  });

  el.querySelectorAll('[data-sort]').forEach(btn => {
    bindPress(btn, () => {
      state.cycling.sortBy = btn.dataset.sort;
      render(state.lang);
    });
  });
}
