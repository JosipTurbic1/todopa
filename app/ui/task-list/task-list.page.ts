import { EventData, Page, Frame } from '@nativescript/core';
import { TaskListViewModel } from './task-list.vm';

let vm: TaskListViewModel;

export async function onNavigatingTo(args: EventData) {
    const page = args.object as Page;

    vm = new TaskListViewModel();
    page.bindingContext = vm;

    await vm.load();
}

export async function filterToDo() {
    await vm.setFilter('TO_DO');
}
export async function filterInProgress() {
    await vm.setFilter('IN_PROGRESS');
}
export async function filterDone() {
    await vm.setFilter('DONE');
}
export async function filterAll() {
    await vm.setFilter('ALL');
}

export function onItemTap(args: any) {
    const index = args.index as number;
    const id = vm.getIdByIndex(index);
    if (!id) return;

    Frame.topmost().navigate({
        moduleName: 'ui/task-detail/task-detail.page',
        context: { id },
    });
}


export function goToCreate() {
    Frame.topmost().navigate('ui/task-create/task-create.page');
}

