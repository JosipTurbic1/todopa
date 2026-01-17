import { TaskRepository } from './task.repository';
import { Task } from '~/domain/task.model';
import { TaskStatus } from '~/domain/task-status.enum';

export class InMemoryTaskRepository implements TaskRepository {
    private tasks: Task[] = [];

    async getAll(): Promise<Task[]> {
        return [...this.tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    async getById(id: string): Promise<Task | null> {
        return this.tasks.find(t => t.id === id) ?? null;
    }

    async create(task: Task): Promise<void> {
        this.tasks = [task, ...this.tasks];
    }

    async update(task: Task): Promise<void> {
        this.tasks = this.tasks.map(t => (t.id === task.id ? task : t));
    }

    async delete(id: string): Promise<void> {
        this.tasks = this.tasks.filter(t => t.id !== id);
    }

    async getByStatus(status: TaskStatus): Promise<Task[]> {
        return (await this.getAll()).filter(t => t.status === status);
    }
}
