import { getTaskStats } from "./task-service.js";

// Здесь только создаётся и обновляется разметка. Задачи здесь не меняются.

function getPriorityText(priority) {
  if (priority === "low") {
    return "Низкий";
  }
  if (priority === "high") {
    return "Высокий";
  }
  return "Средний";
}

export function createTaskElement(task) {
  const item = document.createElement("li");
  item.classList.add("task-card");
  if (task.completed) {
    item.classList.add("is-completed");
  }
  item.dataset.taskId = task.id;

  // Название выводим через textContent, чтобы HTML в названии не сработал
  const title = document.createElement("h3");
  title.classList.add("task-title");
  title.textContent = task.title;

  const status = document.createElement("p");
  status.classList.add("task-status");
  if (task.completed) {
    status.textContent = "Выполнена";
  } else {
    status.textContent = "В работе";
  }

  const priority = document.createElement("p");
  priority.classList.add("task-priority");
  priority.textContent = getPriorityText(task.priority);

  // Кнопка "Выполнена"
  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  const toggleLabel = document.createElement("span");
  toggleLabel.classList.add("action-label");
  toggleLabel.textContent = "Выполнена";
  toggleButton.append(toggleLabel);

  // Кнопка "Удалить"
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.classList.add("action-label");
  deleteLabel.textContent = "Удалить";
  deleteButton.append(deleteLabel);

  const actions = document.createElement("div");
  actions.classList.add("task-actions");
  actions.append(toggleButton, deleteButton);

  item.append(title, status, priority, actions);
  return item;
}

export function renderTaskList(listElement, tasks) {
  // Сначала очищаем список, потом добавляем карточки заново.
  // Сам ul не удаляем, на нём висит обработчик клика.
  listElement.innerHTML = "";
  for (const task of tasks) {
    const card = createTaskElement(task);
    listElement.append(card);
  }
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);

  summaryElement.querySelector('[data-stat="total"]').textContent = stats.total;
  summaryElement.querySelector('[data-stat="completed"]').textContent = stats.completed;
  summaryElement.querySelector('[data-stat="pending"]').textContent = stats.pending;
  summaryElement.querySelector('[data-stat="progress"]').textContent = stats.progress.toFixed(1) + "%";
  summaryElement.querySelector('[data-stat="visible"]').textContent = visibleCount;
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount > 0) {
    messageElement.textContent = "";
    messageElement.hidden = true;
  } else if (total === 0) {
    messageElement.textContent = "Список задач пуст.";
    messageElement.hidden = false;
  } else {
    messageElement.textContent = "Нет задач по выбранному фильтру.";
    messageElement.hidden = false;
  }
}
