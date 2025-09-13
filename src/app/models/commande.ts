import { User } from "./user";
import { Produit } from "../services/produit/test/produits.service";

export type StatutCommande = 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';
export type ModePaiement = 'en_ligne' | 'a_la_livraison';

export interface Commande {
  id: number;
  user_id: number;               // le client qui a passé la commande
  employe_id?: number | null;    // optionnel si assignation à un employé
  statut: StatutCommande;
  mode_paiement: ModePaiement;
  total: number;
  frais_livraison?: number;      // frais de livraison
  date_commande: string;         // ISO date
  updated_at?: string;           // date de dernière mise à jour
  created_at?: string;           // date de création
  date_livraison_estimee?: string | null;
  adresse_livraison: string;
  notes?: string | null;
  actif: boolean;

  // Relations
  client?: User;
  employe?: User;
  produits?: ProduitCommande[];   // pivot avec quantités/prix
  facture?: Facture;
}

export interface ProduitCommande {
  produit_id: number;
  nom?: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  prod?: Produit;   // ⚠️ optional, car backend peut l’envoyer ou pas
}

export interface Facture {
  id: number;
  commande_id: number;
  numero: string;         
  total: number;
  date_emission: string;  
  pdf_path: string;
  envoye_email: boolean;
}
