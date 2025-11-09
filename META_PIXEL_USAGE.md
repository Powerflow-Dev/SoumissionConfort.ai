# Meta Pixel - Guide d'utilisation

## Configuration

Le Meta Pixel est configuré dans `/app/layout.tsx` avec l'ID: **1508005413751111**

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1508005413751111');
fbq('track', 'PageView');
</script>
```

## Utilisation côté client

### Import

```typescript
import { trackPurchase, trackLead, trackViewContent, trackSearch } from '@/lib/meta-pixel'
```

### 1. Track Purchase (Achat complété)

```typescript
// Quand un client complète un achat
trackPurchase({
  value: 5500, // ou "5500"
  currency: 'CAD',
  content_name: 'Isolation Standard',
  content_type: 'insulation_service',
  content_ids: ['ISOL-STD-001'],
  num_items: 1
})
```

### 2. Track Lead (Soumission de formulaire)

```typescript
// Quand un utilisateur soumet le formulaire de contact
trackLead({
  value: 5000,
  currency: 'CAD',
  content_name: 'Demande de soumission isolation',
  content_category: 'insulation'
})
```

### 3. Track ViewContent (Consultation de page)

```typescript
// Quand un utilisateur consulte une page de résultats
trackViewContent({
  content_name: 'Résultats estimation isolation',
  content_category: 'results',
  content_type: 'pricing',
  value: 5000,
  currency: 'CAD'
})
```

### 4. Track Search (Recherche d'adresse)

```typescript
// Quand un utilisateur recherche une adresse
trackSearch({
  search_string: '123 Rue Example, Montreal',
  content_category: 'address_search',
  value: 0,
  currency: 'CAD'
})
```

### 5. Track InitiateCheckout (Début du processus)

```typescript
// Quand un utilisateur commence le questionnaire
import { trackInitiateCheckout } from '@/lib/meta-pixel'

trackInitiateCheckout({
  value: 5000,
  currency: 'CAD',
  content_name: 'Questionnaire isolation',
  content_category: 'questionnaire',
  num_items: 1
})
```

## Événements personnalisés

```typescript
import { trackMetaPixelCustomEvent } from '@/lib/meta-pixel'

trackMetaPixelCustomEvent('QuestionnaireCompleted', {
  questions_answered: 4,
  estimated_value: 5000,
  currency: 'CAD'
})
```

## Exemple complet dans un composant

```typescript
'use client'

import { useState } from 'react'
import { trackLead, trackPurchase } from '@/lib/meta-pixel'

export function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Track Lead event
    trackLead({
      value: 5500,
      currency: 'CAD',
      content_name: 'Isolation Standard',
      content_category: 'insulation'
    })

    // Soumettre le formulaire...
    const result = await submitForm()
    
    if (result.success) {
      // Track Purchase event si le paiement est complété
      trackPurchase({
        value: 5500,
        currency: 'CAD',
        content_name: 'Isolation Standard',
        content_type: 'insulation_service',
        content_ids: [result.orderId],
        num_items: 1
      })
      
      setSubmitted(true)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
    </form>
  )
}
```

## Vérification

Pour vérifier que le pixel fonctionne:

1. **Meta Pixel Helper** (Extension Chrome)
   - Installez l'extension Meta Pixel Helper
   - Visitez votre site
   - Vérifiez que le pixel ID 1508005413751111 est détecté

2. **Console du navigateur**
   - Ouvrez la console (F12)
   - Cherchez les logs: `📊 Meta Pixel: [EventName] tracked`

3. **Meta Events Manager**
   - Allez sur https://business.facebook.com/events_manager2
   - Sélectionnez votre pixel (1508005413751111)
   - Vérifiez les événements en temps réel dans "Test Events"

## Différence Pixel vs Conversion API

| Aspect | Meta Pixel (Client) | Conversion API (Serveur) |
|--------|---------------------|--------------------------|
| **Où** | Navigateur du client | Serveur Next.js |
| **Quand** | Actions utilisateur | Événements backend |
| **Bloqueurs** | Peut être bloqué par AdBlockers | Non bloquable |
| **Données** | Limitées (cookies) | Complètes (PII hashé) |
| **Utilisation** | `trackPurchase()` | `trackPurchase()` dans `/lib/meta-conversion-api.ts` |

## Recommandation

Pour une tracking optimal, utilisez **les deux**:
- **Pixel** pour les événements client (ViewContent, Search, etc.)
- **Conversion API** pour les événements critiques (Lead, Purchase)

Cela assure une couverture maximale même si le pixel est bloqué.
