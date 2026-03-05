"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AddressInput } from "@/components/address-input"
import { CheckCircle } from "lucide-react"
import { NavLogo } from "@/components/nav-logo"
import { getCurrentUTMParameters } from "@/lib/utm-utils"
import { initializeMeta, isMetaConfigured } from "@/lib/meta-config"
import { trackViewContent } from "@/lib/meta-conversion-api"
import { track } from "@vercel/analytics"

// ---------------------------------------------------------------------------
// Shared navigation hook
// ---------------------------------------------------------------------------
function useAddressNavigation() {
  const router = useRouter()
  const [address, setAddress] = useState("")

  const navigate = () => {
    if (!address.trim()) return
    track("Analysis Started", { address: address.trim() })
    const utm = getCurrentUTMParameters()
    const url = new URL("/analysis", window.location.origin)
    url.searchParams.set("address", address.trim())
    ;(["utm_source", "utm_campaign", "utm_content", "utm_medium", "utm_term"] as const).forEach((k) => {
      const v = (utm as any)[k]
      if (v) url.searchParams.set(k, v)
    })
    router.push(url.pathname + url.search)
  }

  return { address, setAddress, navigate }
}

// ---------------------------------------------------------------------------
// Hero form card (vertical stacked layout)
// ---------------------------------------------------------------------------
function HeroFormCard() {
  const { address, setAddress, navigate } = useAddressNavigation()

  return (
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
      <div className="flex flex-wrap gap-4 md:gap-6 justify-center pt-1">
        {["Gratuit et sans obligation", "150+ entrepreneurs certifiés", "Plateforme sécurisée"].map((text) => (
          <div key={text} className="flex items-center gap-1.5">
            <img src="/icons/icon-check.svg" alt="" className="w-6 h-6 shrink-0" />
            <span className="text-[#10002c] font-source-serif text-[17px]">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pill-style address bar (horizontal layout)
// ---------------------------------------------------------------------------
function AddressBar() {
  const { address, setAddress, navigate } = useAddressNavigation()

  return (
    <div className="bg-white border border-black/25 rounded-full p-2 flex items-center gap-2 w-full">
      <div className="flex-1 min-w-0">
        <AddressInput
          onAddressSelect={setAddress}
          onAnalyze={navigate}
          compact
          className="max-w-none"
        />
      </div>
      <button
        onClick={navigate}
        disabled={!address.trim()}
        className="shrink-0 bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-4 md:px-6 rounded-full shadow-[-2px_4px_0px_0px_#002042] disabled:opacity-50 hover:brightness-105 transition-all whitespace-nowrap text-sm md:text-[18px]"
      >
        Obtenir mon estimation gratuite
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// How it works cards
// ---------------------------------------------------------------------------
const howItWorksCards = [
  {
    img: "/icons/card-satellite.png",
    imgStyle: { height: "327.49%", left: "-47.3%", top: "-29.93%", width: "312.27%" },
    title: "Notre outil analyse la superficie de votre toiture grâce aux images satellites",
    description:
      "En entrant simplement votre adresse, notre IA détecte automatiquement la superficie de votre grenier via les images satellites. Pas besoin de mesures manuelles!",
  },
  {
    img: "/icons/card-ai.png",
    imgStyle: { height: "170%", left: "-8.49%", top: "-54.49%", width: "162.1%" },
    title: "Notre IA vous prépare un estimé pour vous aider à démarrer votre projet d'isolation",
    description:
      "En quelques secondes, notre intelligence artificielle calcule le coût d'isolation pour votre grenier selon les tarifs actuels du marché québécois.",
  },
  {
    img: "/icons/card-choice.png",
    imgStyle: { left: "-11.28%", height: "121.87%", top: "-11.13%", width: "121.87%" },
    title: "Vous choisissez si on vous accompagne dans votre recherche de soumission",
    description:
      "Vous êtes entièrement libre de votre décision. Votre estimation est fournie sans engagement ni obligation de continuer avec nous.",
  },
  {
    img: "/icons/card-contractors.png",
    imgStyle: { height: "142.61%", left: "-18.13%", top: "-20.83%", width: "135.99%" },
    title: "On trouve 3 soumissions d'entrepreneurs certifiés pour vous !",
    description:
      "Si vous le souhaitez, nous contactons 3 entrepreneurs certifiés RBQ de notre réseau pour vous obtenir des soumissions réelles pour votre projet.",
  },
]

// ---------------------------------------------------------------------------
// FAQ data
// ---------------------------------------------------------------------------
const faqData = [
  {
    q: "Est-ce que l'estimation est gratuite?",
    a: "Oui, notre service est 100% gratuit et sans aucune obligation de votre part. Vous recevez votre estimation personnalisée en moins d'une minute, sans frais ni engagement.",
  },
  {
    q: "Qui est Soumission Confort ?",
    a: "Soumission Confort est une entreprise québécoise spécialisée dans la mise en relation entre les propriétaires et les entrepreneurs certifiés en isolation. Notre mission est de simplifier et démocratiser l'accès à des projets d'isolation de qualité pour tous les Québécois.",
  },
  {
    q: "Est-ce que je suis obligé de faire affaire avec un entrepreneur de votre réseau ?",
    a: "Absolument pas! Votre estimation vous appartient et vous êtes entièrement libre de votre décision. Notre service d'estimation est fourni à titre informatif. Si vous souhaitez obtenir des soumissions concrètes d'entrepreneurs, c'est vous qui choisissez de continuer ou non.",
  },
  {
    q: "Est-ce que les entrepreneurs sont tous vérifiés et certifiés par la RBQ ?",
    a: "Oui, tous les entrepreneurs de notre réseau sont certifiés par la RBQ (Régie du bâtiment du Québec). En plus de valider leur licence, notre équipe analyse leurs avis Google et les rencontre personnellement avant de les intégrer à notre réseau.",
  },
]

// ---------------------------------------------------------------------------
// FAQ accordion item
// ---------------------------------------------------------------------------
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] overflow-hidden cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="p-6 flex items-center gap-6">
        <p className="flex-1 font-source-serif font-bold text-[20px] text-[#002042] tracking-tight leading-snug">
          {q}
        </p>
        <img
          src="/icons/icon-chevron.svg"
          alt=""
          className="w-6 h-6 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
      {open && (
        <div className="px-6 pb-6">
          <p className="font-source-serif text-[18px] text-[#10002c] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function HomePage() {
  useEffect(() => {
    try {
      const utm = getCurrentUTMParameters()
      if (Object.keys(utm).length > 0) console.log("🏷️ UTM captured:", utm)
    } catch {}
    initializeMeta()
    if (isMetaConfigured()) {
      trackViewContent("Homepage", "website").catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* ---------------------------------------------------------------- */}
      {/* Navbar */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLogo />

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a
              href="#comment-ca-fonctionne"
              className="font-source-serif font-semibold text-[18px] text-[#002042] tracking-tight hover:opacity-70 transition-opacity"
            >
              Comment ça fonctionne ?
            </a>
            <a
              href="#faq"
              className="font-source-serif font-semibold text-[18px] text-[#002042] tracking-tight hover:opacity-70 transition-opacity"
            >
              FAQ
            </a>
            <a
              href="#hero-form"
              className="border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full text-[18px] hover:bg-[#002042] hover:text-white transition-all"
            >
              Obtenir mon estimation gratuite
            </a>
          </nav>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero section */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-4 md:px-8 pb-0 bg-[#fffff6]">
        <div className="max-w-[1320px] mx-auto">
          <div className="relative rounded-[20px] overflow-hidden min-h-[500px] md:min-h-[680px] flex items-start justify-center">
            <img
              src="/images/Soumissioconfort-hero.jpeg"
              alt="Isolation de grenier"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Hero content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 pt-10 md:pt-16 pb-10 w-full max-w-[860px] mx-auto">
              {/* Eyebrow pill */}
              <div className="mb-6" style={{ transform: "rotate(-5.36deg)" }}>
                <div className="bg-[#aedee5] inline-flex items-center gap-1.5 px-4 py-2 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                  <span className="font-source-serif font-bold text-[16px] md:text-[18px] text-[#002042] tracking-tight">
                    Solution développée au Québec
                  </span>
                  <div className="relative w-6 h-6 shrink-0" style={{ transform: "rotate(-4.64deg)" }}>
                    <img src="/icons/icon-maple.png" alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* H1 */}
              <h1 className="font-display font-semibold text-[36px] md:text-[52px] lg:text-[56px] text-[#fffff6] tracking-tight leading-none mb-4 drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]">
                Estimation d'isolation instantané
              </h1>

              {/* Subtitle */}
              <p className="font-source-serif font-semibold text-[18px] md:text-[20px] text-[#fffff6] tracking-tight mb-8">
                Découvrez le coût pour réisoler votre grenier en{" "}
                <span className="underline">moins d'une minute.</span>
              </p>

              {/* Form card */}
              <div id="hero-form" className="w-full">
                <HeroFormCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works section */}
      {/* ---------------------------------------------------------------- */}
      <section id="comment-ca-fonctionne" className="bg-white py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-10">
          <div className="flex flex-col gap-8 items-center">
            <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] text-center tracking-tight">
              Comment ça fonctionne ?
            </h2>
            <p className="font-source-serif font-semibold text-[18px] md:text-[20px] text-[#10002c] text-center tracking-tight">
              Soumission Confort simplifie le démarrage des projets d'isolation des québecois grâce à un outil
              d'estimation basé sur l'intelligence artificielle et l'expérience d'un réseau de plus de 150
              entrepreneurs certifiés par la RBQ.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {howItWorksCards.map(({ img, imgStyle, title, description }) => (
                <div
                  key={title}
                  className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 flex flex-col gap-6"
                >
                  {/* Figma-accurate icon: 80x80 container with cropped image */}
                  <div className="relative w-20 h-20 overflow-hidden shrink-0 rounded-[12px]">
                    <img
                      src={img}
                      alt=""
                      className="absolute max-w-none pointer-events-none"
                      style={imgStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-source-serif font-bold text-[20px] text-[#10002c] tracking-tight leading-snug">
                      {title}
                    </p>
                    <p className="font-source-serif text-[18px] text-[#10002c] leading-snug">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AddressBar />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* "C'est quoi la crosse ?" section */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-6">
          <div className="flex flex-col gap-8 items-center">
            {/* Section header with sticker */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] text-center tracking-tight">
                C'est quoi la « crosse » ?
              </h2>
              <div style={{ transform: "rotate(-5.36deg)" }}>
                <div className="bg-[#aedee5] inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                  <span className="font-source-serif font-bold text-[22px] md:text-[28px] text-[#002042] tracking-tight">
                    Y en n'a pas !
                  </span>
                  <div className="relative w-9 h-9 shrink-0" style={{ transform: "rotate(-7.7deg)" }}>
                    <img src="/icons/icon-emoji-sticker.svg" alt="" className="w-full h-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 flex flex-col gap-4">
                <img src="/icons/icon-shield.svg" alt="" className="w-12 h-12 shrink-0" />
                <div className="flex flex-col gap-3">
                  <p className="font-source-serif font-bold text-[20px] text-[#10002c] tracking-tight leading-snug">
                    Notre service est 100% gratuit, l'entrepreneur nous offre une commission s'il obtient le contrat,
                    c'est «win-win» !
                  </p>
                  <div className="font-source-serif text-[18px] text-[#10002c] leading-snug space-y-2">
                    <p>Aucune pression. On mise sur la qualité de notre service avant tout.</p>
                    <p>
                      Notre meilleure façon de réussir, c'est de vous trouver l'entrepreneur idéal pour votre projet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 flex flex-col gap-4">
                <img src="/icons/icon-shield.svg" alt="" className="w-12 h-12 shrink-0" />
                <div className="flex flex-col gap-3">
                  <p className="font-source-serif font-bold text-[20px] text-[#10002c] tracking-tight leading-snug">
                    Tous nos entrepreneurs sont certifiés RBQ et vérifiés à 360° par notre équipe.
                  </p>
                  <div className="font-source-serif text-[18px] text-[#10002c] leading-snug space-y-2">
                    <p>Pour mériter la confiance de nos clients, nous sélectionnons nos entrepreneurs avec rigueur.</p>
                    <p>
                      En plus de valider leur licence RBQ, nous analysons leurs avis Google et rencontrons
                      personnellement chacun d'eux avant de les intégrer à notre réseau.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-[#aedee5] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-8 py-12 flex flex-wrap gap-10 justify-around w-full">
              {[
                { number: "5 000 +", label: "Projets d'isolation" },
                { number: "150 +", label: "Entrepreneurs vérifiés" },
                { number: "40%", label: "Économie moyenne" },
              ].map(({ number, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span className="font-source-serif font-bold text-[42px] md:text-[48px] text-[#002042] tracking-tight leading-tight">
                    {number}
                  </span>
                  <span className="font-source-serif text-[18px] text-[#002042] text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <AddressBar />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA block */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div
            className="rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 md:px-12 py-16 flex flex-col items-center gap-8"
            style={{
              background:
                "radial-gradient(ellipse at 20% 20%, rgba(185,225,92,0.15) 0%, transparent 60%), linear-gradient(135deg, #002042 0%, #002042 100%)",
            }}
          >
            {/* Sticker */}
            <div style={{ transform: "rotate(-5.36deg)" }}>
              <div className="bg-[#aedee5] inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                <span className="font-source-serif font-bold text-[22px] text-[#002042] tracking-tight">
                  C'est gratuit !
                </span>
                <div className="relative w-7 h-7 shrink-0" style={{ transform: "rotate(-7.7deg)" }}>
                  <img src="/icons/icon-emoji-sticker.svg" alt="" className="w-full h-full" />
                </div>
              </div>
            </div>

            <h2 className="font-display font-semibold text-[36px] md:text-[52px] lg:text-[56px] text-white text-center tracking-tight leading-none">
              Prêt à estimer votre projet ?
            </h2>

            <div className="w-full max-w-[800px]">
              <AddressBar />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ section */}
      {/* ---------------------------------------------------------------- */}
      <section id="faq" className="bg-white py-16 pb-24">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] text-center tracking-tight">
            FAQ
          </h2>
          <div className="flex flex-col gap-4">
            {faqData.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
