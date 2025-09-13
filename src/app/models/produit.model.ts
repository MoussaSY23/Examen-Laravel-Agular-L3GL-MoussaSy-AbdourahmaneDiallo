export interface Produit {
  id?: number;
  categorie_id: number;
  nom: string;
  description: string;
  prix: number;
  en_promotion: boolean;
  prix_promotion?: number | null;
  date_debut_promotion?: string | null;
  date_fin_promotion?: string | null;
  stock: number;
  unite: string;
  image_principale?: string;
  images?: string[];
  actif: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  categorie?: {
    id: number;
    nom: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface CartItem extends Produit {
  quantity: number;
  total: number;
}
