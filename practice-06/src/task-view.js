const PRIORITY_LABELS = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export function createTaskElement(task, category) {
  const item = document.createElement('li');
  item.className = `task-card${task.completed ? ' is-completed' : ''}`;
  item.dataset.taskId = String(task.id);
  const body = document.createElement('div');
  body.className = 'task-content';
  const heading = document.createElement('h3');
  heading.className = 'task-title';
  heading.textContent = task.title;
  const meta = document.createElement('p');
  meta.className = 'task-meta';
  const status = document.createElement('span');
  status.className = 'task-status';
  status.textContent = task.completed ? 'Выполнена' : 'В работе';
  const priority = document.createElement('span');
  priority.className = 'task-priority';
  priority.textContent = PRIORITY_LABELS[task.priority];
  meta.append(status, document.createTextNode(' · '), priority);
  if (category) {
    const label = document.createElement('span');
    label.className = 'task-category';
    label.textContent = category.name;
    meta.append(document.createTextNode(' · '), label);
  }
  body.append(heading, meta);
  const actions = document.createElement('div');
  actions.className = 'task-actions';
  for (const [action, label] of [
    ['toggle', task.completed ? 'Вернуть в работу' : 'Выполнить'],
    ['edit', 'Изменить'], ['delete', 'Удалить'],
  ]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action;
    button.setAttribute('aria-label', `${label}: ${task.title}`);
    const text = document.createElement('span');
    text.className = 'action-label';
    text.textContent = label;
    button.append(text);
    actions.append(button);
  }
  item.append(body, actions);
  return item;
}

export function renderTaskList(list, tasks, categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  list.replaceChildren(...tasks.map((task) => createTaskElement(task, byId.get(task.categoryId))));
}
