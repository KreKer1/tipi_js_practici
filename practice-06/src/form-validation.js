const PRIORITIES = new Set(['low', 'medium', 'high']);
export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft?.title === 'string' ? draft.title.trim() : '';
  if (!title || title.length > 100) errors.title = 'Название: от 1 до 100 символов.';
  const priority = draft?.priority;
  if (!PRIORITIES.has(priority)) errors.priority = 'Выбери допустимый приоритет.';
  const raw = draft?.categoryId;
  const categoryId = typeof raw === 'number' || typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0
    || !categories.some((category) => category.id === categoryId)) {
    errors.categoryId = 'Выбери существующую категорию.';
  }
  const valid = Object.keys(errors).length === 0;
  return { valid, value: valid ? { title, priority, categoryId } : null, errors };
}
