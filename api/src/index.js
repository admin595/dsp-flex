const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'dsp-flex-api', docs: ['/boards/default', '/health'] });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Get default board with tasks
app.get('/boards/default', async (req, res) => {
  try {
    let board = await prisma.board.findFirst({
      where: { name: 'Default Board' },
      include: { columns: { include: { tasks: true } } },
    });

    if (!board) {
      board = await prisma.board.create({
        data: {
          name: 'Default Board',
          columns: {
            create: [
              { key: 'Not Started', name: 'Not Started', order: 0 },
              { key: 'In Progress', name: 'In Progress', order: 1 },
              { key: 'On Hold', name: 'On Hold', order: 2 },
              { key: 'Completed', name: 'Completed', order: 3 },
            ],
          },
        },
        include: { columns: true },
      });
    }

    const tasks = await prisma.task.findMany({ where: { boardId: board.id } });
    res.json({ board, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load board' });
  }
});

// Create new task
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, priority, status, dueAt, assignees, labels, boardId, columnId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueAt: dueAt ? new Date(dueAt) : null,
        assignees,
        labels,
        boardId,
        columnId,
        order: 0
      },
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.task.update({
      where: { id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Move task between columns
app.post('/tasks/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { columnId, status } = req.body;
    const moved = await prisma.task.update({
      where: { id },
      data: { columnId, status },
    });
    res.json(moved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to move task' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
