
import {User} from "./user";
 
export interface Commande {
  id: number;
  user_id: number;               // le client qui a passé la commande
  employe_id?: number | null;    // optionnel si assignation à un employé
  statut: 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';
  mode_paiement: 'en_ligne' | 'a_la_livraison';
  total: number;
  date_commande: string;          // ISO date
  date_livraison_estimee?: string | null;
  adresse_livraison: string;
  notes?: string | null;
  actif: boolean;

  // Relations
  client?: Client;
  employe?: User;
  produits?: ProduitCommande[];   // pivot avec quantités/prix
  facture?: Facture;
}

export interface ProduitCommande {
  produit_id: number;
  nom?: string;           // optionnel si chargé
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  avatar?: string | null;
  role: 'client';
  created_at?: string;
  updated_at?: string;
}


export interface Facture {
  id: number;
  commande_id: number;
  numero: string;         // ex: FAC-20250905-0001
  total: number;
  date_emission: string;  // ISO date
  pdf_path: string;
  envoye_email: boolean;
}


export interface ProduitCommande {
  produit_id: number;
  nom?: string;           // optionnel si chargé
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}









export interface Produit {
  id: number;
  nom: string;
  description?: string;
  prix: number;          // prix unitaire
  stock: number;
  image?: string | null;
  categorie_id?: number;
  allergenes?: string[] | null;

  // Si utilisé dans une commande (pivot)
  quantite?: number;
  prix_unitaire?: number;
  prix_total?: number;
}
