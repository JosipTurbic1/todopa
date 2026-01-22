import { getDb } from '~/data/db/sqlite.client';
import { SyncEntityType, SyncOperation, SyncQueueItem } from './sync.types';

export class SyncQueueRepository {
    async enqueue(params: {
        entityType: SyncEntityType;
        entityId: string;
        operation: SyncOperation;
        payload?: object;
    }): Promise<void> {
        const db = await getDb();

        const payloadString = params.payload ? JSON.stringify(params.payload) : '';

        await db.execSQL(
            `INSERT INTO sync_queue (
        entity_type, entity_id, operation, payload, created_at, processed_at
      ) VALUES (?, ?, ?, NULLIF(?, ''), ?, NULL)`,
            [
                params.entityType,
                params.entityId,
                params.operation,
                payloadString,
                new Date().toISOString(),
            ]
        );
    }

    async getPending(limit = 50): Promise<SyncQueueItem[]> {
        const db = await getDb();

        const rows = await db.all(
            `SELECT
         id,
         entity_type AS entityType,
         entity_id AS entityId,
         operation,
         payload,
         created_at AS createdAt,
         processed_at AS processedAt
       FROM sync_queue
       WHERE processed_at IS NULL
       ORDER BY id ASC
       LIMIT ?`,
            [limit]
        );

        return rows.map((r: any) => this.mapRow(r));
    }

    async markProcessed(ids: number[]): Promise<void> {
        if (!ids.length) return;
        const db = await getDb();

        const now = new Date().toISOString();

        for (const id of ids) {
            await db.execSQL(`UPDATE sync_queue SET processed_at = ? WHERE id = ?`, [now, id]);
        }
    }

    private mapRow(row: any): SyncQueueItem {
        if (Array.isArray(row)) {
            return {
                id: row[0],
                entityType: row[1],
                entityId: row[2],
                operation: row[3],
                payload: row[4] ?? undefined,
                createdAt: row[5],
                processedAt: row[6] ?? undefined,
            };
        }

        return {
            id: row.id,
            entityType: row.entityType,
            entityId: row.entityId,
            operation: row.operation,
            payload: row.payload ?? undefined,
            createdAt: row.createdAt,
            processedAt: row.processedAt ?? undefined,
        };
    }
}
