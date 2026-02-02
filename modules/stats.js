export let energyLog = [80];

export function logEnergy(value){
  energyLog.push(Number(value));
  if(energyLog.length>20) energyLog.shift();
}

export function getEnergyLog(){
  return [...energyLog];
}
