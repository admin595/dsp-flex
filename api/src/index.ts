import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

type Status = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
type Task = {
  id: string; title: string; description?: string; priority: 'Low'|'Medium'|'High';
  status: Status; dueAt?: string; order: number; assignees: string[]; labels: string[];
  boardId: string; createdAt: string; updatedAt: string;
};
type Column = { id: string; key: Status; name: string; order: number; boardId: string; };
type Board = { id: string; name: string; columns: Column[] };

const board: Board = {
  id: 'default',
  name: 'Default Board',
  columns: [
    { id: 'col-not', key: 'Not Started', name: 'Not Started', order: 0, boardId: 'default' },
    { id: 'col-prog', key: 'In Progress', name: 'In Progress', order: 1, boardId: 'default' },
    { id: 'col-hold', key: 'On Hold', name: 'On Hold', order: 2, boardId: 'default' },
    { id: 'col-done', key: 'Completed', name: 'Completed', order: 3, boardId: 'default' },
  ]
};

let tasks: Task[] = [
  { id: randomUUID(), title: 'Vehicle inspection A-12', description: 'Pre-trip DVIR for van 12', priority: 'High', status: 'Not Started', dueAt: new Date(Date.now()+24*3600*1000).toISOString(), order: 0, assignees: ['u_emp1'], labels: [], boardId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: randomUUID(), title: 'Safety refresher video', description: '15-min video + 3 Qs', priority: 'Low', status: 'In Progress', dueAt: new Date(Date.now()+48*3600*1000).toISOString(), order: 0, assignees: ['u_emp2'], labels: [], boardId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: randomUUID(), title: 'Upload route photos', description: 'Add 3 POD photos', priority: 'Medium', status: 'On Hold', dueAt: new Date(Date.now()-6*3600*1000).toISOString(), order: 0, assignees: ['u_emp3'], labels: [], boardId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const server = app.listen(PORT, () => console.log(`API listening on :${PORT}`));
const wss = new WebSocketServer({ server });
function broadcast(msg: any) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((c: any) => { try { c.send(data) } catch {} });
}

app.get('/boards/default', (_req, res) => {
  const boardTasks = tasks.filter(t => t.boardId === 'default');
  res.json({ board, tasks: boardTasks });
});

app.post('/tasks', (req, res) => {
  const { title, description, priority='Medium', dueAt, assignees=[] } = req.body || {};
  const t: Task = { id: randomUUID(), title, description, priority, status: 'Not Started', dueAt, order: Date.now(), assignees, labels: [], boardId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  tasks.unshift(t);
  broadcast({ type: 'task_created', task: t });
  res.status(201).json(t);
});

app.patch('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  tasks[idx] = { ...tasks[idx], ...req.body, updatedAt: new Date().toISOString() };
  broadcast({ type: 'task_updated', task: tasks[idx] });
  res.json(tasks[idx]);
});

app.patch('/tasks/:id/move', (req, res) => {
  const id = req.params.id;
  const { toColumnId } = req.body || {};
  const col = board.columns.find(c => c.id === toColumnId);
  if (!col) return res.status(400).json({ error: 'Invalid column' });
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  tasks[idx].status = col.key;
  tasks[idx].order = Date.now();
  tasks[idx].updatedAt = new Date().toISOString();
  broadcast({ type: 'task_moved', task: tasks[idx] });
  res.json(tasks[idx]);
});

app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const before = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length === before) return res.status(404).json({ error: 'Not found' });
  broadcast({ type: 'task_deleted', id });
  res.status(204).send();
});