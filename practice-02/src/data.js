// Общий контрольный набор. Для своего варианта ниже предусмотрен отдельный массив.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Вариант 2: номер в журнале 18, ((18 - 1) % 8) + 1 = 2.
// Тема: подготовка выступления. Выполнена изначально только первая задача (K = 1).
export const variantNumber = 2;
export const variantTasks = [
  { id: 11, title: "Выбрать тему выступления", completed: true, priority: "medium" },
  { id: 23, title: "Собрать материалы по теме", completed: false, priority: "high" },
  { id: 37, title: "Составить план выступления", completed: false, priority: "medium" },
  { id: 41, title: "Подготовить слайды презентации", completed: false, priority: "high" },
  { id: 58, title: "Отрепетировать выступление", completed: false, priority: "low" },
  { id: 64, title: "Подготовить ответы на вопросы", completed: false, priority: "low" },
];
