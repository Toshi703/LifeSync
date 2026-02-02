// Import des modules
import { decideBestTask } from "./modules/ai.js";
import { saveTasks, loadTasks } from "./modules/storage.js";
import { startFocus } from "./modules/focus.js";

// Données
let tasks = loadTasks();

// UI
const listEl = document.getElementById("list");
const focusEl = document.getElementById("focus");
const statsEl = document.getElementById("stats");
const energyInput = document.getElementById("energy");

// Initialisation énergie
energyInput.addEventListener("input", () => {
  document.getElementById("energyText").textContent = energyInput.value + "%";
});

// Sauvegarde et rendu
function save() {
  saveTasks(tasks);
  render();
}

// Ajouter tâche
window.addTask = function() {
  const titleEl = document.getElementById("title");
  const durationEl = document.getElementById("duration");
  const priorityEl = document.getElementById("priority");

  const t = titleEl.value.trim();
  if (!t) return;

  tasks.push({
    title: t,
    duration: Number(durationEl.value || 30),
    priority: Number(priorityEl.value)
  });

  titleEl.value = "";
  durationEl.value = "";
  render();
  save();
};

// Rendu de la liste et stats
function render() {
  listEl.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "p-2 rounded mb-1 bg-white/60 dark:bg-slate-700/60";
    li.textContent = `${t.title} • ${t.duration} min`;
    listEl.appendChild(li);
  });

  statsEl.innerHTML = `⏱️ Tâches : <b>${tasks.length}</b>`;
}

// Décision de tâche avec mode focus
window.decide = function() {
  if (tasks.length === 0) return;
  const energy = Number(energyInput.value);
  const best = decideBestTask(tasks, energy);
  if (!best) return;

  startFocus(best, () => {
    // Quand le focus est terminé
    tasks = tasks.filter(x => x.title !== best.title);
    focusEl.classList.add("hidden");
    save();
  });
};

// Initial render
render();
