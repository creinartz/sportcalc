import { createT } from '../i18n.js';
import { state, save } from '../state.js';
import { fmtTime, parsePace } from '../format.js';
import { SWIM_DISTS } from '../data/distances.js';
import { bindPress } from '../ui/press.js';

const SUGGEST_PACES = ['1:30','1:40','1:50','2:00','2:10','2:20','2:30','3:00','3:30'];

function calcSwimTime(paceSecsPer100m, distM, pool) {
  const laps = pool > 0 ? Math.ceil(distM / pool) : 0;
  const turnPenalty = laps * 1.5; // ~1.5s per turn in pool, 0 in open water
  const swimTime = (paceSecsPer100m / 100) * distM; // pace is sec/100m, dist in m
  return swimTime + (pool > 0 ? turnPenalty : 0);
}

export function render(lang) {
  const t = createT(lang);
  const el = document.getElementById('swim-view');
  const { pace100, pool } = state.swim;
  const paceSecs = parsePace(pace100) || 120;
  const poolSize = parseInt(pool) || 0;

  const results = SWIM_DISTS.map(d => ({
    ...d,
    totalSecs: calcSwimTime(paceSecs, d.m, poolSize),
  }));

  const mainResult = results.find(d => d.key === 'ironman');

  el.innerHTML = `
    <div class="swim-title-block">
      <div>
        <h1 class="swim-title">${t('swim_title')}</h1>
        <p class="swim-sub">${t('swim_sub')}</p>
      </div>
    </div>
    <div class="swim-grid">
      <div>
        <div class="swim-panel">
          <div class="label">${t('pace_per_100')}</div>
          <input class="swim-input" id="swim-pace-input" type="text" placeholder="2:00" value="${pace100}" maxlength="5">
          <div class="hint">${t('swim_hint')}</div>
          <div class="swim-suggest-row">
            ${SUGGEST_PACES.map(p => `<button class="swim-chip" data-pace="${p}">${p}</button>`).join('')}
          </div>

          <div class="label" style="margin-top:16px">${t('pool_25')} / ${t('pool_50')} / ${t('open_water')}</div>
          <div class="swim-pool-tabs">
            <button class="swim-pool-tab ${poolSize === 25 ? 'active' : ''}" data-pool="25">${t('pool_25')}</button>
            <button class="swim-pool-tab ${poolSize === 50 ? 'active' : ''}" data-pool="50">${t('pool_50')}</button>
            <button class="swim-pool-tab ${poolSize === 0 ? 'active' : ''}" data-pool="0">${t('open_water')}</button>
          </div>
          ${poolSize > 0 ? `<div class="hint">${t('turns')}: +1.5s / Wende</div>` : ''}
        </div>

        <div class="swim-hero">
          <div>
            <div class="k">Ironman · ${fmtTime(paceSecs)} /100m</div>
            <div class="v">${fmtTime(mainResult.totalSecs)}</div>
            <div class="sub">${(3600 / paceSecs * 100 / 1000).toFixed(2)} km/h</div>
          </div>
          <div class="swim-badge">3800<br>m</div>
        </div>
      </div>

      <div>
        <div class="swim-results">
          ${results.map(r => `
            <div class="swim-row ${r.key === 'ironman' ? 'highlight' : ''}">
              <div class="swim-dist-badge">${r.m >= 1000 ? (r.m/1000).toFixed(r.m % 1000 === 0 ? 0 : 1) + 'k' : r.m + 'm'}</div>
              <div>
                <div class="swim-row-name">${r.label}</div>
                <div class="swim-row-meta">${fmtTime(paceSecs)} /100m · ${r.m} m</div>
              </div>
              <div>
                <div class="swim-row-time">${fmtTime(r.totalSecs)}</div>
                <div class="swim-row-pace">${(3600 / paceSecs * 100 / 1000).toFixed(2)} km/h</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  bind(el);
}

function bind(el) {
  const input = el.querySelector('#swim-pace-input');

  function update() {
    const secs = parsePace(input.value);
    if (isFinite(secs) && secs > 0) {
      state.swim.pace100 = input.value;
      save(); render(state.lang);
    }
  }

  input?.addEventListener('change', update);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') update(); });

  el.querySelectorAll('.swim-chip').forEach(btn => {
    bindPress(btn, () => { input.value = btn.dataset.pace; update(); });
  });

  el.querySelectorAll('[data-pool]').forEach(btn => {
    bindPress(btn, () => {
      state.swim.pool = btn.dataset.pool;
      save(); render(state.lang);
    });
  });
}
