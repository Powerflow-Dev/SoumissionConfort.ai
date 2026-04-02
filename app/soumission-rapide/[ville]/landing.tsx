"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, CheckCircle, Clock, CalendarDays, Search, Zap, Shield, PhoneCall, Users, Star, BadgeCheck } from "lucide-react"
import type { Municipality } from "@/lib/municipalities"
import { getCurrentUTMParameters } from "@/lib/utm-utils"

interface Props {
  municipality: Municipality
}

const timelineOptions = [
  { id: "urgent", label: "Dès que possible", icon: Zap },
  { id: "soon", label: "3 prochains mois", icon: CalendarDays },
  { id: "later", label: "Dans l'année", icon: Clock },
  { id: "exploring", label: "Je magasine seulement", icon: Search },
]

const faqItems = [
  {
    question: "Est-ce que le service est vraiment gratuit?",
    answer:
      "Oui, 100% gratuit pour vous. Les entrepreneurs de notre réseau nous versent une commission seulement s'ils obtiennent le contrat. Vous n'avez rien à payer, aucun engagement.",
  },
  {
    question: "Qui est Soumission Confort?",
    answer:
      "Soumission Confort est une plateforme québécoise qui met en contact les propriétaires avec des entrepreneurs en isolation certifiés et vérifiés par notre équipe. On accompagne chaque client du début à la fin pour s'assurer qu'il travaille avec les bons entrepreneurs.",
  },
  {
    question: "Est-ce que je suis obligé de faire affaire avec un entrepreneur de votre réseau?",
    answer:
      "Pas du tout. Vous recevez jusqu'à 3 soumissions et vous choisissez librement. Aucune obligation, aucune pression. Notre rôle est de vous donner accès aux meilleurs entrepreneurs — la décision vous appartient.",
  },
  {
    question: "Comment vérifiez-vous les entrepreneurs?",
    answer:
      "Chaque entrepreneur passe par notre processus en 3 étapes : 1) Validation de la licence RBQ active, 2) Analyse complète des avis Google et Facebook, 3) Entrevue obligatoire avec notre équipe. On refuse ceux qui ne sont pas sérieux.",
  },
  {
    question: "Combien de temps pour recevoir mes soumissions?",
    answer:
      "Vous recevez jusqu'à 3 soumissions d'entrepreneurs certifiés en moins de 48 heures. Notre équipe vous appelle aussi pour valider votre besoin et s'assurer que vous êtes jumelé avec les bons entrepreneurs.",
  },
  {
    question: "Est-ce que je peux bénéficier de subventions?",
    answer:
      "Oui! Des programmes gouvernementaux comme Rénoclimat et Hydro-Québec offrent des subventions pour les travaux d'isolation. Nos entrepreneurs peuvent vous aider à vérifier votre éligibilité et maximiser vos remboursements.",
  },
]

export function SoumissionRapideLanding({ municipality }: Props) {
  const router = useRouter()
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    getCurrentUTMParameters()
  }, [])

  const cityName = municipality.name

  function handleTimelineSelect(id: string) {
    setSelectedTimeline(id)
    router.push(`/soumission-rapide/questionnaire?ville=${encodeURIComponent(municipality.slug)}&timeline=${encodeURIComponent(id)}`)
  }

  function handleCtaClick() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#FFFFF6]" style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-[#FFFFF6] border-b border-[#e8e8e0]">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/logosoumissionconfort-1.png"
              alt="Soumission Confort"
              className="h-12 md:h-16 w-auto"
            />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#comment-ca-fonctionne" className="text-[#002042] font-semibold text-lg hover:opacity-70 transition-opacity">
              Comment ça fonctionne?
            </a>
            <a href="#faq" className="text-[#002042] font-semibold text-lg hover:opacity-70 transition-opacity">
              FAQ
            </a>
            <button
              onClick={handleCtaClick}
              className="border-2 border-[#002042] rounded-full px-8 py-3 font-bold text-[#002042] text-lg hover:bg-[#002042] hover:text-white transition-colors"
            >
              Obtenir mon estimation gratuite
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#FFFFF6] px-4 lg:px-[60px] pt-6 pb-10 lg:pt-10 lg:pb-16">
        <div className="max-w-[1116px] mx-auto">
          <div className="relative rounded-[20px] overflow-hidden shadow-md min-h-[500px] lg:min-h-[700px] flex flex-col lg:flex-row items-center justify-between">
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src="/images/Soumissioconfort-hero.jpeg"
                alt="Maison avec isolation au Québec"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Left content */}
            <div className="relative z-10 flex-1 px-6 lg:px-10 py-10 lg:py-16 flex flex-col gap-6 lg:gap-8 max-w-[600px]">
              <div className="inline-flex items-center gap-1.5 bg-[#AEDEE5] rounded-full px-4 py-1.5 shadow self-start">
                <span className="font-bold text-[#1B2244] text-sm lg:text-base">
                  Entrepreneurs certifiés RBQ à {cityName}
                </span>
                <CheckCircle className="w-5 h-5 text-[#1B2244]" />
              </div>

              <h1 className="text-3xl lg:text-[56px] lg:leading-[1.05] font-bold text-white tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
                Comparez{" "}
                <span className="text-[#b9e15c]">3 soumissions</span>
                {" "}d'entrepreneurs certifiés en isolation à {cityName}.
              </h1>

              <p className="text-lg lg:text-xl text-white/90 font-semibold leading-relaxed">
                Répondez à quelques questions pour recevoir jusqu'à 3 soumissions d'entrepreneurs certifiés près de chez vous.
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {["Gratuit et sans obligation", "Entrepreneurs certifiés RBQ", "5 000+ projets complétés"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-5 h-5 text-[#b9e15c] flex-shrink-0" />
                    <span className="text-white text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className="relative z-10 w-full lg:w-auto lg:max-w-[520px] p-4 lg:p-6 flex-shrink-0">
              <div className="bg-white border-4 border-[#AEDEE5] rounded-[20px] shadow-lg p-6 lg:p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h2 className="text-xl lg:text-2xl font-bold text-[#1B2244]" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
                    À quel moment aimeriez-vous réaliser votre projet d'isolation?
                  </h2>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: "10%",
                        background: "linear-gradient(90deg, #AEDEE5 0%, #b9e15c 100%)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {timelineOptions.map((opt) => {
                    const Icon = opt.icon
                    const isSelected = selectedTimeline === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleTimelineSelect(opt.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-[16px] border-2 transition-all text-center ${
                          isSelected
                            ? "border-[#AEDEE5] bg-[#EBF7F9] shadow-sm"
                            : "border-gray-200 bg-white hover:border-[#AEDEE5]/50"
                        }`}
                      >
                        <Icon className={`w-10 h-10 ${isSelected ? "text-[#1B2244]" : "text-gray-400"}`} strokeWidth={1.5} />
                        <span className={`text-base leading-tight ${isSelected ? "text-[#1B2244] font-semibold" : "text-[#1B2244]"}`}>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handleTimelineSelect("exploring")}
                  className="w-full bg-[#b9e15c] border-2 border-[#1B2244] text-[#1B2244] font-bold text-lg py-4 rounded-full shadow-[-2px_4px_0px_0px_#1B2244] hover:shadow-[-3px_5px_0px_0px_#1B2244] hover:translate-x-[1px] hover:translate-y-[-1px] transition-all"
                >
                  Continuer pour obtenir mes 3 soumissions
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce que nous faisons pour vous */}
      <section className="bg-white py-16 lg:py-20 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col items-center gap-8">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] text-center tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Ce que nous faisons pour vous
          </h2>
          <p className="text-lg lg:text-xl text-[#375371] text-center max-w-[900px] font-semibold leading-relaxed">
            Obtenez des soumissions d'entrepreneurs vérifiés et les informations nécessaires pour comparer les prix, comprendre les options et avancer dans votre projet en toute tranquillité.
          </p>

          <div className="grid md:grid-cols-3 gap-6 w-full">
            {[
              {
                icon: Users,
                title: "Jusqu'à 3 soumissions d'entrepreneurs certifiés",
                desc: "Recevez rapidement des soumissions d'entrepreneurs vérifiés dans votre région.",
              },
              {
                icon: Star,
                title: "Une meilleure visibilité sur les prix",
                desc: "Comparer plusieurs soumissions vous permet de choisir l'entrepreneur le plus adapté et d'éviter de payer trop cher.",
              },
              {
                icon: PhoneCall,
                title: "Un accompagnement pour vous aider à décider",
                desc: "Notre équipe reste disponible pour répondre à vos questions et vous aider à choisir l'entrepreneur qui convient le mieux à votre projet.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white border border-[#EEF5FC] rounded-[20px] shadow-md p-8 flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ecf8cf] border border-[#b9e15c] flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-[#1B2244]" />
                </div>
                <p className="text-xl font-bold text-[#10002C] leading-snug">{card.title}</p>
                <p className="text-base text-[#375371] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleCtaClick}
            className="bg-[#b9e15c] border-2 border-[#1B2244] text-[#1B2244] font-bold text-lg px-10 py-4 rounded-full shadow-[-2px_4px_0px_0px_#1B2244] hover:shadow-[-3px_5px_0px_0px_#1B2244] hover:translate-x-[1px] hover:translate-y-[-1px] transition-all"
          >
            Obtenir mon estimation gratuite
          </button>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section id="comment-ca-fonctionne" className="py-16 lg:py-20 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col items-center gap-8">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] text-center tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Comment ça fonctionne?
          </h2>
          <p className="text-lg lg:text-xl text-[#375371] text-center max-w-[900px] font-semibold leading-relaxed">
            Soumission Confort vous met en contact avec des entrepreneurs en isolation certifiés RBQ, vérifiés et interviewés par notre équipe. Simple, rapide, gratuit.
          </p>

          <div className="grid md:grid-cols-3 gap-6 w-full">
            {[
              { num: "1", text: "Répondez à quelques questions pour décrire votre projet d'isolation" },
              { num: "2", text: "Nous trouvons les meilleurs entrepreneurs vérifiés pour votre situation" },
              { num: "3", text: "Vous recevez jusqu'à 3 soumissions pour votre projet en 48h!" },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[#EEF5FC] rounded-[20px] shadow-md p-8 flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ecf8cf] border border-[#b9e15c] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1B2244]">{step.num}</span>
                </div>
                <p className="text-xl font-bold text-[#10002C] leading-snug">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi passer par nous */}
      <section className="bg-white py-16 lg:py-20 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-[485px] h-[300px] lg:h-[486px] relative rounded-[20px] overflow-hidden shadow-md flex-shrink-0">
            <Image
              src="/images/Soumissioconfort-hero.jpeg"
              alt="Entrepreneur certifié en isolation"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col gap-8 lg:gap-12">
            <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
              Pourquoi passer par nous?
            </h2>

            <div className="flex flex-col gap-6">
              {[
                {
                  icon: Shield,
                  title: "La tranquillité d'esprit",
                  desc: "On fait le tri pour vous et sélectionnons des entrepreneurs fiables de notre réseau. Chaque entrepreneur est interviewé avant d'être accepté.",
                },
                {
                  icon: Clock,
                  title: "Gain de temps",
                  desc: "Pas besoin de chercher ou appeler plusieurs entreprises. On s'en occupe pour vous et vous recevez vos soumissions en 48h.",
                },
                {
                  icon: PhoneCall,
                  title: "Aucune sollicitation inutile",
                  desc: "Vos informations sont envoyées seulement aux entrepreneurs nécessaires pour votre projet. On vous appelle pour valider votre besoin d'abord.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ecf8cf] border border-[#b9e15c] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#1B2244]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold text-[#10002C]">{item.title}</p>
                    <p className="text-lg text-[#375371] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1024px] mx-auto mt-10">
          <button
            onClick={handleCtaClick}
            className="w-full bg-[#b9e15c] border-2 border-[#1B2244] text-[#1B2244] font-bold text-lg py-4 rounded-full shadow-[-2px_4px_0px_0px_#1B2244] hover:shadow-[-3px_5px_0px_0px_#1B2244] hover:translate-x-[1px] hover:translate-y-[-1px] transition-all"
          >
            Obtenir mon estimation gratuite
          </button>
        </div>
      </section>

      {/* C'est quoi la « crosse »? */}
      <section className="py-16 lg:py-20 px-4">
        <div className="max-w-[900px] mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] text-center tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
              C'est quoi la « crosse »?
            </h2>
            <span className="bg-[#AEDEE5] rounded-full px-5 py-2 font-bold text-[#1B2244] text-lg shadow rotate-[-3deg] inline-block">
              Y en n'a pas!
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            <div className="bg-white border border-gray-200 rounded-[20px] shadow-md p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ecf8cf] border border-[#b9e15c] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#1B2244]" />
              </div>
              <p className="text-xl font-bold text-[#10002C]">
                Les entrepreneurs nous paient pour les mettre en contact avec des propriétaires qui veulent faire leurs travaux.
              </p>
              <div className="text-lg text-[#375371] leading-relaxed space-y-3">
                <p>Aucune pression. On mise sur la qualité de notre service avant tout.</p>
                <p>Notre meilleure façon de réussir, c'est de vous trouver l'entrepreneur idéal pour votre projet.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-[20px] shadow-md p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ecf8cf] border border-[#b9e15c] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#1B2244]" />
              </div>
              <p className="text-xl font-bold text-[#10002C]">
                Tous nos entrepreneurs sont certifiés RBQ et vérifiés à 360° par notre équipe.
              </p>
              <div className="text-lg text-[#375371] leading-relaxed space-y-3">
                <p>Pour mériter la confiance de nos clients, nous sélectionnons nos entrepreneurs avec rigueur.</p>
                <p>En plus de valider leur licence RBQ, nous analysons leurs avis Google et rencontrons personnellement chacun d'eux avant de les intégrer à notre réseau.</p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-[#AEDEE5] rounded-[20px] shadow-md px-8 py-10 w-full flex flex-wrap justify-around gap-8">
            {[
              { value: "5 000+", label: "Projets d'isolation" },
              { value: "150+", label: "Entrepreneurs vérifiés" },
              { value: "40%", label: "Économie moyenne" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 min-w-[150px]">
                <span className="text-4xl lg:text-5xl font-bold text-[#1B2244]">{stat.value}</span>
                <span className="text-lg text-[#1B2244]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment vérifions-nous les entrepreneurs */}
      <section className="bg-white py-16 lg:py-20 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col items-center gap-8">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] text-center tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Comment vérifions-nous les entrepreneurs?
          </h2>
          <p className="text-lg lg:text-xl text-[#375371] text-center max-w-[900px] font-semibold leading-relaxed">
            Avant d'être recommandés à nos clients, les entrepreneurs passent par un processus de vérification rigoureux.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {[
              { num: "1", title: "Validation de la licence RBQ", desc: "Nous vérifions que l'entrepreneur détient une licence RBQ valide et conforme pour les travaux d'isolation." },
              { num: "2", title: "Analyse du dossier de l'entreprise", desc: "Nous consultons les informations publiques disponibles pour détecter d'éventuels litiges, plaintes ou problèmes récurrents." },
              { num: "3", title: "Analyse des avis et commentaires", desc: "Nous analysons les avis Google et les commentaires des clients pour nous assurer que l'entrepreneur maintient une bonne réputation." },
              { num: "4", title: "Entretien avec l'entrepreneur", desc: "Nous discutons avec chaque entrepreneur avant de l'intégrer au réseau." },
              { num: "5", title: "Suivi avec les clients", desc: "Après les projets, nous faisons un suivi auprès des clients pour nous assurer qu'ils sont satisfaits du travail réalisé." },
            ].map((step) => (
              <div key={step.num} className="bg-[#FFFFF6] border border-[#EEF5FC] rounded-[20px] shadow-sm p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#AEDEE5]/30 border border-[#AEDEE5] flex items-center justify-center">
                  <span className="text-lg font-bold text-[#002042]">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-[#10002C]" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>{step.title}</h3>
                <p className="text-sm text-[#375371] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-16 lg:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Soumissioconfort-hero.jpeg"
            alt=""
            fill
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#1B2244]/90" />
        </div>

        <div className="relative z-10 max-w-[900px] mx-auto flex flex-col items-center gap-8 text-center">
          <span className="bg-[#AEDEE5] rounded-full px-5 py-2 font-bold text-[#1B2244] text-lg shadow rotate-[-3deg] inline-block">
            C'est gratuit!
          </span>

          <h2 className="text-3xl lg:text-[56px] lg:leading-[1.05] font-semibold text-white tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Prêt à estimer votre projet d'isolation à {cityName}?
          </h2>

          <button
            onClick={handleCtaClick}
            className="bg-[#b9e15c] border-2 border-[#1B2244] text-[#1B2244] font-bold text-lg px-10 py-4 rounded-full shadow-[-2px_4px_0px_0px_#1B2244] hover:shadow-[-3px_5px_0px_0px_#1B2244] hover:translate-x-[1px] hover:translate-y-[-1px] transition-all"
          >
            Obtenir mon estimation gratuite
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 lg:py-20 px-4">
        <div className="max-w-[900px] mx-auto flex flex-col items-center gap-8">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] text-center tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            FAQ
          </h2>

          <div className="flex flex-col gap-4 w-full">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-[20px] shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg lg:text-xl font-bold text-[#1B2244] pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-[#1B2244] flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-lg text-[#375371] leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B2244] py-8 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logosoumissionconfort-1.png" alt="" className="h-10 w-auto brightness-0 invert" />
          </div>
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Soumission Confort. Tous droits réservés.
          </p>
          <Link href="/politique-de-confidentialite" className="text-white/60 text-sm hover:text-white transition-colors">
            Politique de confidentialité
          </Link>
        </div>
      </footer>

      <Link href="/soumission-rapide/questionnaire" prefetch={true} className="hidden" aria-hidden="true" tabIndex={-1} />
    </div>
  )
}
