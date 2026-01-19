import { EventData, NavigatedData, Page, Frame } from '@nativescript/core';
import { TaskDetailViewModel } from './task-detail.vm';

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
