// src/app/models/commande.model.ts
import { User } from './user';
import { Produit } from './produit';

export interface LigneCommande {
  id?: number;
  produit_id: number;
  produit?: Produit;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

export interface Commande {
  id: number;
  user_id: number;
  user?: User;
  statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
  montant_total: number;
  adresse_livraison: string;
  telephone: string;
  notes?: string;
  lignes_commande: LigneCommande[];
  created_at: string;
  updated_at: string;
  date_livraison?: string;
}