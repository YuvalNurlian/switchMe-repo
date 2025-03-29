//import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { ProductEditComponent } from './components/product-edit/product-edit.component';
import { Routes } from '@angular/router';
import { ProductViewComponent } from './components/product-view/product-view.component';
import { RegistrationComponent } from './components/registration/registration.component';

export const routes: Routes = [
  { path: 'sign-in', component: SignInComponent }, // נתיב ל-sign-in
  { path: 'registration', component: RegistrationComponent },
  { path: 'product-edit', component: ProductEditComponent }, 
  { path: 'product-view', component: ProductViewComponent }, 
    { path: '', redirectTo: '/sign-in', pathMatch: 'full' }, // כברירת מחדל לsign-in
    
  ];
