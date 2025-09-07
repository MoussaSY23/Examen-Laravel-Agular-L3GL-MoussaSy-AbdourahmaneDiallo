export interface Categorie {
  id: number;  // pas de ?
  nom: string;
  description?: string;
  position?: number;
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  produits?: any[];
}

export interface Produit {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  stock: number;
  categorie_id: number;
  unite?: string;
  image_principale?: string;
  images?: string[];
  en_promotion?: boolean;
  prix_promotion?: number;
  date_debut_promotion?: string;
  date_fin_promotion?: string;
  actif?: boolean;
}
