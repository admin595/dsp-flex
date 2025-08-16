'use client'
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Column, Task } from './types';
import { Badge } from '../ui';

export function ColumnView({ column, tasks }: { column: Column, tasks: Task[] }) {
  const { setNodeRef } = useDroppable({ id: column.id, data: { columnId: column.id } });

  const overdue = tasks.filter(t => t.dueAt && new Date(t.dueAt) < new Date() && t.status !== 'Completed').length;

  return (
    <div className="bg-gray-50 border rounded-xl p-3 min-h-[300px]" ref={setNodeRef}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{column.name}</h3>
        <div className="flex items-center gap-2 text-xs">
          {overdue > 0 && <Badge tone="red">{overdue} overdue</Badge>}
          <span className="text-gray-500">{tasks.length} items</span>
        </div>
      </div>
      <SortableContext items={tasks.map(t => t.id)}>
        <div className="space-y-2">
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </SortableContext>
    </div>
  );
}