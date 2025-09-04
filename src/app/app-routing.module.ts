import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { HomeComponent } from './pages/dashboard/home/home.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ServiceComponent } from './pages/dashboard/service/service.component';
import { AproposComponent } from './pages/dashboard/apropos/apropos.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
   { 
    path: 'auth/Connexion',  component: LoginComponent},
  {path: 'auth/Inscription', component: RegisterComponent},
  {path: 'home', component: HomeComponent},
  {path: 'service', component: ServiceComponent},
  {path: 'Apropos', component: AproposComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
