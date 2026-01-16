import { Frame } from '@nativescript/core';

export function onNavigatingTo() {
  // nothing yet
}

export function goToDummy() {
  Frame.topmost().navigate('ui/dummy/dummy-page');
}
