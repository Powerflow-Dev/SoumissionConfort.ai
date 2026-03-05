"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AddressInput } from "@/components/address-input"
import { NavLogo } from "@/components/nav-logo"
import { track } from "@vercel/analytics"

const advantages = [
  {
    title: "Connaissance du Climat Local",
    description: "Expertise des conditions hivernales rigoureuses et des défis climatiques de la Mauricie",
  },
  {
    title: "Disponibilité Rapide",
    description: "Entrepreneurs basés à Shawinigan pour une intervention rapide et un service personnalisé",
  },
  {
    title: "Prix Compétitifs",
    description: "Tarifs adaptés au marché local de Shawinigan, sans frais de déplacement élevés",
  },
  {
    title: "Matériaux Adaptés",
    description: "Sélection de matériaux résistants aux conditions climatiques de la région",
  },
  {
    title: "Références Locales",
    description: "Nombreux projets réalisés à Shawinigan avec références vérifiables dans votre quartier",
  },
  {
    title: "Service Après-Vente",
    description: "Suivi et garanties assurés par des entrepreneurs établis dans la région",
  },
]

const stats = [
  { number: "500+", label: "Projets à Shawinigan" },
  { number: "25+", label: "Entrepreneurs locaux" },
  { number: "4.8★", label: "Note moyenne locale" },
  { number: "35%", label: "Économies moyennes" },
]

export default function ToitureShawiniganPage() {
  const router = useRouter()
  const [address, setAddress] = useState("")

  const navigate = () => {
    if (!address.trim()) return
    track("Analysis Started", { address: address.trim(), source: "shawinigan" })
    router.push(`/analysis?address=${encodeURIComponent(address)}&region=shawinigan`)
  }

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLogo />
          <div className="hidden md:flex items-center gap-2">
            <span className="font-source-serif font-semibold text-[16px] text-[#002042]">Service Local Shawinigan</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 md:px-8 bg-[#fffff6]">
        <div className="max-w-[1320px] mx-auto">
          <div className="relative rounded-[20px] overflow-hidden min-h-[500px] md:min-h-[640px] flex items-start justify-center">
            <img
              src="/images/heroimage.jpg"
              alt="Toiture Shawinigan"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />

            <div className="relative z-10 flex flex-col items-center text-center px-4 pt-10 md:pt-16 pb-10 w-full max-w-[860px] mx-auto">
              <div className="mb-6" style={{ transform: "rotate(-5.36deg)" }}>
                <div className="bg-[#aedee5] inline-flex items-center gap-1.5 px-4 py-2 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                  <span className="font-source-serif font-bold text-[16px] md:text-[18px] text-[#002042] tracking-tight">
                    Entrepreneurs Locaux Shawinigan
                  </span>
                </div>
              </div>

              <h1 className="font-display font-semibold text-[36px] md:text-[52px] lg:text-[56px] text-[#fffff6] tracking-tight leading-none mb-4 drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]">
                Toiture à Shawinigan
              </h1>

              <p className="font-source-serif font-semibold text-[18px] md:text-[20px] text-[#fffff6] tracking-tight mb-8">
                Comparez les prix des meilleurs entrepreneurs locaux et obtenez plusieurs soumissions gratuites.
              </p>

              <div className="bg-white rounded-[20px] border border-[#f2f2f7] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8 flex flex-col gap-4 w-full">
                <AddressInput
                  onAddressSelect={setAddress}
                  onAnalyze={navigate}
                  compact
                  className="max-w-none"
                />
                <button
                  onClick={navigate}
                  disabled={!address.trim()}
                  className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg disabled:opacity-50 hover:brightness-105 transition-all"
                >
                  Obtenir mon estimation gratuite
                </button>
                <div className="flex flex-wrap gap-4 justify-center">
                  {["Entrepreneurs locaux de Shawinigan", "Connaissance du climat local", "Prix compétitifs région Mauricie"].map((text) => (
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

      {/* Advantages */}
      <section className="bg-white py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          <div className="flex flex-col gap-4 items-center">
            <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] text-center tracking-tight">
              Pourquoi choisir des entrepreneurs de Shawinigan ?
            </h2>
            <p className="font-source-serif font-semibold text-[18px] md:text-[20px] text-[#10002c] text-center tracking-tight">
              Les entrepreneurs locaux connaissent parfaitement le climat et les défis spécifiques de la région Mauricie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map(({ title, description }) => (
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

      {/* Stats */}
      <section className="bg-white py-8 pb-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div className="bg-[#aedee5] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-8 py-12 flex flex-wrap gap-10 justify-around">
            {stats.map(({ number, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="font-source-serif font-bold text-[42px] md:text-[48px] text-[#002042] tracking-tight leading-tight">
                  {number}
                </span>
                <span className="font-source-serif text-[18px] text-[#002042] text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA block */}
      <section className="bg-white py-8 pb-24">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div
            className="rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 md:px-12 py-16 flex flex-col items-center gap-6"
            style={{ background: "linear-gradient(135deg, #002042 0%, #002042 100%)" }}
          >
            <h2 className="font-display font-semibold text-[32px] md:text-[48px] text-white text-center tracking-tight leading-none">
              Prêt à comparer les prix à Shawinigan ?
            </h2>
            <div className="flex flex-wrap gap-6 justify-center">
              {["Entrepreneurs Locaux Certifiés", "Prix Compétitifs Région", "Service 100% Gratuit"].map((text) => (
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
