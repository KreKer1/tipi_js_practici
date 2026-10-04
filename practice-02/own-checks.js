import {
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
  getTaskStats,
} from "./src/task-service.js";

function makeTasks() {
  return [
    { id: 1, title: "Первая", completed: false, priority: "low" },
    { id: 2, title: "Вторая", completed: false, priority: "medium" },
    { id: 3, title: "Третья", completed: true, priority: "high" },
  ];
}

let tasks = makeTasks();
let result = removeTask(tasks, 2);
tasks = result.tasks;
result = addTask(tasks, 2, "Вторая заново", "high");
const ids1 = result.tasks.map((task) => task.id).join(",");
console.log("Проверка 1:", result.ok === true && ids1 === "1,3,2" ? "ПРОЙДЕНО" : "НЕ ПРОЙДЕНО", "| id:", ids1);

tasks = makeTasks();
const middleBefore = tasks[1];
result = setTaskCompleted(tasks, 1, true);
result = renameTask(result.tasks, 3, "  Последняя  ");
const ok2 =
  result.tasks[0].completed === true &&
  result.tasks[2].title === "Последняя" &&
  result.tasks[1] === middleBefore &&
  tasks[0].completed === false &&
  tasks[2].title === "Третья";
console.log("Проверка 2:", ok2 ? "ПРОЙДЕНО" : "НЕ ПРОЙДЕНО", "| названия:", result.tasks.map((task) => task.title).join(" / "));

tasks = makeTasks();
for (const task of makeTasks()) {
  result = setTaskCompleted(tasks, task.id, true);
  tasks = result.tasks;
}
const stats = getTaskStats(tasks);
console.log("Проверка 3:", stats.progress === 100 && stats.pending === 0 ? "ПРОЙДЕНО" : "НЕ ПРОЙДЕНО", "| прогресс:", stats.progress);

const title100 = "а".repeat(100);
const title101 = "а".repeat(101);
const r100 = addTask([], 5, title100);
const r101 = addTask([], 5, title101);
console.log("Проверка 4:", r100.ok === true && r101.ok === false ? "ПРОЙДЕНО" : "НЕ ПРОЙДЕНО", "| 100:", r100.ok, "| 101:", r101.ok, r101.error);
