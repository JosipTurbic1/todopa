export type SyncEntityType = 'task';
export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
    id: number;
    entityType: SyncEntityType;
    entityId: string;
    operation: SyncOperation;
    payload?: string;
    createdAt: string;
    processedAt?: string;
}
