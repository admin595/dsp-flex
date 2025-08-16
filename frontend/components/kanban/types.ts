export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueAt?: string;
  order: number;
  assignees: string[];
  labels: string[];
  boardId: string;
  updatedAt: string;
  createdAt: string;
};

export type Column = {
  id: string;
  key: Status | string;
  name: string;
  order: number;
  boardId: string;
};

export type Board = {
  id: string;
  name: string;
  columns: Column[];
};