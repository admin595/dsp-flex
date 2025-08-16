'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: number;
  title: string;
  status: string;
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${API_URL}/boards/default`)
      .then(res => res.json())
      .then(data => setTasks(data.tasks));
  }, []);

  const addTask = async () => {
    const newTask = { title: `Task ${tasks.length + 1}`, status: "Not Started" };
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask)
    });
    const task = await res.json();
    setTasks([...tasks, task]);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">DSP Flex Kanban v1</h1>
      <button onClick={addTask} className="px-4 py-2 bg-blue-600 text-white rounded">New Task</button>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {["Not Started", "In Progress", "Completed"].map(status => (
          <div key={status} className="border p-4 rounded bg-gray-50">
            <h2 className="font-semibold mb-2">{status}</h2>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} className="p-2 mb-2 bg-white rounded shadow">
                {task.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
