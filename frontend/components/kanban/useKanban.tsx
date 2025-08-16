'use client'

import useSWR from 'swr';
import { useCallback, useMemo } from 'react';
import type { Board, Column, Task } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useKanban() {
  const { data, mutate } = useSWR(`${API}/boards/default`, fetcher, { revalidateOnFocus: true });

  const board: Board | undefined = data?.board ?? { id: 'default', name: 'Default Board', columns: [
    { id: 'col-not', key: 'Not Started', name: 'Not Started', order: 0, boardId: 'default' },
    { id: 'col-prog', key: 'In Progress', name: 'In Progress', order: 1, boardId: 'default' },
    { id: 'col-hold', key: 'On Hold', name: 'On Hold', order: 2, boardId: 'default' },
    { id: 'col-done', key: 'Completed', name: 'Completed', order: 3, boardId: 'default' },
  ]};
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

  const moveTask = async (taskId: string, fromColId: string, toColId: string) => {
    await fetch(`${API}/tasks/${taskId}/move`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toColumnId: toColId }) });
    mutate();
  };

  const createTask = async () => {
    await fetch(`${API}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Task', priority: 'Medium', dueAt: new Date(Date.now() + 24*3600*1000).toISOString(), assignees: [] }) });
    mutate();
  };

  const editTask = async (task: Task) => {
    const title = prompt('Task title', task.title) || task.title;
    await fetch(`${API}/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
    mutate();
  };

  const quickStatus = async (task: Task, status: string) => {
    await fetch(`${API}/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    mutate();
  };

  return { board: board!, columns, tasksByColumn, moveTask, createTask, editTask, quickStatus };
}