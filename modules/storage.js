const TASK_KEY = "lifesync_tasks";
const ENERGY_KEY = "lifesync_energy";

export function saveTasks(tasks) {
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
}

export function loadTasks() {
  const data = localStorage.getItem(TASK_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEnergy(energyLog) {
  localStorage.setItem(ENERGY_KEY, JSON.stringify(energyLog));
}

export function loadEnergy() {
  const data = localStorage.getItem(ENERGY_KEY);
  return data ? JSON.parse(data) : [80];
}
