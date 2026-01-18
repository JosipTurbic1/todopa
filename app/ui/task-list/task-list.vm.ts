import { Observable } from '@nativescript/core';
import { AppContainer } from '~/app.container';
import { Task } from '~/domain/task.model';
import { TaskStatus } from '~/domain/task-status.enum';
import { TaskPriority } from '~/domain/task-priority.enum';

type Filter = 'ALL' | 'TO_DO' | 'IN_PROGRESS' | 'DONE';

type TaskListItem = {
    id: string;
    title: string;
    statusLabel: string;
    metaLabel: string;
};

export class TaskListViewModel extends Observable {
    private allTasks: Task[] = [];
    private filter: Filter = 'ALL';

    tasks: TaskListItem[] = [];
    isEmpty = true;
    emptyLabel = 'Keine Aufgaben vorhanden.';

    async load(): Promise<void> {
        await this.ensureDemoDataOnce();

        this.allTasks = await AppContainer.taskService.getAll();
        this.applyFilter();
    }

    async setFilter(filter: Filter): Promise<void> {
        this.filter = filter;
        this.applyFilter();
    }

    async selectByIndex(index: number): Promise<void> {
        const item = this.tasks[index];
        if (!item) return;

        console.log(`Selected task id: ${item.id}`);
    }

    private applyFilter(): void {
        let filtered: Task[];

        if (this.filter === 'ALL') {
            filtered = this.allTasks;
        } else {
            const status =
                this.filter === 'TO_DO'
                    ? TaskStatus.ToDo
                    : this.filter === 'IN_PROGRESS'
                        ? TaskStatus.InProgress
                        : TaskStatus.Done;

            filtered = this.allTasks.filter(t => t.status === status);
        }


        this.tasks = filtered.map(t => ({
            id: t.id,
            title: t.title,
            statusLabel: this.statusToLabel(t.status),
            metaLabel: this.buildMetaLabel(t),
        }));

        this.isEmpty = this.tasks.length === 0;

        this.notifyPropertyChange('tasks', this.tasks);
        this.notifyPropertyChange('isEmpty', this.isEmpty);
        this.notifyPropertyChange('emptyLabel', this.emptyLabel);
    }

    private mapFilterToStatus(filter: 'TO_DO' | 'IN_PROGRESS' | 'DONE'): TaskStatus {
        switch (filter) {
            case 'TO_DO':
                return TaskStatus.ToDo;
            case 'IN_PROGRESS':
                return TaskStatus.InProgress;
            case 'DONE':
                return TaskStatus.Done;
        }
    }

    private statusToLabel(status: TaskStatus): string {
        switch (status) {
            case TaskStatus.ToDo:
                return 'Status: To Do';
            case TaskStatus.InProgress:
                return 'Status: In Progress';
            case TaskStatus.Done:
                return 'Status: Done';
        }
    }

    private buildMetaLabel(task: Task): string {
        const prio = this.priorityToLabel(task.priority);
        const deadline = task.deadline ? `Deadline: ${this.formatDate(task.deadline)}` : 'Keine Deadline';
        return `${prio} • ${deadline}`;
    }

    private priorityToLabel(priority: TaskPriority): string {
        switch (priority) {
            case TaskPriority.Low:
                return 'Priorität: Low';
            case TaskPriority.Medium:
                return 'Priorität: Medium';
            case TaskPriority.High:
                return 'Priorität: High';
        }
    }

    private formatDate(iso: string): string {
        return iso.slice(0, 10);
    }

    private async ensureDemoDataOnce(): Promise<void> {
        const before = await AppContainer.taskService.getAll();
        if (before.length > 0) return;

        const t1 = await AppContainer.taskService.create({
            title: 'Beispiel: Transferarbeit planen',
            priority: TaskPriority.High,
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        });

        await AppContainer.taskService.create({
            title: 'Beispiel: App-Architektur dokumentieren',
            priority: TaskPriority.Medium,
        });

        await AppContainer.taskService.create({
            title: 'Beispiel: Unit Tests vorbereiten',
            priority: TaskPriority.Low,
        });

        await AppContainer.taskService.setStatus(t1.id, TaskStatus.InProgress);
    }

}
