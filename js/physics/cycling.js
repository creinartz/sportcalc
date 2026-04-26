const RHO = 1.1;     // air density kg/m³ (Zwift indoor estimate)
const CDA = 0.32;    // drag coefficient × frontal area (hoods position)
const CRR = 0.004;   // rolling resistance (smart trainer)
const G = 9.81;

function powerAtSpeed(v, totalMass, gradeAvg) {
  const fRoll = CRR * totalMass * G * Math.cos(Math.atan(gradeAvg));
  const fGrav = totalMass * G * Math.sin(Math.atan(gradeAvg));
  const fAero = 0.5 * RHO * CDA * v * v;
  return (fRoll + fGrav + fAero) * v;
}

function gradeFromElev(dist_m, elev_m) {
  if (dist_m === 0) return 0;
  return elev_m / dist_m;
}

function bellPenalty(grade) {
  // rolling terrain adds time — modelled as speed reduction at avg grade
  return 0;
}

export function estimateTimeSeconds(distKm, elevM, watts, weightKg) {
  const bikeKg = 8;
  const totalMass = weightKg + bikeKg;
  const distM = distKm * 1000;
  const grade = gradeFromElev(distM, elevM);

  // Bisect for avg speed where power matches
  let lo = 0.5, hi = 30; // m/s
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (powerAtSpeed(mid, totalMass, grade) < watts) lo = mid;
    else hi = mid;
  }
  const vAvg = (lo + hi) / 2;

  // Add hilly terrain penalty: undulating terrain costs ~3-8% vs flat equivalent
  const hilly = Math.min(elevM / distKm, 20);
  const penalty = 1 + 0.004 * hilly;

  return (distM / vAvg) * penalty;
}

export function estimateWkgForTime(distKm, elevM, targetSeconds, weightKg) {
  // Bisect for watts
  let lo = 50, hi = 700;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (estimateTimeSeconds(distKm, elevM, mid, weightKg) > targetSeconds) lo = mid;
    else hi = mid;
  }
  const watts = (lo + hi) / 2;
  return watts / weightKg;
}
