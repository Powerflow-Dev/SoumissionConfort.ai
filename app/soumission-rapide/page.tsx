import type { Metadata } from "next"
import { SoumissionRapideLandingGeneric } from "./landing-generic"

export const metadata: Metadata = {
  title: "Soumission Isolation Gratuite | 3 Soumissions d'Entrepreneurs Certifiés RBQ",
  description: "Comparez 3 soumissions d'entrepreneurs en isolation certifiés RBQ au Québec. Service gratuit, entrepreneurs vérifiés et interviewés par notre équipe. Réponse en moins de 48h.",
  openGraph: {
    title: "Soumission Isolation Gratuite | 3 Soumissions d'Entrepreneurs Certifiés RBQ",
    description: "Comparez 3 soumissions d'entrepreneurs en isolation certifiés RBQ au Québec.",
    url: "https://soumissionconfort.com/soumission-rapide",
    siteName: "Soumission Confort",
    locale: "fr_CA",
    type: "website",
  },
  alternates: { canonical: "https://soumissionconfort.com/soumission-rapide" },
}

export default function SoumissionRapideGenericPage() {
  return <SoumissionRapideLandingGeneric />
}
