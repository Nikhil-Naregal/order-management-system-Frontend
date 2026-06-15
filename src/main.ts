import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { BackendWakeInterceptor } from './app/core/interceptors/backend-wake.interceptor';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BackendWakeInterceptor,
      multi: true
    },
    provideRouter(routes)
  ]
}).catch((error) => console.error(error));
