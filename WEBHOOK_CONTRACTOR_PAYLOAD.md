# Webhook Payload - Demandes d'Entrepreneurs

## Vue d'ensemble

Lorsqu'un entrepreneur soumet le formulaire sur `/pour-entrepreneurs`, un webhook est automatiquement déclenché vers les URLs configurées dans `WEBHOOK_URLS`.

## Configuration

Les webhooks utilisent la même variable d'environnement que les leads clients:
```
WEBHOOK_URLS=https://hook.eu2.make.com/your-webhook-url
```

## Structure du Payload

### Format Make.com / Google Sheets

```json
{
  "Type de lead": "Entrepreneur",
  "Lead ID": "CONTRACTOR1732145234567abcd1234",
  "Webhook Type": "contractor_application",
  "Timestamp": "2025-11-20T22:35:00.000Z",
  
  "Nom de l'entreprise": "Isolation Pro Inc.",
  "Numéro RBQ": "1234-5678-90",
  "Région desservie": "Montréal, Laval, Rive-Sud",
  "Années d'expérience": "10+ ans",
  
  "Prénom": "Jean",
  "Nom": "Tremblay",
  "Email": "contact@isolationpro.com",
  "Téléphone": "514-555-0123",
  
  "Message": "Intéressé à rejoindre votre réseau...",
  
  "Date de soumission": "2025-11-20 17:35:00",
  "Source": "soumission-confort-ai"
}
```

## Champs du Payload

### Identification
- **Type de lead**: Toujours "Entrepreneur" (pour différencier des leads clients)
- **Lead ID**: Identifiant unique au format `CONTRACTOR{timestamp}{random}`
- **Webhook Type**: Toujours "contractor_application"
- **Timestamp**: Date/heure ISO 8601

### Informations de l'entreprise
- **Nom de l'entreprise**: Nom commercial de l'entreprise
- **Numéro RBQ**: Numéro de licence RBQ (requis)
- **Région desservie**: Zone géographique couverte (optionnel)
- **Années d'expérience**: Niveau d'expérience (optionnel)

### Contact
- **Prénom**: Prénom du contact
- **Nom**: Nom du contact
- **Email**: Email professionnel
- **Téléphone**: Numéro de téléphone

### Autres
- **Message**: Message optionnel de l'entrepreneur
- **Date de soumission**: Date/heure formatée (fr-CA)
- **Source**: Toujours "soumission-confort-ai"

## Différences avec les Leads Clients

| Aspect | Leads Clients | Leads Entrepreneurs |
|--------|---------------|---------------------|
| **Lead ID** | `LEAD{timestamp}{random}` | `CONTRACTOR{timestamp}{random}` |
| **Type** | "initial_contact" | "contractor_application" |
| **Données** | Propriété, isolation, prix | Entreprise, RBQ, expérience |
| **Champs** | ~50 champs (A-AL) | ~14 champs |

## Intégration Make.com

### Scénario recommandé

1. **Webhook Trigger**: Recevoir le payload
2. **Router**: Vérifier le "Type de lead"
   - Si "Entrepreneur" → Route vers gestion entrepreneurs
   - Si autre → Route vers gestion clients
3. **Google Sheets**: Ajouter ligne dans feuille "Entrepreneurs"
4. **Email**: Notification à l'équipe
5. **CRM**: Créer contact dans le CRM (optionnel)

### Colonnes Google Sheets suggérées

```
A: Type de lead
B: Lead ID
C: Date de soumission
D: Nom de l'entreprise
E: Numéro RBQ
F: Prénom
G: Nom
H: Email
I: Téléphone
J: Région desservie
K: Années d'expérience
L: Message
M: Statut (À traiter/Contacté/Accepté/Refusé)
N: Notes
```

## Logs et Debugging

Le système génère des logs détaillés:
- `📥 Contractor lead received`: Données reçues
- `🆔 Generated contractor lead ID`: ID généré
- `📦 CONTRACTOR API: Make.com formatted payload`: Payload complet
- `📤 CONTRACTOR API: Sending to webhook`: Envoi en cours
- `📥 CONTRACTOR API: Webhook response`: Réponse reçue
- `📊 CONTRACTOR API: X/Y webhooks succeeded`: Résumé

## Gestion des Erreurs

- Si le webhook échoue, la soumission est quand même acceptée
- Les erreurs sont loggées mais ne bloquent pas le processus
- Timeout de 30 secondes par webhook
- Retry automatique non implémenté (à ajouter si nécessaire)

## Tests

Pour tester le webhook:

1. Remplir le formulaire sur `/pour-entrepreneurs`
2. Vérifier les logs serveur pour les messages `CONTRACTOR API`
3. Vérifier la réception dans Make.com
4. Vérifier l'ajout dans Google Sheets

## Notes

- Le même `WEBHOOK_URLS` est utilisé pour clients et entrepreneurs
- Utiliser le champ "Type de lead" pour router correctement
- Le Lead ID unique permet de tracker chaque demande
- Aucune donnée sensible n'est exposée dans les logs
