"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Phone, Clock, BadgeCheck, Lock, Zap, Heart, ArrowRight, Home, Users, FileText, Star } from "lucide-react"

declare global {
  interface Window {
    fbq: (...args: any[]) => void
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface LeadSessionData {
  firstName?: string
  ville?: string
  villeSlug?: string
  leadId?: string
  timeline?: string
}

export default function MerciPage() {
  const [leadData, setLeadData] = useState<LeadSessionData>({})

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("soumission-rapide-lead")
      if (stored) setLeadData(JSON.parse(stored))
    } catch {}

    if (typeof window.fbq === "function") {
      window.fbq("track", "CompleteRegistration", { content_name: "soumission-rapide", currency: "CAD" })
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", { event_category: "pSEO Questionnaire", event_label: "merci_page_view" })
      window.gtag("event", "merci_page_view", { event_category: "pSEO Questionnaire" })
    }
  }, [])

  const firstName = leadData.firstName || ""
  const ville = leadData.ville || ""

  return (
    <div className="min-h-screen bg-[#FFFFF6] flex flex-col" style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" }}>
      {/* Hero */}
      <section className="relative bg-[#002042] overflow-hidden">
        <nav className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logosoumissionconfort-1.png" alt="Soumission Confort" className="h-12 md:h-16 w-auto brightness-0 invert" />
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-[700px] mx-auto px-4 pt-8 pb-12 lg:pt-12 lg:pb-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#AEDEE5]/20 border-2 border-[#AEDEE5] flex items-center justify-center mb-5">
            <CheckCircle className="w-8 h-8 text-[#AEDEE5]" />
          </div>

          <span className="inline-flex items-center gap-1.5 bg-[#AEDEE5]/20 border border-[#AEDEE5]/40 text-[#AEDEE5] font-semibold text-sm rounded-full px-4 py-1.5 mb-5">
            <CheckCircle className="w-3.5 h-3.5" />
            Demande bien reçue
          </span>

          <h1 className="text-3xl lg:text-[42px] lg:leading-[1.1] font-bold text-white tracking-tight mb-4" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Merci{firstName ? ` ${firstName}` : ""} ! Votre demande a été transmise avec succès
          </h1>

          <p className="text-white/80 text-lg lg:text-xl leading-relaxed mb-6 max-w-[560px]">
            Nous contactons les meilleurs entrepreneurs de{ville ? ` ${ville}` : " votre région"}. Vous recevrez jusqu'à <strong className="text-white">3 soumissions détaillées</strong> dans les prochaines 24 heures.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { icon: Lock, label: "100% confidentiel" },
              { icon: Zap, label: "Réponse sous 24h" },
              { icon: Heart, label: "Sans engagement" },
              { icon: BadgeCheck, label: "Entrepreneurs vérifiés" },
            ].map((pill) => (
              <div key={pill.label} className="flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <pill.icon className="w-3.5 h-3.5 text-[#AEDEE5]" />
                <span className="text-xs font-semibold text-white">{pill.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-white/10 border-2 border-white/30 rounded-full px-6 py-3 font-bold text-white text-sm hover:bg-white/20 transition-colors" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>

      {/* Prochaines étapes */}
      <section className="bg-[#FFFFF6] py-14 lg:py-20 px-4">
        <div className="max-w-[1024px] mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-[#375371] text-sm font-semibold mb-2">
              <Clock className="w-4 h-4" />
              Prochaines étapes
            </span>
            <h2 className="text-2xl lg:text-[32px] font-bold text-[#10002C] tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
              Voici ce qui se passe maintenant
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { num: "1", icon: FileText, title: "Validation de votre projet", desc: "Un membre de notre équipe valide rapidement les détails pour assurer un bon appariement avec les entrepreneurs." },
              { num: "2", icon: Users, title: "Appariement avec 3 entrepreneurs", desc: "Nous sélectionnons des entrepreneurs certifiés et bien notés disponibles dans votre secteur pour votre type de projet." },
              { num: "3", icon: Star, title: "Réception de soumissions détaillées", desc: "Comparez les prix, les matériaux et les délais. Notre objectif est de vous aider à économiser et choisir en confiance." },
            ].map((step) => (
              <div key={step.num} className="bg-white border border-[#EEF5FC] rounded-[20px] shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#AEDEE5]/20 border border-[#AEDEE5] flex items-center justify-center text-sm font-bold text-[#002042]" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>{step.num}</span>
                  <step.icon className="w-5 h-5 text-[#375371]" />
                </div>
                <h3 className="text-base font-bold text-[#10002C]" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>{step.title}</h3>
                <p className="text-sm text-[#375371] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white border-t border-[#e8e8e0] py-14 lg:py-16 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-xl lg:text-2xl font-bold text-[#10002C] mb-3" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Optimisez vos chances d'obtenir le meilleur prix
          </h2>
          <p className="text-[#375371] text-base leading-relaxed mb-6">
            Préparez quelques photos de votre entretoit et précisez vos préférences pour accélérer l'obtention de soumissions précises.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-[#b9e15c] border-2 border-[#1B2244] text-[#1B2244] font-bold text-sm px-8 py-3.5 rounded-full shadow-[-2px_4px_0px_0px_#1B2244] hover:shadow-[-3px_5px_0px_0px_#1B2244] hover:translate-x-[1px] hover:translate-y-[-1px] transition-all" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>
            Retour à l'accueil
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B2244] py-8 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/images/logosoumissionconfort-1.png" alt="" className="h-10 w-auto brightness-0 invert" />
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} Soumission Confort. Tous droits réservés.</p>
          <Link href="/politique-de-confidentialite" className="text-white/60 text-sm hover:text-white transition-colors">Politique de confidentialité</Link>
        </div>
      </footer>
    </div>
  )
}
