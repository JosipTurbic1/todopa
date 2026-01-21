import { Application } from '@nativescript/core'
import './app.container'; // ensures services are initialized
import { runMigrations } from '~/data/db/migrations';

async function start() {
    await runMigrations();
    Application.run({ moduleName: 'app-root' });
}

start().catch(err => {
    console.error('App start failed:', err);
});


