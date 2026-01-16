import { TaskRepository } from './task.repository';
import { Task } from '~/domain/task.model';

export class SqliteTaskRepository implements TaskRepository {
    async getAll(): Promise<Task[]> {
        throw new Error('Not implemented yet');
    }

    async getById(id: string): Promise<Task | null> {
        throw new Error('Not implemented yet');
    }

    async create(task: Task): Promise<void> {
        throw new Error('Not implemented yet');
    }

    async update(task: Task): Promise<void> {
        throw new Error('Not implemented yet');
    }

    async delete(id: string): Promise<void> {
        throw new Error('Not implemented yet');
    }
}
