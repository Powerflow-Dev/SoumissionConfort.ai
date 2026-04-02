export interface Municipality {
  slug: string
  name: string
  region: string
}

export const municipalities: Municipality[] = [
  // Grand Montréal
  { slug: "montreal", name: "Montréal", region: "Grand Montréal" },
  { slug: "laval", name: "Laval", region: "Grand Montréal" },
  { slug: "longueuil", name: "Longueuil", region: "Grand Montréal" },
  { slug: "brossard", name: "Brossard", region: "Grand Montréal" },
  { slug: "terrebonne", name: "Terrebonne", region: "Grand Montréal" },
  { slug: "repentigny", name: "Repentigny", region: "Grand Montréal" },
  { slug: "saint-jean-sur-richelieu", name: "Saint-Jean-sur-Richelieu", region: "Grand Montréal" },
  { slug: "saint-jerome", name: "Saint-Jérôme", region: "Grand Montréal" },
  { slug: "blainville", name: "Blainville", region: "Grand Montréal" },
  { slug: "mirabel", name: "Mirabel", region: "Grand Montréal" },
  { slug: "chateauguay", name: "Châteauguay", region: "Grand Montréal" },
  { slug: "mascouche", name: "Mascouche", region: "Grand Montréal" },
  { slug: "saint-eustache", name: "Saint-Eustache", region: "Grand Montréal" },
  { slug: "vaudreuil-dorion", name: "Vaudreuil-Dorion", region: "Grand Montréal" },
  { slug: "boucherville", name: "Boucherville", region: "Grand Montréal" },
  { slug: "boisbriand", name: "Boisbriand", region: "Grand Montréal" },
  { slug: "sainte-julie", name: "Sainte-Julie", region: "Grand Montréal" },
  { slug: "chambly", name: "Chambly", region: "Grand Montréal" },
  { slug: "saint-constant", name: "Saint-Constant", region: "Grand Montréal" },
  { slug: "la-prairie", name: "La Prairie", region: "Grand Montréal" },
  { slug: "candiac", name: "Candiac", region: "Grand Montréal" },
  { slug: "valleyfield", name: "Salaberry-de-Valleyfield", region: "Grand Montréal" },

  // Grand Québec
  { slug: "quebec", name: "Québec", region: "Grand Québec" },
  { slug: "levis", name: "Lévis", region: "Grand Québec" },

  // Autres régions
  { slug: "gatineau", name: "Gatineau", region: "Outaouais" },
  { slug: "sherbrooke", name: "Sherbrooke", region: "Estrie" },
  { slug: "saguenay", name: "Saguenay", region: "Saguenay-Lac-Saint-Jean" },
  { slug: "trois-rivieres", name: "Trois-Rivières", region: "Mauricie" },
  { slug: "drummondville", name: "Drummondville", region: "Centre-du-Québec" },
  { slug: "granby", name: "Granby", region: "Estrie" },
  { slug: "saint-hyacinthe", name: "Saint-Hyacinthe", region: "Montérégie" },
  { slug: "shawinigan", name: "Shawinigan", region: "Mauricie" },
  { slug: "rimouski", name: "Rimouski", region: "Bas-Saint-Laurent" },
  { slug: "victoriaville", name: "Victoriaville", region: "Centre-du-Québec" },
  { slug: "sorel-tracy", name: "Sorel-Tracy", region: "Montérégie" },
  { slug: "joliette", name: "Joliette", region: "Lanaudière" },
  { slug: "alma", name: "Alma", region: "Saguenay-Lac-Saint-Jean" },
  { slug: "magog", name: "Magog", region: "Estrie" },
  { slug: "saint-georges", name: "Saint-Georges", region: "Chaudière-Appalaches" },
  { slug: "thetford-mines", name: "Thetford Mines", region: "Chaudière-Appalaches" },
]

export function getMunicipalityBySlug(slug: string): Municipality | undefined {
  return municipalities.find((m) => m.slug === slug)
}

export function getAllSlugs(): string[] {
  return municipalities.map((m) => m.slug)
}
