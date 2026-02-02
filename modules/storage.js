const TASK_KEY = "lifesync_tasks";

export function saveTasks(tasks){
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
}

export function loadTasks(){
  const data = localStorage.getItem(TASK_KEY);
  return data?JSON.parse(data):[];
}
