import { createT } from '../i18n.js';
import { state, save } from '../state.js';
import { fmtTime } from '../format.js';
import { bindPress } from '../ui/press.js';

const ACTIVITIES = {
  walking: { defaultSpeed: 5.5 },
  inline:  { defaultSpeed: 15 },
  skate:   { defaultSpeed: 12 },
};

const DIST_LIST = [
  { km: 1,    key: '1 km' },
  { km: 3,    key: '3 km' },
  { km: 5,    key: '5 km' },
  { km: 10,   key: '10 km' },
  { km: 21.1, key: 'half_marathon' },
  { km: 42.2, key: 'marathon_label' },
];

function paceStr(speedKph) {
  const secPerKm = 3600 / speedKph;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')} min/km`;
}

export function render(lang) {
  const t = createT(lang);
  const el = document.getElementById('street-view');
  if (!state.street) state.street = { activity: 'inline', speedKph: 15, distance: 10 };
  const { activity, speedKph, distance } = state.street;

  const timeForDist = fmtTime(Math.round((3600 / speedKph) * distance));

  el.innerHTML = `
    <div class="str-title-block">
      <h1 class="str-title">${t('str_title')}</h1>
      <p class="str-sub">${t('str_sub')}</p>
    </div>

    <div class="str-grid">
      <div class="str-panel">
        <div class="label">${t('activity')}</div>
        <div class="str-pill-row">
          <button class="str-pill ${activity === 'walking' ? 'active' : ''}" data-activity="walking">${t('walking')}</button>
          <button class="str-pill ${activity === 'inline'  ? 'active' : ''}" data-activity="inline">${t('inline')}</button>
          <button class="str-pill ${activity === 'skate'   ? 'active' : ''}" data-activity="skate">${t('skate')}</button>
        </div>

        <div style="margin-top:20px" class="label">${t('speed_kmh')}</div>
        <input type="range" class="str-slider" id="str-speed" min="2" max="40" step="0.5" value="${speedKph}">
        <div class="str-speed-display">
          <span class="str-speed-val">${speedKph.toFixed(1)} km/h</span>
          <span class="str-pace-val">${paceStr(speedKph)}</span>
        </div>

        <div style="margin-top:20px" class="label">${t('distance')} (km)</div>
        <input type="range" class="str-slider" id="str-dist" min="1" max="100" step="0.5" value="${distance}">
        <div class="str-dist-display">${distance} km</div>
      </div>

      <div>
        <div class="str-hero">
          <div class="str-hero-k">${t('time_for_dist')}</div>
          <div class="str-hero-v">${timeForDist}</div>
          <div class="str-hero-sub">${speedKph.toFixed(1)} km/h · ${distance} km · ${paceStr(speedKph)}</div>
        </div>

        <div class="str-dist-list">
          ${DIST_LIST.map(d => {
            const label = d.key.startsWith('1') || d.key.startsWith('3') || d.key.startsWith('5') || d.key.startsWith('10')
              ? d.key : t(d.key);
            const timeSecs = Math.round((3600 / speedKph) * d.km);
            return `
              <div class="str-dist-row">
                <span class="str-dist-label">${label}</span>
                <span class="str-dist-time">${fmtTime(timeSecs)}</span>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  el.querySelector('#str-speed').addEventListener('input', e => {
    state.street.speedKph = parseFloat(e.target.value);
    save();
    render(state.lang);
  });

  el.querySelector('#str-dist').addEventListener('input', e => {
    state.street.distance = parseFloat(e.target.value);
    save();
    render(state.lang);
  });

  el.querySelectorAll('[data-activity]').forEach(btn => {
    bindPress(btn, () => {
      const act = btn.dataset.activity;
      state.street.activity = act;
      state.street.speedKph = ACTIVITIES[act].defaultSpeed;
      save();
      render(state.lang);
    });
  });
}
