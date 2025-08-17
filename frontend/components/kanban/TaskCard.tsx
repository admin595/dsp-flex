
'use client'
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from './types';
import { Badge, Button } from '../ui';
import { useKanban } from './useKanban';

export function TaskCard({ task }: { task: Task }) {
  // Attach sortable to the card, but only put DRAG LISTENERS on a small handle,
  // so buttons remain fully clickable.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { columnId: task.status }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const dueSoon = task.dueAt && new Date(task.dueAt).getTime() - Date.now() < 24*3600*1000 && new Date(task.dueAt) > new Date();
  const overdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status !== 'Completed';
  const { editTask, quickStatus } = useKanban();

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="bg-white border rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <span
              {...listeners}
              className="cursor-grab select-none text-gray-400 mr-1"
              title="Drag"
              aria-label="Drag task"
            >
              ⠿
            </span>
            <span className="font-medium">{task.title}</span>
            <Badge>{task.priority}</Badge>
            {overdue && <Badge tone="red">Overdue</Badge>}
            {dueSoon && !overdue && <Badge tone="yellow">Due soon</Badge>}
          </div>
          {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
          {task.dueAt && <p className="text-xs text-gray-500">Due {new Date(task.dueAt).toLocaleString()}</p>}
        </div>
        <div className="flex items-center gap-1">
          <Button onClick={(e) => { e.stopPropagation(); editTask(task); }} className="text-xs">Edit</Button>
          <Button onClick={(e) => { e.stopPropagation(); quickStatus(task, 'Completed'); }} className="text-xs">Complete</Button>
        </div>
      </div>
    </div>
  );
}
