// Import des modules
import { decideBestTask } from "./modules/ai.js";
import { saveTasks, loadTasks } from "./modules/storage.js";
import { startFocus } from "./modules/focus.js";
import { logEnergy, getEnergyLog } from "./modules/stats.js";
import { translations } from "./modules/i18n.js";

// Données
let tasks = loadTasks();
let currentLang = "fr";

// UI
const listEl = document.getElementById("list");
const focusEl = document.getElementById("focus");
const energyInput = document.getElementById("energy");
const langSelector = document.getElementById("langSelector");

// Graphique énergie
let energyChart = null;

// Initialisation texte et langue
function setLanguage(lang){
  currentLang = lang;
  const t = translations[lang];

  document.getElementById("mainTitle").textContent = t.title;
  document.getElementById("title").placeholder = t.taskPlaceholder;
  document.getElementById("duration").placeholder = t.durationPlaceholder;
  document.getElementById("priority").placeholder = t.priorityPlaceholder;
  document.getElementById("addTaskBtn").textContent = t.addTask;
  document.getElementById("decideBtn").textContent = t.decideButton;
  document.getElementById("energyLabel").textContent = t.energyLevel;
  document.getElementById("energyHistoryLabel").textContent = t.energyHistory;
}

// Changement de langue
langSelector.addEventListener("change", e=>{
  setLanguage(e.target.value);
});

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

// Rendu de la liste
function render() {
  listEl.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "p-2 rounded mb-1 bg-white/60 dark:bg-slate-700/60";
    li.textContent = `${t.title} • ${t.duration} min`;
    listEl.appendChild(li);
  });
}

// Décision focus
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
setLanguage(currentLang);
render();
drawChart();
