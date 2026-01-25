import { Observable } from '@nativescript/core';
import { AppContainer } from '~/app.container';
import { Task } from '~/domain/task.model';
import { TaskStatus } from '~/domain/task-status.enum';
import { TaskPriority } from '~/domain/task-priority.enum';
import { formatDateGerman } from '~/utils/date-format.util';


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
    syncStatusLabel = '';

    async load(): Promise<void> {
        this.allTasks = await AppContainer.taskService.getAll();
        this.applyFilter();
        this.updateSyncStatusLabel();
    }

    async setFilter(filter: Filter): Promise<void> {
        this.filter = filter;
        this.applyFilter();
    }

    getIdByIndex(index: number): string | null {
        const item = this.tasks[index];
        return item?.id ?? null;
    }

    private applyFilter(): void {
        const filtered: Task[] =
            this.filter === 'ALL'
                ? [...this.allTasks]
                : this.allTasks.filter(t => t.status === this.mapFilterToStatus(this.filter as Exclude<Filter, 'ALL'>));

        const sorted = [...filtered].sort((a, b) => {
            const pDiff = this.priorityWeight(a.priority) - this.priorityWeight(b.priority);
            if (pDiff !== 0) return pDiff;

            return this.deadlineTimestamp(a) - this.deadlineTimestamp(b);
        });

        this.tasks = sorted.map(t => ({
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
        const deadline = task.deadline ? `Deadline: ${formatDateGerman(task.deadline)}` : 'Keine Deadline';
        const overdue = this.isOverdue(task) ? ' • ÜBERFÄLLIG' : '';
        return `${prio} • ${deadline}${overdue}`;

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
    private priorityWeight(priority: TaskPriority): number {
        switch (priority) {
            case TaskPriority.High:
                return 1;
            case TaskPriority.Medium:
                return 2;
            case TaskPriority.Low:
                return 3;
        }
    }

    private deadlineTimestamp(task: Task): number {
        if (!task.deadline) return Number.MAX_SAFE_INTEGER;
        return new Date(task.deadline).getTime();
    }

    private isOverdue(task: Task): boolean {
        if (!task.deadline) return false;
        if (task.status === TaskStatus.Done) return false;

        const deadlineTime = new Date(task.deadline).getTime();
        const now = Date.now();
        return deadlineTime < now;
    }

    private updateSyncStatusLabel(): void {
        const online = AppContainer.connectivityService.isOnline();
        this.syncStatusLabel = online ? 'Online – Synchronisation bereit' : 'Offline – Änderungen werden lokal gespeichert';
        this.notifyPropertyChange('syncStatusLabel', this.syncStatusLabel);
    }

}
