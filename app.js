let data = JSON.parse(localStorage.getItem("lifesync")) || {
  tasks: [],
  worked: 0,
  sessions: 0
};

function save() {
  localStorage.setItem("lifesync", JSON.stringify(data));
}

function addTask() {
  const title = document.getElementById("title").value.trim();
  if (!title) return;

  data.tasks.push({
    title,
    duration: Number(document.getElementById("duration").value || 30),
    priority: Number(document.getElementById("priority").value)
  });

  document.getElementById("title").value = "";
  render();
  save();
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";
  data.tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "p-2 rounded mb-1 bg-white/60 dark:bg-slate-700/60";
    li.textContent = `${t.title} • ${t.duration} min`;
    list.appendChild(li);
  });

  document.getElementById("stats").innerHTML =
    `⏱️ Temps productif : <b>${data.worked} min</b><br>
     🧠 Sessions focus : <b>${data.sessions}</b>`;
}

function decide() {
  if (data.tasks.length === 0) return;

  const energy = Number(document.getElementById("energy").value);
  const best = data.tasks.sort((a, b) =>
    (b.priority * 3 - b.duration + energy) -
    (a.priority * 3 - a.duration + energy)
  )[0];

  const focus = document.getElementById("focus");
  focus.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">🎯 Focus</h2>
    <p class="text-lg mb-2">${best.title}</p>
    <p class="opacity-70 mb-4">⏱️ ${best.duration} minutes</p>
    <button onclick="complete('${best.title}')" class="bg-indigo-600 text-white px-6 py-2 rounded-xl">
      ✅ Terminé
    </button>
  `;
  focus.classList.remove("hidden");
}

function complete(title) {
  const task = data.tasks.find(t => t.title === title);
  data.worked += task.duration;
  data.sessions++;
  data.tasks = data.tasks.filter(t => t.title !== title);

  document.getElementById("focus").classList.add("hidden");
  render();
  save();
}

render();
