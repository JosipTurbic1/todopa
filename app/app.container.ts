import { SqliteTaskRepository } from '~/data/repositories/task.repository.sqlite';
import { TaskService } from '~/services/task.service';
import { SyncQueueRepository } from '~/data/sync/sync-queue.repository';
import { SyncService } from '~/data/sync/sync.service';
import { ConnectivityService } from '~/services/connectivity.service';



const taskRepository = new SqliteTaskRepository();
const taskService = new TaskService(taskRepository);
const syncQueueRepository = new SyncQueueRepository();
const syncService = new SyncService(syncQueueRepository);
const connectivityService = new ConnectivityService();

export const AppContainer = {
    taskService,
    syncService,
    syncQueueRepository,
    connectivityService,
};

