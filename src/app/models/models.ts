interface DashboardStats {
  commandesAujourdhui: {
    total: number;
    variation: number;
  };
  chiffreAffaires: {
    total: number;
    variation: number;
  };
  produitsEnStock: {
    total: number;
    variation: number;
  };
  clientsActifs: {
    total: number;
    variation: number;
  };
}

interface CommandeRecente {
  id: number;
  client: string;
  produit: string;
  quantite: number;
  montant: number;
  statut: string;
  tempsEcoule: string;
}

interface ProduitPopulaire {
  nom: string;
  vendus: number;
  variation: number;
}

interface Notification {
  type: 'stock' | 'commande' | 'objectif';
  message: string;
  
}

