const G = 9.81;
const RHO = 1.225; // air density kg/m³ (outdoor, sea level)

export const TIRES = {
  road:   { label_de: 'Rennrad',  label_en: 'Road',   Crr: 0.0035, CdA: 0.32 },
  gravel: { label_de: 'Gravel',   label_en: 'Gravel', Crr: 0.006,  CdA: 0.38 },
  mtb:    { label_de: 'MTB',      label_en: 'MTB',    Crr: 0.012,  CdA: 0.50 },
};

function powerAtSpeed(v, watts, totalMass, grade, windMps, tire) {
  const { Crr, CdA } = TIRES[tire] || TIRES.road;
  const vAir = v + windMps; // positive = headwind
  const fRoll = Crr * totalMass * G;
  const fGrav = totalMass * G * grade;
  const fAero = 0.5 * RHO * CdA * vAir * Math.abs(vAir);
  return (fRoll + fGrav + fAero) * v - watts;
}

function solveSpeed(watts, totalMass, grade, windMps, tire) {
  let lo = 0.1, hi = 25;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (powerAtSpeed(mid, watts, totalMass, grade, windMps, tire) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function outdoorPhysics({ wkg, weight, wind, grade, tire, distKm }) {
  const bikeKg = 9;
  const totalMass = weight + bikeKg;
  const watts = wkg * weight;
  const gradeDecimal = grade / 100;
  const windMps = wind / 3.6; // km/h to m/s, positive = headwind

  const vFlat   = solveSpeed(watts, totalMass, 0,            windMps, tire);
  const vActual = solveSpeed(watts, totalMass, gradeDecimal, windMps, tire);

  // Rolling terrain adds time vs flat — use avg grade effect
  const timeSeconds = (distKm * 1000) / vActual;

  // Power breakdown at actual speed
  const { Crr, CdA } = TIRES[tire] || TIRES.road;
  const vAir = vActual + windMps;
  const pRoll = Crr * totalMass * G * vActual;
  const pGrav = totalMass * G * gradeDecimal * vActual;
  const pAero = 0.5 * RHO * CdA * vAir * Math.abs(vAir) * vActual;
  const pTotal = pRoll + pGrav + pAero;

  return {
    speedKph: vActual * 3.6,
    timeSeconds,
    wattsActual: Math.round(pTotal),
    breakdown: {
      roll: Math.round((pRoll / pTotal) * 100),
      aero: Math.round((pAero / pTotal) * 100),
      grav: Math.round((pGrav / pTotal) * 100),
      pRoll: Math.round(pRoll),
      pAero: Math.round(pAero),
      pGrav: Math.round(pGrav),
    }
  };
}

export function scenariosFor(base) {
  const grades = [
    { label_de: 'Flach', label_en: 'Flat', grade: 0 },
    { label_de: 'Leicht hügelig', label_en: 'Rolling', grade: 1.5 },
    { label_de: 'Hügelig', label_en: 'Hilly', grade: 3 },
    { label_de: 'Bergig', label_en: 'Mountainous', grade: 5 },
  ];
  return grades.map(g => ({
    ...g,
    ...outdoorPhysics({ ...base, grade: g.grade })
  }));
}
