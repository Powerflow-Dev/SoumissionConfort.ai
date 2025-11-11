#!/usr/bin/env node

// Script de diagnostic pour vérifier la configuration du webhook
const fs = require('fs');
const path = require('path');

// Lire manuellement le fichier .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

console.log('🔍 DIAGNOSTIC DE CONFIGURATION WEBHOOK\n');
console.log('=' .repeat(50));

// Vérifier les variables d'environnement critiques
const checks = [
  { name: 'WEBHOOK_URLS', value: process.env.WEBHOOK_URLS, required: true },
  { name: 'VERCEL_URL', value: process.env.VERCEL_URL, required: false },
  { name: 'NEXT_PUBLIC_BASE_URL', value: process.env.NEXT_PUBLIC_BASE_URL, required: false },
  { name: 'VERCEL_AUTOMATION_BYPASS_SECRET', value: process.env.VERCEL_AUTOMATION_BYPASS_SECRET, required: false },
  { name: 'NEXT_PUBLIC_META_PIXEL_ID', value: process.env.NEXT_PUBLIC_META_PIXEL_ID, required: false },
  { name: 'META_CONVERSION_ACCESS_TOKEN', value: process.env.META_CONVERSION_ACCESS_TOKEN, required: false },
];

let hasErrors = false;

checks.forEach(check => {
  const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
  const statusText = check.value ? 'CONFIGURÉ' : (check.required ? 'MANQUANT (REQUIS)' : 'NON CONFIGURÉ (OPTIONNEL)');
  
  console.log(`\n${status} ${check.name}`);
  console.log(`   Statut: ${statusText}`);
  
  if (check.value) {
    // Masquer les valeurs sensibles
    const displayValue = check.name.includes('TOKEN') || check.name.includes('SECRET') 
      ? check.value.substring(0, 10) + '...' 
      : check.value;
    console.log(`   Valeur: ${displayValue}`);
    
    // Vérifier les URLs de webhook
    if (check.name === 'WEBHOOK_URLS') {
      const urls = check.value.split(',').map(url => url.trim());
      console.log(`   Nombre d'URLs: ${urls.length}`);
      urls.forEach((url, index) => {
        console.log(`   URL ${index + 1}: ${url}`);
      });
    }
  }
  
  if (check.required && !check.value) {
    hasErrors = true;
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ ERREURS DÉTECTÉES - Le webhook ne fonctionnera pas correctement');
  console.log('\n📋 Actions requises:');
  console.log('   1. Vérifier que WEBHOOK_URLS est défini dans .env.local');
  console.log('   2. Vérifier que l\'URL du webhook Make.com est correcte');
  console.log('   3. Redémarrer le serveur après modification');
  process.exit(1);
} else {
  console.log('\n✅ Configuration de base OK');
  console.log('\n💡 Prochaines étapes:');
  console.log('   1. Tester le webhook avec: node test-webhook.js');
  console.log('   2. Vérifier les logs du serveur Next.js');
  console.log('   3. Vérifier les logs de Make.com');
  process.exit(0);
}
