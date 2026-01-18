import { EventData, Page, Frame, alert, DatePicker } from '@nativescript/core';
import { TaskCreateViewModel } from './task-create.vm';

let vm: TaskCreateViewModel;

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
    const picker = args.object as DatePicker;
    vm.deadlineDate = picker.date;
    vm.updateDeadlineLabel();
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
