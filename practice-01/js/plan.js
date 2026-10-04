"use strict";

const totalTasks = 15;
const completedTasks = 0;
const dailyLimit = 4;

const maxTasks = 1000;
const maxDailyLimit = 1000;

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  console.log("Ошибка: количество задач должно быть числом.");
} else if (!Number.isFinite(totalTasks) || !Number.isFinite(completedTasks)) {
  console.log("Ошибка: недопустимое числовое значение количества задач.");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом.");
} else if (totalTasks < 0 || completedTasks < 0) {
  console.log("Ошибка: количество задач не может быть отрицательным.");
} else if (totalTasks > maxTasks) {
  console.log(`Ошибка: общее количество задач превышает верхнюю границу ${maxTasks}.`);
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: некорректное число выполненных задач (больше общего количества).");
} else if (typeof dailyLimit !== "number") {
  console.log("Ошибка: дневная норма должна быть числом, а не строкой.");
} else if (!Number.isInteger(dailyLimit)) {
  console.log("Ошибка: дневная норма должна быть целым числом.");
} else if (dailyLimit < 1 || dailyLimit > maxDailyLimit) {
  console.log(`Ошибка: дневная норма должна быть от 1 до ${maxDailyLimit}.`);
} else {
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;

  console.log(`Осталось задач: ${remainingTasks}`);

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
  }

  while (remainingTasks > 0) {
    day += 1;
    const doneToday = Math.min(dailyLimit, remainingTasks);
    remainingTasks -= doneToday;
    console.log(`День ${day}: выполнено ${doneToday}, осталось ${remainingTasks}`);
  }

  console.log(`Потребуется дней: ${day}`);
}
