// Import des modules
import { decideBestTask } from "./modules/ai.js";
import { saveTasks, loadTasks } from "./modules/storage.js";
import { startFocus } from "./modules/focus.js";
import { logEnergy, getEnergyLog } from "./modules/stats.js";

// Données
let tasks = loadTasks();

// UI
const listEl = document.getElementById("list");
const focusEl = document.getElementById("focus");
const statsEl = document.getElementById("stats");
const energyInput = document.getElementById("energy");

// Graphique énergie
let energyChart = null;

// Initialisation énergie
energyInput.addEventListener("input", () => {
  document.getElementById("energyText").textContent = energyInput.value + "%";
});

// Sauvegarde et rendu
function save() {
  saveTasks(tasks);
  render();
  drawChart();
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
    tasks = tasks.filter(x => x.title !== best.title);
    focusEl.classList.add("hidden");
    save();
  });
};

// Enregistrer énergie
energyInput.addEventListener("change", () => {
  logEnergy(energyInput.value);
  drawChart();
});

// Graphique énergie
function drawChart() {
  const ctxEl = document.getElementById("energyChart");
  if (!ctxEl) return;
  const ctx = ctxEl.getContext("2d");

  const labels = getEnergyLog().map((_,i)=>i===getEnergyLog().length-1?'Maintenant':'');

  if (energyChart) energyChart.destroy();

  energyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Énergie',
        data: getEnergyLog(),
        borderColor: 'blue',
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { min:0, max:100 } }
    }
  });
}

// Initial render
render();
drawChart();
