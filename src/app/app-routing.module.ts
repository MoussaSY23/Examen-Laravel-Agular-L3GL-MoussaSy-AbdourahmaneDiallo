import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { HomeComponent } from './utils/home/home.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ServiceComponent } from './utils/service/service.component';
import { AproposComponent } from './utils/apropos/apropos.component';
import { ProduitsComponent } from './pages/produits/produits/produits.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import { MonProfilComponent } from './pages/profil/mon-profil/mon-profil.component';
import { ProduitFormComponent } from './pages/produits/produit-form/produit-form.component';
import { FormProduitComponent } from './pages/produits/form-produit/form-produit.component';
import { DetailProduitComponent } from './pages/produits/detail-produit/detail-produit.component';
import { ListeCategoriesComponent } from './pages/categories/liste-categories/liste-categories.component';
import { DetailsCategorieComponent } from './pages/categories/details-categorie/details-categorie.component';
import { CategoriesFormComponent } from './pages/categories/categories-form/categories-form.component';
import { CommandesFormComponent } from './pages/commandes/commandes-form/commandes-form.component';
import { ListeCommandesComponent } from './pages/commandes/liste-commandes/liste-commandes.component';
import { DetailCommandeComponent } from './pages/commandes/detail-commande/detail-commande.component';


const routes: Routes = [
  {path: '', component: HomeComponent},
   { 
    path: 'auth/Connexion',  component: LoginComponent},
  {path: 'auth/Inscription', component: RegisterComponent},
  {path: 'home', component: HomeComponent},
  {path: 'service', component: ServiceComponent},
  {path: 'Apropos', component: AproposComponent},
  {path: 'produits', component: ProduitsComponent},
  {path: 'admin-dashboard', component: AdminDashboardComponent},
  {path: 'mon-profil', component: MonProfilComponent},
  {path: 'produit-form', component: ProduitFormComponent},
  {path: 'produit-form/:id', component: FormProduitComponent},
  {path: 'form-produit', component: FormProduitComponent},
  {path: 'details-produit/:id', component: DetailProduitComponent},
  {path: 'categories', component: ListeCategoriesComponent},
  {path: 'details-categorie/:id', component: DetailsCategorieComponent},
  {path: 'categorie-form', component: CategoriesFormComponent},
  {path: 'categorie-form/:id', component: CategoriesFormComponent},
  {path: 'commandes', component: ListeCommandesComponent},
  {path: 'commande-form', component: CommandesFormComponent},
  {path: 'commande-form/:id', component: CommandesFormComponent},
  {path: 'detail-commande/:id', component: DetailCommandeComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
