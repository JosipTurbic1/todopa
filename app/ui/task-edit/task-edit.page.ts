import { EventData, Page, Frame, alert, DatePicker } from '@nativescript/core';
import { TaskEditViewModel } from './task-edit.vm';

let vm: TaskEditViewModel;

export async function onNavigatingTo(args: any) {
    const page = args.object as Page;
    const id = (args as any).context?.id as string | undefined;

    vm = new TaskEditViewModel();
    page.bindingContext = vm;

    if (!id) {
        vm.showError('Keine Task-ID übergeben.');
        return;
    }

    await vm.load(id);
}

export async function save() {
    try {
        await vm.save();
        await alert({ title: 'Gespeichert', message: 'Änderungen wurden gespeichert.', okButtonText: 'OK' });
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

export function setToDo() {
    vm.setStatus('TO_DO');
}
export function setInProgress() {
    vm.setStatus('IN_PROGRESS');
}
export function setDone() {
    vm.setStatus('DONE');
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
