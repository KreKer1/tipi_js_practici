import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function printStats(tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

function printIds(tasks) {
  const ids = tasks.map((task) => task.id);
  console.log("id задач: [" + ids.join(", ") + "]");
}

console.log("========== ОБЩИЙ СЦЕНАРИЙ ==========");

const demoBefore = JSON.stringify(demoTasks);

let currentTasks = demoTasks;
let result;

console.log("\n1. Исходный набор");
console.table(currentTasks);
console.log("Названия:", getTaskTitles(currentTasks));
console.log("Невыполненные id: [" + getPendingTasks(currentTasks).map((task) => task.id).join(", ") + "]");
console.log("Задача с id = 4:", findTaskById(currentTasks, 4));
printStats(currentTasks);

console.log("\n2. Добавляем задачу id = 20");
result = addTask(currentTasks, 20, "Добавить проверку", "high");
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(currentTasks);
printStats(currentTasks);

console.log("\n3. Отмечаем выполненной задачу id = 4");
result = setTaskCompleted(currentTasks, 4, true);
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(currentTasks);
printStats(currentTasks);

console.log("\n4. Переименовываем задачу id = 10");
result = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(currentTasks);
printStats(currentTasks);

console.log("\n5. Удаляем задачу id = 7");
result = removeTask(currentTasks, 7);
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(currentTasks);
printStats(currentTasks);

console.log("\n6. Пробуем ещё раз добавить id = 20 (должна быть ошибка)");
result = addTask(currentTasks, 20, "Дубликат", "low");
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(currentTasks);

console.log('\n7. Передаём статус строкой "true" (должна быть ошибка)');
result = setTaskCompleted(currentTasks, 1, "true");
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(currentTasks);

console.log("\nИтог общего сценария:");
console.table(currentTasks);
console.log("Невыполненные id: [" + getPendingTasks(currentTasks).map((task) => task.id).join(", ") + "]");
console.log("demoTasks не изменился:", JSON.stringify(demoTasks) === demoBefore);

console.log(`\n========== ВАРИАНТ ${variantNumber} ==========`);

const variantBefore = JSON.stringify(variantTasks);
let myTasks = variantTasks;

console.log("\n1. Исходный набор варианта");
console.table(myTasks);
printStats(myTasks);

console.log("\n2. Добавляем задачу id = 80");
result = addTask(myTasks, 80, "Проверить проектор в аудитории", "medium");
if (result.ok) {
  myTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(myTasks);
printStats(myTasks);

console.log("\n3. Отмечаем выполненной задачу id = 11");
result = setTaskCompleted(myTasks, 11, true);
if (result.ok) {
  myTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(myTasks);
printStats(myTasks);

console.log("\n4. Переименовываем задачу id = 23");
result = renameTask(myTasks, 23, "Собрать и проверить материалы по теме");
if (result.ok) {
  myTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(myTasks);
printStats(myTasks);

console.log("\n5. Удаляем задачу id = 37");
result = removeTask(myTasks, 37);
if (result.ok) {
  myTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(myTasks);
printStats(myTasks);

console.log("\n6. Пробуем ещё раз добавить id = 80 (должна быть ошибка)");
result = addTask(myTasks, 80, "Проверить проектор в аудитории", "medium");
if (result.ok) {
  myTasks = result.tasks;
} else {
  console.log(`Ошибка: ${result.error}`);
}
printIds(myTasks);

console.log("\nИтог варианта:");
console.table(myTasks);
printStats(myTasks);
console.log("variantTasks не изменился:", JSON.stringify(variantTasks) === variantBefore);
