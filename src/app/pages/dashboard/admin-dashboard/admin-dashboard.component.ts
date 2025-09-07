import { Component, OnInit } from '@angular/core';
import { CommandeService } from '../../../services/commande/commande.service';
import { ProduitService } from '../../../services/produit/produit.service';
import { Commande } from '../../../models/commande';
import { Produit } from '../../../models/produit';

interface DashboardStats {
  commandesAujourdhui: { total: number; variation: number };
  chiffreAffaires: { total: number; variation: number };
  produitsEnStock: { total: number; variation: number };
  clientsActifs: { total: number; variation: number };
}

interface Notification {
  type: 'stock' | 'commande' | 'objectif';
  message: string;
  icon?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  currentDate: Date = new Date();
  lastUpdate: Date = new Date();
  loading: boolean = false;

  stats: DashboardStats = {
    commandesAujourdhui: { total: 0, variation: 0 },
    chiffreAffaires: { total: 0, variation: 0 },
    produitsEnStock: { total: 0, variation: 0 },
    clientsActifs: { total: 0, variation: 0 }
  };

  notifications: Notification[] = [];
  commandesRecentes: Commande[] = [];
  produitsPopulaires: Produit[] = [];

  constructor(
    private commandeService: CommandeService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.rafraichirDonnees();
  }

  rafraichirDonnees() {
    this.loading = true;

    // 1️⃣ Récupérer toutes les commandes
    this.commandeService.getCommandes().subscribe({
      next: (commandes) => {
        // Trier les commandes récentes
        this.commandesRecentes = commandes
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        // Statistiques
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const commandesAujourdHui = commandes.filter(c => new Date(c.created_at).toDateString() === today.toDateString()).length;
        const commandesHier = commandes.filter(c => new Date(c.created_at).toDateString() === yesterday.toDateString()).length;

        const chiffreAffairesAujourdHui = commandes
          .filter(c => new Date(c.created_at).toDateString() === today.toDateString())
          .reduce((sum, c) => sum + c.montant_total, 0);

        const chiffreAffairesHier = commandes
          .filter(c => new Date(c.created_at).toDateString() === yesterday.toDateString())
          .reduce((sum, c) => sum + c.montant_total, 0);

        this.stats.commandesAujourdhui.total = commandesAujourdHui;
        this.stats.commandesAujourdhui.variation = this.calcVariation(commandesAujourdHui, commandesHier);

        this.stats.chiffreAffaires.total = chiffreAffairesAujourdHui;
        this.stats.chiffreAffaires.variation = this.calcVariation(chiffreAffairesAujourdHui, chiffreAffairesHier);

        // Clients actifs
        const clientsAujourdHui = new Set(commandes
          .filter(c => new Date(c.created_at).toDateString() === today.toDateString())
          .map(c => c.user_id)).size;

        const clientsHier = new Set(commandes
          .filter(c => new Date(c.created_at).toDateString() === yesterday.toDateString())
          .map(c => c.user_id)).size;

        this.stats.clientsActifs.total = clientsAujourdHui;
        this.stats.clientsActifs.variation = this.calcVariation(clientsAujourdHui, clientsHier);

        // Notifications simples
        this.notifications = [];
        commandes.forEach(c => {
          if (c.statut === 'en_cours') {
            this.notifications.push({
              type: 'commande',
              icon: '🛒',
              message: `Nouvelle commande #${c.id} (Client: ${c.user?.name || 'Inconnu'})`
            });
          }
        });
      },
      error: (err) => console.error(err)
    });

    // 2️⃣ Récupérer les produits
    this.produitService.getProduits().subscribe({
      next: (produits) => {
        this.produitsPopulaires = produits
          .sort((a, b) => b.stock - a.stock)
          .slice(0, 5);

        const stockAujourdHui = produits.reduce((sum, p) => sum + p.stock, 0);
        this.stats.produitsEnStock.total = stockAujourdHui;
        // Variation non calculable sans historique → mettre 0
        this.stats.produitsEnStock.variation = 0;

        // Notifications de stock critique
        produits.forEach(p => {
          if (p.stock <= 5) {
            this.notifications.push({
              type: 'stock',
              icon: '⚠️',
              message: `Stock critique: ${p.nom} (${p.stock} unités restantes)`
            });
          }
        });
      },
      error: (err) => console.error(err)
    });

    this.lastUpdate = new Date();
    setTimeout(() => this.loading = false, 500);
  }

  calcVariation(todayValue: number, yesterdayValue: number): number {
    if (yesterdayValue === 0) return todayValue === 0 ? 0 : 100;
    return Math.round(((todayValue - yesterdayValue) / yesterdayValue) * 100);
  }

  voirToutesCommandes() {
    console.log('Redirection vers la page commandes...');
  }

  getVariationClass(value: number): string {
    return value >= 0 ? 'variation-positive' : 'variation-negative';
  }

  getStatutClass(statut: Commande['statut']): string {
    switch (statut) {
      case 'terminee': return 'statut-terminee';
      case 'en_cours': return 'statut-cours';
      case 'en_attente': return 'statut-attente';
      case 'annulee': return 'statut-annulee';
      default: return 'statut-default';
    }
  }

  getNotificationClass(type: Notification['type']): string {
    switch (type) {
      case 'stock': return 'notification-stock';
      case 'commande': return 'notification-commande';
      case 'objectif': return 'notification-objectif';
      default: return '';
    }
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
