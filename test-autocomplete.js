#!/usr/bin/env node

/**
 * Script de Test - Google Places Autocomplete
 * 
 * Ce script teste si l'API Google Places fonctionne correctement.
 * 
 * Usage:
 *   node test-autocomplete.js
 */

const https = require('https');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_SOLAR_API_KEY;

console.log('\n🔍 Test de Google Places Autocomplete\n');
console.log('=====================================\n');

// Vérifier la clé API
if (!GOOGLE_API_KEY) {
  console.error('❌ ERREUR: Aucune clé API trouvée!');
  console.log('\n📝 Solution:');
  console.log('   1. Créer un fichier .env.local à la racine du projet');
  console.log('   2. Ajouter: GOOGLE_PLACES_API_KEY=votre_cle_api');
  console.log('   3. Relancer ce script\n');
  process.exit(1);
}

console.log('✅ Clé API trouvée:', GOOGLE_API_KEY.substring(0, 10) + '...\n');

// Test 1: Vérifier Places API
console.log('📡 Test 1: Appel à Google Places API...\n');

const testInput = 'montreal';
const params = new URLSearchParams({
  input: testInput,
  key: GOOGLE_API_KEY,
  types: 'address',
  components: 'country:ca',
  language: 'fr',
  region: 'ca',
  location: '46.8139,-71.2080',
  radius: '500000'
});

const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('📥 Réponse reçue!\n');
      console.log('Status:', response.status);
      
      if (response.status === 'OK') {
        console.log('✅ SUCCESS! L\'API fonctionne correctement\n');
        console.log(`📍 ${response.predictions.length} suggestions trouvées:\n`);
        
        response.predictions.slice(0, 5).forEach((pred, i) => {
          console.log(`   ${i + 1}. ${pred.description}`);
        });
        
        console.log('\n✨ Tout fonctionne! L\'autocomplete devrait marcher dans l\'app.\n');
        
      } else if (response.status === 'REQUEST_DENIED') {
        console.error('❌ ERREUR: REQUEST_DENIED\n');
        console.log('Message:', response.error_message || 'Aucun message');
        console.log('\n📝 Solutions possibles:');
        console.log('   1. Activer Places API dans Google Cloud Console');
        console.log('   2. Vérifier que la clé a accès à Places API');
        console.log('   3. Vérifier les restrictions de la clé API\n');
        
      } else if (response.status === 'ZERO_RESULTS') {
        console.log('⚠️  Aucun résultat trouvé pour "' + testInput + '"');
        console.log('    Mais l\'API fonctionne!\n');
        
      } else {
        console.error('❌ ERREUR:', response.status);
        console.log('Message:', response.error_message || 'Aucun message');
        console.log('\n📝 Vérifier la documentation Google Places API\n');
      }
      
    } catch (error) {
      console.error('❌ Erreur de parsing JSON:', error.message);
      console.log('\nRéponse brute:', data.substring(0, 200));
    }
  });

}).on('error', (error) => {
  console.error('❌ Erreur réseau:', error.message);
  console.log('\n📝 Vérifier votre connexion internet\n');
});

// Test 2: Vérifier l'endpoint local (si le serveur tourne)
console.log('📡 Test 2: Vérifier l\'endpoint local...\n');
console.log('   Pour tester l\'endpoint local:');
console.log('   1. Démarrer le serveur: npm run dev');
console.log('   2. Ouvrir: http://localhost:3000/api/places/autocomplete?input=montreal');
console.log('   3. Vérifier la réponse JSON\n');

console.log('=====================================\n');
