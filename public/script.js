const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const statusMessage = document.getElementById('statusMessage');

// Показати повідомлення про помилку.
function showError(message) {
    statusMessage.textContent = message;
}

// Отримати та показати список завдань із сервера.
async function loadTasks() {
    try {
        statusMessage.textContent = '';

        const response = await fetch('/api/tasks');

        if (!response.ok) {
            throw new Error('Не вдалося завантажити завдання.');
        }

        const tasks = await response.json();
        taskList.innerHTML = '';

        taskCounter.textContent = `${tasks.length} завдань`;

        if (tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Поки що завдань немає. Додайте перше!';
            taskList.appendChild(emptyMessage);
            return;
        }

        tasks.forEach(task => {
            const item = document.createElement('li');
            item.className = 'task-item';

            const title = document.createElement('span');
            title.className = 'task-title';
            title.textContent = task.title;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.type = 'button';
            deleteButton.textContent = 'Видалити';
            deleteButton.addEventListener('click', () => deleteTask(task.id));

            item.appendChild(title);
            item.appendChild(deleteButton);
            taskList.appendChild(item);
        });
    } catch (error) {
        showError(error.message);
    }
}

// Додати нове завдання через POST-запит.
async function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        showError('Введіть назву завдання.');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Не вдалося додати завдання.');
        }

        taskInput.value = '';
        taskInput.focus();
        await loadTasks();
    } catch (error) {
        showError(error.message);
    }
}

// Видалити завдання через DELETE-запит.
async function deleteTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Не вдалося видалити завдання.');
        }

        await loadTasks();
    } catch (error) {
        showError(error.message);
    }
}

taskForm.addEventListener('submit', addTask);

// Завантажити завдання після відкриття сторінки.
loadTasks();
