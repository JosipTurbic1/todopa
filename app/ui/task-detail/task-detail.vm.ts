import { Observable } from '@nativescript/core';
import { AppContainer } from '~/app.container';
import { Task } from '~/domain/task.model';
import { TaskStatus } from '~/domain/task-status.enum';
import { TaskPriority } from '~/domain/task-priority.enum';

export class TaskDetailViewModel extends Observable {
    private task: Task | null = null;

    title = '';
    statusLabel = '';
    priorityLabel = '';
    deadlineLabel = '';
    descriptionLabel = '';

    hasInfo = false;
    infoLabel = '';
    isOverdue = false;
    overdueLabel = 'ÜBERFÄLLIG';


    async load(id: string): Promise<void> {
        this.task = await AppContainer.taskService.getById(id);

        if (!this.task) {
            this.showInfo('Aufgabe nicht gefunden.');
            return;
        }

        this.title = this.task.title;
        this.statusLabel = `Status: ${this.statusToLabel(this.task.status)}`;
        this.priorityLabel = `Priorität: ${this.priorityToLabel(this.task.priority)}`;
        this.deadlineLabel = this.task.deadline
            ? `Deadline: ${this.task.deadline.slice(0, 10)}`
            : 'Deadline: Keine';
        this.isOverdue = this.computeOverdue(this.task);
        this.overdueLabel = this.isOverdue ? 'ÜBERFÄLLIG' : '';

        this.descriptionLabel = this.task.description?.trim() || '(Keine Beschreibung)';

        this.notifyAll();
    }

    showInfo(message: string): void {
        this.hasInfo = true;
        this.infoLabel = message;
        this.notifyPropertyChange('hasInfo', this.hasInfo);
        this.notifyPropertyChange('infoLabel', this.infoLabel);
    }

    private notifyAll(): void {
        this.notifyPropertyChange('title', this.title);
        this.notifyPropertyChange('statusLabel', this.statusLabel);
        this.notifyPropertyChange('priorityLabel', this.priorityLabel);
        this.notifyPropertyChange('deadlineLabel', this.deadlineLabel);
        this.notifyPropertyChange('descriptionLabel', this.descriptionLabel);
        this.notifyPropertyChange('hasInfo', this.hasInfo);
        this.notifyPropertyChange('infoLabel', this.infoLabel);
        this.notifyPropertyChange('isOverdue', this.isOverdue);
        this.notifyPropertyChange('overdueLabel', this.overdueLabel);

    }

    private statusToLabel(status: TaskStatus): string {
        switch (status) {
            case TaskStatus.ToDo:
                return 'To Do';
            case TaskStatus.InProgress:
                return 'In Progress';
            case TaskStatus.Done:
                return 'Done';
        }
    }

    private priorityToLabel(priority: TaskPriority): string {
        switch (priority) {
            case TaskPriority.Low:
                return 'Low';
            case TaskPriority.Medium:
                return 'Medium';
            case TaskPriority.High:
                return 'High';
        }
    }

    private computeOverdue(task: Task): boolean {
        if (!task.deadline) return false;
        if (task.status === TaskStatus.Done) return false;

        return new Date(task.deadline).getTime() < Date.now();
    }

}
