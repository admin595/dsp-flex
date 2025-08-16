'use client'

import useSWR from 'swr';
import { useCallback, useMemo, useState } from 'react';
import type { Board, Column, Task } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useKanban() {
  const { data, mutate } = useSWR(`${API}/boards/default`, fetcher, { revalidateOnFocus: true });
  const [editing, setEditing] = useState<Task | null>(null);

  const board: Board | undefined = data?.board;
  const tasks: Task[] = data?.tasks || [];
  const columns: Column[] = board?.columns || [];

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of columns) map[col.id] = [];
    for (const t of tasks) {
      const col = columns.find(c => c.key === t.status) || columns[0];
      if (!map[col.id]) map[col.id] = [];
      map[col.id].push(t);
    }
    for (const colId in map) map[colId].sort((a, b) => a.order - b.order);
    return map;
  }, [tasks, columns]);

  const moveTask = useCallback(async (taskId: string, fromColId: string, toColId: string) => {
    const to = columns.find(c => c.id === toColId);
    if (!to) return;
    await fetch(`${API}/tasks/${taskId}/move`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toColumnId: toColId }) });
    mutate();
  }, [columns, mutate]);

  const createTask = useCallback(async () => {
    await fetch(`${API}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Task', priority: 'Medium', dueAt: new Date(Date.now() + 24*3600*1000).toISOString(), assignees: [] }) });
    mutate();
  }, [mutate]);

  const editTask = useCallback(async (task: Task) => {
    const title = prompt('Task title', task.title) || task.title;
    await fetch(`${API}/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
    mutate();
  }, [mutate]);

  const quickStatus = useCallback(async (task: Task, status: string) => {
    await fetch(`${API}/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    mutate();
  }, [mutate]);

  return { board: board!, columns, tasksByColumn, moveTask, createTask, editTask, quickStatus, editing, setEditing };
}