import { Task } from '~/domain/task.model';
import { TaskStatus } from '~/domain/task-status.enum';

export interface TaskRepository {
    getAll(): Promise<Task[]>;
    getById(id: string): Promise<Task | null>;

    create(task: Task): Promise<void>;
    update(task: Task): Promise<void>;
    delete(id: string): Promise<void>;

    // optional helper
    getByStatus?(status: TaskStatus): Promise<Task[]>;
}
