import { ApiError } from './api-client.js';
const PRIORITIES = new Set(['low', 'medium', 'high']);
const FILTERS = new Set(['completed', 'priority', 'categoryId', 'q']);
const positiveId = (value) => Number.isSafeInteger(value) && value > 0;
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const titleOk = (value) => typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 100;
export function isTask(value) {
  return Boolean(object(value) && positiveId(value.id) && titleOk(value.title)
    && typeof value.completed === 'boolean' && PRIORITIES.has(value.priority) && positiveId(value.categoryId));
}
export function isCategory(value) {
  return Boolean(object(value) && positiveId(value.id) && titleOk(value.name));
}
const invalid = (message) => new ApiError(message, { kind: 'invalid-response' });
function checkId(id) { if (!positiveId(id)) throw new TypeError('Нужен положительный целый id.'); }
function normalizeFilters(filters) {
  if (!object(filters) || ![Object.prototype, null].includes(Object.getPrototypeOf(filters))) {
    throw new TypeError('Фильтры должны быть обычным объектом.');
  }
  const result = {};
  for (const [key, value] of Object.entries(filters)) {
    if (!FILTERS.has(key)) throw new TypeError(`Неизвестный фильтр: ${key}`);
    if (value === undefined || value === null || value === '') continue;
    if (key === 'completed' && typeof value !== 'boolean') throw new TypeError('completed должен быть boolean.');
    if (key === 'priority' && !PRIORITIES.has(value)) throw new TypeError('Неверный приоритет.');
    if (key === 'categoryId') checkId(value);
    if (key === 'q' && (typeof value !== 'string' || value.trim().length > 100)) throw new TypeError('Неверная строка поиска.');
    const normalized = key === 'q' ? value.trim() : value;
    if (normalized !== '') result[key] = normalized;
  }
  return result;
}
function collection(payload, predicate) {
  if (!object(payload) || !Array.isArray(payload.data) || !payload.data.every(predicate)
    || new Set(payload.data.map((item) => item.id)).size !== payload.data.length
    || !object(payload.meta) || payload.meta.total !== payload.data.length) {
    throw invalid('Неверная схема коллекции.');
  }
  return payload.data;
}
function single(payload) {
  if (!object(payload) || !isTask(payload.data)) throw invalid('Неверная схема задачи.');
  return payload.data;
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== 'function') throw new TypeError('Нужен клиент requestJson.');
  const withSignal = (options, signal) => signal === undefined ? options : { ...options, signal };
  async function getTasks(filters = {}, { signal } = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson('/tasks', withSignal({ query }, signal));
    const tasks = collection(payload, isTask);
    return { tasks, meta: payload.meta };
  }
  async function getTaskById(id, { signal } = {}) {
    checkId(id);
    return single(await client.requestJson(`/tasks/${id}`, withSignal(undefined, signal)));
  }
  async function getCategories({ signal } = {}) {
    return collection(await client.requestJson('/categories', withSignal(undefined, signal)), isCategory);
  }
  async function loadInitialData(filters = {}, options = {}) {
    const [result, categories] = await Promise.all([getTasks(filters, options), getCategories(options)]);
    return { tasks: result.tasks, categories, meta: result.meta };
  }
  
  return { getTasks, getTaskById, getCategories, loadInitialData  };
}
