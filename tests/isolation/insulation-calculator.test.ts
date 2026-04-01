/**
 * Tests d'isolation - Calculateur de prix d'isolation d'entretoit
 *
 * 100 cas de test avec des adresses mélangées de :
 *  - Trois-Rivières (TR)  ~34 cas
 *  - Québec (QC)          ~33 cas
 *  - Montréal (MTL)       ~33 cas
 *
 * Validations couvertes :
 *  1. La superficie ajustée est ≥ la superficie brute (multiplicateur de pente ≥ 1)
 *  2. Les coûts min ≤ coûts max pour chaque gamme
 *  3. Les coûts respectent le plancher minimum par projet
 *  4. Les économies annuelles sont positives quand ΔR > 0
 *  5. La période de retour est positive et cohérente
 *  6. Les économies sur 25 ans sont ≥ économies annuelles * 25
 *  7. La gamme premium coûte toujours plus que l'économique
 *  8. La gamme premium génère plus d'économies que l'économique
 *  9. formatPrice retourne une chaîne en dollars canadiens
 * 10. formatPercentage retourne une chaîne terminant par '%'
 */

import { describe, it, expect } from 'vitest'
import {
  calculateInsulationPricing,
  formatPrice,
  formatPercentage,
} from '../../lib/insulation-calculator'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type HeatingSystem = 'electricite' | 'bi-energie' | 'gaz' | 'mazout' | 'eau-chaude' | 'autre'
type InsulationLevel = 'aucune' | 'partielle' | 'complete' | 'recente' | 'inconnue'
type AtticAccess = 'facile' | 'trappe' | 'difficile' | 'aucun' | 'inconnue'

interface TestCase {
  id: number
  ville: string
  adresse: string
  roofArea: number
  roofPitch: number
  currentInsulation: InsulationLevel
  atticAccess: AtticAccess
  heatingSystem: HeatingSystem
  identifiedProblems: string[]
}

// ---------------------------------------------------------------------------
// Données de test : 100 adresses mélangées (Trois-Rivières / Québec / Montréal)
// ---------------------------------------------------------------------------
const TEST_CASES: TestCase[] = [
  // ── TROIS-RIVIÈRES (cases 1-34) ──────────────────────────────────────────
  { id: 1,  ville: 'Trois-Rivières', adresse: '1450 boul. des Forges, Trois-Rivières, QC G8Z 1W3',       roofArea: 1100, roofPitch: 18, currentInsulation: 'aucune',    atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 2,  ville: 'Trois-Rivières', adresse: '2315 rue Laviolette, Trois-Rivières, QC G8T 6G4',         roofArea: 900,  roofPitch: 25, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['courants-air'] },
  { id: 3,  ville: 'Trois-Rivières', adresse: '560 rue Notre-Dame Centre, Trois-Rivières, QC G9A 1L3',   roofArea: 1250, roofPitch: 12, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: ['factures-elevees'] },
  { id: 4,  ville: 'Trois-Rivières', adresse: '3780 rue Ste-Marguerite, Trois-Rivières, QC G8Z 2G8',     roofArea: 1400, roofPitch: 35, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'mazout',      identifiedProblems: ['moisissure'] },
  { id: 5,  ville: 'Trois-Rivières', adresse: '875 boul. du Carmel, Trois-Rivières, QC G8Z 3R9',         roofArea: 1600, roofPitch: 22, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['glace'] },
  { id: 6,  ville: 'Trois-Rivières', adresse: '410 rue des Ursulines, Trois-Rivières, QC G9A 5C8',       roofArea: 800,  roofPitch: 45, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'electricite', identifiedProblems: ['pas-trappe', 'courants-air'] },
  { id: 7,  ville: 'Trois-Rivières', adresse: '2050 rue Principale, Cap-de-la-Madeleine, QC G8T 5J7',    roofArea: 1050, roofPitch: 30, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'eau-chaude',  identifiedProblems: [] },
  { id: 8,  ville: 'Trois-Rivières', adresse: '155 rue St-Philippe, Trois-Rivières, QC G9A 3Z5',         roofArea: 950,  roofPitch: 15, currentInsulation: 'recente',   atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 9,  ville: 'Trois-Rivières', adresse: '3400 boul. des Récollets, Trois-Rivières, QC G8Z 4J4',    roofArea: 1300, roofPitch: 28, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['temperature-inegale'] },
  { id: 10, ville: 'Trois-Rivières', adresse: '695 rue des Prairies, Trois-Rivières, QC G8Y 3X2',        roofArea: 1750, roofPitch: 40, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'gaz',         identifiedProblems: ['vermiculite'] },
  { id: 11, ville: 'Trois-Rivières', adresse: '222 boul. Thibeau, Trois-Rivières, QC G8T 2S4',           roofArea: 1020, roofPitch: 20, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'electricite', identifiedProblems: ['courants-air', 'glace'] },
  { id: 12, ville: 'Trois-Rivières', adresse: '1888 rue Sherbrooke, Trois-Rivières, QC G8Y 1L1',         roofArea: 1180, roofPitch: 33, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'mazout',      identifiedProblems: ['factures-elevees'] },
  { id: 13, ville: 'Trois-Rivières', adresse: '4450 rue des Ormes, Trois-Rivières, QC G8Z 4N5',          roofArea: 2000, roofPitch: 50, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'eau-chaude',  identifiedProblems: ['moisissure', 'courants-air'] },
  { id: 14, ville: 'Trois-Rivières', adresse: '330 rue St-François-Xavier, Trois-Rivières, QC G9A 3H6',  roofArea: 850,  roofPitch: 10, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 15, ville: 'Trois-Rivières', adresse: '1650 rue Rolland-Brunelle, Trois-Rivières, QC G8Y 4T8',   roofArea: 1350, roofPitch: 26, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['glace', 'courants-air'] },
  { id: 16, ville: 'Trois-Rivières', adresse: '2700 boul. Ste-Madeleine, Trois-Rivières, QC G8T 6M3',    roofArea: 1100, roofPitch: 38, currentInsulation: 'inconnue',  atticAccess: 'difficile', heatingSystem: 'bi-energie',  identifiedProblems: ['vermiculite', 'moisissure'] },
  { id: 17, ville: 'Trois-Rivières', adresse: '910 rue Champflour, Cap-de-la-Madeleine, QC G8T 1P9',     roofArea: 1450, roofPitch: 22, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: ['factures-elevees'] },
  { id: 18, ville: 'Trois-Rivières', adresse: '480 rue des Commissaires O., Trois-Rivières, QC G9A 5A6', roofArea: 700,  roofPitch: 42, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'autre',       identifiedProblems: ['pas-trappe'] },
  { id: 19, ville: 'Trois-Rivières', adresse: '1230 boul. Fusey, Trois-Rivières, QC G8Z 2P1',            roofArea: 1580, roofPitch: 18, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'mazout',      identifiedProblems: ['temperature-inegale', 'glace'] },
  { id: 20, ville: 'Trois-Rivières', adresse: '3100 rue Ste-Cécile, Trois-Rivières, QC G8Z 3W5',         roofArea: 1200, roofPitch: 29, currentInsulation: 'recente',   atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 21, ville: 'Trois-Rivières', adresse: '570 rue Hertel, Trois-Rivières, QC G9A 2K9',              roofArea: 1650, roofPitch: 55, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'gaz',         identifiedProblems: ['moisissure'] },
  { id: 22, ville: 'Trois-Rivières', adresse: '2860 boul. des Chenaux, Trois-Rivières, QC G8Y 6B7',      roofArea: 980,  roofPitch: 14, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: ['courants-air'] },
  { id: 23, ville: 'Trois-Rivières', adresse: '1010 rue Ste-Julie, Trois-Rivières, QC G8T 3N2',          roofArea: 1100, roofPitch: 32, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['glace'] },
  { id: 24, ville: 'Trois-Rivières', adresse: '4200 rue de Bruyère, Trois-Rivières, QC G8Z 4E8',         roofArea: 1900, roofPitch: 48, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'eau-chaude',  identifiedProblems: ['vermiculite', 'courants-air'] },
  { id: 25, ville: 'Trois-Rivières', adresse: '760 rue des Augustines, Trois-Rivières, QC G9A 5G3',      roofArea: 1300, roofPitch: 20, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 26, ville: 'Trois-Rivières', adresse: '3550 boul. Gene-H-Kruger, Trois-Rivières, QC G9A 4N2',    roofArea: 1450, roofPitch: 36, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['factures-elevees', 'temperature-inegale'] },
  { id: 27, ville: 'Trois-Rivières', adresse: '825 rue du Fleuve, Trois-Rivières, QC G9A 2G6',           roofArea: 1050, roofPitch: 24, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'mazout',      identifiedProblems: ['moisissure', 'glace'] },
  { id: 28, ville: 'Trois-Rivières', adresse: '2430 rue Boisseau, Trois-Rivières, QC G8Y 3P4',           roofArea: 1750, roofPitch: 16, currentInsulation: 'inconnue',  atticAccess: 'facile',    heatingSystem: 'bi-energie',  identifiedProblems: [] },
  { id: 29, ville: 'Trois-Rivières', adresse: '330 rue des Plaines, Trois-Rivières, QC G8T 2H8',         roofArea: 900,  roofPitch: 44, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'electricite', identifiedProblems: ['pas-trappe', 'vermiculite'] },
  { id: 30, ville: 'Trois-Rivières', adresse: '1720 rue Garneau, Trois-Rivières, QC G8Z 1S5',            roofArea: 1150, roofPitch: 27, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'eau-chaude',  identifiedProblems: ['courants-air'] },
  { id: 31, ville: 'Trois-Rivières', adresse: '4880 boul. des Prairies, Trois-Rivières, QC G8Y 5K2',     roofArea: 2100, roofPitch: 52, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'gaz',         identifiedProblems: ['moisissure', 'courants-air', 'glace'] },
  { id: 32, ville: 'Trois-Rivières', adresse: '640 rue Champplain, Trois-Rivières, QC G9A 1Z3',          roofArea: 1000, roofPitch: 19, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 33, ville: 'Trois-Rivières', adresse: '1310 rue Ste-Angèle, Trois-Rivières, QC G9A 3T7',         roofArea: 1250, roofPitch: 31, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['temperature-inegale'] },
  { id: 34, ville: 'Trois-Rivières', adresse: '2970 boul. des Hêtres, Trois-Rivières, QC G8Z 4V1',       roofArea: 1480, roofPitch: 23, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'mazout',      identifiedProblems: ['factures-elevees'] },

  // ── QUÉBEC (cases 35-67) ─────────────────────────────────────────────────
  { id: 35, ville: 'Québec', adresse: '420 Grande Allée Est, Québec, QC G1R 2J3',                        roofArea: 1200, roofPitch: 20, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 36, ville: 'Québec', adresse: '1050 boul. Laurier, Québec, QC G1V 3N8',                          roofArea: 1550, roofPitch: 30, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['courants-air', 'glace'] },
  { id: 37, ville: 'Québec', adresse: '3280 chemin Ste-Foy, Sainte-Foy, QC G1X 1S6',                    roofArea: 1800, roofPitch: 25, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['moisissure'] },
  { id: 38, ville: 'Québec', adresse: '225 rue St-Joseph Est, Québec, QC G1K 3A8',                       roofArea: 850,  roofPitch: 45, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'electricite', identifiedProblems: ['vermiculite', 'courants-air'] },
  { id: 39, ville: 'Québec', adresse: '4490 boul. des Galeries, Québec, QC G1P 1A2',                     roofArea: 1650, roofPitch: 18, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'mazout',      identifiedProblems: [] },
  { id: 40, ville: 'Québec', adresse: '789 avenue Myrand, Sainte-Foy, QC G1V 2V2',                       roofArea: 1000, roofPitch: 35, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['factures-elevees', 'temperature-inegale'] },
  { id: 41, ville: 'Québec', adresse: '1700 chemin Quatre-Bourgeois, Québec, QC G1W 2L2',                roofArea: 1350, roofPitch: 28, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'electricite', identifiedProblems: ['pas-trappe'] },
  { id: 42, ville: 'Québec', adresse: '630 rue de la Couronne, Québec, QC G1K 6E4',                      roofArea: 950,  roofPitch: 15, currentInsulation: 'recente',   atticAccess: 'facile',    heatingSystem: 'eau-chaude',  identifiedProblems: [] },
  { id: 43, ville: 'Québec', adresse: '2550 boul. Wilfrid-Hamel, Québec, QC G1P 2J1',                    roofArea: 1200, roofPitch: 40, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['glace', 'courants-air'] },
  { id: 44, ville: 'Québec', adresse: '510 rue de la Reine, Lévis, QC G6V 1A5',                          roofArea: 1100, roofPitch: 22, currentInsulation: 'inconnue',  atticAccess: 'difficile', heatingSystem: 'electricite', identifiedProblems: ['moisissure'] },
  { id: 45, ville: 'Québec', adresse: '3100 boul. Lebourgneuf, Québec, QC G2K 2E4',                      roofArea: 2000, roofPitch: 50, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'gaz',         identifiedProblems: ['vermiculite', 'moisissure'] },
  { id: 46, ville: 'Québec', adresse: '1890 avenue Belvédère, Québec, QC G1S 3V9',                       roofArea: 1400, roofPitch: 33, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: ['factures-elevees'] },
  { id: 47, ville: 'Québec', adresse: '445 rue d\'Estimauville, Beauport, QC G1E 5J4',                   roofArea: 1050, roofPitch: 19, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'mazout',      identifiedProblems: [] },
  { id: 48, ville: 'Québec', adresse: '2200 avenue Chapdelaine, Québec, QC G1J 3J3',                     roofArea: 1750, roofPitch: 48, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'autre',       identifiedProblems: ['pas-trappe', 'glace'] },
  { id: 49, ville: 'Québec', adresse: '670 rue St-Vallier Ouest, Québec, QC G1K 1K4',                    roofArea: 900,  roofPitch: 26, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'electricite', identifiedProblems: ['courants-air'] },
  { id: 50, ville: 'Québec', adresse: '3780 chemin de la Canardière, Québec, QC G1J 2H3',                roofArea: 1300, roofPitch: 38, currentInsulation: 'partielle', atticAccess: 'difficile', heatingSystem: 'bi-energie',  identifiedProblems: ['temperature-inegale'] },
  { id: 51, ville: 'Québec', adresse: '555 boul. du Versant Nord, Québec, QC G1N 4G7',                   roofArea: 1600, roofPitch: 16, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'gaz',         identifiedProblems: [] },
  { id: 52, ville: 'Québec', adresse: '2980 boul. Père-Lelièvre, Québec, QC G1P 3V6',                    roofArea: 1150, roofPitch: 30, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'electricite', identifiedProblems: ['moisissure', 'courants-air'] },
  { id: 53, ville: 'Québec', adresse: '1220 côte d\'Abraham, Québec, QC G1R 1A3',                        roofArea: 780,  roofPitch: 55, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'mazout',      identifiedProblems: ['vermiculite'] },
  { id: 54, ville: 'Québec', adresse: '4100 boul. des Chutes, Québec, QC G2C 2G7',                       roofArea: 1850, roofPitch: 24, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'eau-chaude',  identifiedProblems: ['glace'] },
  { id: 55, ville: 'Québec', adresse: '305 rue des Sœurs, Lévis, QC G6V 6B8',                            roofArea: 1000, roofPitch: 42, currentInsulation: 'recente',   atticAccess: 'trappe',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 56, ville: 'Québec', adresse: '1560 rue de la Pointe-aux-Lièvres, Québec, QC G1L 4K2',           roofArea: 1250, roofPitch: 27, currentInsulation: 'inconnue',  atticAccess: 'facile',    heatingSystem: 'bi-energie',  identifiedProblems: ['courants-air', 'factures-elevees'] },
  { id: 57, ville: 'Québec', adresse: '870 avenue Holland, Québec, QC G1S 3T3',                          roofArea: 1700, roofPitch: 36, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'gaz',         identifiedProblems: ['moisissure', 'glace'] },
  { id: 58, ville: 'Québec', adresse: '2460 chemin St-Louis, Sainte-Foy, QC G1T 1P8',                    roofArea: 1400, roofPitch: 20, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 59, ville: 'Québec', adresse: '695 boul. des Chutes, Beauport, QC G1C 3J6',                      roofArea: 1100, roofPitch: 32, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'autre',       identifiedProblems: ['temperature-inegale'] },
  { id: 60, ville: 'Québec', adresse: '3450 boul. de l\'Ormière, Québec, QC G2B 3R4',                    roofArea: 1950, roofPitch: 46, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'mazout',      identifiedProblems: ['pas-trappe', 'vermiculite', 'moisissure'] },
  { id: 61, ville: 'Québec', adresse: '1040 rue St-Jean, Québec, QC G1R 1S1',                            roofArea: 720,  roofPitch: 14, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 62, ville: 'Québec', adresse: '2860 avenue des Braves, Sainte-Foy, QC G1W 2H8',                  roofArea: 1550, roofPitch: 29, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['glace'] },
  { id: 63, ville: 'Québec', adresse: '480 boul. René-Lévesque Est, Québec, QC G1R 2B5',                 roofArea: 1000, roofPitch: 50, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'gaz',         identifiedProblems: ['courants-air'] },
  { id: 64, ville: 'Québec', adresse: '1680 avenue Galilée, Québec, QC G1P 3R8',                         roofArea: 1350, roofPitch: 18, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: ['factures-elevees'] },
  { id: 65, ville: 'Québec', adresse: '3050 rue de la Promenade, Sainte-Foy, QC G1X 4B2',                roofArea: 1600, roofPitch: 34, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'eau-chaude',  identifiedProblems: ['moisissure'] },
  { id: 66, ville: 'Québec', adresse: '950 rue du Roi, Lévis, QC G6V 2V5',                               roofArea: 880,  roofPitch: 22, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['courants-air', 'glace'] },
  { id: 67, ville: 'Québec', adresse: '1750 chemin de la Suête, Québec, QC G2L 1A1',                     roofArea: 1420, roofPitch: 40, currentInsulation: 'inconnue',  atticAccess: 'difficile', heatingSystem: 'electricite', identifiedProblems: ['vermiculite'] },

  // ── MONTRÉAL (cases 68-100) ──────────────────────────────────────────────
  { id: 68, ville: 'Montréal', adresse: '4530 avenue du Parc, Montréal, QC H2V 4E3',                     roofArea: 1100, roofPitch: 18, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['courants-air'] },
  { id: 69, ville: 'Montréal', adresse: '2800 boul. Rosemont, Montréal, QC H1Y 1K1',                     roofArea: 1350, roofPitch: 28, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'electricite', identifiedProblems: ['moisissure', 'glace'] },
  { id: 70, ville: 'Montréal', adresse: '1455 boul. de Maisonneuve O., Montréal, QC H3G 1M8',            roofArea: 950,  roofPitch: 22, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'eau-chaude',  identifiedProblems: [] },
  { id: 71, ville: 'Montréal', adresse: '8255 boul. Décarie, Montréal, QC H4P 2H6',                      roofArea: 1800, roofPitch: 40, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'gaz',         identifiedProblems: ['pas-trappe', 'vermiculite'] },
  { id: 72, ville: 'Montréal', adresse: '3590 rue Jarry Est, Montréal, QC H1Z 2G3',                      roofArea: 1250, roofPitch: 15, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['temperature-inegale'] },
  { id: 73, ville: 'Montréal', adresse: '6780 rue St-Denis, Montréal, QC H2S 2S3',                       roofArea: 1050, roofPitch: 35, currentInsulation: 'inconnue',  atticAccess: 'difficile', heatingSystem: 'electricite', identifiedProblems: ['courants-air', 'factures-elevees'] },
  { id: 74, ville: 'Montréal', adresse: '1920 boul. de l\'Acadie, Montréal, QC H4N 1L6',                 roofArea: 1600, roofPitch: 25, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'mazout',      identifiedProblems: ['moisissure'] },
  { id: 75, ville: 'Montréal', adresse: '5100 avenue Gatineau, Montréal, QC H3V 1E6',                    roofArea: 900,  roofPitch: 48, currentInsulation: 'recente',   atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 76, ville: 'Montréal', adresse: '3310 rue Wellington, Verdun, QC H4G 1V2',                       roofArea: 1400, roofPitch: 20, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['glace'] },
  { id: 77, ville: 'Montréal', adresse: '7540 rue Sherbrooke Est, Montréal, QC H1N 1G3',                 roofArea: 1100, roofPitch: 30, currentInsulation: 'inconnue',  atticAccess: 'facile',    heatingSystem: 'bi-energie',  identifiedProblems: ['courants-air'] },
  { id: 78, ville: 'Montréal', adresse: '2350 boul. Pie-IX, Montréal, QC H1V 2E2',                       roofArea: 2200, roofPitch: 55, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'eau-chaude',  identifiedProblems: ['vermiculite', 'moisissure', 'courants-air'] },
  { id: 79, ville: 'Montréal', adresse: '4690 avenue Christophe-Colomb, Montréal, QC H2J 3H1',           roofArea: 1200, roofPitch: 16, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'gaz',         identifiedProblems: [] },
  { id: 80, ville: 'Montréal', adresse: '1100 avenue Bernard O., Montréal, QC H2V 1V6',                  roofArea: 980,  roofPitch: 38, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'electricite', identifiedProblems: ['moisissure'] },
  { id: 81, ville: 'Montréal', adresse: '5800 boul. Côte-des-Neiges, Montréal, QC H3S 1Z4',              roofArea: 1500, roofPitch: 26, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'mazout',      identifiedProblems: ['factures-elevees', 'glace'] },
  { id: 82, ville: 'Montréal', adresse: '3850 rue Beaubien Est, Montréal, QC H1X 1H7',                   roofArea: 1050, roofPitch: 22, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['temperature-inegale', 'courants-air'] },
  { id: 83, ville: 'Montréal', adresse: '6200 avenue Victoria, Montréal, QC H3W 2N5',                    roofArea: 1300, roofPitch: 44, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'gaz',         identifiedProblems: ['pas-trappe', 'moisissure'] },
  { id: 84, ville: 'Montréal', adresse: '2750 rue Hochelaga, Montréal, QC H1W 1H6',                      roofArea: 850,  roofPitch: 18, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: [] },
  { id: 85, ville: 'Montréal', adresse: '4110 rue Jean-Talon Ouest, Montréal, QC H4P 1V5',               roofArea: 1750, roofPitch: 32, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'autre',       identifiedProblems: ['factures-elevees'] },
  { id: 86, ville: 'Montréal', adresse: '9450 boul. St-Laurent, Montréal, QC H2N 1P2',                   roofArea: 1600, roofPitch: 50, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'eau-chaude',  identifiedProblems: ['vermiculite', 'glace'] },
  { id: 87, ville: 'Montréal', adresse: '550 avenue Querbes, Outremont, QC H2V 3W5',                     roofArea: 1150, roofPitch: 24, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['courants-air'] },
  { id: 88, ville: 'Montréal', adresse: '2300 rue Ontario Est, Montréal, QC H2K 1W8',                    roofArea: 1000, roofPitch: 36, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['moisissure', 'courants-air'] },
  { id: 89, ville: 'Montréal', adresse: '7860 rue St-Hubert, Montréal, QC H2R 2P2',                      roofArea: 1450, roofPitch: 20, currentInsulation: 'partielle', atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: ['glace'] },
  { id: 90, ville: 'Montréal', adresse: '3200 avenue Durocher, Montréal, QC H2X 2E3',                    roofArea: 800,  roofPitch: 42, currentInsulation: 'recente',   atticAccess: 'facile',    heatingSystem: 'gaz',         identifiedProblems: [] },
  { id: 91, ville: 'Montréal', adresse: '5560 boul. Henri-Bourassa Est, Montréal, QC H1G 2T3',           roofArea: 1900, roofPitch: 28, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'mazout',      identifiedProblems: ['factures-elevees', 'moisissure'] },
  { id: 92, ville: 'Montréal', adresse: '1240 rue St-Zotique Est, Montréal, QC H2S 1M1',                 roofArea: 1100, roofPitch: 46, currentInsulation: 'inconnue',  atticAccess: 'trappe',    heatingSystem: 'electricite', identifiedProblems: ['courants-air', 'glace'] },
  { id: 93, ville: 'Montréal', adresse: '6010 rue Sherbrooke Ouest, Montréal, QC H4B 1L5',               roofArea: 1650, roofPitch: 14, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'bi-energie',  identifiedProblems: [] },
  { id: 94, ville: 'Montréal', adresse: '4300 boul. Gouin Est, Montréal, QC H1H 1A7',                    roofArea: 2000, roofPitch: 52, currentInsulation: 'aucune',    atticAccess: 'aucun',     heatingSystem: 'autre',       identifiedProblems: ['pas-trappe', 'vermiculite', 'moisissure'] },
  { id: 95, ville: 'Montréal', adresse: '1680 avenue Van Horne, Montréal, QC H2V 1L4',                   roofArea: 950,  roofPitch: 22, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'gaz',         identifiedProblems: ['temperature-inegale'] },
  { id: 96, ville: 'Montréal', adresse: '3460 rue Bellechasse, Montréal, QC H1X 1K1',                    roofArea: 1250, roofPitch: 34, currentInsulation: 'aucune',    atticAccess: 'difficile', heatingSystem: 'electricite', identifiedProblems: ['courants-air', 'factures-elevees'] },
  { id: 97, ville: 'Montréal', adresse: '8800 rue Pascal-Gagnon, Montréal, QC H1P 1Z3',                  roofArea: 1500, roofPitch: 26, currentInsulation: 'inconnue',  atticAccess: 'facile',    heatingSystem: 'eau-chaude',  identifiedProblems: ['glace'] },
  { id: 98, ville: 'Montréal', adresse: '2180 rue de Verdun, Verdun, QC H4G 1J8',                        roofArea: 1150, roofPitch: 38, currentInsulation: 'partielle', atticAccess: 'trappe',    heatingSystem: 'mazout',      identifiedProblems: ['moisissure'] },
  { id: 99, ville: 'Montréal', adresse: '5050 chemin Queen-Mary, Montréal, QC H3W 1W4',                  roofArea: 1350, roofPitch: 18, currentInsulation: 'aucune',    atticAccess: 'trappe',    heatingSystem: 'bi-energie',  identifiedProblems: ['courants-air', 'glace'] },
  { id: 100, ville: 'Montréal', adresse: '340 rue de Castelnau Est, Montréal, QC H2R 1P6',               roofArea: 1050, roofPitch: 30, currentInsulation: 'complete',  atticAccess: 'facile',    heatingSystem: 'electricite', identifiedProblems: ['factures-elevees'] },
]

// ---------------------------------------------------------------------------
// Constantes (miroir des minimums dans le calculateur)
// ---------------------------------------------------------------------------
const MIN_COSTS = { economique: 1500, standard: 2000, premium: 3500 }

// ---------------------------------------------------------------------------
// Suite principale
// ---------------------------------------------------------------------------
describe('Calculateur d\'isolation – 100 adresses québécoises', () => {

  // ── 1. Superficie ajustée ─────────────────────────────────────────────────
  describe('1. Superficie ajustée (pitchMultiplier ≥ 1)', () => {
    TEST_CASES.forEach(tc => {
      it(`[#${tc.id}] ${tc.ville} – ${tc.roofArea} pi² pente ${tc.roofPitch}°`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        expect(result.adjustedArea).toBeGreaterThanOrEqual(tc.roofArea)
      })
    })
  })

  // ── 2. Cohérence min/max des coûts ────────────────────────────────────────
  describe('2. Coûts min ≤ max pour chaque gamme', () => {
    TEST_CASES.forEach(tc => {
      it(`[#${tc.id}] ${tc.ville}`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        expect(result.ranges.economique.totalCost.min).toBeLessThanOrEqual(result.ranges.economique.totalCost.max)
        expect(result.ranges.standard.totalCost.min).toBeLessThanOrEqual(result.ranges.standard.totalCost.max)
        expect(result.ranges.premium.totalCost.min).toBeLessThanOrEqual(result.ranges.premium.totalCost.max)
      })
    })
  })

  // ── 3. Respect des coûts minimums ─────────────────────────────────────────
  describe('3. Coûts ≥ plancher minimum du projet', () => {
    TEST_CASES.forEach(tc => {
      it(`[#${tc.id}] ${tc.ville}`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        expect(result.ranges.economique.totalCost.min).toBeGreaterThanOrEqual(MIN_COSTS.economique)
        expect(result.ranges.standard.totalCost.min).toBeGreaterThanOrEqual(MIN_COSTS.standard)
        expect(result.ranges.premium.totalCost.min).toBeGreaterThanOrEqual(MIN_COSTS.premium)
      })
    })
  })

  // ── 4. Économies annuelles positives ──────────────────────────────────────
  describe('4. Économies annuelles > 0 quand ΔR > 0', () => {
    TEST_CASES.filter(tc => tc.currentInsulation !== 'recente').forEach(tc => {
      it(`[#${tc.id}] ${tc.ville} – chauffage: ${tc.heatingSystem}`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        expect(result.ranges.economique.annualSavings.min).toBeGreaterThan(0)
        expect(result.ranges.standard.annualSavings.min).toBeGreaterThan(0)
        expect(result.ranges.premium.annualSavings.min).toBeGreaterThan(0)
      })
    })
  })

  // ── 5. Période de retour positive ─────────────────────────────────────────
  describe('5. Période de retour > 0', () => {
    TEST_CASES.filter(tc => tc.currentInsulation !== 'recente').forEach(tc => {
      it(`[#${tc.id}] ${tc.ville}`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        expect(result.ranges.economique.paybackPeriod.min).toBeGreaterThan(0)
        expect(result.ranges.standard.paybackPeriod.min).toBeGreaterThan(0)
        expect(result.ranges.premium.paybackPeriod.min).toBeGreaterThan(0)
      })
    })
  })

  // ── 6. Économies 25 ans cohérentes ────────────────────────────────────────
  describe('6. Économies 25 ans = économies annuelles × 25', () => {
    TEST_CASES.filter(tc => tc.currentInsulation !== 'recente').forEach(tc => {
      it(`[#${tc.id}] ${tc.ville}`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        const r = result.ranges.economique
        expect(r.savings25Years.min).toBeCloseTo(r.annualSavings.min * 25, 0)
        expect(r.savings25Years.max).toBeCloseTo(r.annualSavings.max * 25, 0)
      })
    })
  })

  // ── 7. Premium plus cher que économique ───────────────────────────────────
  describe('7. Coût premium > coût économique', () => {
    TEST_CASES.forEach(tc => {
      it(`[#${tc.id}] ${tc.ville}`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        expect(result.ranges.premium.totalCost.min).toBeGreaterThan(result.ranges.economique.totalCost.min)
      })
    })
  })

  // ── 8. Premium génère plus d'économies que économique ─────────────────────
  describe('8. Économies annuelles premium > économique', () => {
    TEST_CASES.filter(tc => tc.currentInsulation !== 'recente').forEach(tc => {
      it(`[#${tc.id}] ${tc.ville}`, () => {
        const result = calculateInsulationPricing({
          roofArea: tc.roofArea,
          roofPitch: tc.roofPitch,
          currentInsulation: tc.currentInsulation,
          atticAccess: tc.atticAccess,
          heatingSystem: tc.heatingSystem,
          identifiedProblems: tc.identifiedProblems,
        })
        expect(result.ranges.premium.annualSavings.min).toBeGreaterThanOrEqual(result.ranges.economique.annualSavings.min)
      })
    })
  })

  // ── 9. formatPrice ────────────────────────────────────────────────────────
  describe('9. formatPrice – format dollar canadien', () => {
    const prices = [0, 500, 1500, 2000, 3500, 5000, 10000, 25000]
    prices.forEach(p => {
      it(`formatPrice(${p}) contient '$'`, () => {
        const formatted = formatPrice(p)
        expect(typeof formatted).toBe('string')
        expect(formatted).toMatch(/\$/)
      })
    })
  })

  // ── 10. formatPercentage ──────────────────────────────────────────────────
  describe('10. formatPercentage – se termine par "%"', () => {
    const values = [0, 5, 10, 15, 25, 40, 100]
    values.forEach(v => {
      it(`formatPercentage(${v}) = "${v}%"`, () => {
        const formatted = formatPercentage(v)
        expect(formatted).toBe(`${v}%`)
      })
    })
  })

})
