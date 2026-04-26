import { createT } from '../i18n.js';
import { state, save } from '../state.js';
import { fmtTime, fmtPace, parsePace, pad } from '../format.js';
import { DISTANCES } from '../data/distances.js';
import { bindPress } from '../ui/press.js';

const SUGGEST_PACES = ['3:30','3:45','4:00','4:15','4:30','4:45','5:00','5:30','6:00','6:30'];

function calcResults(paceSecPerKm) {
  return DISTANCES.map(d => ({
    ...d,
    totalSecs: paceSecPerKm * d.km,
    paceStr: fmtPace(paceSecPerKm),
  }));
}

function buildSplits(paceSecPerKm, distKm) {
  const splits = [];
  const fullKm = Math.floor(distKm);
  let cum = 0;
  for (let i = 1; i <= Math.min(fullKm, 42); i++) {
    cum += paceSecPerKm;
    splits.push({ km: i, split: fmtTime(paceSecPerKm), cum: fmtTime(cum) });
  }
  const rem = distKm - fullKm;
  if (rem > 0.05) {
    const splitSec = paceSecPerKm * rem;
    cum += splitSec;
    splits.push({ km: distKm.toFixed(3), split: fmtTime(splitSec), cum: fmtTime(cum) });
  }
  return splits;
}

const HERO_DISTS = ['5k', '10k', 'half', 'marathon'];

export function render(lang) {
  const t = createT(lang);
  const el = document.getElementById('running-view');
  const paceRaw = state.running.pace || '5:00';
  const paceSecs = parsePace(paceRaw) || 300;
  const results = calcResults(paceSecs);
  const heroKey = HERO_DISTS.includes(state.running.heroKey) ? state.running.heroKey : 'marathon';
  const mainDist = DISTANCES.find(d => d.key === heroKey) || DISTANCES.find(d => d.key === 'marathon');
  const mainResult = results.find(d => d.key === heroKey) || results.find(d => d.key === 'marathon');
  const splits = buildSplits(paceSecs, mainDist.km);

  el.innerHTML = `
    <div class="run-title-block">
      <div>
        <h1 class="run-title">${t('run_title')}</h1>
        <p class="run-sub">${t('run_sub')}</p>
      </div>
    </div>
    <div class="run-grid">
      <div>
        <div class="panel">
          <div class="label">${t('your_pace')}</div>
          <input class="big-input" id="run-pace-input" type="text" placeholder="5:00" value="${paceRaw}" maxlength="6">
          <div class="hint" id="run-pace-hint">${t('run_hint')}</div>
          <div class="suggest-row">
            ${SUGGEST_PACES.map(p => `<button class="suggest-chip" data-pace="${p}">${p}</button>`).join('')}
          </div>
        </div>

        <div class="hero-metric">
          <div style="width:100%">
            <div class="k" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
              <span>${mainDist.label} · ${fmtPace(paceSecs)} /km</span>
              <div style="display:flex;gap:4px">
                ${HERO_DISTS.map(k => {
                  const d = DISTANCES.find(x => x.key === k);
                  return `<button class="hero-dist-pill${k === heroKey ? ' active' : ''}" data-herokey="${k}">${d ? d.label : k}</button>`;
                }).join('')}
              </div>
            </div>
            <div class="v">${fmtTime(mainResult.totalSecs)}</div>
            <div class="sub">${(3.6 / paceSecs * 1000).toFixed(2)} km/h · ${fmtPace(paceSecs * 1.60934)} /mi</div>
          </div>
        </div>

        <div class="splits-wrap">
          <div class="splits-wrap-header">
            <h4>${mainDist.label} Splits</h4>
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--run-ink-2)">${t('run_equal_pace')} · ${fmtPace(paceSecs)}/km</span>
          </div>
          <div class="splits-scroll">
            ${splits.map(s => `
              <div class="split-row">
                <span class="split-km">${s.km}</span>
                <div class="split-bar"><div class="split-bar-fill" style="width:${Math.min(100, Math.round(Number(s.km) / 42.195 * 100))}%"></div></div>
                <span class="split-time">${s.split}</span>
                <span class="split-total">${s.cum}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div>
        <div class="results-list">
          ${results.filter(r => r.featured).map(r => `
            <div class="result-row ${r.key === 'marathon' ? 'highlight' : 'featured'}">
              <div class="result-dist">${r.label}</div>
              <div>
                <div class="result-name">${fmtTime(r.totalSecs)}</div>
                <div class="result-meta">${fmtPace(paceSecs)} /km · ${(r.km).toFixed(r.km >= 10 ? 1 : 3)} km</div>
              </div>
              <div class="result-time">${fmtPace(paceSecs)}</div>
            </div>`).join('')}
          <div class="result-divider">${t('run_more_dists')}</div>
          ${results.filter(r => !r.featured).map(r => `
            <div class="result-row secondary">
              <div class="result-dist">${r.label}</div>
              <div>
                <div class="result-name">${fmtTime(r.totalSecs)}</div>
                <div class="result-meta">${fmtPace(paceSecs)} /km · ${(r.km).toFixed(r.km >= 10 ? 1 : 3)} km</div>
              </div>
              <div class="result-time">${fmtPace(paceSecs)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  bind(el);
  el.querySelector('.splits-scroll')?.scrollTo(0, 0);
}

function bind(el) {
  const input = el.querySelector('#run-pace-input');
  const hint  = el.querySelector('#run-pace-hint');

  function update() {
    const secs = parsePace(input.value);
    if (isFinite(secs) && secs > 0) {
      state.running.pace = input.value;
      save();
      render(state.lang);
    } else {
      const t = createT(state.lang);
      input.classList.add('invalid');
      if (hint) { hint.textContent = t('run_pace_error'); hint.style.color = 'var(--run-accent)'; }
    }
  }

  function autoFormat() {
    const secs = parsePace(input.value);
    if (isFinite(secs) && secs > 0) {
      const m = Math.floor(secs / 60);
      const s = Math.round(secs % 60);
      input.value = `${m}:${pad(s)}`;
      input.classList.remove('invalid');
      if (hint) { hint.textContent = createT(state.lang)('run_hint'); hint.style.color = ''; }
    }
  }

  input.addEventListener('change', update);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { autoFormat(); update(); } });
  input.addEventListener('blur', autoFormat);

  el.querySelectorAll('.suggest-chip').forEach(btn => {
    bindPress(btn, () => {
      input.value = btn.dataset.pace;
      update();
    });
  });

  el.querySelectorAll('.hero-dist-pill').forEach(btn => {
    bindPress(btn, () => {
      state.running.heroKey = btn.dataset.herokey;
      save();
      render(state.lang);
    });
  });
}
