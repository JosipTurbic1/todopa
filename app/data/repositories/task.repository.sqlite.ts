import { TaskRepository } from './task.repository';
import { Task } from '~/domain/task.model';
import { TaskStatus } from '~/domain/task-status.enum';
import { getDb } from '~/data/db/sqlite.client';

export class SqliteTaskRepository implements TaskRepository {
    async getAll(): Promise<Task[]> {
        const db = await getDb();

        const rows = await db.all(
            `SELECT
                id,
                title,
                description,
                status,
                deadline,
                priority,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM tasks
            ORDER BY updated_at DESC`
        );

        console.log('[SQLITE] getAll rows', rows.length);

        return rows.map(this.mapRowToTask);

    }

    async getById(id: string): Promise<Task | null> {
        const db = await getDb();

        const row = await db.get(
            `SELECT
                id,
                title,
                description,
                status,
                deadline,
                priority,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM tasks
            WHERE id = ?`,
            [id]
        );



        return row ? this.mapRowToTask(row) : null;
    }

    async create(task: Task): Promise<void> {
        console.log('[SQLITE] create task', task.id);

        const db = await getDb();

        await db.execSQL(
            `INSERT INTO tasks (
                    id, title, description, status, deadline, priority,
                    created_at, updated_at
                ) VALUES (
                    ?, ?,
                    NULLIF(?, ''),  -- description
                    ?,
                    NULLIF(?, ''),  -- deadline
                    ?, ?, ?
                )`,
            [
                task.id,
                task.title,
                task.description ?? '',
                task.status,
                task.deadline ?? '',
                task.priority,
                task.createdAt,
                task.updatedAt,
            ]
        );

    }

    async update(task: Task): Promise<void> {
        const db = await getDb();

        await db.execSQL(
            `UPDATE tasks
            SET title = ?,
                description = NULLIF(?, ''),
                status = ?,
                deadline = NULLIF(?, ''),
                priority = ?,
                updated_at = ?
            WHERE id = ?`,
            [
                task.title,
                task.description ?? '',
                task.status,
                task.deadline ?? '',
                task.priority,
                task.updatedAt,
                task.id,
            ]
        );

    }

    async delete(id: string): Promise<void> {
        const db = await getDb();

        await db.execSQL(
            `DELETE FROM tasks WHERE id = ?`,
            [id]
        );
    }

    async getByStatus(status: TaskStatus): Promise<Task[]> {
        const db = await getDb();

        const rows = await db.all(
            `SELECT
                id,
                title,
                description,
                status,
                deadline,
                priority,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM tasks
            WHERE status = ?
            ORDER BY updated_at DESC`,
            [status]
        );


        return rows.map(this.mapRowToTask);
    }

    private mapRowToTask(row: any): Task {
        if (Array.isArray(row)) {
            return {
                id: row[0],
                title: row[1],
                description: row[2] ? row[2] : undefined,
                status: row[3] as TaskStatus,
                deadline: row[4] ? row[4] : undefined,
                priority: row[5],
                createdAt: row[6],
                updatedAt: row[7],
            };
        }

        return {
            id: row.id,
            title: row.title,
            description: row.description ? row.description : undefined,
            status: row.status as TaskStatus,
            deadline: row.deadline ? row.deadline : undefined,
            priority: row.priority,
            createdAt: row.createdAt ?? row.created_at,
            updatedAt: row.updatedAt ?? row.updated_at,
        };
    }

}
