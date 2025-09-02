<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture #{{ $commande->id }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 8px; text-align: left; }
    </style>
</head>
<body>
<h2>Facture #{{ $commande->id }}</h2>
<p>Client: {{ $commande->client->name }} ({{ $commande->client->email }})</p>
<p>Date: {{ $commande->date_commande->format('d/m/Y H:i') }}</p>
<table>
    <thead>
    <tr>
        <th>Produit</th>
        <th>Quantité</th>
        <th>Prix Unitaire</th>
        <th>Total</th>
    </tr>
    </thead>
    <tbody>
    @foreach($commande->produits as $produit)
        <tr>
            <td>{{ $produit->nom }}</td>
            <td>{{ $produit->pivot->quantite }}</td>
            <td>{{ number_format($produit->pivot->prix_unitaire,2) }} €</td>
            <td>{{ number_format($produit->pivot->prix_total,2) }} €</td>
        </tr>
    @endforeach
    </tbody>
</table>
<p><strong>Total: {{ number_format($commande->total,2) }} €</strong></p>
</body>
</html>
