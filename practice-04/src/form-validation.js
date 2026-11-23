const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const isEditing = editingId !== null;

  // При редактировании id берём из состояния приложения, а не из поля формы.
  const rawId = isEditing ? editingId : draft.id;
  const id = isEditing ? rawId : Number(rawId);
  const hasValidIdType = typeof rawId === "string" || typeof rawId === "number";

  if (!hasValidIdType || !Number.isSafeInteger(id) || id <= 0) {
    errors.id = "Укажи положительный целый идентификатор.";
  } else if (isEditing) {
    if (!tasks.some((task) => task.id === id)) {
      errors.id = "Задача для редактирования не найдена.";
    }
  } else if (tasks.some((task) => task.id === id)) {
    errors.id = "Задача с таким идентификатором уже существует.";
  }

  // trim создаёт новую строку: исходный draft остаётся без изменений.
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов.";
  }

  const priority = draft.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выбери приоритет low, medium или high.";
  }

  // Собираем все ошибки, чтобы пользователь мог исправить поля за один раз.
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { id, title, priority } };
}
