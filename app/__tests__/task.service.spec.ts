jest.mock('~/app.container', () => ({
    AppContainer: {
        syncQueueRepository: {
            enqueue: jest.fn(),
        },
    },
}));

import { TaskService } from '~/services/task.service';
import { TaskRepository } from '~/data/repositories/task.repository';
import { TaskStatus } from '~/domain/task-status.enum';
import { TaskPriority } from '~/domain/task-priority.enum';
import { AppContainer } from '~/app.container';
import { Task } from '~/domain/task.model';

describe('TaskService', () => {
    let repo: jest.Mocked<TaskRepository>;
    let service: TaskService;

    beforeEach(() => {
        jest.clearAllMocks();

        repo = {
            getAll: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getByStatus: jest.fn(),
        };

        service = new TaskService(repo);
    });

    it('getAll delegates to repository', async () => {
        const tasks: Task[] = [];
        repo.getAll.mockResolvedValue(tasks);

        const result = await service.getAll();

        expect(repo.getAll).toHaveBeenCalledTimes(1);
        expect(result).toBe(tasks);
    });

    it('create creates task with default values and enqueues sync event', async () => {
        const input = {
            title: '  Test Task  ',
            description: '  Beschreibung ',
            priority: TaskPriority.High,
        };

        const task = await service.create(input);

        expect(repo.create).toHaveBeenCalledTimes(1);

        const createdTask = (repo.create as jest.Mock).mock.calls[0][0] as Task;

        expect(createdTask.id).toBeDefined();
        expect(createdTask.title).toBe('Test Task');
        expect(createdTask.description).toBe('Beschreibung');
        expect(createdTask.status).toBe(TaskStatus.ToDo);
        expect(createdTask.priority).toBe(TaskPriority.High);
        expect(createdTask.createdAt).toBeDefined();
        expect(createdTask.updatedAt).toBeDefined();

        expect((AppContainer as any).syncQueueRepository.enqueue).toHaveBeenCalledWith(
            expect.objectContaining({
                entityType: 'task',
                entityId: createdTask.id,
                operation: 'create',
            })
        );

        // also: ensure create() returns the created task
        expect(task.id).toBe(createdTask.id);
    });

    it('update trims fields, updates timestamp and enqueues update event', async () => {
        const existing: Task = {
            id: 't-1',
            title: '  Alt ',
            description: '  Text ',
            status: TaskStatus.ToDo,
            deadline: undefined,
            priority: TaskPriority.Medium,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        };

        await service.update(existing);

        expect(repo.update).toHaveBeenCalledTimes(1);

        const updatedTask = (repo.update as jest.Mock).mock.calls[0][0] as Task;

        expect(updatedTask.title).toBe('Alt');
        expect(updatedTask.description).toBe('Text');
        expect(updatedTask.updatedAt).not.toBe(existing.updatedAt);

        expect((AppContainer as any).syncQueueRepository.enqueue).toHaveBeenCalledWith(
            expect.objectContaining({
                entityType: 'task',
                entityId: 't-1',
                operation: 'update',
            })
        );
    });

    it('delete deletes task and enqueues delete event', async () => {
        await service.delete('t-99');

        expect(repo.delete).toHaveBeenCalledWith('t-99');

        expect((AppContainer as any).syncQueueRepository.enqueue).toHaveBeenCalledWith(
            expect.objectContaining({
                entityType: 'task',
                entityId: 't-99',
                operation: 'delete',
            })
        );
    });

    it('setStatus updates status and enqueues update event', async () => {
        const existing: Task = {
            id: 't-5',
            title: 'Task',
            description: undefined,
            status: TaskStatus.ToDo,
            deadline: undefined,
            priority: TaskPriority.Low,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        };

        repo.getById.mockResolvedValue(existing);

        await service.setStatus('t-5', TaskStatus.Done);

        expect(repo.getById).toHaveBeenCalledWith('t-5');
        expect(repo.update).toHaveBeenCalledTimes(1);

        const updatedTask = (repo.update as jest.Mock).mock.calls[0][0] as Task;
        expect(updatedTask.status).toBe(TaskStatus.Done);

        expect((AppContainer as any).syncQueueRepository.enqueue).toHaveBeenCalledWith(
            expect.objectContaining({
                entityType: 'task',
                entityId: 't-5',
                operation: 'update',
            })
        );
    });

    it('setStatus does nothing if task does not exist', async () => {
        repo.getById.mockResolvedValue(null);

        await service.setStatus('unknown', TaskStatus.Done);

        expect(repo.update).not.toHaveBeenCalled();
        expect((AppContainer as any).syncQueueRepository.enqueue).not.toHaveBeenCalled();
    });

    it('throws validation error when title is empty on create', async () => {
        await expect(service.create({ title: '   ' })).rejects.toThrow(
            "Validation error: 'title' must not be empty."
        );
    });
});

