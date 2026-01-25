import { Observable } from '@nativescript/core';
import { AppContainer } from '~/app.container';
import { TaskPriority } from '~/domain/task-priority.enum';
import { formatDateGerman } from '~/utils/date-format.util';

type PriorityKey = 'LOW' | 'MEDIUM' | 'HIGH';

export class TaskCreateViewModel extends Observable {
    title = '';
    description = '';

    priority: TaskPriority = TaskPriority.Medium;
    priorityLabel = 'Priorität: Medium';

    deadlineDate: Date = new Date();
    deadlineLabel = 'Deadline: (heute)';

    hasError = false;
    errorMessage = '';

    constructor() {
        super();
        this.updatePriorityLabel();
        this.updateDeadlineLabel();
    }

    setPriority(key: PriorityKey): void {
        this.priority =
            key === 'LOW' ? TaskPriority.Low : key === 'HIGH' ? TaskPriority.High : TaskPriority.Medium;

        this.updatePriorityLabel();
    }

    async save(): Promise<void> {
        this.clearError();

        const cleanTitle = (this.title ?? '').trim();
        if (!cleanTitle) {
            this.setError('Der Titel ist ein Pflichtfeld.');
            throw new Error('Validation error: title required');
        }

        const deadlineIso = this.deadlineDate ? this.deadlineDate.toISOString() : undefined;

        await AppContainer.taskService.create({
            title: cleanTitle,
            description: (this.description ?? '').trim() || undefined,
            priority: this.priority,
            deadline: deadlineIso,
        });
    }

    set deadlineDateSetter(value: Date) {
        this.deadlineDate = value;
        this.updateDeadlineLabel();
        this.notifyPropertyChange('deadlineLabel', this.deadlineLabel);
    }

    private updatePriorityLabel(): void {
        const text =
            this.priority === TaskPriority.Low
                ? 'Low'
                : this.priority === TaskPriority.High
                    ? 'High'
                    : 'Medium';

        this.priorityLabel = `Priorität: ${text}`;
        this.notifyPropertyChange('priorityLabel', this.priorityLabel);
    }

    public updateDeadlineLabel(): void {
        const d = this.deadlineDate;
        this.deadlineLabel = `Deadline: ${formatDateGerman(this.deadlineDate.toISOString())}`;
        this.notifyPropertyChange('deadlineLabel', this.deadlineLabel);
    }

    private setError(message: string): void {
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
}
