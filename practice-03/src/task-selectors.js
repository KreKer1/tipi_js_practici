// Возвращает задачи, которые нужно показать при выбранном фильтре.
export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") {
    return tasks.filter((task) => task.completed === false);
  }
  if (filter === "completed") {
    return tasks.filter((task) => task.completed === true);
  }
  // Фильтр "all" — копия всего списка
  return [...tasks];
}
