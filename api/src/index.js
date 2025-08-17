
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Seed only if DB empty
async function ensureSeed() {
  const boards = await prisma.board.count();
  if (boards > 0) return;
  await prisma.board.create({
    data: {
      id: 'default',
      name: 'Default Board',
      columns: {
        create: [
          { id: 'col-not', key: 'Not Started', name: 'Not Started', order: 0, boardId: 'default' },
          { id: 'col-prog', key: 'In Progress', name: 'In Progress', order: 1, boardId: 'default' },
          { id: 'col-hold', key: 'On Hold', name: 'On Hold', order: 2, boardId: 'default' },
          { id: 'col-done', key: 'Completed', name: 'Completed', order: 3, boardId: 'default' },
        ]
      },
      tasks: {
        create: [
          { title: 'Vehicle inspection A-12', description: 'Pre-trip DVIR for van 12', priority: 'High', status: 'Not Started', dueAt: new Date(Date.now() + 24*3600*1000) },
          { title: 'Safety refresher video', description: '15-min video + 3 Qs', priority: 'Low', status: 'In Progress', dueAt: new Date(Date.now() + 48*3600*1000) },
          { title: 'Upload route photos', description: 'Add 3 POD photos', priority: 'Medium', status: 'On Hold', dueAt: new Date(Date.now() - 6*3600*1000) },
        ]
      }
    }
  });
  console.log('Seeded default board/columns/tasks');
}

app.get('/', (_req, res) => res.json({ ok: true, service: 'dsp-flex-api', docs: ['/boards/default','/health'] }));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/boards/default', async (_req, res) => {
  await ensureSeed();
  const board = await prisma.board.findUnique({
    where: { id: 'default' },
    include: { columns: true, tasks: true }
  });
  res.json({ board, tasks: board?.tasks || [] });
});

app.post('/tasks', async (req, res) => {
  const { title = 'New Task', description = null, priority = 'Medium', dueAt = null } = req.body || {};
  const t = await prisma.task.create({
    data: { title, description, priority, status: 'Not Started', boardId: 'default', dueAt: dueAt ? new Date(dueAt) : null }
  });
  res.status(201).json(t);
});

app.patch('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const t = await prisma.task.update({ where: { id }, data: { ...req.body } });
    res.json(t);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.patch('/tasks/:id/move', async (req, res) => {
  const id = req.params.id;
  const { toColumnId } = req.body || {};
  const col = await prisma.column.findUnique({ where: { id: toColumnId } });
  if (!col) return res.status(400).json({ error: 'Invalid column' });
  try {
    const t = await prisma.task.update({ where: { id }, data: { status: col.key, columnId: col.id } });
    res.json(t);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
