import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router'; // ✅ הוספת תמיכה בנתיבים
import { routes } from './app/app.routes'; // ✅ ייבוא הנתיבים מהקובץ `app.routes.ts`

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideHttpClient(), // תמיכה ב-HTTP
    provideRouter(routes) // ✅ הוספת מערכת הניווט
  ]
}).catch((err) => console.error(err));




// bootstrapApplication(AppComponent, {
//   ...appConfig,
//   providers: [
//     provideHttpClient() // מוסיף תמיכה ב-HTTP עבור קריאות API
//   ]
// }).catch((err) => console.error(err));

