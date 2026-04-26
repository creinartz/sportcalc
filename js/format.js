export function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

export function fmtTime(totalSeconds) {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '--:--';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function fmtPace(secsPerKm) {
  if (!isFinite(secsPerKm) || secsPerKm <= 0) return '--:--';
  const m = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${m}:${pad(s)}`;
}

export function fmtPacePer100(secsPerKm) {
  const s100 = secsPerKm / 10;
  const m = Math.floor(s100 / 60);
  const s = Math.round(s100 % 60);
  return `${m}:${pad(s)}`;
}

export function parsePace(str) {
  if (!str) return NaN;
  const parts = str.split(':').map(Number);
  if (parts.length === 2 && parts.every(isFinite)) return parts[0] * 60 + parts[1];
  return NaN;
}

export function parseTime(str) {
  if (!str) return NaN;
  const parts = str.split(':').map(Number);
  if (parts.length === 3 && parts.every(isFinite)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2 && parts.every(isFinite)) return parts[0] * 60 + parts[1];
  return NaN;
}

export function fmtKph(mps) { return (mps * 3.6).toFixed(1); }
export function fmtWatts(w) { return Math.round(w); }
