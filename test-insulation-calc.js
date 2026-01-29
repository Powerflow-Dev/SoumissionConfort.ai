// Test du calcul d'isolation pour 1145 rue Charles-Olivier, Boisbriand

// Données de l'API roof-analysis
const roofData = {
  roofArea: 1271, // pieds carrés
  usableArea: 1106,
  segments: 5,
  pitchComplexity: "moderate",
  buildingHeight: 20,
  obstacles: ["minimal obstacles"],
  accessDifficulty: "easy",
  roofShape: "moderate"
};

// Import du calculateur (simulation)
const calculateInsulationPricing = (inputs) => {
  // Prix de base par gamme
  const INSULATION_RANGES = {
    economique: {
      name: 'Économique',
      type: 'Fibre de verre soufflée',
      pricePerSqFt: { min: 2.20, max: 2.70 }
    },
    standard: {
      name: 'Standard',
      type: 'Cellulose soufflée',
      pricePerSqFt: { min: 2.70, max: 3.60 }
    },
    premium: {
      name: 'Premium',
      type: 'Uréthane giclé',
      pricePerSqFt: { min: 4.00, max: 5.50 }
    }
  };

  // Multiplicateur d'accès
  const accessMultipliers = {
    'facile': 1.00,
    'trappe': 1.10,
    'difficile': 1.30,
    'aucun': 1.30
  };

  const accessMultiplier = accessMultipliers[inputs.atticAccess] || 1.10;
  const adjustedArea = inputs.roofArea;

  console.log('\n=== TEST CALCUL ISOLATION ===');
  console.log(`Adresse: 1145 rue Charles-Olivier, Boisbriand, QC`);
  console.log(`Surface du toit: ${roofData.roofArea} pi²`);
  console.log(`Surface utilisable: ${roofData.usableArea} pi²`);
  console.log(`Accès: ${inputs.atticAccess} (multiplicateur: ${accessMultiplier})`);
  console.log(`Isolation actuelle: ${inputs.currentInsulation}`);
  console.log('\n--- RÉSULTATS PAR GAMME ---\n');

  Object.entries(INSULATION_RANGES).forEach(([key, range]) => {
    const baseCostMin = adjustedArea * range.pricePerSqFt.min;
    const baseCostMax = adjustedArea * range.pricePerSqFt.max;
    
    const totalCostMin = Math.round(baseCostMin * accessMultiplier);
    const totalCostMax = Math.round(baseCostMax * accessMultiplier);
    
    const effectivePriceMin = (totalCostMin / adjustedArea).toFixed(2);
    const effectivePriceMax = (totalCostMax / adjustedArea).toFixed(2);

    console.log(`${range.name} (${range.type}):`);
    console.log(`  Prix de base: ${range.pricePerSqFt.min}$ - ${range.pricePerSqFt.max}$ /pi²`);
    console.log(`  Coût total: ${totalCostMin.toLocaleString()}$ - ${totalCostMax.toLocaleString()}$`);
    console.log(`  Prix effectif: ${effectivePriceMin}$ - ${effectivePriceMax}$ /pi²`);
    console.log('');
  });
};

// Test avec différents scénarios
console.log('\n========================================');
console.log('SCÉNARIO 1: Accès facile, aucune isolation');
console.log('========================================');
calculateInsulationPricing({
  roofArea: roofData.roofArea,
  currentInsulation: 'aucune',
  atticAccess: 'facile',
  heatingSystem: 'electricite',
  identifiedProblems: []
});

console.log('\n========================================');
console.log('SCÉNARIO 2: Accès par trappe, isolation partielle');
console.log('========================================');
calculateInsulationPricing({
  roofArea: roofData.roofArea,
  currentInsulation: 'partielle',
  atticAccess: 'trappe',
  heatingSystem: 'electricite',
  identifiedProblems: []
});

console.log('\n========================================');
console.log('SCÉNARIO 3: Accès difficile, isolation complète');
console.log('========================================');
calculateInsulationPricing({
  roofArea: roofData.roofArea,
  currentInsulation: 'complete',
  atticAccess: 'difficile',
  heatingSystem: 'electricite',
  identifiedProblems: []
});
