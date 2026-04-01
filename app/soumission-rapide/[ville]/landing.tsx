"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, Users, Star, PhoneCall } from "lucide-react"
import type { Municipality } from "@/lib/municipalities"
import { getCurrentUTMParameters } from "@/lib/utm-utils"

interface Props {
  municipality: Municipality
}

/* ────────────────────────────────────────────
   Timeline options
   ──────────────────────────────────────────── */
const timelineOptions = [
  { id: "urgent", label: "Dès que possible", img: "/images/icon-timeline-urgent.svg" },
  { id: "soon", label: "3 prochains mois", img: "/images/icon-timeline-soon.svg" },
  { id: "later", label: "Dans l'année", img: "/images/icon-timeline-later.svg" },
  { id: "exploring", label: "Je magasine seulement", img: "/images/icon-timeline-exploring.svg" },
]

/* ────────────────────────────────────────────
   FAQ data
   ──────────────────────────────────────────── */
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

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */
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

      {/* ── Intro section (Navbar + Hero) — p-[60px] comme Figma ── */}
      <section className="bg-[#FFFFF6] px-4 pt-2 pb-0 lg:p-[60px]">

        {/* Navbar */}
        <nav className="flex items-center justify-between py-2 lg:py-4 w-full">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src="/images/logo-icon.svg" alt="" className="h-10 md:h-[62px] w-auto" />
            <div className="font-['Radio_Canada_Big',sans-serif] font-bold text-[#002042] leading-[0.9] tracking-[-0.04em] text-[18px] md:text-[26px] whitespace-nowrap">
              <p>Soumission</p>
              <p>Confort</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#comment-ca-fonctionne" className="font-semibold text-[20px] text-[#002042] tracking-[-0.8px] hover:opacity-70 transition-opacity whitespace-nowrap">
              Comment ça fonctionne ?
            </a>
            <a href="#faq" className="font-semibold text-[20px] text-[#002042] tracking-[-0.8px] hover:opacity-70 transition-opacity">
              FAQ
            </a>
            <button
              onClick={handleCtaClick}
              className="border-2 border-[#002042] rounded-full px-8 h-[56px] font-bold text-[18px] text-[#002042] hover:bg-[#002042] hover:text-white transition-colors whitespace-nowrap"
            >
              Obtenir mon estimation gratuite
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="relative rounded-[20px] overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] lg:h-[700px] flex flex-col lg:flex-row items-stretch lg:items-center justify-between lg:px-[40px] lg:py-[50px]">
          {/* Background */}
          <div className="absolute inset-0">
            <Image src="/images/hero-iso.jpg" alt={`Isolation résidentielle à ${cityName}`} fill className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%)" }} />
          </div>

          <div className="relative z-10 flex-1 flex flex-col gap-3 lg:gap-[32px] items-start justify-center px-5 py-5 lg:px-[20px] lg:py-[64px] min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1 bg-[#aedee5] rounded-full pl-3 pr-2 py-1 lg:py-1.5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] self-start max-w-full overflow-hidden">
              <span className="font-bold text-[12px] md:text-[18px] text-[#002042] tracking-[-0.5px] md:tracking-[-0.72px] truncate">
                Entrepreneurs certifiés RBQ à {cityName}
              </span>
              <img src="/images/icon-qc-flag.png" alt="" className="w-[18px] h-[18px] md:w-[24px] md:h-[24px] -rotate-[5deg] flex-shrink-0" />
            </div>

            {/* Headline */}
            <div className="drop-shadow-[0px_0px_4px_rgba(0,0,0,0.4)]">
              <h1 className="text-[28px] sm:text-[40px] lg:text-[56px] font-semibold text-[#FFFFF6] tracking-[-1.2px] lg:tracking-[-2.24px] leading-[1.1]" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
                Comparez{" "}
                <span className="font-bold bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(20deg, #AEDEE5 0%, #b9e15c 99%)" }}>
                  3 soumissions
                </span>
                {" "}d'entrepreneurs certifiés à {cityName} en moins de 48h.
              </h1>
            </div>

            {/* Subtext */}
            <p className="font-semibold text-[14px] md:text-[20px] text-[#FFFFF6] tracking-[-0.4px] md:tracking-[-0.8px] leading-[1.3]">
              Répondez à quelques questions pour recevoir jusqu'à 3 soumissions d'entrepreneurs certifiés près de chez vous.
            </p>

            {/* Checklist */}
            <div className="hidden sm:flex flex-wrap gap-x-3 gap-y-2">
              {["Gratuit et sans obligation", "Entrepreneurs certifiés RBQ", "5 000+ projets complétés"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <img src="/images/icon-check-circle.svg" alt="" className="w-[20px] h-[20px] flex-shrink-0" />
                  <span className="font-semibold text-[13px] md:text-[14px] text-white tracking-[-0.4px] md:tracking-[-0.56px]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full lg:w-auto lg:max-w-[540px] flex-shrink-0">
            <div className="bg-white border-4 border-[#aedee5] rounded-b-[20px] lg:rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-4 lg:p-[32px] flex flex-col gap-[14px] lg:gap-[24px] min-w-0 lg:min-w-[426px]">

              {/* Title + progress */}
              <div className="flex flex-col gap-2 lg:gap-3">
                <h2 className="font-bold text-[18px] lg:text-[24px] text-[#002042] tracking-[-0.72px] leading-[1.2]" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
                  À quel moment aimeriez-vous réaliser votre projet d'isolation ?
                </h2>
                <div className="w-full h-[16px] bg-[#eef5fc] rounded-full overflow-hidden">
                  <div className="h-full w-[10%] rounded-full" style={{ background: "linear-gradient(19deg, #AEDEE5 0%, #b9e15c 99%)" }} />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                {timelineOptions.map((opt) => {
                  const isSelected = selectedTimeline === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleTimelineSelect(opt.id)}
                      className={`flex flex-col items-center gap-2 lg:gap-6 p-2 lg:p-4 rounded-[20px] transition-all text-center ${
                        isSelected
                          ? "border-2 border-[#b9e15c] bg-[#f4fce4]"
                          : "border border-[#aedee5] bg-white hover:border-[#b9e15c]/60"
                      }`}
                    >
                      <img src={opt.img} alt="" className="w-10 h-10 lg:w-20 lg:h-20 object-contain" />
                      <span className="text-[13px] lg:text-[18px] text-[#002042] tracking-[-0.4px] lg:tracking-[-0.72px] leading-[1.2]">
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleTimelineSelect("exploring")}
                className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-bold text-[15px] lg:text-[18px] h-[48px] lg:h-[56px] rounded-full shadow-[-2px_4px_0px_0px_#002042] hover:shadow-[-1px_2px_0px_0px_#002042] hover:translate-y-0.5 transition-all"
              >
                Continuer pour obtenir mes 3 soumissions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ce que vous obtiendrez ── */}
      <section className="bg-white py-16 lg:py-20 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col items-center gap-8">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] text-center tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Ce que vous obtiendrez
          </h2>
          <p className="text-lg lg:text-xl text-[#375371] text-center max-w-[900px] font-semibold leading-relaxed">
            Soumission Confort simplifie vos projets d'isolation grâce à un réseau d'entrepreneurs certifiés RBQ à {cityName}, vérifiés et interviewés par notre équipe.
          </p>

          <div className="grid md:grid-cols-3 gap-6 w-full">
            {[
              {
                icon: Users,
                title: "Jusqu'à 3 soumissions d'entrepreneurs certifiés par notre équipe",
              },
              {
                icon: Star,
                title: "Comparaison claire des prix entre 3 entrepreneurs vérifiés",
              },
              {
                icon: PhoneCall,
                title: "Un accompagnement personnalisé du début à la fin",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white border border-[#EEF5FC] rounded-[20px] shadow-md p-8 flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f4fce4] border border-[#b9e15c] flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-[#1B2244]" />
                </div>
                <p className="text-xl font-bold text-[#10002C] leading-snug">{card.title}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleCtaClick}
            className="bg-[#b9e15c] border-2 border-[#1B2244] text-[#1B2244] font-bold text-lg px-10 py-4 rounded-full shadow-[-2px_4px_0px_0px_#1B2244] hover:shadow-[-3px_5px_0px_0px_#1B2244] hover:translate-x-[1px] hover:translate-y-[-1px] transition-all"
            style={{ fontFamily: "'Radio Canada Big', sans-serif" }}
          >
            Obtenir mon estimation gratuite
          </button>
        </div>
      </section>

      {/* ── Comment ça fonctionne ── */}
      <section id="comment-ca-fonctionne" className="py-16 lg:py-20 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col items-center gap-8">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#10002C] text-center tracking-tight" style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}>
            Comment ça fonctionne?
          </h2>
          <p className="text-lg lg:text-xl text-[#375371] text-center max-w-[900px] font-semibold leading-relaxed">
            Soumission Confort vous met en contact avec des entrepreneurs en isolation certifiés RBQ à {cityName}, vérifiés et interviewés par notre équipe. Simple, rapide, gratuit.
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
                <div className="w-12 h-12 rounded-xl bg-[#f4fce4] border border-[#b9e15c] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1B2244]">{step.num}</span>
                </div>
                <p className="text-xl font-bold text-[#10002C] leading-snug">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi passer par nous ── */}
      <section className="bg-white py-[60px] px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col gap-[40px] items-center">
          <div className="flex flex-wrap gap-[24px] items-center w-full">
            {/* Left — mockup image */}
            <div className="w-full lg:w-[485px] lg:h-[486px] flex-shrink-0">
              <Image
                src="/images/pourquoi-mockup.png"
                alt="Comparaison de soumissions d'entrepreneurs"
                width={485}
                height={486}
                className="w-full h-auto lg:w-[485px] lg:h-[486px] object-cover"
              />
            </div>

            {/* Right — content */}
            <div className="flex-1 min-w-[300px] flex flex-col gap-[48px] p-[24px]">
              <h2 className="font-bold text-[40px] text-[#10002c] tracking-[-1.2px] leading-[1.2]" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>
                Pourquoi passer par nous ?
              </h2>

              <div className="flex flex-col gap-[24px]">
                {[
                  { icon: "/images/icon-pourquoi-1.svg", title: "La tranquilité d'esprit", desc: "On fait le tri pour vous et sélectionnons des entrepreneurs fiables de notre réseau." },
                  { icon: "/images/icon-pourquoi-2.svg", title: "Gain de temps", desc: "Pas besoin de chercher ou appeler plusieurs entreprises. On s'en occupe pour vous." },
                  { icon: "/images/icon-pourquoi-3.svg", title: "Aucune sollicitation inutile", desc: "Vos informations sont envoyées seulement aux entrepreneurs nécessaires pour votre projet." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-[16px] items-start">
                    <div className="w-[48px] h-[48px] rounded-[10px] bg-[#f7fceb] border border-[#b9e15c] flex items-center justify-center flex-shrink-0 p-[8px]">
                      <img src={item.icon} alt="" className="w-[24px] h-[24px]" />
                    </div>
                    <div className="flex flex-col gap-[16px]">
                      <p className="font-bold text-[20px] text-[#10002c] tracking-[-0.8px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{item.title}</p>
                      <p className="text-[18px] text-[#375371] tracking-[-0.72px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleCtaClick}
            className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-bold text-[18px] h-[56px] rounded-full shadow-[-2px_4px_0px_0px_#002042] hover:shadow-[-1px_2px_0px_0px_#002042] hover:translate-y-0.5 transition-all"
            style={{ fontFamily: "'Source Serif Pro', serif" }}
          >
            Obtenir mes 3 soumissions
          </button>
        </div>
      </section>

      {/* ── C'est quoi la « crosse » ? ── */}
      <section className="py-[60px] px-4">
        <div className="max-w-[900px] mx-auto flex flex-col gap-[24px] items-center">

          {/* Title + sticker */}
          <div className="flex gap-[4px] items-center justify-center flex-wrap w-full">
            <h2 className="font-bold text-[40px] text-[#10002c] text-center tracking-[-1.2px] leading-[1.2] whitespace-nowrap" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>
              C'est quoi la « crosse » ?
            </h2>
            <div className="flex items-center justify-center" style={{ transform: "rotate(-5.36deg)" }}>
              <div className="bg-[#aedee5] flex gap-[4px] items-center justify-center px-[24px] py-[10px] rounded-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <span className="font-bold text-[32px] text-[#002042] text-center tracking-[-1.28px] leading-[1.2] whitespace-nowrap" style={{ fontFamily: "'Source Serif Pro', serif" }}>
                  Y en n'a pas !
                </span>
                <div style={{ transform: "rotate(-7.7deg)" }}>
                  <img src="/images/sticker-emoji-crosse.svg" alt="" className="w-[36px] h-[36px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Two cards */}
          <div className="flex flex-wrap gap-[24px] items-start w-full">
            {[
              {
                title: "Les entrepreneurs nous paient pour les mettre en contact avec des propriétaires qui veulent faire leurs travaux.",
                body: [
                  "Aucune pression. On mise sur la qualité de notre service avant tout.",
                  "Notre meilleure façon de réussir, c'est de vous trouver l'entrepreneur idéal pour votre projet.",
                ],
              },
              {
                title: "Tous nos entrepreneurs sont certifiés RBQ et vérifiés à 360° par notre équipe.",
                body: [
                  "Pour mériter la confiance de nos clients, nous sélectionnons nos entrepreneurs avec rigueur.",
                  "En plus de valider leur licence RBQ, nous analysons leurs avis Google et rencontrons personnellement chacun d'eux avant de les intégrer à notre réseau.",
                ],
              },
            ].map((card) => (
              <div key={card.title} className="bg-white border border-[#f2f2f7] flex-1 min-w-[326px] flex flex-col gap-[16px] p-[32px] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <img src="/images/icon-check-green.svg" alt="" className="w-[48px] h-[48px]" />
                <div className="flex flex-col gap-[16px]">
                  <p className="font-bold text-[20px] text-[#10002c] tracking-[-0.8px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{card.title}</p>
                  <div className="flex flex-col gap-[18px]">
                    {card.body.map((p) => (
                      <p key={p} className="text-[18px] text-[#375371] tracking-[-0.72px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="bg-[#aedee5] flex flex-wrap gap-[48px] items-start px-[32px] py-[48px] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full">
            {[
              { value: "5 000 +", label: "Projets d'isolation" },
              { value: "150 +", label: "Entrepreneurs vérifiés" },
              { value: "40%", label: "Économie moyenne" },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 min-w-[180px] flex flex-col gap-[8px] items-center">
                <p className="font-bold text-[48px] text-[#002042] text-center tracking-[-1.92px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{stat.value}</p>
                <p className="text-[18px] text-[#002042] text-center tracking-[-0.72px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Comment vérifions-nous les entrepreneurs ? ── */}
      <section className="py-[60px] px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col gap-[32px] items-center">
          <h2 className="font-bold text-[40px] text-[#10002c] text-center tracking-[-1.2px] leading-[1.2]" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>
            Comment vérifions-nous les entrepreneurs ?
          </h2>
          <p className="font-semibold text-[20px] text-[#375371] text-center tracking-[-0.8px] leading-[1.2] max-w-[700px]" style={{ fontFamily: "'Source Serif Pro', serif" }}>
            Avant d'être recommandés à nos clients, les entrepreneurs passent par un processus de vérification rigoureux.
          </p>
          <div className="flex flex-wrap gap-[24px] items-start justify-center w-full">
            {[
              { step: "1", title: "Validation de la licence RBQ", desc: "On vérifie que chaque entrepreneur détient une licence RBQ active et valide avant toute chose.", img: "/images/verification-rbq.png", imgAlt: "Registre RBQ" },
              { step: "2", title: "Analyse du dossier de l'entreprise", desc: "On examine l'historique, les certifications et l'expérience de l'entreprise en détail.", img: "/images/verification-liste-1.png", imgAlt: "Liste de vérification" },
              { step: "3", title: "Analyse des avis et commentaires", desc: "On lit et analyse tous les avis Google, Facebook et autres plateformes publiques.", img: "/images/verification-google.png", imgAlt: "Avis Google" },
              { step: "4", title: "Entretien avec l'entrepreneur", desc: "Un membre de notre équipe rencontre personnellement chaque entrepreneur avant de l'accepter.", img: "/images/verification-facetime.png", imgAlt: "Entretien vidéo" },
              { step: "5", title: "Suivi avec les clients", desc: "On recueille les commentaires de chaque client pour s'assurer de la qualité du travail effectué.", img: "/images/verification-liste-2.png", imgAlt: "Sondage de satisfaction" },
            ].map((card) => (
              <div key={card.step} className="bg-[#eef5fc] border border-[#eef5fc] flex-1 min-w-[240px] max-w-[325px] flex flex-col gap-[16px] p-[24px] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <div className="w-[48px] h-[48px] rounded-full bg-[#f7fceb] border border-[#b9e15c] flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-[24px] text-[#10002c] tracking-[-0.96px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{card.step}</span>
                </div>
                <p className="font-bold text-[20px] text-[#10002c] tracking-[-0.8px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{card.title}</p>
                <p className="text-[18px] text-[#375371] tracking-[-0.72px] leading-[1.2]" style={{ fontFamily: "'Source Serif Pro', serif" }}>{card.desc}</p>
                <img src={card.img} alt={card.imgAlt} className="w-full h-auto object-contain mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="relative py-[60px] px-4 overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="absolute inset-0">
          <Image src="/images/cta-bg.jpg" alt="" fill className="object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 max-w-[900px] mx-auto">
          <div className="bg-[#002042] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-[48px] flex flex-col gap-[32px] items-center">

            {/* Sticker + Headline */}
            <div className="flex flex-col gap-[16px] items-center w-full">
              <div style={{ transform: "rotate(-5.36deg)" }}>
                <div className="bg-[#aedee5] flex gap-[4px] items-center justify-center px-[24px] py-[10px] rounded-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <span className="font-bold text-[24px] text-[#002042] text-center tracking-[-0.96px] leading-[1.2] whitespace-nowrap" style={{ fontFamily: "'Source Serif Pro', serif" }}>
                    C'est gratuit !
                  </span>
                  <div style={{ transform: "rotate(-7.7deg)" }}>
                    <img src="/images/sticker-emoji-crosse.svg" alt="" className="w-[40px] h-[40px]" />
                  </div>
                </div>
              </div>
              <h2 className="font-semibold text-[56px] text-white text-center tracking-[-1.68px] leading-none" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>
                Prêt à estimer votre projet à {cityName} ?
              </h2>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCtaClick}
              className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-bold text-[18px] h-[56px] rounded-full shadow-[-2px_4px_0px_0px_#002042] hover:shadow-[-1px_2px_0px_0px_#002042] hover:translate-y-0.5 transition-all"
              style={{ fontFamily: "'Source Serif Pro', serif" }}
            >
              Obtenir mon estimation gratuite
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
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

      {/* ── Footer ── */}
      <footer className="bg-[#1B2244] py-8 px-4">
        <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo-icon.svg" alt="" className="h-8 w-auto brightness-0 invert" />
            <div className="font-['Radio_Canada_Big',sans-serif] font-bold text-white leading-[0.9] text-[18px] whitespace-nowrap">
              <p>Soumission</p>
              <p>Confort</p>
            </div>
          </div>
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Soumission Confort. Tous droits réservés.
          </p>
          <Link href="/politique-de-confidentialite" className="text-white/60 text-sm hover:text-white transition-colors">
            Politique de confidentialité
          </Link>
        </div>
      </footer>

      {/* Prefetch questionnaire page for instant navigation */}
      <Link href="/soumission-rapide/questionnaire" prefetch={true} className="hidden" aria-hidden="true" tabIndex={-1} />
    </div>
  )
}
