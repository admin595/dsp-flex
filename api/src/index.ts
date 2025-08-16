import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

let tasks: any[] = [
  { id: 1, title: "Sample Task 1", status: "Not Started" },
  { id: 2, title: "Sample Task 2", status: "In Progress" }
];

app.get('/boards/default', (req, res) => {
  res.json({ tasks });
});

app.post('/tasks', (req, res) => {
  const task = { id: tasks.length + 1, ...req.body };
  tasks.push(task);
  res.json(task);
});

app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === parseInt(id));
  if (task) {
    task.status = req.body.status;
    res.json(task);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
