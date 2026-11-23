import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}


// Контроллер знает API и абстрактное представление; глобальный DOM не нужен.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  const apiMethods = ['loadInitialData', 'getTasks', 'createTask', 'updateTask', 'setTaskCompleted', 'deleteTask', 'resetDemoData'];
  const viewMethods = ['setListState', 'setTasks', 'setCategories', 'setTotal', 'setFormTask', 'showFormErrors', 'setMutationPending', 'notify'];
  if (!api || !view || apiMethods.some((key) => typeof api[key] !== 'function')
    || viewMethods.some((key) => typeof view[key] !== 'function') || typeof validateDraft !== 'function') {
    throw new TypeError('Нужны API, представление и функция валидации.');
  }
  let tasks = [];
  let categories = [];
  let filters = {};
  let editingId = null;
  let categoriesLoaded = false;
  let active = null;
  let sequence = 0;
  let pending = false;
  let destroyed = false;

  async function load() {
    if (destroyed) return;
    const requestNumber = ++sequence;
    active?.abort();
    const controller = new AbortController();
    active = controller;
    view.setListState('loading');
    try {
      const result = categoriesLoaded ? await api.getTasks({ ...filters }, { signal: controller.signal })
        : await api.loadInitialData({ ...filters }, { signal: controller.signal });
      if (destroyed || requestNumber !== sequence || controller.signal.aborted) return;
      if (!categoriesLoaded) {
        categories = result.categories;
        categoriesLoaded = true;
        view.setCategories(categories);
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? 'ready' : 'empty');
      // Новые карточки должны получить тот же статус блокировки, что и старые.
      if (pending) view.setMutationPending(true);
    } catch (error) {
      if (destroyed || requestNumber !== sequence || controller.signal.aborted || error?.kind === 'aborted') return;
      view.setListState('error', messageForError(error));
    } finally {
      if (active === controller) active = null;
    }
  }
  function cancelEdit() {
    editingId = null;
    view.showFormErrors({});
    view.setFormTask(null);
  }
  async function mutate(action, message, resetForm = false) {
    if (pending || destroyed) return;
    pending = true;
    // Начатая до мутации загрузка не должна отрисовать старое состояние сервера.
    active?.abort();
    ++sequence;
    view.setMutationPending(true);
    try {
      await action();
      if (destroyed) return;
      if (resetForm) cancelEdit();
      view.notify(message, 'success');
      await load();
    } catch (error) {
      if (!destroyed && error?.kind !== 'aborted') view.notify(messageForError(error), 'error');
    } finally {
      pending = false;
      if (!destroyed) view.setMutationPending(false);
    }
  }
  function find(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) view.notify('Задача не найдена в текущем списке.', 'error');
    return task;
  }
  return {
    start(initialFilters = {}) { filters = { ...initialFilters }; return load(); },
    applyFilters(nextFilters = {}) { filters = { ...nextFilters }; return load(); },
    refresh() { return load(); },
    async submit(draft) {
      if (pending || destroyed) return;
      const result = validateDraft(draft, categories);
      view.showFormErrors(result.errors);
      if (!result.valid) return;
      const id = editingId;
      return mutate(() => id === null ? api.createTask(result.value) : api.updateTask(id, result.value),
        id === null ? 'Задача добавлена.' : 'Изменения сохранены.', true);
    },
    beginEdit(id) {
      if (pending || destroyed) return;
      const task = find(id);
      if (!task) return;
      editingId = id;
      view.showFormErrors({});
      view.setFormTask(task);
    },
    cancelEdit,
    async toggleTask(id) {
      const task = find(id);
      if (!task) return;
      return mutate(() => api.setTaskCompleted(id, !task.completed), 'Статус изменён.');
    },
    async deleteTask(id) {
      if (!find(id)) return;
      return mutate(() => api.deleteTask(id), 'Задача удалена.', editingId === id);
    },
    resetData() { return mutate(() => api.resetDemoData(), 'Исходный набор восстановлен.', true); },
    destroy() { destroyed = true; ++sequence; active?.abort(); active = null; },
  };
}
