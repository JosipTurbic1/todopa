import { SqliteTaskRepository } from '~/data/repositories/task.repository.sqlite';
import { TaskStatus } from '~/domain/task-status.enum';
import { TaskPriority } from '~/domain/task-priority.enum';
import { Task } from '~/domain/task.model';

jest.mock('~/data/db/sqlite.client', () => ({
    getDb: jest.fn(),
}));

import { getDb } from '~/data/db/sqlite.client';

describe('SqliteTaskRepository', () => {
    const dbMock = {
        execSQL: jest.fn(),
        all: jest.fn(),
        get: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getDb as jest.Mock).mockResolvedValue(dbMock);
    });

    it('getAll: calls db.all and maps object rows', async () => {
        dbMock.all.mockResolvedValue([
            {
                id: 't-1',
                title: 'A',
                description: null,
                status: TaskStatus.ToDo,
                deadline: null,
                priority: TaskPriority.Low,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
            },
        ]);

        const repo = new SqliteTaskRepository();
        const tasks = await repo.getAll();

        expect(dbMock.all).toHaveBeenCalledTimes(1);

        const [sql] = dbMock.all.mock.calls[0];
        expect(String(sql)).toContain('FROM tasks');
        expect(String(sql)).toContain('ORDER BY updated_at DESC');

        expect(tasks).toHaveLength(1);
        expect(tasks[0]).toMatchObject({
            id: 't-1',
            title: 'A',
            status: TaskStatus.ToDo,
            priority: TaskPriority.Low,
            description: undefined, // null -> undefined in mapRowToTask
            deadline: undefined,
        });
    });

    it('getAll: maps array rows (plugin can return arrays)', async () => {
        // order: id,title,description,status,deadline,priority,createdAt,updatedAt
        dbMock.all.mockResolvedValue([
            [
                't-2',
                'B',
                '',
                TaskStatus.InProgress,
                '',
                TaskPriority.Medium,
                '2026-01-01T00:00:00.000Z',
                '2026-01-03T00:00:00.000Z',
            ],
        ]);

        const repo = new SqliteTaskRepository();
        const tasks = await repo.getAll();

        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe('t-2');
        expect(tasks[0].title).toBe('B');
        expect(tasks[0].status).toBe(TaskStatus.InProgress);
        expect(tasks[0].description).toBeUndefined();
        expect(tasks[0].deadline).toBeUndefined();
    });

    it('getById: calls db.get with id param and maps row', async () => {
        dbMock.get.mockResolvedValue({
            id: 't-3',
            title: 'C',
            description: 'desc',
            status: TaskStatus.Done,
            deadline: '2026-01-10T00:00:00.000Z',
            priority: TaskPriority.High,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-05T00:00:00.000Z',
        });

        const repo = new SqliteTaskRepository();
        const task = await repo.getById('t-3');

        expect(dbMock.get).toHaveBeenCalledTimes(1);
        const [sql, params] = dbMock.get.mock.calls[0];

        expect(String(sql)).toContain('WHERE id = ?');
        expect(params).toEqual(['t-3']);

        expect(task).not.toBeNull();
        expect(task!.id).toBe('t-3');
        expect(task!.priority).toBe(TaskPriority.High);
        expect(task!.description).toBe('desc');
    });

    it('getById: returns null if row is null', async () => {
        dbMock.get.mockResolvedValue(null);

        const repo = new SqliteTaskRepository();
        const task = await repo.getById('missing');

        expect(task).toBeNull();
    });

    it('create: calls db.execSQL INSERT and converts undefined to empty strings for NULLIF', async () => {
        const repo = new SqliteTaskRepository();

        const t: Task = {
            id: 't-4',
            title: 'New',
            description: undefined,
            status: TaskStatus.ToDo,
            deadline: undefined,
            priority: TaskPriority.Medium,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        };

        await repo.create(t);

        expect(dbMock.execSQL).toHaveBeenCalledTimes(1);
        const [sql, params] = dbMock.execSQL.mock.calls[0];

        expect(String(sql)).toContain('INSERT INTO tasks');
        expect(String(sql)).toContain('NULLIF(?, \'\')'); // description/deadline pattern

        // params: id,title,description,status,deadline,priority,createdAt,updatedAt
        expect(params).toEqual([
            't-4',
            'New',
            '', // description undefined -> ''
            TaskStatus.ToDo,
            '', // deadline undefined -> ''
            TaskPriority.Medium,
            '2026-01-01T00:00:00.000Z',
            '2026-01-01T00:00:00.000Z',
        ]);
    });

    it('update: calls db.execSQL UPDATE and passes correct params order', async () => {
        const repo = new SqliteTaskRepository();

        const t: Task = {
            id: 't-5',
            title: 'Upd',
            description: 'x',
            status: TaskStatus.InProgress,
            deadline: '2026-01-10T00:00:00.000Z',
            priority: TaskPriority.Low,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };

        await repo.update(t);

        expect(dbMock.execSQL).toHaveBeenCalledTimes(1);
        const [sql, params] = dbMock.execSQL.mock.calls[0];

        expect(String(sql)).toContain('UPDATE tasks');
        expect(String(sql)).toContain('WHERE id = ?');

        // params: title, description, status, deadline, priority, updatedAt, id
        expect(params).toEqual([
            'Upd',
            'x',
            TaskStatus.InProgress,
            '2026-01-10T00:00:00.000Z',
            TaskPriority.Low,
            '2026-01-02T00:00:00.000Z',
            't-5',
        ]);
    });

    it('delete: calls db.execSQL DELETE with id param', async () => {
        const repo = new SqliteTaskRepository();
        await repo.delete('t-6');

        expect(dbMock.execSQL).toHaveBeenCalledTimes(1);
        const [sql, params] = dbMock.execSQL.mock.calls[0];

        expect(String(sql)).toContain('DELETE FROM tasks WHERE id = ?');
        expect(params).toEqual(['t-6']);
    });

    it('getByStatus: calls db.all with status param and maps rows', async () => {
        dbMock.all.mockResolvedValue([
            {
                id: 't-7',
                title: 'Done Task',
                description: null,
                status: TaskStatus.Done,
                deadline: null,
                priority: TaskPriority.High,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
            },
        ]);

        const repo = new SqliteTaskRepository();
        const tasks = await repo.getByStatus(TaskStatus.Done);

        expect(dbMock.all).toHaveBeenCalledTimes(1);
        const [sql, params] = dbMock.all.mock.calls[0];

        expect(String(sql)).toContain('WHERE status = ?');
        expect(params).toEqual([TaskStatus.Done]);

        expect(tasks).toHaveLength(1);
        expect(tasks[0].status).toBe(TaskStatus.Done);
    });

    it('mapping should preserve createdAt/updatedAt aliases', async () => {
        dbMock.get.mockResolvedValue({
            id: 't-8',
            title: 'Alias Test',
            description: null,
            status: TaskStatus.ToDo,
            deadline: null,
            priority: TaskPriority.Medium,
            created_at: '2026-01-01T00:00:00.000Z', // fallback field
            updated_at: '2026-01-02T00:00:00.000Z', // fallback field
        });

        const repo = new SqliteTaskRepository();
        const task = await repo.getById('t-8');

        expect(task).not.toBeNull();
        expect(task!.createdAt).toBe('2026-01-01T00:00:00.000Z');
        expect(task!.updatedAt).toBe('2026-01-02T00:00:00.000Z');
    });
});
