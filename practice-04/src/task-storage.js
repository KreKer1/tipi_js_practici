export const STORAGE_VERSION = 1;
const copy = (tasks) => tasks.map((task) => ({ ...task }));

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  return value.every((task) => {
    if (!task || !Number.isSafeInteger(task.id) || task.id <= 0
      || typeof task.title !== 'string' || task.title !== task.title.trim()
      || task.title.length < 1 || task.title.length > 100
      || typeof task.completed !== 'boolean'
      || !['low', 'medium', 'high'].includes(task.priority) || ids.has(task.id)) return false;
    ids.add(task.id);
    return true;
  });
}
export function loadTasks(storage, key, fallbackTasks) {
  const fallback = copy(fallbackTasks);
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: 'initial', tasks: fallback };
    const value = JSON.parse(raw);
    if (!value || value.version !== STORAGE_VERSION || !isValidTaskList(value.tasks)) {
      throw new Error('Неверная версия или схема сохранённых задач.');
    }
    return { ok: true, source: 'storage', tasks: copy(value.tasks) };
  } catch {
    return { ok: false, source: 'fallback', tasks: fallback,
      error: 'Не удалось восстановить данные. Используется исходный набор.' };
  }
}
export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) return { ok: false, error: 'Некорректный список не сохранён.' };
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Хранилище недоступно или переполнено. Изменения остаются в текущей вкладке.' };
  }
}
export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось удалить сохранённые данные.' };
  }
}
