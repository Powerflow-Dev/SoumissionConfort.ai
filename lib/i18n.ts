export type Language = "fr" | "en"

export interface Translations {
  // Navigation & Header
  backToHome: string
  howItWorks: string

  // Hero Section
  heroTitle: string
  heroSubtitle: string
  enterAddress: string
  addressPlaceholder: string
  getFreeAnalysis: string
  noSignupRequired: string
  poweredBy: string
  servingCanada: string

  // How It Works
  howItWorksTitle: string
  howItWorksSubtitle: string
  step1Title: string
  step1Description: string
  step2Title: string
  step2Description: string
  step3Title: string
  step3Description: string
  step4Title: string
  step4Description: string

  // Features
  featuresTitle: string
  featuresSubtitle: string
  aiAnalysisTitle: string
  aiAnalysisDescription: string
  instantPricingTitle: string
  instantPricingDescription: string
  certifiedContractorsTitle: string
  certifiedContractorsDescription: string
  securePrivateTitle: string
  securePrivateDescription: string
  saveTimeTitle: string
  saveTimeDescription: string
  qualityGuaranteedTitle: string
  qualityGuaranteedDescription: string

  // Analysis Results
  analysisCompleteTitle: string
  analysisCompleteSubtitle: string
  totalRoofArea: string
  usableArea: string
  roofSegments: string
  complexity: string
  squareFeet: string
  distinctSections: string
  difficultyLevel: string
  analysisSummaryTitle: string
  analysisSummaryDescription: string
  propertyDetails: string
  buildingHeight: string
  accessDifficulty: string
  roofShape: string
  pitchComplexity: string
  identifiedObstacles: string
  continueToPricing: string
  nextAnswerQuestions: string

  // Questionnaire
  tellUsAboutProject: string
  helpUsProvideAccurate: string
  roofConditions: string
  selectAllThatApply: string
  roofAge: string
  selectRoofAge: string
  roofMaterial: string
  selectRoofMaterial: string
  knownRoofIssues: string
  selectCurrentProblems: string
  propertyAccess: string
  serviceType: string
  servicesInterested: string
  timeline: string
  contactMethod: string
  bestTime: string
  getMyEstimate: string
  nextPersonalizedQuote: string

  // Roof Conditions Options
  treesShading: string
  multipleLevels: string
  skylightsObstacles: string
  steepPitch: string
  easyAccess: string

  // Roof Age Options
  lessThan5: string
  years5to15: string
  years15to25: string
  moreThan25: string
  notSure: string

  // Roof Materials
  asphaltShingles: string
  metal: string
  tile: string
  cedarShakes: string
  slate: string
  membrane: string
  other: string

  // Roof Issues
  leaksWaterDamage: string
  missingShingles: string
  saggingAreas: string
  gutterProblems: string
  iceDamIssues: string
  noKnownIssues: string

  // Property Access
  easyStreetAccess: string
  narrowDriveway: string
  difficultAccess: string

  // Services
  completeReplacement: string
  roofRepair: string
  roofInspection: string
  gutterWork: string
  justEstimates: string

  // Timeline
  urgent: string
  soon: string
  planning: string
  exploring: string

  // Contact
  phone: string
  email: string
  text: string
  morning: string
  afternoon: string
  evening: string
  anytime: string

  // Pricing
  yourRoofingEstimate: string
  basedOnAnalysis: string
  estimatedProjectCost: string
  forRoofIn: string
  importantDisclaimer: string
  disclaimerText: string
  pricingFactors: string
  whatInfluences: string
  whatsIncluded: string
  typicalScope: string
  materialLabor: string
  permitsInspections: string
  cleanupDisposal: string
  basicWarranty: string
  additionalRepairs: string
  readyForQuotes: string
  connectCertified: string
  localContractors: string
  detailedQuotes: string
  compareOptions: string
  connectWithContractors: string
  freeToConnect: string

  // Lead Capture
  connectWithLocal: string
  getDetailedQuotes: string
  yourContactInfo: string
  shareWithQualified: string
  firstName: string
  lastName: string
  emailAddress: string
  phoneNumber: string
  additionalNotes: string
  additionalNotesPlaceholder: string
  agreeToTerms: string
  agreeToContact: string
  connectingContractors: string
  getMyQuotes: string

  // Success
  thankYou: string
  infoSentToContractors: string
  whatHappensNext: string
  contractorsReview: string
  receiveCallsEmails: string
  scheduleAssessments: string
  startAnotherAnalysis: string

  // Project Summary
  projectSummary: string
  property: string
  estimatedCost: string
  services: string

  // Why Our Contractors
  whyOurContractors: string
  licensedInsured: string
  verifiedReviews: string
  localExpertise: string
  competitivePricing: string
  needHelp: string
  callUsAt: string

  // Stats
  roofsAnalyzed: string
  certifiedContractors: string
  provincesCovered: string
  averageRating: string

  // CTA
  readyForQuote: string
  joinThousands: string
  startFreeAnalysis: string

  // Footer
  footerDescription: string
  coverage: string
  support: string
  helpCenter: string
  contactUs: string
  privacyPolicy: string
  termsOfService: string
  allRightsReserved: string

  // Complexity levels
  simple: string
  moderate: string
  complex: string

  // Access difficulty
  easy: string
  difficult: string

  // Loading states
  analyzingRoof: string
  processingSatellite: string
  mayTakeMoments: string
  calculatingEstimate: string
  analyzingComplexity: string
  applyingRates: string

  // Errors
  unableToAnalyze: string
  tryDifferentAddress: string
  errorSubmitting: string
  tryAgain: string
  retry: string
}

export const translations: Record<Language, Translations> = {
  fr: {
    // Navigation & Header
    backToHome: "Retour à l'accueil",
    howItWorks: "Comment ça fonctionne",

    // Hero Section
    heroTitle: "Obtenez votre soumission de toiture en 60 secondes",
    heroSubtitle: "L'analyse de toit alimentée par l'IA vous connecte avec des entrepreneurs locaux certifiés instantanément. Obtenez des estimations de prix en minutes, pas en jours.",
    enterAddress: "Entrez l'adresse de votre propriété",
    addressPlaceholder: "Entrez votre adresse",
    getFreeAnalysis: "Obtenez votre analyse gratuite",
    noSignupRequired: "Aucune inscription requise • Analyse gratuite • Connectez-vous avec des entrepreneurs locaux",
    poweredBy: "Alimenté par l'API Google Solar",
    servingCanada: "Au service de toutes les provinces canadiennes",

    // How It Works
    howItWorksTitle: "Comment ça fonctionne",
    howItWorksSubtitle: "Obtenez votre soumission de toiture en 4 étapes simples",
    step1Title: "Entrez votre adresse",
    step1Description: "Saisissez simplement l'adresse de votre propriété pour commencer l'analyse.",
    step2Title: "Répondez aux questions rapides",
    step2Description: "Parlez-nous de l'état de votre toit, de l'accès et de votre échéancier.",
    step3Title: "Obtenez des estimations instantanées",
    step3Description: "Recevez des prix basés sur la complexité de votre toit et les tarifs locaux.",
    step4Title: "Connectez-vous avec des entrepreneurs",
    step4Description: "Soyez jumelé avec des entrepreneurs locaux certifiés pour des soumissions détaillées.",

    // Features
    featuresTitle: "Pourquoi choisir Soumission Toiture AI?",
    featuresSubtitle: "La façon la plus intelligente de se connecter avec des entrepreneurs en toiture au Canada",
    aiAnalysisTitle: "Analyse de toit alimentée par l'IA",
    aiAnalysisDescription: "L'imagerie satellite avancée et l'API Google Solar fournissent des mesures détaillées et une évaluation de la complexité.",
    instantPricingTitle: "Estimations de prix instantanées",
    instantPricingDescription: "Obtenez des prix basés sur les tarifs du marché canadien, la complexité du toit et les facteurs régionaux.",
    certifiedContractorsTitle: "Entrepreneurs certifiés",
    certifiedContractorsDescription: "Connectez-vous avec des entrepreneurs en toiture présélectionnés et licenciés avec des avis vérifiés.",
    securePrivateTitle: "Sécurisé et privé",
    securePrivateDescription: "Vos informations sont protégées et partagées uniquement avec les entrepreneurs que vous choisissez.",
    saveTimeTitle: "Économisez du temps",
    saveTimeDescription: "Évitez les appels téléphoniques et les visites. Obtenez des soumissions préliminaires en minutes.",
    qualityGuaranteedTitle: "Qualité garantie",
    qualityGuaranteedDescription: "Tous les entrepreneurs sont vérifiés pour les licences, l'assurance et la satisfaction client.",

    // Analysis Results
    analysisCompleteTitle: "Analyse du toit terminée",
    analysisCompleteSubtitle: "Voici ce que nous avons découvert sur votre propriété",
    totalRoofArea: "Surface totale du toit",
    usableArea: "Surface utilisable",
    roofSegments: "Sections de toit",
    complexity: "Complexité",
    squareFeet: "pieds carrés",
    distinctSections: "sections distinctes",
    difficultyLevel: "niveau de difficulté",
    analysisSummaryTitle: "Résumé de l'analyse du toit",
    analysisSummaryDescription: "Basé sur l'imagerie satellite et les données de l'API Google Solar",
    propertyDetails: "Détails de la propriété",
    buildingHeight: "Hauteur du bâtiment",
    accessDifficulty: "Difficulté d'accès",
    roofShape: "Forme du toit",
    pitchComplexity: "Complexité de la pente",
    identifiedObstacles: "Obstacles identifiés",
    continueToPricing: "Continuer pour obtenir une estimation de prix",
    nextAnswerQuestions: "Suivant: Répondez à quelques questions sur votre projet",

    // Questionnaire
    tellUsAboutProject: "Parlez-nous de votre projet",
    helpUsProvideAccurate: "Aidez-nous à fournir des estimations de prix plus précises",
    roofConditions: "Conditions du toit",
    selectAllThatApply: "Sélectionnez tout ce qui s'applique à votre propriété",
    roofAge: "Âge du toit",
    selectRoofAge: "Sélectionnez l'âge du toit",
    roofMaterial: "Matériau du toit",
    selectRoofMaterial: "Sélectionnez le matériau du toit",
    knownRoofIssues: "Problèmes de toit connus",
    selectCurrentProblems: "Sélectionnez les problèmes actuels (optionnel)",
    propertyAccess: "Accès à la propriété",
    serviceType: "Type de service",
    servicesInterested: "Quels services vous intéressent?",
    timeline: "Calendrier",
    contactMethod: "Méthode de contact",
    bestTime: "Meilleur moment",
    getMyEstimate: "Obtenez mon estimation de prix",
    nextPersonalizedQuote: "Suivant: Consultez votre devis de toiture personnalisé",

    // Roof Conditions Options
    treesShading: "Arbres ou bâtiments projetant des ombres sur le toit",
    multipleLevels: "Plusieurs niveaux de toit ou angles complexes",
    skylightsObstacles: "Lucarnes, cheminées ou obstacles sur le toit",
    steepPitch: "Pente de toit raide (plus de 6/12)",
    easyAccess: "Accès facile depuis le niveau de la rue",

    // Roof Age Options
    lessThan5: "Moins de 5 ans",
    years5to15: "5-15 ans",
    years15to25: "15-25 ans",
    moreThan25: "Plus de 25 ans",
    notSure: "Pas sûr",

    // Roof Materials
    asphaltShingles: "Bardeaux d'asphalte",
    metal: "Métal",
    tile: "Tuile",
    cedarShakes: "Bardeaux de cèdre",
    slate: "Ardoise",
    membrane: "Membrane Élastomère",
    other: "Autre",

    // Roof Issues
    leaksWaterDamage: "Fuites ou dégâts d'eau",
    missingShingles: "Bardeaux manquants ou endommagés",
    saggingAreas: "Zones affaissées",
    gutterProblems: "Problèmes de gouttières",
    iceDamIssues: "Problèmes de barrage de glace",
    noKnownIssues: "Aucun problème connu",

    // Property Access
    easyStreetAccess: "Accès facile depuis la rue pour l'équipement",
    narrowDriveway: "Allée étroite ou accès limité",
    difficultAccess: "Accès difficile (rural, fermé, etc.)",

    // Services
    completeReplacement: "Remplacement complet du toit",
    roofRepair: "Réparation de toit",
    roofInspection: "Inspection de toit",
    gutterWork: "Travaux de gouttières",
    justEstimates: "Juste obtenir des estimations",

    // Timeline
    urgent: "Urgent (dans les 2 semaines)",
    soon: "Bientôt (1-3 mois)",
    planning: "Planification (3-6 mois)",
    exploring: "Juste explorer",

    // Contact
    phone: "Téléphone",
    email: "Courriel",
    text: "Texto",
    morning: "Matin",
    afternoon: "Après-midi",
    evening: "Soir",
    anytime: "N'importe quand",

    // Pricing
    yourRoofingEstimate: "Votre estimation de toiture",
    basedOnAnalysis: "Basé sur votre analyse de toit et les détails du projet",
    estimatedProjectCost: "Coût estimé du projet",
    forRoofIn: "pieds carrés de toit en",
    importantDisclaimer: "Avis important:",
    disclaimerText:
      "Il s'agit d'une estimation basée sur l'analyse satellite et vos entrées. Le prix final dépend d'une évaluation détaillée sur site, des choix de matériaux et des conditions actuelles du marché.",
    pricingFactors: "Facteurs de prix",
    whatInfluences: "Ce qui influence votre estimation",
    whatsIncluded: "Ce qui est inclus",
    typicalScope: "Portée typique d'un projet de toiture",
    materialLabor: "Coûts des matériaux et de la main-d'œuvre",
    permitsInspections: "Permis et inspections",
    cleanupDisposal: "Nettoyage et élimination",
    basicWarranty: "Couverture de garantie de base",
    additionalRepairs: "Réparations supplémentaires (si nécessaire)",
    readyForQuotes: "Prêt pour des devis précis?",
    connectCertified: "Connectez-vous avec des entrepreneurs locaux certifiés pour des évaluations détaillées sur site",
    localContractors: "Entrepreneurs locaux",
    detailedQuotes: "Devis détaillés",
    compareOptions: "Comparer les options",
    connectWithContractors: "Connectez-vous avec des entrepreneurs locaux",
    freeToConnect: "Gratuit pour se connecter • Aucune obligation • Vos informations restent privées",

    // Lead Capture
    connectWithLocal: "Connectez-vous avec des entrepreneurs locaux",
    getDetailedQuotes: "Obtenez des devis détaillés de professionnels de la toiture certifiés",
    yourContactInfo: "Vos informations de contact",
    shareWithQualified: "Nous partagerons ceci avec des entrepreneurs qualifiés dans votre région",
    firstName: "Prénom",
    lastName: "Nom de famille",
    emailAddress: "Adresse courriel",
    phoneNumber: "Numéro de téléphone",
    additionalNotes: "Notes supplémentaires (optionnel)",
    additionalNotesPlaceholder: "Toute exigence spécifique, questions ou détails de calendrier...",
    agreeToTerms: "J'accepte les conditions de service et la politique de confidentialité",
    agreeToContact:
      "Je consens à être contacté par des entrepreneurs en toiture par téléphone, courriel ou texto concernant mon projet",
    connectingContractors: "Vous connecter avec des entrepreneurs...",
    getMyQuotes: "Obtenez mes devis",

    // Success
    thankYou: "Merci!",
    infoSentToContractors: "Vos informations ont été envoyées à des entrepreneurs qualifiés dans votre région.",
    whatHappensNext: "Ce qui se passe ensuite:",
    contractorsReview: "Les entrepreneurs examineront les détails de votre projet",
    receiveCallsEmails: "Vous recevrez des appels/courriels dans les 24-48 heures",
    scheduleAssessments: "Planifiez des évaluations sur site pour des devis détaillés",
    startAnotherAnalysis: "Commencer une autre analyse",

    // Project Summary
    projectSummary: "Résumé du projet",
    property: "Propriété",
    estimatedCost: "Coût estimé",
    services: "Services",

    // Why Our Contractors
    whyOurContractors: "Pourquoi nos entrepreneurs?",
    licensedInsured: "Licenciés et assurés",
    verifiedReviews: "Avis vérifiés",
    localExpertise: "Expertise locale",
    competitivePricing: "Prix compétitifs",
    needHelp: "Besoin d'aide?",
    callUsAt: "Appelez-nous au 1-800-ROOF-123 pour obtenir de l'aide avec votre projet",

    // Stats
    roofsAnalyzed: "Toits analysés",
    certifiedContractors: "Entrepreneurs certifiés",
    provincesCovered: "Provinces couvertes",
    averageRating: "Note moyenne",

    // CTA
    readyForQuote: "Prêt à obtenir votre devis de toiture?",
    joinThousands:
      "Rejoignez des milliers de propriétaires canadiens qui ont trouvé leur entrepreneur en toiture parfait",
    startFreeAnalysis: "Commencez votre analyse gratuite",

    // Footer
    footerDescription: "Connecter les propriétaires canadiens avec des entrepreneurs en toiture certifiés depuis 2024.",
    coverage: "Couverture",
    support: "Support",
    helpCenter: "Centre d'aide",
    contactUs: "Contactez-nous",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions de service",
    allRightsReserved: "Tous droits réservés",

    // Complexity levels
    simple: "simple",
    moderate: "modéré",
    complex: "complexe",

    // Access difficulty
    easy: "facile",
    difficult: "difficile",

    // Loading states
    analyzingRoof: "Analyse de votre toit",
    processingSatellite: "Traitement de l'imagerie satellite...",
    mayTakeMoments: "Cela peut prendre quelques instants",
    calculatingEstimate: "Calcul de votre estimation",
    analyzingComplexity: "Analyse de la complexité du toit et des prix régionaux...",
    applyingRates: "Application des tarifs du marché canadien",

    // Errors
    unableToAnalyze: "Impossible d'analyser cette adresse. Veuillez essayer une adresse différente.",
    tryDifferentAddress: "Veuillez vérifier le format de l'adresse et réessayer.",
    errorSubmitting: "Il y a eu une erreur lors de la soumission de vos informations. Veuillez réessayer.",
    tryAgain: "Réessayer",
    retry: "Réessayer",
  },
  en: {
    // Navigation & Header
    backToHome: "Back to Home",
    howItWorks: "How It Works",

    // Hero Section
    heroTitle: "Get Instant Roofing Quotes",
    heroSubtitle:
      "Enter your address to get AI-powered roof analysis and connect with certified local contractors. Get pricing estimates in minutes, not days.",
    enterAddress: "Enter your property address",
    addressPlaceholder: "Enter your address",
    getFreeAnalysis: "Get Free Roof Analysis",
    noSignupRequired: "No signup required • Free analysis • Connect with local contractors",
    poweredBy: "Powered by Google Solar API",
    servingCanada: "Serving all Canadian provinces",

    // How It Works
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Get your roofing quote in 4 simple steps",
    step1Title: "Enter Your Address",
    step1Description: "Simply input your property address to start the roof analysis process.",
    step2Title: "Answer Quick Questions",
    step2Description: "Tell us about your roof condition, access, and project timeline.",
    step3Title: "Get Instant Estimates",
    step3Description: "Receive pricing based on your roof complexity and local rates.",
    step4Title: "Connect with Contractors",
    step4Description: "Get matched with certified local contractors for detailed quotes.",

    // Features
    featuresTitle: "Why Choose RoofQuote Canada?",
    featuresSubtitle: "The smartest way to connect with roofing contractors across Canada",
    aiAnalysisTitle: "AI-Powered Roof Analysis",
    aiAnalysisDescription:
      "Advanced satellite imagery and Google Solar API provide detailed roof measurements and complexity assessment.",
    instantPricingTitle: "Instant Pricing Estimates",
    instantPricingDescription: "Get pricing based on Canadian market rates, roof complexity, and regional factors.",
    certifiedContractorsTitle: "Certified Contractors",
    certifiedContractorsDescription:
      "Connect with pre-screened, licensed roofing contractors in your area with verified reviews.",
    securePrivateTitle: "Secure & Private",
    securePrivateDescription:
      "Your information is protected and only shared with contractors you choose to connect with.",
    saveTimeTitle: "Save Time",
    saveTimeDescription: "Skip the phone calls and site visits. Get preliminary quotes in minutes, not weeks.",
    qualityGuaranteedTitle: "Quality Guaranteed",
    qualityGuaranteedDescription:
      "All contractors are vetted for licensing, insurance, and customer satisfaction ratings.",

    // Analysis Results
    analysisCompleteTitle: "Roof Analysis Complete",
    analysisCompleteSubtitle: "Here's what we found about your property",
    totalRoofArea: "Total Roof Area",
    usableArea: "Usable Area",
    roofSegments: "Roof Segments",
    complexity: "Complexity",
    squareFeet: "square feet",
    distinctSections: "distinct sections",
    difficultyLevel: "difficulty level",
    analysisSummaryTitle: "Roof Analysis Summary",
    analysisSummaryDescription: "Based on satellite imagery and Google Solar API data",
    propertyDetails: "Property Details",
    buildingHeight: "Building Height",
    accessDifficulty: "Access Difficulty",
    roofShape: "Roof Shape",
    pitchComplexity: "Pitch Complexity",
    identifiedObstacles: "Identified Obstacles",
    continueToPricing: "Continue to Get Pricing Estimate",
    nextAnswerQuestions: "Next: Answer a few questions about your project",

    // Questionnaire
    tellUsAboutProject: "Tell Us About Your Project",
    helpUsProvideAccurate: "Help us provide more accurate pricing estimates",
    roofConditions: "Roof Conditions",
    selectAllThatApply: "Select all that apply to your property",
    roofAge: "Roof Age",
    selectRoofAge: "Select roof age",
    roofMaterial: "Roof Material",
    selectRoofMaterial: "Select roof material",
    knownRoofIssues: "Known Roof Issues",
    selectCurrentProblems: "Select any current problems (optional)",
    propertyAccess: "Property Access",
    serviceType: "Service Type",
    servicesInterested: "What services are you interested in?",
    timeline: "Timeline",
    contactMethod: "Contact Method",
    bestTime: "Best Time",
    getMyEstimate: "Get My Pricing Estimate",
    nextPersonalizedQuote: "Next: View your personalized roofing quote",

    // Roof Conditions Options
    treesShading: "Trees or buildings casting shadows on roof",
    multipleLevels: "Multiple roof levels or complex angles",
    skylightsObstacles: "Skylights, chimneys, or roof obstacles",
    steepPitch: "Steep roof pitch (over 6/12)",
    easyAccess: "Easy access from street level",

    // Roof Age Options
    lessThan5: "Less than 5 years",
    years5to15: "5-15 years",
    years15to25: "15-25 years",
    moreThan25: "More than 25 years",
    notSure: "Not sure",

    // Roof Materials
    asphaltShingles: "Asphalt Shingles",
    metal: "Metal",
    tile: "Tile",
    cedarShakes: "Cedar Shakes",
    slate: "Slate",
    membrane: "Elastomeric Membrane",
    other: "Other",

    // Roof Issues
    leaksWaterDamage: "Leaks or water damage",
    missingShingles: "Missing or damaged shingles",
    saggingAreas: "Sagging areas",
    gutterProblems: "Gutter problems",
    iceDamIssues: "Ice dam issues",
    noKnownIssues: "No known issues",

    // Property Access
    easyStreetAccess: "Easy street access for equipment",
    narrowDriveway: "Narrow driveway or limited access",
    difficultAccess: "Difficult access (rural, gated, etc.)",

    // Services
    completeReplacement: "Complete roof replacement",
    roofRepair: "Roof repair",
    roofInspection: "Roof inspection",
    gutterWork: "Gutter work",
    justEstimates: "Just getting estimates",

    // Timeline
    urgent: "Urgent (within 2 weeks)",
    soon: "Soon (1-3 months)",
    planning: "Planning (3-6 months)",
    exploring: "Just exploring",

    // Contact
    phone: "Phone",
    email: "Email",
    text: "Text",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    anytime: "Anytime",

    // Pricing
    yourRoofingEstimate: "Your Roofing Estimate",
    basedOnAnalysis: "Based on your roof analysis and project details",
    estimatedProjectCost: "Estimated Project Cost",
    forRoofIn: "sq ft roof in",
    importantDisclaimer: "Important Disclaimer:",
    disclaimerText:
      "This is an estimate based on satellite analysis and your inputs. Final pricing depends on detailed on-site assessment, material choices, and current market conditions.",
    pricingFactors: "Pricing Factors",
    whatInfluences: "What influences your estimate",
    whatsIncluded: "What's Included",
    typicalScope: "Typical roofing project scope",
    materialLabor: "Material and labor costs",
    permitsInspections: "Permits and inspections",
    cleanupDisposal: "Cleanup and disposal",
    basicWarranty: "Basic warranty coverage",
    additionalRepairs: "Additional repairs (if needed)",
    readyForQuotes: "Ready for Accurate Quotes?",
    connectCertified: "Connect with certified local contractors for detailed, on-site assessments",
    localContractors: "Local Contractors",
    detailedQuotes: "Detailed Quotes",
    compareOptions: "Compare Options",
    connectWithContractors: "Connect with Local Contractors",
    freeToConnect: "Free to connect • No obligation • Your information stays private",

    // Lead Capture
    connectWithLocal: "Connect with Local Contractors",
    getDetailedQuotes: "Get detailed quotes from certified roofing professionals",
    yourContactInfo: "Your Contact Information",
    shareWithQualified: "We'll share this with qualified contractors in your area",
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    additionalNotes: "Additional Notes (Optional)",
    additionalNotesPlaceholder: "Any specific requirements, questions, or timeline details...",
    agreeToTerms: "I agree to the Terms of Service and Privacy Policy",
    agreeToContact: "I consent to be contacted by roofing contractors via phone, email, or text regarding my project",
    connectingContractors: "Connecting You with Contractors...",
    getMyQuotes: "Get My Quotes",

    // Success
    thankYou: "Thank You!",
    infoSentToContractors: "Your information has been sent to qualified contractors in your area.",
    whatHappensNext: "What happens next:",
    contractorsReview: "Contractors will review your project details",
    receiveCallsEmails: "You'll receive calls/emails within 24-48 hours",
    scheduleAssessments: "Schedule on-site assessments for detailed quotes",
    startAnotherAnalysis: "Start Another Analysis",

    // Project Summary
    projectSummary: "Project Summary",
    property: "Property",
    estimatedCost: "Estimated Cost",
    services: "Services",

    // Why Our Contractors
    whyOurContractors: "Why Our Contractors?",
    licensedInsured: "Licensed & Insured",
    verifiedReviews: "Verified Reviews",
    localExpertise: "Local Expertise",
    competitivePricing: "Competitive Pricing",
    needHelp: "Need Help?",
    callUsAt: "Call us at 1-800-ROOF-123 for assistance with your project",

    // Stats
    roofsAnalyzed: "Roofs Analyzed",
    certifiedContractors: "Certified Contractors",
    provincesCovered: "Provinces Covered",
    averageRating: "Average Rating",

    // CTA
    readyForQuote: "Ready to Get Your Roofing Quote?",
    joinThousands: "Join thousands of Canadian homeowners who've found their perfect roofing contractor",
    startFreeAnalysis: "Start Your Free Analysis",

    // Footer
    footerDescription: "Connecting Canadian homeowners with certified roofing contractors since 2024.",
    coverage: "Coverage",
    support: "Support",
    helpCenter: "Help Center",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved",

    // Complexity levels
    simple: "simple",
    moderate: "moderate",
    complex: "complex",

    // Access difficulty
    easy: "easy",
    difficult: "difficult",

    // Loading states
    analyzingRoof: "Analyzing Your Roof",
    processingSatellite: "Processing satellite imagery...",
    mayTakeMoments: "This may take a few moments",
    calculatingEstimate: "Calculating Your Estimate",
    analyzingComplexity: "Analyzing roof complexity and regional pricing...",
    applyingRates: "Applying Canadian market rates",

    // Errors
    unableToAnalyze: "Unable to analyze this address. Please try a different address.",
    tryDifferentAddress: "Please check the address format and try again.",
    errorSubmitting: "There was an error submitting your information. Please try again.",
    tryAgain: "Try Again",
    retry: "Retry",
  },
}

export function useTranslation(language: Language = "fr") {
  return translations[language]
}
