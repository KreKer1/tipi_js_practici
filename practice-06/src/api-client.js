export class ApiError extends Error {
  constructor(message, { kind, status = null, code = null, details = null, url = null, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'ApiError';
    Object.assign(this, { kind, status, code, details, url });
  }
}

const isObject = (value) => value !== null && typeof value === 'object'
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));

function normalizedBase(value) {
  if (typeof value !== 'string') throw new TypeError('Нужен абсолютный URL API.');
  let url;
  try { url = new URL(value); } catch { throw new TypeError('Неверный URL API.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) {
    throw new TypeError('Нужен HTTP(S) URL без query и hash.');
  }
  return url.href.replace(/\/+$/, '');
}

export function buildUrl(baseUrl, path, query = {}) {
  const base = normalizedBase(baseUrl);
  if (typeof path !== 'string' || !path.trim() || /^[a-z][a-z\d+.-]*:/i.test(path)
    || path.includes('?') || path.includes('#') || path.includes('\\')
    || path.split('/').some((part) => part === '..' || part === '.')) {
    throw new TypeError('Нужен относительный путь без query, hash и переходов по каталогам.');
  }
  if (!isObject(query)) throw new TypeError('query должен быть обычным объектом.');
  const url = new URL(`${base}/${path.replace(/^\/+|\/+$/g, '')}`);
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(name, String(value));
  }
  return url.href;
}

function checkTimeout(value) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > 2147483647) {
    throw new TypeError('timeoutMs должен быть положительным целым числом.');
  }
}

export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 3000 } = {}) {
  const base = normalizedBase(baseUrl);
  if (typeof fetchFn !== 'function') throw new TypeError('fetchFn должен быть функцией.');
  checkTimeout(timeoutMs);

  async function requestJson(path, { method = 'GET', query = {}, body, signal, timeoutMs: limit = timeoutMs } = {}) {
    if (typeof method !== 'string' || !['GET', 'POST', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      throw new TypeError('Неподдерживаемый HTTP-метод.');
    }
    method = method.toUpperCase();
    if (method === 'GET' && body !== undefined) throw new TypeError('У GET не должно быть тела.');
    if (signal !== undefined && !(signal instanceof AbortSignal)) throw new TypeError('Неверный AbortSignal.');
    checkTimeout(limit);
    const url = buildUrl(base, path, query);
    const headers = { Accept: 'application/json' };
    const options = { method, headers };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
      if (options.body === undefined) throw new TypeError('Тело нельзя сериализовать в JSON.');
      headers['Content-Type'] = 'application/json';
    }

    // Один сигнал прерывает и fetch, и чтение тела; таймер всегда очищается.
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort(signal.reason);
    if (signal?.aborted) cancel();
    else signal?.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(() => {
      if (!controller.signal.aborted) {
        timedOut = true;
        controller.abort(new DOMException('Время ожидания истекло.', 'TimeoutError'));
      }
    }, limit);
    options.signal = controller.signal;

    function transportError(cause) {
      if (controller.signal.aborted) return new ApiError(timedOut ? 'Время ожидания истекло.' : 'Запрос отменён.',
        { kind: timedOut ? 'timeout' : 'aborted', url, cause });
      return new ApiError('Не удалось связаться с сервером.', { kind: 'network', url, cause });
    }

    try {
      let response;
      try {
        controller.signal.throwIfAborted();
        response = await fetchFn(url, options);
      } catch (cause) {
        if (cause instanceof ApiError) throw cause;
        throw transportError(cause);
      }
      if (!(response instanceof Response)) {
        throw new ApiError('Ожидался HTTP Response.', { kind: 'invalid-response', url });
      }
      // HTTP-ошибка имеет приоритет, даже если тело не содержит корректного JSON.
      if (!response.ok) {
        let payload;
        try { payload = await response.json(); } catch { /* Статус всё равно сохраняем. */ }
        const error = payload?.error;
        throw new ApiError(typeof error?.message === 'string' && error.message.trim()
          ? error.message : `HTTP-ошибка ${response.status}.`, {
          kind: 'http', status: response.status, code: error?.code ?? null,
          details: error?.details ?? null, url,
        });
      }
      if (response.status === 204) return null;
      const type = (response.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();
      if (type !== 'application/json' && !/^application\/[\w.+-]+\+json$/.test(type)) {
        throw new ApiError('Ожидался JSON Content-Type.', { kind: 'invalid-response', url });
      }
      try {
        const payload = await response.json();
        controller.signal.throwIfAborted();
        return payload;
      } catch (cause) {
        if (controller.signal.aborted) throw transportError(cause);
        throw new ApiError('Некорректное JSON-тело ответа.', { kind: 'invalid-response', url, cause });
      }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  }
  return { requestJson };
}
