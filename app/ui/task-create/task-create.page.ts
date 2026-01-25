import { EventData, Page, Frame, alert } from '@nativescript/core';
import { TaskCreateViewModel } from './task-create.vm';

let vm: TaskCreateViewModel;

function todayMinDate(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}


export function onNavigatingTo(args: EventData) {
    const page = args.object as Page;
    vm = new TaskCreateViewModel();
    page.bindingContext = vm;
}

export async function save() {
    try {
        await vm.save();
        await alert({ title: 'Gespeichert', message: 'Aufgabe wurde erstellt.', okButtonText: 'OK' });
        Frame.topmost().goBack();
    } catch (e) {
        console.log(e);
    }
}

export function onDateChange(args: any) {
    const picker = args.object as any;
    const min = todayMinDate();

    const chosen = new Date(picker.date);
    chosen.setHours(0, 0, 0, 0);

    if (chosen.getTime() < min.getTime()) {
        picker.date = min;
        vm.deadlineDate = min;
    } else {
        vm.deadlineDate = picker.date;
    }

    vm.updateDeadlineLabel();

    const page = picker.page;
    page?.dismissSoftInput?.();
}




export function setLow() {
    vm.setPriority('LOW');
}
export function setMedium() {
    vm.setPriority('MEDIUM');
}
export function setHigh() {
    vm.setPriority('HIGH');
}
