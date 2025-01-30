import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
// import { ToastrModule } from 'ngx-toastr';
 
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
 
 
    // provideAnimations(),
    // importProvidersFrom(
    //   ToastrModule.forRoot({
    //     timeOut: 3000,
    //     positionClass: 'toast-top-right',
    //     preventDuplicates: true,
    //   })
    // ),
  ],
};