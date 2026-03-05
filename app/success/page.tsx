"use client"

import Link from "next/link"
import { NavLogo } from "@/components/nav-logo"
import { ArrowRight, Home, Phone } from "lucide-react"
import { track } from "@vercel/analytics"
import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function SuccessContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type")
  const isContractor = type === "contractor"

  useEffect(() => {
    track(isContractor ? "Contractor Lead Submitted" : "Conversion Completed")
  }, [isContractor])

  const steps = isContractor
    ? [
        {
          title: "Vérification de votre profil",
          desc: "Notre équipe vérifie vos informations et votre licence RBQ pour assurer la qualité de notre réseau.",
        },
        {
          title: "Configuration de votre compte",
          desc: "Nous créons votre profil d'entrepreneur et configurons vos préférences de zone de service et de projets.",
        },
        {
          title: "Réception de vos premiers leads",
          desc: "Commencez à recevoir des leads qualifiés correspondant à votre expertise et votre zone de service.",
        },
      ]
    : [
        {
          title: "Validation de votre projet",
          desc: "Un membre de notre équipe valide rapidement les détails pour assurer un bon appariement avec les entrepreneurs.",
        },
        {
          title: "Appariement avec 3 entrepreneurs",
          desc: "Nous sélectionnons des entrepreneurs certifiés et bien notés disponibles dans votre secteur pour votre type de projet.",
        },
        {
          title: "Réception de soumissions détaillées",
          desc: "Comparez les prix, les matériaux et les délais. Notre objectif est de vous aider à économiser et choisir en confiance.",
        },
      ]

  return (
    <div className="min-h-screen bg-[#fffff6] flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLogo />
          <Link
            href="/"
            className="border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full text-[16px] hover:bg-[#002042] hover:text-white transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 md:px-8 bg-[#fffff6]">
        <div className="max-w-[1320px] mx-auto">
          <div className="relative rounded-[20px] overflow-hidden min-h-[320px] md:min-h-[400px] flex items-center justify-center">
            <img
              src="/images/heroimage.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#002042]/70" />
            <div className="relative z-10 text-center px-4 py-12 max-w-[700px]">
              {/* Success pill */}
              <div className="mb-6 flex justify-center">
                <div className="bg-[#b9e15c] inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                  <img src="/icons/icon-check.svg" alt="" className="w-5 h-5" />
                  <span className="font-source-serif font-bold text-[16px] text-[#002042]">Demande bien reçue</span>
                </div>
              </div>

              <h1 className="font-display font-semibold text-[32px] md:text-[48px] text-[#fffff6] tracking-tight leading-tight mb-4">
                {isContractor
                  ? "Merci de votre intérêt pour rejoindre notre réseau!"
                  : "Merci ! Votre demande de soumission a été transmise"}
              </h1>

              <p className="font-source-serif text-[18px] text-[#fffff6]/90 mb-8">
                {isContractor
                  ? "Notre équipe examinera votre demande et vous contactera dans les prochaines 24-48 heures."
                  : "Nous contactons les meilleurs entrepreneurs de votre région. Vous recevrez jusqu'à 3 soumissions dans les prochaines 24 heures."}
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full shadow-[-2px_4px_0px_0px_#002042] hover:brightness-105 transition-all flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </Link>
                <a
                  href="tel:+15149091526"
                  className="border-2 border-white text-white font-source-serif font-bold py-3 px-6 rounded-full hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Nous contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="bg-white py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] text-center tracking-tight">
            La suite…
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 flex flex-col gap-4"
              >
                <div className="w-10 h-10 bg-[#002042] rounded-full flex items-center justify-center text-white font-display font-bold text-[18px] shrink-0">
                  {idx + 1}
                </div>
                <p className="font-source-serif font-bold text-[18px] text-[#002042] tracking-tight leading-snug">
                  {item.title}
                </p>
                <p className="font-source-serif text-[16px] text-[#10002c] leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 pb-24">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div
            className="rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 md:px-12 py-12 flex flex-col items-center gap-6 text-center"
            style={{ background: "linear-gradient(135deg, #002042 0%, #002042 100%)" }}
          >
            <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-white tracking-tight leading-none">
              {isContractor
                ? "Préparez-vous à recevoir des leads"
                : "Optimisez vos chances d'obtenir le meilleur prix"}
            </h2>
            <p className="font-source-serif text-[18px] text-white/80 max-w-lg">
              {isContractor
                ? "Assurez-vous que votre profil est complet et que vous êtes prêt à répondre rapidement."
                : "Préparez quelques photos de votre toiture et vos préférences de matériaux pour accélérer le processus."}
            </p>
            <Link
              href="/"
              className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all flex items-center gap-2"
            >
              {isContractor ? "Retour à l'accueil" : "Faire une autre estimation"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fffff6] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#002042] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
