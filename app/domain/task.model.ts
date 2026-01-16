import { TaskPriority } from './task-priority.enum';
import { TaskStatus } from './task-status.enum';

export interface Task {
    id: string;                 // UUID / generated id
    title: string;
    description?: string;

    status: TaskStatus;

    deadline?: string;          // ISO string (e.g. 2026-01-16T10:00:00.000Z)
    priority: TaskPriority;

    createdAt: string;          // ISO string
    updatedAt: string;          // ISO string
}
