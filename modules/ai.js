export function decideBestTask(tasks, energy) {
  if (!tasks || tasks.length === 0) return null;
  return [...tasks].sort((a,b)=>{
    const scoreA = a.priority*3 - a.duration + energy;
    const scoreB = b.priority*3 - b.duration + energy;
    return scoreB - scoreA;
  })[0];
}
