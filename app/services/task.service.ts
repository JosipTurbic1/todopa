import { Task } from '~/domain/task.model';
import { TaskPriority } from '~/domain/task-priority.enum';
import { TaskStatus } from '~/domain/task-status.enum';
import { TaskRepository } from '~/data/repositories/task.repository';
import { AppContainer } from '~/app.container';


export class TaskService {
    constructor(private readonly repo: TaskRepository) { }

    async getAll(): Promise<Task[]> {
        return this.repo.getAll();
    }

    async getById(id: string): Promise<Task | null> {
        this.ensureNonEmpty(id, 'id');
        return this.repo.getById(id);
    }

    async create(input: {
        title: string;
        description?: string;
        deadline?: string;
        priority?: TaskPriority;
    }): Promise<Task> {
        this.ensureNonEmpty(input.title, 'title');

        const now = new Date().toISOString();
        const task: Task = {
            id: this.generateId(),
            title: input.title.trim(),
            description: input.description?.trim() || undefined,
            status: TaskStatus.ToDo,
            deadline: input.deadline,
            priority: input.priority ?? TaskPriority.Medium,
            createdAt: now,
            updatedAt: now,
        };

        await this.repo.create(task);

        await AppContainer.syncQueueRepository.enqueue({
            entityType: 'task',
            entityId: task.id,
            operation: 'create',
            payload: task,
        });

        return task;
    }

    async update(task: Task): Promise<void> {
        this.ensureNonEmpty(task.id, 'id');
        this.ensureNonEmpty(task.title, 'title');

        const updated: Task = {
            ...task,
            title: task.title.trim(),
            description: task.description?.trim() || undefined,
            updatedAt: new Date().toISOString(),
        };

        await this.repo.update(updated);

        await AppContainer.syncQueueRepository.enqueue({
            entityType: 'task',
            entityId: updated.id,
            operation: 'update',
            payload: updated,
        });

    }

    async delete(id: string): Promise<void> {
        this.ensureNonEmpty(id, 'id');
        await this.repo.delete(id);

        await AppContainer.syncQueueRepository.enqueue({
            entityType: 'task',
            entityId: id,
            operation: 'delete',
        });

    }

    async setStatus(id: string, status: TaskStatus): Promise<void> {
        this.ensureNonEmpty(id, 'id');
        const existing = await this.repo.getById(id);
        if (!existing) return;

        await this.repo.update({
            ...existing,
            status,
            updatedAt: new Date().toISOString(),
        });

        await AppContainer.syncQueueRepository.enqueue({
            entityType: 'task',
            entityId: id,
            operation: 'update',
            payload: { id, status },
        });

    }

    // -------------------------
    // Helpers
    // -------------------------

    private ensureNonEmpty(value: string, fieldName: string): void {
        if (!value || !value.toString().trim()) {
            throw new Error(`Validation error: '${fieldName}' must not be empty.`);
        }
    }

    private generateId(): string {
        return `tsk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    }
}
