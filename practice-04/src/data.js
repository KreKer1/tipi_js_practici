// Общий контрольный набор не изменяется: он используется в автоматических проверках.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];


// Номер в журнале 18 соответствует учебному варианту 2: ((18 - 1) % 8) + 1.
export const studentVariantNumber = 18;
export const variantNumber = 2;
export const variantTasks = [
  { id: 11, title: 'Выбрать тему выступления', completed: true, priority: 'high' },
  { id: 23, title: 'Составить план выступления', completed: false, priority: 'medium' },
  { id: 37, title: 'Собрать примеры для доклада', completed: false, priority: 'low' },
  { id: 41, title: 'Подготовить слайды', completed: false, priority: 'high' },
  { id: 58, title: 'Отрепетировать выступление', completed: false, priority: 'medium' },
  { id: 64, title: 'Проверить время доклада', completed: false, priority: 'low' },
];
