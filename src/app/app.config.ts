import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

import { SignInComponent } from './components/sign-in/sign-in.component';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = { 
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
