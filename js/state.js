const KEY = 'sportcalc_v1';

export const state = {
  lang: 'de',
  mode: 'running',
  running: { pace: '5:00', unit: 'km', heroKey: 'marathon' },
  cycling: { wkg: 2.5, weight: 75, mode: 'route', routeId: null },
  outdoor: { wkg: 2.5, weight: 75, wind: 0, grade: 0, tire: 'road', distance: 40 },
  swim: { pace100: '2:00', pool: 25 },
  street: { activity: 'inline', speedKph: 15, distance: 10 },
};

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    for (const [k, v] of Object.entries(saved)) {
      if (typeof state[k] === 'object' && state[k] !== null && typeof v === 'object' && v !== null) {
        Object.assign(state[k], v);
      } else if (k in state) {
        state[k] = v;
      }
    }
  } catch (_) {}
}
