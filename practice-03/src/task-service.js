// Функции для работы со списком задач.
// Здесь нет console.log и нет глобального списка задач.
// Если данные неправильные, функция возвращает { ok: false, error: "..." }.

// Проверка id. Возвращает текст ошибки или пустую строку, если всё хорошо.
function checkId(id) {
  if (typeof id !== "number") {
    return "id должен быть числом";
  }
  if (!Number.isSafeInteger(id) || id <= 0) {
    return "id должен быть положительным целым числом";
  }
  return "";
}

// Проверка названия. Возвращает текст ошибки или пустую строку.
function checkTitle(title) {
  if (typeof title !== "string") {
    return "Название должно быть строкой";
  }
  const cleanTitle = title.trim();
  if (cleanTitle.length === 0) {
    return "Название не может быть пустым";
  }
  if (cleanTitle.length > 100) {
    return "Название должно быть не длиннее 100 символов";
  }
  return "";
}

export function createTask(id, title, priority = "medium") {
  const idError = checkId(id);
  if (idError !== "") {
    return { ok: false, error: idError };
  }

  const titleError = checkTitle(title);
  if (titleError !== "") {
    return { ok: false, error: titleError };
  }

  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    return { ok: false, error: "Приоритет должен быть low, medium или high" };
  }

  const task = {
    id: id,
    title: title.trim(),
    completed: false,
    priority: priority,
  };

  return { ok: true, task: task };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;

  let completed = 0;
  for (const task of tasks) {
    if (task.completed === true) {
      completed += 1;
    }
  }

  const pending = total - completed;

  let progress = 0;
  if (total > 0) {
    progress = (completed / total) * 100;
  }

  return { total: total, completed: completed, pending: pending, progress: progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);
  if (result.ok === false) {
    return result;
  }

  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: "Задача с таким id уже есть" };
  }

  // Новый массив: старые задачи + новая в конце.
  const newTasks = [...tasks, result.task];
  return { ok: true, tasks: newTasks };
}

export function setTaskCompleted(tasks, id, completed) {
  const idError = checkId(id);
  if (idError !== "") {
    return { ok: false, error: idError };
  }

  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус должен быть true или false" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  // Для нужной задачи создаём новый объект, остальные оставляем как есть.
  const newTasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: completed };
    }
    return task;
  });

  return { ok: true, tasks: newTasks };
}

export function renameTask(tasks, id, title) {
  const idError = checkId(id);
  if (idError !== "") {
    return { ok: false, error: idError };
  }

  const titleError = checkTitle(title);
  if (titleError !== "") {
    return { ok: false, error: titleError };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  const newTasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, title: title.trim() };
    }
    return task;
  });

  return { ok: true, tasks: newTasks };
}

export function removeTask(tasks, id) {
  const idError = checkId(id);
  if (idError !== "") {
    return { ok: false, error: idError };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  const newTasks = tasks.filter((task) => task.id !== id);
  return { ok: true, tasks: newTasks };
}
