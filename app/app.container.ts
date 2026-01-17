import { InMemoryTaskRepository } from '~/data/repositories/task.repository.memory';
import { TaskService } from '~/services/task.service';

const taskRepository = new InMemoryTaskRepository();
const taskService = new TaskService(taskRepository);

export const AppContainer = {
    taskService,
};
