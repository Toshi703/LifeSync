// Import des modules
import { decideBestTask } from "./modules/ai.js";
import { saveTasks, loadTasks } from "./modules/storage.js";

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

// Décision de tâche
window.decide = function() {
  if (tasks.length === 0) return;

  const energy = Number(energyInput.value);
  const best = decideBestTask(tasks, energy);

  if (!best) return;

  focusEl.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">🎯 Focus</h2>
    <p class="text-lg mb-2">${best.title}</p>
    <p class="opacity-70 mb-4">⏱️ ${best.duration} minutes</p>
    <button onclick="complete('${best.title}')" class="bg-indigo-600 text-white px-6 py-2 rounded-xl">
      ✅ Terminé
    </button>
  `;
  focusEl.classList.remove("hidden");
};

// Compléter tâche
window.complete = function(title) {
  const t = tasks.find(x => x.title === title);
  tasks = tasks.filter(x => x.title !== title);
  focusEl.classList.add("hidden");
  save();
};

// Initial render
render();
