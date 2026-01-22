import { SyncQueueRepository } from './sync-queue.repository';

export class SyncService {
    constructor(private readonly repo: SyncQueueRepository) { }

    async processQueue(): Promise<number> {
        const pending = await this.repo.getPending(50);

        if (!pending.length) {
            console.log('[SYNC] No pending items.');
            return 0;
        }

        console.log(`[SYNC] Processing ${pending.length} item(s) (stub, no backend).`);
        for (const item of pending) {
            console.log('[SYNC] item:', {
                id: item.id,
                entityType: item.entityType,
                entityId: item.entityId,
                operation: item.operation,
            });
        }

        await this.repo.markProcessed(pending.map(p => p.id));
        console.log('[SYNC] Marked items as processed.');

        return pending.length;
    }
}
