import { Application } from '@nativescript/core';
import { runMigrations } from '~/data/db/migrations';
import { AppContainer } from './app.container';


async function start() {
    console.log('[APP] running migrations...');
    await runMigrations();
    console.log('[APP] migrations done.');

    if (AppContainer.connectivityService.isOnline()) {
        AppContainer.syncService.processQueue().catch(err => console.error('[SYNC] failed:', err));
    } else {
        console.log('[SYNC] offline - queue will be processed when online');
    }

    Application.run({ moduleName: 'app-root' });
}

start().catch(err => {
    console.error('App start failed:', err);
});


