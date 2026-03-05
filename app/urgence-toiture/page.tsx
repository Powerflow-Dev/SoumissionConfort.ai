"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AddressInput } from "@/components/address-input"
import { NavLogo } from "@/components/nav-logo"
import { getCurrentUTMParameters } from "@/lib/utm-utils"
import { track } from "@vercel/analytics"

const repairTypes = [
  {
    title: "Fuites et Infiltrations",
    description: "Réparation rapide des fuites d'eau et infiltrations dans votre toiture",
  },
  {
    title: "Bardeaux Endommagés",
    description: "Remplacement de bardeaux cassés, décollés ou manquants",
  },
  {
    title: "Gouttières",
    description: "Réparation et nettoyage de gouttières et descentes pluviales",
  },
  {
    title: "Isolation",
    description: "Amélioration de l'isolation pour réduire les pertes énergétiques",
  },
  {
    title: "Ventilation",
    description: "Installation et réparation de systèmes de ventilation de toiture",
  },
  {
    title: "Urgences",
    description: "Interventions rapides pour dommages causés par intempéries",
  },
]

export default function UrgenceToiturePage() {
  const router = useRouter()
  const [address, setAddress] = useState("")

  useEffect(() => {
    try {
      const utm = getCurrentUTMParameters()
      if (Object.keys(utm).length > 0) console.log("🏷️ UTM captured on urgent page:", utm)
    } catch {}
  }, [])

  const navigateToAnalysis = () => {
    if (!address.trim()) return
    track("Analysis Started", { address: address.trim(), source: "urgence-toiture" })
    const utm = getCurrentUTMParameters()
    const url = new URL("/analysis", window.location.origin)
    url.searchParams.set("address", address.trim())
    ;(["utm_source", "utm_campaign", "utm_content", "utm_medium", "utm_term"] as const).forEach((k) => {
      const v = (utm as any)[k]
      if (v) url.searchParams.set(k, v)
    })
    router.push(url.pathname + url.search)
  }

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLogo />
          <a
            href="/"
            className="hidden md:block border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full text-[16px] hover:bg-[#002042] hover:text-white transition-all"
          >
            Obtenir mon estimation gratuite
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 md:px-8 bg-[#fffff6]">
        <div className="max-w-[1320px] mx-auto">
          <div className="relative rounded-[20px] overflow-hidden min-h-[500px] md:min-h-[640px] flex items-start justify-center">
            <img
              src="/images/heroimage.jpg"
              alt="Réparation de toiture"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />

            <div className="relative z-10 flex flex-col items-center text-center px-4 pt-10 md:pt-16 pb-10 w-full max-w-[860px] mx-auto">
              {/* Eyebrow pill */}
              <div className="mb-6" style={{ transform: "rotate(-5.36deg)" }}>
                <div className="bg-[#aedee5] inline-flex items-center gap-1.5 px-4 py-2 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                  <span className="font-source-serif font-bold text-[16px] md:text-[18px] text-[#002042] tracking-tight">
                    Réparation Toiture Spécialisée
                  </span>
                </div>
              </div>

              <h1 className="font-display font-semibold text-[36px] md:text-[52px] lg:text-[56px] text-[#fffff6] tracking-tight leading-none mb-4 drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]">
                Réparation de Toiture au Québec
              </h1>

              <p className="font-source-serif font-semibold text-[18px] md:text-[20px] text-[#fffff6] tracking-tight mb-8">
                Comparez les prix et obtenez les meilleures soumissions d'entrepreneurs certifiés.
              </p>

              {/* Form card */}
              <div className="bg-white rounded-[20px] border border-[#f2f2f7] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8 flex flex-col gap-4 w-full">
                <AddressInput
                  onAddressSelect={setAddress}
                  onAnalyze={navigateToAnalysis}
                  compact
                  className="max-w-none"
                />
                <button
                  onClick={navigateToAnalysis}
                  disabled={!address.trim()}
                  className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg disabled:opacity-50 hover:brightness-105 transition-all"
                >
                  Obtenir mon estimation gratuite
                </button>
                <div className="flex flex-wrap gap-4 justify-center">
                  {["Analyse IA de votre toiture", "Spécialistes en réparation", "Entrepreneurs certifiés RBQ"].map((text) => (
                    <div key={text} className="flex items-center gap-1.5">
                      <img src="/icons/icon-check.svg" alt="" className="w-5 h-5 shrink-0" />
                      <span className="text-[#10002c] font-source-serif text-[16px]">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Repair Types */}
      <section className="bg-white py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] text-center tracking-tight">
            Types de réparations couvertes
          </h2>
          <p className="font-source-serif font-semibold text-[18px] md:text-[20px] text-[#10002c] text-center tracking-tight -mt-4">
            Nos entrepreneurs partenaires sont spécialisés dans tous types de réparations de toiture
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repairTypes.map(({ title, description }) => (
              <div
                key={title}
                className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6"
              >
                <p className="font-source-serif font-bold text-[18px] text-[#002042] mb-2">{title}</p>
                <p className="font-source-serif text-[16px] text-[#10002c] leading-snug">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA block */}
      <section className="bg-white py-16 pb-24">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div
            className="rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 md:px-12 py-16 flex flex-col items-center gap-6"
            style={{ background: "linear-gradient(135deg, #002042 0%, #002042 100%)" }}
          >
            <h2 className="font-display font-semibold text-[32px] md:text-[48px] text-white text-center tracking-tight leading-none">
              Besoin de réparations rapidement ?
            </h2>
            <div className="flex flex-wrap gap-6 justify-center">
              {["Estimation Gratuite", "Entrepreneurs Vérifiés", "Économisez 30%"].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <img src="/icons/icon-check.svg" alt="" className="w-5 h-5 shrink-0 brightness-200" />
                  <span className="font-source-serif text-white text-[17px]">{text}</span>
                </div>
              ))}
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all"
            >
              Obtenir mon estimation gratuite
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
