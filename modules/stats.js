export let energyLog = [80]; // Historique initial

export function logEnergy(value) {
  energyLog.push(Number(value));
  if (energyLog.length > 20) energyLog.shift(); // garder les 20 derniers points
}

export function getEnergyLog() {
  return [...energyLog];
}
