import { Application } from '@nativescript/core'
import './app.container'; // ensures services are initialized

Application.run({ moduleName: 'app-root' })

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
