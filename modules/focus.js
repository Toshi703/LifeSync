export function startFocus(task, onComplete) {
  const focusEl = document.getElementById("focus");
  let timeLeft = task.duration * 60;

  function formatTime(s) {
    const m = Math.floor(s/60);
    const sec = s%60;
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  }

  focusEl.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">🎯 Focus</h2>
    <p class="text-lg mb-2">${task.title}</p>
    <p id="timer" class="text-xl font-mono mb-4">${formatTime(timeLeft)}</p>
    <button id="endFocus" class="bg-red-600 text-white px-6 py-2 rounded-xl">🛑 Terminer</button>
  `;
  focusEl.classList.remove("hidden");

  const timerEl = document.getElementById("timer");
  const endBtn = document.getElementById("endFocus");

  const interval = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = formatTime(timeLeft);
    if(timeLeft<=0){
      clearInterval(interval);
      onComplete();
    }
  },1000);

  endBtn.onclick = ()=>{
    clearInterval(interval);
    onComplete();
  };
}
