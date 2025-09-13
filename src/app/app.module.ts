import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { JwtModule } from '@auth0/angular-jwt';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { HomeComponent } from './utils/home/home.component';
import { DetailProduitComponent } from './pages/produits/detail-produit/detail-produit.component';
import { ProduitFormComponent } from './pages/produits/produit-form/produit-form.component';
import { ListeCategoriesComponent } from './pages/categories/liste-categories/liste-categories.component';
import { CategoriesFormComponent } from './pages/categories/categories-form/categories-form.component';
import { ListeCommandesComponent } from './pages/commandes/liste-commandes/liste-commandes.component';
import { CommandesFormComponent } from './pages/commandes/commandes-form/commandes-form.component';
import { DetailCommandeComponent } from './pages/commandes/detail-commande/detail-commande.component';
import { MonProfilComponent } from './pages/profil/mon-profil/mon-profil.component';
import { ModifierProfilComponent } from './pages/profil/modifier-profil/modifier-profil.component';
import { ServiceComponent } from './utils/service/service.component';
import { AproposComponent } from './utils/apropos/apropos.component';
import { ProduitsComponent } from './pages/produits/produits/produits.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ConversationsComponent } from './pages/conversations/conversations.component';
import { AuthInterceptor } from './interceptors/interceptor';
import { FormProduitComponent } from './pages/produits/form-produit/form-produit.component';
import { DetailsCategorieComponent } from './pages/categories/details-categorie/details-categorie.component';
import { CommandePanierComponent } from './pages/commandes/commande-panier/commande-panier.component';
import { MesCommandesComponent } from './pages/commandes/mes-commandes/mes-commandes.component';
import { CartService } from './services/cart.service';
import { NotFoundComponent } from './utils/not-found/not-found.component';
import { FooterComponent } from './utils/footer/footer.component';
import { UsersManagementComponent } from './pages/users/users-management/users-management.component';
import { ClientDashboardComponent } from './pages/dashboard/client-dashboard/client-dashboard.component';
import { AddProduitComponent } from './pages/produits/add-produit/add-produit.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DetailProduitComponent,
    ProduitFormComponent,
    ListeCategoriesComponent,
    CategoriesFormComponent,
    ListeCommandesComponent,
    CommandesFormComponent,
    DetailCommandeComponent,
    MonProfilComponent,
    ModifierProfilComponent,
    ServiceComponent,
    AproposComponent,
    ProduitsComponent,
    AdminDashboardComponent,
    NavbarComponent,
    FormProduitComponent,
    DetailsCategorieComponent,
    CommandePanierComponent,
    MesCommandesComponent,
    ChatComponent,
    ConversationsComponent,
    NotFoundComponent,
    FooterComponent,
    UsersManagementComponent,
    ClientDashboardComponent,
    AddProduitComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    JwtModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    })
  ],
  providers: [
    provideClientHydration(),
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    CartService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
