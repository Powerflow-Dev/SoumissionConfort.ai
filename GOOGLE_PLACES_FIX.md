# 🔧 Fix: Google Places Autocomplete

## 🔍 Diagnostic du Problème

L'autocomplete Google Places ne fonctionne pas. Voici les causes possibles et les solutions.

---

## ✅ Solution 1: Configurer la Clé API Google Places

### Étape 1: Vérifier les Variables d'Environnement

Créer ou modifier le fichier `.env.local` à la racine du projet:

```bash
# .env.local

# Google Solar API (existant)
GOOGLE_SOLAR_API_KEY=votre_cle_google_solar

# Google Places API (AJOUTER CETTE LIGNE)
GOOGLE_PLACES_API_KEY=votre_cle_google_places
```

### Étape 2: Obtenir une Clé API Google Places

1. **Aller sur Google Cloud Console**: https://console.cloud.google.com/
2. **Sélectionner votre projet** (ou en créer un nouveau)
3. **Activer l'API Places**:
   - Menu → APIs & Services → Library
   - Rechercher "Places API"
   - Cliquer sur "Places API"
   - Cliquer "Enable"
4. **Créer une clé API**:
   - Menu → APIs & Services → Credentials
   - Cliquer "Create Credentials" → "API Key"
   - Copier la clé générée
5. **Restreindre la clé** (recommandé):
   - Cliquer sur la clé créée
   - Application restrictions → HTTP referrers
   - Ajouter: `localhost:3000/*` (dev) et `soumissionconfort.com/*` (prod)
   - API restrictions → Restrict key
   - Sélectionner: "Places API"
   - Sauvegarder

### Étape 3: Ajouter la Clé dans Vercel (Production)

Si déployé sur Vercel:

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Settings → Environment Variables
4. Ajouter:
   - Name: `GOOGLE_PLACES_API_KEY`
   - Value: `votre_cle_api`
   - Environments: Production, Preview, Development
5. Redéployer l'application

---

## ✅ Solution 2: Utiliser la Même Clé (Temporaire)

Si vous voulez tester rapidement, vous pouvez utiliser la même clé que Google Solar API.

**IMPORTANT**: Assurez-vous que la clé a accès à **Places API** en plus de **Solar API**.

Le code actuel a déjà un fallback:

```typescript
// Dans /app/api/places/autocomplete/route.ts (ligne 13)
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_SOLAR_API_KEY
```

Donc si `GOOGLE_PLACES_API_KEY` n'est pas définie, elle utilisera `GOOGLE_SOLAR_API_KEY`.

### Activer Places API sur la Clé Existante

1. Google Cloud Console → APIs & Services → Credentials
2. Trouver votre clé Solar API
3. Cliquer dessus
4. Dans "API restrictions":
   - Si "Restrict key" est sélectionné, ajouter "Places API" à la liste
   - Ou sélectionner "Don't restrict key" (moins sécurisé)
5. Sauvegarder

---

## 🧪 Solution 3: Tester le Fallback Local

Le système a déjà un fallback avec des villes québécoises communes. Pour tester:

1. **Ouvrir la console du navigateur** (F12)
2. **Taper une adresse** dans le champ
3. **Vérifier les logs**:
   ```
   🔵 fetchPredictions called with: montreal
   🚀 Making API call to /api/places/autocomplete
   📡 Fetching: /api/places/autocomplete?input=montreal
   📥 Response status: 200 true
   ✅ API Response data: { predictions: [...], fallback: true }
   ```

4. **Si vous voyez `fallback: true`**, cela signifie que l'API Google ne fonctionne pas mais le fallback local fonctionne.

### Villes dans le Fallback

Le système suggère automatiquement ces villes si l'API échoue:
- Montréal
- Québec
- Laval
- Gatineau
- Longueuil
- Sherbrooke
- Saguenay
- Lévis
- Trois-Rivières
- Terrebonne
- Saint-Jean-sur-Richelieu
- Repentigny
- Brossard
- Drummondville
- Saint-Jérôme

---

## 🔍 Diagnostic Avancé

### Vérifier les Logs Serveur

1. **En développement local**:
   ```bash
   npm run dev
   ```
   
   Regarder les logs dans le terminal:
   ```
   Making request to Places API: https://maps.googleapis.com/maps/api/place/autocomplete/json?...
   Places API response status: OK
   ```

2. **En production (Vercel)**:
   - Aller sur Vercel Dashboard
   - Sélectionner le projet
   - Functions → Logs
   - Chercher les logs de `/api/places/autocomplete`

### Erreurs Communes

#### Erreur: `REQUEST_DENIED`
```
Places API REQUEST_DENIED: This API project is not authorized to use this API
```

**Solution**: Activer Places API dans Google Cloud Console (voir Solution 1, Étape 2)

#### Erreur: `API key not configured`
```
Google API key not configured
```

**Solution**: Ajouter `GOOGLE_PLACES_API_KEY` dans `.env.local` (voir Solution 1)

#### Erreur: `OVER_QUERY_LIMIT`
```
Places API error: OVER_QUERY_LIMIT
```

**Solution**: 
- Vous avez dépassé le quota gratuit (2,500 requêtes/jour)
- Activer la facturation sur Google Cloud
- Ou attendre 24h pour le reset du quota

#### Erreur: `INVALID_REQUEST`
```
Places API error: INVALID_REQUEST
```

**Solution**: Vérifier que la clé API a les bonnes restrictions (HTTP referrers)

---

## 🧪 Test Manuel

### Test 1: Vérifier l'API Directement

Ouvrir dans le navigateur (remplacer `YOUR_API_KEY`):

```
https://maps.googleapis.com/maps/api/place/autocomplete/json?input=montreal&key=YOUR_API_KEY&types=address&components=country:ca
```

**Résultat attendu**: JSON avec `status: "OK"` et une liste de `predictions`

### Test 2: Vérifier l'Endpoint Local

1. Démarrer le serveur: `npm run dev`
2. Ouvrir dans le navigateur:
   ```
   http://localhost:3000/api/places/autocomplete?input=montreal
   ```

**Résultat attendu**:
```json
{
  "predictions": [
    {
      "place_id": "...",
      "description": "Montréal, QC, Canada",
      "main_text": "Montréal",
      "secondary_text": "QC, Canada",
      "types": ["locality", "political"]
    }
  ]
}
```

### Test 3: Vérifier dans l'Interface

1. Ouvrir http://localhost:3000
2. Cliquer dans le champ d'adresse
3. Taper "mont"
4. **Vérifier**:
   - Un dropdown apparaît
   - Des suggestions sont affichées
   - Si badge jaune "Suggestions locales" → Fallback actif (API ne fonctionne pas)
   - Si pas de badge → API fonctionne correctement

---

## 📝 Checklist de Vérification

- [ ] Variable `GOOGLE_PLACES_API_KEY` définie dans `.env.local`
- [ ] Places API activée dans Google Cloud Console
- [ ] Clé API créée avec accès à Places API
- [ ] Restrictions de clé configurées (HTTP referrers)
- [ ] Serveur redémarré après modification `.env.local`
- [ ] Test de l'endpoint `/api/places/autocomplete?input=test`
- [ ] Test dans l'interface utilisateur
- [ ] Vérification des logs console (F12)
- [ ] (Production) Variable ajoutée dans Vercel
- [ ] (Production) Application redéployée

---

## 🚀 Solution Rapide (Quick Fix)

Si vous voulez que ça fonctionne **immédiatement** sans Google Places API:

Le système utilise déjà un fallback automatique. Les utilisateurs peuvent:

1. **Taper le nom d'une ville** → Suggestions locales apparaissent
2. **Sélectionner une suggestion** → Fonctionne normalement
3. **Ou taper l'adresse complète manuellement** → Fonctionne aussi

Le fallback est **transparent** pour l'utilisateur (juste un petit badge jaune).

---

## 💡 Recommandations

### Pour le Développement
✅ Utiliser une clé API dédiée pour Places API
✅ Activer les logs détaillés (déjà fait dans le code)
✅ Tester avec différentes villes québécoises

### Pour la Production
✅ Utiliser une clé API séparée (meilleure sécurité)
✅ Configurer les restrictions de clé (domaine uniquement)
✅ Monitorer l'utilisation de l'API (Google Cloud Console)
✅ Activer la facturation si besoin (après quota gratuit)

### Quota Gratuit Google Places API
- **Autocomplete**: 2,500 requêtes/jour GRATUITES
- Au-delà: 2.83$ par 1,000 requêtes
- Pour un site avec 100 visiteurs/jour → Largement suffisant

---

## 🔧 Code de Debug (Temporaire)

Si vous voulez plus de logs, ajoutez ceci dans `/hooks/use-address-autocomplete.ts`:

```typescript
// Ligne 64, après console.log('✅ API Response data:', data)
console.log('📊 Predictions count:', data.predictions?.length || 0)
console.log('⚠️ Is fallback?', data.fallback)
console.log('❌ Error?', data.error)
```

Puis dans le navigateur (F12 → Console), vous verrez exactement ce qui se passe.

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. **Vérifier les logs** dans la console navigateur (F12)
2. **Vérifier les logs** serveur (terminal ou Vercel)
3. **Copier les messages d'erreur** exacts
4. **Vérifier** que la clé API a bien accès à Places API

---

**Créé le**: 10 décembre 2024  
**Version**: 1.0  
**Statut**: Guide de dépannage complet
