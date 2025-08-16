'use client'

import React from 'react';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { ColumnView } from './ColumnView';
import { useKanban } from './useKanban';
import { Section, Button } from '../ui';

export function BoardView() {
  const { board, columns, tasksByColumn, moveTask, createTask } = useKanban();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const from = active.data.current?.columnId as string | undefined;
    const to = over.data.current?.columnId as string | undefined;
    const taskId = active.id as string;
    if (!from || !to) return;
    if (from === to) return;
    moveTask(taskId, from, to);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">DSP Flex — Task Board</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => createTask()}>New Task</Button>
        </div>
      </header>
      <Section title={board?.name || 'Board'}>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SortableContext items={columns.map(c => c.id)}>
              {columns.map((col) => (
                <ColumnView key={col.id} column={col} tasks={tasksByColumn[col.id] || []} />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </Section>
    </div>
  )
}