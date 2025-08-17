
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'dsp-flex-api', docs: ['/boards/default','/health'] });
});

// Get board + tasks
app.get('/boards/:id', async (req, res) => {
  const boardId = req.params.id || 'default';
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { columns: true }
    });

    const tasks = await prisma.task.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ board, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create task
app.post('/tasks', async (req, res) => {
  const { title, description, priority, status, dueAt, assignees, boardId } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueAt: dueAt ? new Date(dueAt) : null,
        assignees,
        boardId: boardId || 'default',
      },
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
