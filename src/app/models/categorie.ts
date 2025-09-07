// src/app/models/categorie.model.ts
export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}