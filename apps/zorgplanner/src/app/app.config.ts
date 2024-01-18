import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { JwtModule } from '@auth0/angular-jwt';
import { jwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  IconPlus,
  IconHeartPlus,
  IconHeartCog,
  IconHomePlus,
  IconHomeCog,
  IconMap,
  IconHelp,
  IconCaretRight,
  IconChevronDown,
  IconBook,
  IconCircle,
  IconTable,
  IconCheck,
  IconX,
} from 'angular-tabler-icons/icons';

const icons = {
  IconPlus,
  IconHeartPlus,
  IconHeartCog,
  IconHomePlus,
  IconHomeCog,
  IconMap,
  IconHelp,
  IconCaretRight,
  IconChevronDown,
  IconBook,
  IconCircle,
  IconTable,
  IconCheck,
  IconX,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter(appRoutes),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => localStorage.getItem('access_token'),
        },
      }),
      TablerIconsModule.pick(icons)
    ),
  ],
};
