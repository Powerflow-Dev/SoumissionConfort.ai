# Flux de la Page de Pricing

## Vue d'ensemble

La page de résultats de pricing a été séparée en une route dédiée `/pricing` pour améliorer l'expérience utilisateur et permettre le partage d'URL.

## Architecture

### 1. Routes

- **`/app/pricing/page.tsx`** - Page de résultats de pricing
- **`/app/api/pricing-data/route.ts`** - API pour stocker/récupérer les données

### 2. Flux utilisateur

```
1. Utilisateur complète le questionnaire
   ↓
2. Soumission du formulaire de capture de leads
   ↓
3. Données envoyées à /api/leads (webhook Make.com)
   ↓
4. leadId généré et retourné
   ↓
5. Données stockées via POST /api/pricing-data
   ↓
6. Redirection vers /pricing?leadId=LEADXXX
   ↓
7. Page /pricing récupère les données via GET /api/pricing-data?leadId=LEADXXX
   ↓
8. Affichage des résultats InsulationResults
```

### 3. Stockage des données

**Méthode actuelle:** In-memory Map (développement)
- Les données sont stockées en mémoire avec un TTL de 1 heure
- Nettoyage automatique des entrées expirées

**Pour la production:**
- Utiliser Redis pour le cache distribué
- Ou stocker dans une base de données
- Ou utiliser des sessions côté serveur

### 4. Structure des données stockées

```typescript
{
  leadId: string,
  roofData: {
    address: string,
    roofArea: number,
    pitchComplexity: string,
    // ... autres données du toit
  },
  userAnswers: {
    heatingSystem: string,
    currentInsulation: string,
    atticAccess: string,
    identifiedProblems: string[]
  },
  leadData: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    leadId: string
  }
}
```

## Avantages

1. **URL partageable** - Les utilisateurs peuvent bookmarker ou partager leur estimation
2. **Meilleur tracking** - Chaque page a sa propre URL pour analytics
3. **Rechargement de page** - Les utilisateurs peuvent rafraîchir sans perdre leurs données
4. **SEO** - Meilleure indexation des pages de résultats
5. **Navigation** - Retour en arrière possible avec le bouton du navigateur

## Sécurité

- Les leadIds sont uniques et difficiles à deviner (timestamp + random)
- Les données expirent après 1 heure
- Pas de données sensibles exposées dans l'URL

## Améliorations futures

1. Implémenter Redis pour le stockage en production
2. Ajouter une authentification pour les données sensibles
3. Permettre le téléchargement PDF des résultats
4. Ajouter un système de cache côté client
5. Implémenter un système de sessions persistantes
