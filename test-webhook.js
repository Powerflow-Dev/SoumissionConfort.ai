// Test script pour vérifier si le webhook Make.com fonctionne
const WEBHOOK_URL = 'https://hook.us2.make.com/hkh6cvtrgbswwecam6gmul9plxtgk98m';

const testPayload = {
  "Prénom (A)": "Test",
  "Nom (B)": "Webhook",
  "Adresse courriel (C)": "test@example.com",
  "Téléphone (D)": "514-555-0123",
  "Adresse (E)": "123 Test Street",
  "Code postal (F)": "H1A 1A1",
  "Ville (G)": "Montreal",
  "Superficie du toit (H)": 1500,
  "Hauteur du bâtiment (I)": 2,
  "Lead ID (Y)": "TEST123",
  "Webhook Type (Z)": "test"
};

console.log('📤 Envoi du test webhook à Make.com...');
console.log('🔗 URL:', WEBHOOK_URL);
console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('✅ Statut:', response.status);
  console.log('✅ Status Text:', response.statusText);
  return response.text();
})
.then(text => {
  console.log('📥 Réponse:', text);
})
.catch(error => {
  console.error('❌ Erreur:', error);
});
