const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

// Підключення до бази даних SQLite.
// Файл tasks.db створиться автоматично в папці проєкту.
const db = new Database(path.join(__dirname, 'tasks.db'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Створення таблиці, якщо її ще немає.
db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
    )
`);

// GET: отримати всі завдання.
app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
    res.json(tasks);
});

// POST: додати нове завдання.
app.post('/api/tasks', (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';

    if (!title) {
        return res.status(400).json({ error: 'Введіть назву завдання.' });
    }

    const result = db.prepare(
        'INSERT INTO tasks (title) VALUES (?)'
    ).run(title);

    const newTask = db.prepare(
        'SELECT * FROM tasks WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(newTask);
});

// DELETE: видалити завдання за його ID.
app.delete('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Некоректний номер завдання.' });
    }

    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Завдання не знайдено.' });
    }

    res.json({ message: 'Завдання успішно видалено.' });
});

// Обробка помилок некоректного JSON.
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Некоректний формат JSON.' });
    }

    console.error(err);
    res.status(500).json({ error: 'Внутрішня помилка сервера.' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});
