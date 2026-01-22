import { Connectivity } from '@nativescript/core';

export class ConnectivityService {
    isOnline(): boolean {
        return Connectivity.getConnectionType() !== Connectivity.connectionType.none;
    }
}
