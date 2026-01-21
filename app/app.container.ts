import { SqliteTaskRepository } from '~/data/repositories/task.repository.sqlite';
import { TaskService } from '~/services/task.service';

const taskRepository = new SqliteTaskRepository();
const taskService = new TaskService(taskRepository);

export const AppContainer = {
    taskService,
};

