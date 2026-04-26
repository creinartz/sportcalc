import { createT } from '../i18n.js';
import { state, save } from '../state.js';
import { fmtTime } from '../format.js';
import { outdoorPhysics, scenariosFor, TIRES } from '../physics/outdoor.js';
import { bindPress } from '../ui/press.js';

export function render(lang) {
  const t = createT(lang);
  const el = document.getElementById('outdoor-view');
  const { wkg, weight, wind, grade, tire, distance } = state.outdoor;

  const result = outdoorPhysics({ wkg, weight, wind, grade, tire, distKm: distance });
  const scenarios = scenariosFor({ wkg, weight, wind, tire, distKm: distance });
  const { breakdown } = result;

  const windLabel = wind < 0 ? `${Math.abs(wind)} km/h ${t('tailwind')}` : wind > 0 ? `${wind} km/h ${t('headwind')}` : t('no_wind') || 'Kein Wind';

  el.innerHTML = `
    <div class="out-title-block">
      <div>
        <h1 class="out-title">${t('out_title')}</h1>
        <p class="out-sub">${t('out_sub')}</p>
      </div>
    </div>
    <div class="out-grid">
      <div class="out-panel">
        <div class="label">W/kg</div>
        <input type="range" class="out-slider" id="out-wkg" min="1" max="6" step="0.05" value="${wkg}">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:4px">
          <span style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--out-accent)" id="out-wkg-val">${wkg.toFixed(2)}</span>
          <span style="font-size:12px;color:var(--out-ink-2)">${Math.round(wkg * weight)} W</span>
        </div>

        <div style="margin-top:16px" class="label">${t('weight')} (kg) · ${t('distance')} (km)</div>
        <div class="out-row-2">
          <input class="out-input sm" id="out-weight" type="number" min="40" max="150" value="${weight}">
          <input class="out-input sm" id="out-distance" type="number" min="5" max="300" value="${distance}">
        </div>

        <div style="margin-top:16px" class="label">${t('wind')} (km/h) — negativ = ${t('tailwind')}</div>
        <input type="range" class="out-slider" id="out-wind" min="-30" max="30" step="1" value="${wind}">
        <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--out-ink-2);margin-top:4px">${windLabel}</div>

        <div style="margin-top:16px" class="label">${t('grade')} (%)</div>
        <input type="range" class="out-slider" id="out-grade" min="-8" max="12" step="0.5" value="${grade}">
        <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--out-ink-2);margin-top:4px">${grade > 0 ? '+' : ''}${grade}%</div>

        <div style="margin-top:16px" class="label">${t('tire')}</div>
        <div class="out-pill-row">
          ${Object.keys(TIRES).map(k => `<button class="out-pill ${tire === k ? 'active' : ''}" data-tire="${k}">${lang === 'de' ? TIRES[k].label_de : TIRES[k].label_en}</button>`).join('')}
        </div>
      </div>

      <div>
        <div class="out-hero">
          <div>
            <div class="k">${t('estimated_avg')}</div>
            <div class="v">${result.speedKph.toFixed(1)}</div>
            <div class="sub">km/h · ${distance} km · ${fmtTime(result.timeSeconds)}</div>
          </div>
          <div class="out-medal">${Math.round(wkg * weight)}<br>W</div>
        </div>

        <div class="out-breakdown">
          <div class="out-breakdown-head">
            <h4>${t('breakdown')}</h4>
            <span class="out-breakdown-watts">${result.wattsActual} W total</span>
          </div>
          ${[
            { key: 'rolling_resistance', pct: breakdown.roll, w: breakdown.pRoll, color: 'oklch(0.65 0.15 150)' },
            { key: 'aero_drag',          pct: breakdown.aero, w: breakdown.pAero, color: 'oklch(0.55 0.18 210)' },
            { key: 'gravity',            pct: breakdown.grav, w: breakdown.pGrav, color: 'oklch(0.68 0.16 45)' },
          ].map(item => `
            <div class="out-brow">
              <span class="rk">${t(item.key)}</span>
              <div class="out-bar"><div class="out-bar-fill" style="width:${item.pct}%;background:${item.color}"></div></div>
              <span class="rv">${item.w} W · ${item.pct}%</span>
            </div>`).join('')}
        </div>

        <div class="out-scenarios-head">
          <h4>${t('scenarios')}</h4>
          <span>${wkg.toFixed(2)} W/kg</span>
        </div>
        <div class="out-scenario-grid">
          ${scenarios.map(s => `
            <div class="out-scenario">
              <div class="sk">${lang === 'de' ? s.label_de : s.label_en}</div>
              <div class="sv">${s.speedKph.toFixed(1)}</div>
              <div class="ss">km/h · ${fmtTime(s.timeSeconds)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  bind(el);
}

function bind(el) {
  function update() {
    state.outdoor.wkg      = parseFloat(el.querySelector('#out-wkg').value)      || 2.5;
    state.outdoor.weight   = parseFloat(el.querySelector('#out-weight').value)    || 75;
    state.outdoor.wind     = parseFloat(el.querySelector('#out-wind').value)      || 0;
    state.outdoor.grade    = parseFloat(el.querySelector('#out-grade').value)     || 0;
    state.outdoor.distance = parseFloat(el.querySelector('#out-distance').value)  || 40;
    save(); render(state.lang);
  }

  ['#out-wkg','#out-wind','#out-grade'].forEach(id => {
    el.querySelector(id)?.addEventListener('input', update);
  });
  ['#out-weight','#out-distance'].forEach(id => {
    el.querySelector(id)?.addEventListener('change', update);
  });

  el.querySelectorAll('[data-tire]').forEach(btn => {
    bindPress(btn, () => {
      state.outdoor.tire = btn.dataset.tire;
      save(); render(state.lang);
    });
  });
}
