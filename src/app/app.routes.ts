//import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { ProductEditComponent } from './components/product-edit/product-edit.component';
import { Routes } from '@angular/router';
import { ProductViewComponent } from './components/product-view/product-view.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AboutUsComponent } from './components/about-us/about-us.component';

export const routes: Routes = [
  { path: 'sign-in', component: SignInComponent }, // נתיב ל-sign-in
  { path: 'product-edit', component: ProductEditComponent }, 
  { path: 'product-view', component: ProductViewComponent }, 
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'about-us', component: AboutUsComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // כברירת מחדל לsign-in
    
  ];
