import { Observable } from '@nativescript/core';
import { AppContainer } from '~/app.container';
import { Task } from '~/domain/task.model';
import { TaskPriority } from '~/domain/task-priority.enum';
import { TaskStatus } from '~/domain/task-status.enum';

type PriorityKey = 'LOW' | 'MEDIUM' | 'HIGH';
type StatusKey = 'TO_DO' | 'IN_PROGRESS' | 'DONE';

export class TaskEditViewModel extends Observable {
    private task: Task | null = null;

    title = '';
    description = '';

    status: TaskStatus = TaskStatus.ToDo;
    statusLabel = 'Status: To Do';

    priority: TaskPriority = TaskPriority.Medium;
    priorityLabel = 'Priorität: Medium';

    deadlineDate: Date = new Date();
    deadlineLabel = '';

    hasError = false;
    errorMessage = '';

    async load(id: string): Promise<void> {
        this.clearError();

        const task = await AppContainer.taskService.getById(id);
        if (!task) {
            this.showError('Aufgabe nicht gefunden.');
            return;
        }

        this.task = task;

        this.title = task.title;
        this.description = task.description ?? '';

        this.status = task.status;
        this.priority = task.priority;

        this.deadlineDate = task.deadline ? new Date(task.deadline) : new Date();

        this.updateStatusLabel();
        this.updatePriorityLabel();
        this.updateDeadlineLabel();

        this.notifyAll();
    }

    async save(): Promise<void> {
        this.clearError();

        if (!this.task) {
            this.showError('Keine Aufgabe geladen.');
            throw new Error('No task loaded');
        }

        const cleanTitle = (this.title ?? '').trim();
        if (!cleanTitle) {
            this.showError('Der Titel ist ein Pflichtfeld.');
            throw new Error('Validation error: title required');
        }

        const updated: Task = {
            ...this.task,
            title: cleanTitle,
            description: (this.description ?? '').trim() || undefined,
            status: this.status,
            priority: this.priority,
            deadline: this.deadlineDate ? this.deadlineDate.toISOString() : undefined,
            // updatedAt is set inside TaskService.update()
            updatedAt: this.task.updatedAt,
        };

        await AppContainer.taskService.update(updated);
    }

    setPriority(key: PriorityKey): void {
        this.priority =
            key === 'LOW' ? TaskPriority.Low : key === 'HIGH' ? TaskPriority.High : TaskPriority.Medium;

        this.updatePriorityLabel();
    }

    setStatus(key: StatusKey): void {
        this.status =
            key === 'TO_DO' ? TaskStatus.ToDo : key === 'DONE' ? TaskStatus.Done : TaskStatus.InProgress;

        this.updateStatusLabel();
    }

    updateDeadlineLabel(): void {
        const yyyyMmDd = this.deadlineDate.toISOString().slice(0, 10);
        this.deadlineLabel = `Deadline: ${yyyyMmDd}`;
        this.notifyPropertyChange('deadlineLabel', this.deadlineLabel);
    }

    // -------------------------
    // UI labels + error handling
    // -------------------------

    private updateStatusLabel(): void {
        const text =
            this.status === TaskStatus.ToDo ? 'To Do' : this.status === TaskStatus.Done ? 'Done' : 'In Progress';

        this.statusLabel = `Status: ${text}`;
        this.notifyPropertyChange('statusLabel', this.statusLabel);
    }

    private updatePriorityLabel(): void {
        const text =
            this.priority === TaskPriority.Low ? 'Low' : this.priority === TaskPriority.High ? 'High' : 'Medium';

        this.priorityLabel = `Priorität: ${text}`;
        this.notifyPropertyChange('priorityLabel', this.priorityLabel);
    }

    showError(message: string): void {
        this.hasError = true;
        this.errorMessage = message;
        this.notifyPropertyChange('hasError', this.hasError);
        this.notifyPropertyChange('errorMessage', this.errorMessage);
    }

    private clearError(): void {
        this.hasError = false;
        this.errorMessage = '';
        this.notifyPropertyChange('hasError', this.hasError);
        this.notifyPropertyChange('errorMessage', this.errorMessage);
    }

    private notifyAll(): void {
        this.notifyPropertyChange('title', this.title);
        this.notifyPropertyChange('description', this.description);
        this.notifyPropertyChange('statusLabel', this.statusLabel);
        this.notifyPropertyChange('priorityLabel', this.priorityLabel);
        this.notifyPropertyChange('deadlineDate', this.deadlineDate);
        this.notifyPropertyChange('deadlineLabel', this.deadlineLabel);
        this.notifyPropertyChange('hasError', this.hasError);
        this.notifyPropertyChange('errorMessage', this.errorMessage);
    }
}
