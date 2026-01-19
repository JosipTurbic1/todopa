import { EventData, NavigatedData, Page, Frame, confirm } from '@nativescript/core';
import { TaskDetailViewModel } from './task-detail.vm';
import { AppContainer } from '~/app.container';
import { TaskStatus } from '~/domain/task-status.enum'

let vm: TaskDetailViewModel;
let taskId: string | null = null;


export async function onNavigatingTo(args: any) {
    const page = args.object as Page;

    const nav = args as NavigatedData;
    const context = (nav as any).context as { id?: string } | undefined;
    const id = context?.id;
    taskId = id ?? null;

    vm = new TaskDetailViewModel();
    page.bindingContext = vm;

    if (!id) {
        vm.showInfo('Keine Task-ID übergeben.');
        return;
    }

    await vm.load(id);
}

export function goToEdit() {
    if (!taskId) return;

    Frame.topmost().navigate({
        moduleName: 'ui/task-edit/task-edit.page',
        context: { id: taskId },
    });
}

export async function deleteTask() {
    if (!taskId) return;

    const ok = await confirm({
        title: 'Löschen bestätigen',
        message: 'Möchtest du diese Aufgabe wirklich löschen?',
        okButtonText: 'Löschen',
        cancelButtonText: 'Abbrechen',
    });

    if (!ok) return;

    await AppContainer.taskService.delete(taskId);
    Frame.topmost().goBack();
}

export async function setToDo() {
    await setStatus(TaskStatus.ToDo);
}

export async function setInProgress() {
    await setStatus(TaskStatus.InProgress);
}

export async function setDone() {
    await setStatus(TaskStatus.Done);
}

async function setStatus(status: TaskStatus) {
    if (!taskId) return;

    await AppContainer.taskService.setStatus(taskId, status);
    await vm.load(taskId);
}

