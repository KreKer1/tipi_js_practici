const PRIORITIES = new Set(['low', 'medium', 'high']);
const validId = (id) => Number.isSafeInteger(id) && id > 0;
const failure = (error) => ({ ok: false, error });

export function createTask(id, title, priority = 'medium') {
  if (!validId(id)) return failure('Нужен положительный целый id.');
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 100) {
    return failure('Название должно содержать от 1 до 100 символов.');
  }
  if (!PRIORITIES.has(priority)) return failure('Неизвестный приоритет.');
  return { ok: true, task: { id, title: title.trim(), completed: false, priority } };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}
export function getPendingTasks(tasks) {
  return tasks.filter((task) => !task.completed);
}
export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}
export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  return { total, completed, pending: total - completed, progress: total ? completed / total * 100 : 0 };
}
export function addTask(tasks, id, title, priority = 'medium') {
  const result = createTask(id, title, priority);
  if (!result.ok) return result;
  if (findTaskById(tasks, id)) return failure('Задача с таким id уже существует.');
  return { ok: true, tasks: [...tasks, result.task] };
}
function checkExisting(tasks, id) {
  if (!validId(id)) return failure('Некорректный id.');
  if (!findTaskById(tasks, id)) return failure('Задача не найдена.');
  return { ok: true };
}
export function setTaskCompleted(tasks, id, completed) {
  const checked = checkExisting(tasks, id);
  if (!checked.ok) return checked;
  if (typeof completed !== 'boolean') return failure('Статус должен быть boolean.');
  return { ok: true, tasks: tasks.map((task) => task.id === id ? { ...task, completed } : task) };
}
export function renameTask(tasks, id, title) {
  const checked = checkExisting(tasks, id);
  if (!checked.ok) return checked;
  return updateTask(tasks, id, title, findTaskById(tasks, id).priority);
}
export function removeTask(tasks, id) {
  const checked = checkExisting(tasks, id);
  if (!checked.ok) return checked;
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
export function updateTask(tasks, id, title, priority) {
  const checked = checkExisting(tasks, id);
  if (!checked.ok) return checked;
  if (!PRIORITIES.has(priority)) return failure('Неизвестный приоритет.');
  const result = createTask(id, title, priority);
  if (!result.ok) return result;
  // completed берём из существующей задачи, а не из результата createTask.
  return { ok: true, tasks: tasks.map((task) => task.id === id
    ? { ...task, title: result.task.title, priority: result.task.priority } : task) };
}
