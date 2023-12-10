import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { mapToArrInterceptor } from './shared/interceptors/map-to-arr.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([mapToArrInterceptor])),
    provideRouter(appRoutes),
  ],
};
// export const appConfig: ApplicationConfig = {
//   providers: [importProvidersFrom(HttpClientModule), provideRouter(appRoutes)],
// };
