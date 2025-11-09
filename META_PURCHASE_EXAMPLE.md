# Meta Conversion API - Purchase Event

## Configuration

Le payload Purchase a été intégré dans `lib/meta-conversion-api.ts` avec le format exact requis par Meta.

## Utilisation

### 1. Initialiser l'API (déjà fait dans votre app)

```typescript
import { initializeMetaConversionAPI } from '@/lib/meta-conversion-api'

initializeMetaConversionAPI(
  process.env.NEXT_PUBLIC_META_PIXEL_ID!,
  process.env.META_CONVERSION_ACCESS_TOKEN!,
  process.env.META_TEST_EVENT_CODE // Optional
)
```

### 2. Tracker un événement Purchase

```typescript
import { trackPurchase } from '@/lib/meta-conversion-api'

// Exemple: Quand un client complète un achat d'isolation
const result = await trackPurchase({
  email: 'client@example.com',
  phone: '514-555-1234', // Optional
  firstName: 'Jean', // Optional
  lastName: 'Tremblay', // Optional
  value: '142.52', // ou number: 142.52
  currency: 'USD', // ou 'CAD'
  attributionShare: '0.3', // Optional - pour attribution partielle
  contentName: 'Isolation Premium', // Optional
  contentType: 'service', // Optional
  clientIp: '192.168.1.1', // Requis côté serveur
  userAgent: 'Mozilla/5.0...', // Requis côté serveur
  sourceUrl: 'https://soumissionconfort.com/checkout'
})

if (result.success) {
  console.log('Purchase event tracked successfully')
} else {
  console.error('Failed to track purchase:', result.error)
}
```

### 3. Exemple de payload généré

```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1762702190,
      "action_source": "website",
      "user_data": {
        "em": ["7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068"],
        "ph": ["a1b2c3d4..."], // ou [null] si pas de téléphone
        "fn": "hashed_firstname",
        "ln": "hashed_lastname",
        "client_ip_address": "192.168.1.1",
        "client_user_agent": "Mozilla/5.0..."
      },
      "attribution_data": {
        "attribution_share": "0.3"
      },
      "custom_data": {
        "currency": "USD",
        "value": "142.52",
        "content_type": "service",
        "content_name": "Isolation Premium"
      },
      "original_event_data": {
        "event_name": "Purchase",
        "event_time": 1762702190
      },
      "event_source_url": "https://soumissionconfort.com/checkout"
    }
  ]
}
```

## Intégration dans votre webhook

Pour tracker les achats quand un lead devient client, ajoutez dans `/app/api/webhook/route.ts`:

```typescript
import { trackPurchase } from '@/lib/meta-conversion-api'

// Après qu'un entrepreneur accepte le projet
if (leadData.status === 'accepted' && leadData.projectValue) {
  await trackPurchase({
    email: leadData.contact.email,
    phone: leadData.contact.phone,
    firstName: leadData.contact.firstName,
    lastName: leadData.contact.lastName,
    value: leadData.projectValue,
    currency: 'CAD',
    clientIp: request.headers.get('x-forwarded-for') || '127.0.0.1',
    userAgent: request.headers.get('user-agent') || '',
    sourceUrl: 'https://soumissionconfort.com',
    attributionShare: '0.3', // Si vous partagez l'attribution
    contentName: `Isolation ${leadData.pricing.selectedRange}`,
    contentType: 'insulation_service'
  })
}
```

## Différences avec Lead Event

| Champ | Lead | Purchase |
|-------|------|----------|
| `user_data.em` | string | string[] |
| `user_data.ph` | string | (string\|null)[] |
| `attribution_data` | ❌ | ✅ |
| `original_event_data` | ❌ | ✅ |
| `custom_data.value` | number | string |

## Test

Pour tester l'événement Purchase:

```bash
curl -X POST http://localhost:3000/api/test-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "value": "142.52",
    "currency": "USD"
  }'
```
