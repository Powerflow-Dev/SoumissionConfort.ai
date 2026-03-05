"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AddressInput } from "@/components/address-input"
import { NavLogo } from "@/components/nav-logo"
import { getCurrentUTMParameters, type UTMParameters } from "@/lib/utm-utils"
import { track } from "@vercel/analytics"
import {
  Home,
  Building2,
  Zap,
  Flame,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  Layers,
  ThermometerSnowflake,
  Loader2,
  Phone,
  Mail,
  User,
  Calculator,
  Leaf,
  MessageCircle,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FunnelStep = "hero" | "q1" | "q2" | "q3" | "q4" | "lead" | "result"

interface Answers {
  owner: string        // "oui" | "non"
  buildingType: string // "unifamiliale" | "jumelee" | "condo" | "autre"
  heating: string      // "oui" | "non" | "nsp"
  insulation: string   // "aucune" | "partielle" | "ancienne" | "recente" | "nsp"
}

// ---------------------------------------------------------------------------
// Eligibility logic
// ---------------------------------------------------------------------------

function computeEligibility(answers: Answers) {
  const criteria = [
    {
      label: "Propriétaire occupant de la résidence",
      met: answers.owner === "oui",
    },
    {
      label: "Maison unifamiliale, jumelée ou en rangée",
      met: ["unifamiliale", "jumelee"].includes(answers.buildingType),
    },
    {
      label: "Chauffage principal à l'électricité (Hydro-Québec)",
      met: answers.heating === "oui" || answers.heating === "nsp",
    },
    {
      label: "Isolation de l'entretoit à améliorer",
      met: answers.insulation !== "recente",
    },
  ]

  const eligible = criteria.every((c) => c.met)
  return { eligible, criteria }
}

// ---------------------------------------------------------------------------
// Reusable option card
// ---------------------------------------------------------------------------

function OptionCard({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ElementType
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group flex items-center gap-4 w-full p-5 rounded-[16px] border-2 text-left
        transition-all duration-200 cursor-pointer
        ${
          selected
            ? "border-[#002042] bg-[#b9e15c]/20 shadow-lg scale-[1.02]"
            : "border-[#f2f2f7] bg-white hover:border-[#002042]/40 hover:shadow-md hover:scale-[1.01]"
        }
      `}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          selected
            ? "bg-[#002042] text-white"
            : "bg-[#f2f2f7] text-[#002042] group-hover:bg-[#aedee5] group-hover:text-[#002042]"
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-source-serif text-base md:text-lg font-semibold text-[#10002c]">{label}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function SubventionsPage() {
  const router = useRouter()

  // Funnel state
  const [step, setStep] = useState<FunnelStep>("hero")
  const [address, setAddress] = useState("")
  const [answers, setAnswers] = useState<Answers>({
    owner: "",
    buildingType: "",
    heating: "",
    insulation: "",
  })
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [utmParams, setUtmParams] = useState<UTMParameters>({})
  const [leadForm, setLeadForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agreeToTerms: false,
    agreeToContact: false,
  })
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Capture UTMs on mount
  useEffect(() => {
    const params = getCurrentUTMParameters()
    if (Object.keys(params).length > 0) setUtmParams(params)
  }, [])

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [step])

  // -----------------------------------------------------------------------
  // Navigation helpers
  // -----------------------------------------------------------------------

  const stepOrder: FunnelStep[] = ["hero", "q1", "q2", "q3", "q4", "lead", "result"]

  const goBack = useCallback(() => {
    const idx = stepOrder.indexOf(step)
    if (idx > 0) setStep(stepOrder[idx - 1])
  }, [step])

  const progress = (() => {
    const idx = stepOrder.indexOf(step)
    if (idx <= 0) return 0
    // hero=0%, q1=20%, q2=40%, q3=60%, q4=80%, lead=90%, result=100%
    const map: Record<FunnelStep, number> = {
      hero: 0,
      q1: 20,
      q2: 40,
      q3: 60,
      q4: 80,
      lead: 90,
      result: 100,
    }
    return map[step]
  })()

  // -----------------------------------------------------------------------
  // Auto-advance helpers for questions
  // -----------------------------------------------------------------------

  const selectAnswer = (key: keyof Answers, value: string, nextStep: FunnelStep) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    track("Subvention Question Answered", { question: key, answer: value })
    // Small delay for visual feedback before advancing
    setTimeout(() => setStep(nextStep), 250)
  }

  // -----------------------------------------------------------------------
  // Lead submission
  // -----------------------------------------------------------------------

  const isLeadFormValid = () => {
    return (
      leadForm.firstName.trim() &&
      leadForm.lastName.trim() &&
      leadForm.email.trim() &&
      leadForm.phone.trim() &&
      leadForm.agreeToTerms &&
      leadForm.agreeToContact
    )
  }

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = leadForm.phone.replace(/\D/g, "")
    if (digits.length !== 10) {
      setPhoneError("Veuillez entrer un numéro de téléphone à 10 chiffres (ex: 5141234567).")
      return
    }
    setPhoneError(null)
    if (!isLeadFormValid()) return

    setIsSubmittingLead(true)

    const { eligible, criteria } = computeEligibility(answers)
    const eventId = crypto.randomUUID()

    try {
      // Fire Meta Pixel (client-side) with shared eventId for dedup
      if (typeof window !== "undefined" && (window as any).fbq) {
        ;(window as any).fbq(
          "track",
          "Lead",
          { service_type: "subvention" },
          { eventID: eventId }
        )
      }

      track("Lead Submitted", {
        firstName: leadForm.firstName,
        email: leadForm.email,
      })

      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          leadType: "subvention",
          address,
          subventionAnswers: answers,
          eligible,
          eligibilityCriteria: criteria,
          utmParams,
          eventId,
        }),
      })

      track("Subvention Lead Captured", { eligible })
    } catch (error) {
      console.error("Error submitting subvention lead:", error)
    } finally {
      setIsSubmittingLead(false)
      setStep("result")
    }
  }

  // When Q4 is answered, go to inline lead capture
  const handleQ4Answer = (value: string) => {
    setAnswers((prev) => ({ ...prev, insulation: value }))
    track("Subvention Question Answered", { question: "insulation", answer: value })
    setTimeout(() => {
      setStep("lead")
    }, 250)
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const isQuestionStep = ["q1", "q2", "q3", "q4"].includes(step)

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* Header — always visible */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLogo />
          {step !== "hero" && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 font-source-serif text-sm text-[#002042] hover:opacity-70 transition-opacity border-2 border-[#002042] py-2 px-4 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step !== "hero" && (
          <div className="h-1 bg-[#f2f2f7]">
            <div
              className="h-full bg-[#b9e15c] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      {/* ================================================================= */}
      {/* STEP: HERO                                                        */}
      {/* ================================================================= */}
      {step === "hero" && (
        <>
          <section className="px-4 md:px-8 bg-[#fffff6]">
            <div className="max-w-[1320px] mx-auto">
              <div className="relative rounded-[20px] overflow-hidden min-h-[500px] md:min-h-[640px] flex items-start justify-center">
                <img
                  src="/images/heroimage.jpg"
                  alt="Isolation résidentielle"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />

                <div className="relative z-10 flex flex-col items-center text-center px-4 pt-10 md:pt-16 pb-10 w-full max-w-[860px] mx-auto">
                  <div className="mb-6" style={{ transform: "rotate(-5.36deg)" }}>
                    <div className="bg-[#b9e15c] inline-flex items-center gap-1.5 px-4 py-2 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                      <span className="font-source-serif font-bold text-[16px] md:text-[18px] text-[#002042] tracking-tight">
                        Subvention Gouvernementale
                      </span>
                    </div>
                  </div>

                  <h1 className="font-display font-semibold text-[36px] md:text-[52px] lg:text-[56px] text-[#fffff6] tracking-tight leading-none mb-4 drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]">
                    Le gouvernement vous rembourse{" "}
                    <span className="text-[#b9e15c]">1&nbsp;500$</span>
                  </h1>

                  <p className="font-source-serif font-semibold text-[18px] md:text-[20px] text-[#fffff6] tracking-tight mb-8">
                    Vérifiez votre admissibilité en 4 questions. Seulement certaines maisons qualifient.
                  </p>

                  <div className="bg-white rounded-[20px] border border-[#f2f2f7] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8 flex flex-col gap-4 w-full">
                    <AddressInput
                      onAddressSelect={(selectedAddress) => setAddress(selectedAddress)}
                      onAnalyze={() => {
                        if (address.trim()) {
                          track("Subvention Address Entered", { address: address.trim() })
                          setStep("q1")
                        }
                      }}
                      compact
                      className="max-w-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (address.trim()) {
                          track("Subvention Address Entered", { address: address.trim() })
                          setStep("q1")
                        }
                      }}
                      disabled={!address.trim()}
                      className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg disabled:opacity-50 hover:brightness-105 transition-all"
                    >
                      Vérifier mon admissibilité maintenant
                    </button>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {["100% Gratuit", "Sans engagement", "Résultat en 30 secondes"].map((text) => (
                        <div key={text} className="flex items-center gap-1.5">
                          <img src="/icons/icon-check.svg" alt="" className="w-5 h-5 shrink-0" />
                          <span className="text-[#10002c] font-source-serif text-[16px]">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subsidy logos */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                      <img src="/hydro-quebec.svg" alt="Hydro-Québec" className="h-6 w-auto" />
                    </div>
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                      <img src="/Rénoclimat.jpg" alt="Rénoclimat" className="h-6 w-auto" />
                    </div>
                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                      <img src="/Gouvernement_du_Canada_logo.svg" alt="Gouvernement du Canada" className="h-6 w-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ================================================================= */}
      {/* QUESTION STEPS — Full-screen, centered, RoofHero style            */}
      {/* ================================================================= */}

      {isQuestionStep && (
        <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-12">
          <div className="w-full max-w-xl mx-auto">
            {/* Q1: Propriétaire */}
            {step === "q1" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <span className="inline-block bg-[#aedee5] text-[#002042] text-sm font-source-serif font-semibold px-3 py-1 rounded-full mb-4">
                    Question 1 sur 4
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-[#10002c]">
                    Êtes-vous propriétaire de cette résidence?
                  </h2>
                  <p className="font-source-serif text-[#10002c]/70 mt-2">
                    La subvention s'adresse aux propriétaires occupants.
                  </p>
                </div>
                <div className="space-y-3">
                  <OptionCard
                    icon={CheckCircle}
                    label="Oui, je suis propriétaire"
                    selected={answers.owner === "oui"}
                    onClick={() => selectAnswer("owner", "oui", "q2")}
                  />
                  <OptionCard
                    icon={XCircle}
                    label="Non, je suis locataire"
                    selected={answers.owner === "non"}
                    onClick={() => selectAnswer("owner", "non", "q2")}
                  />
                </div>
              </div>
            )}

            {/* Q2: Type de bâtiment */}
            {step === "q2" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <span className="inline-block bg-[#aedee5] text-[#002042] text-sm font-source-serif font-semibold px-3 py-1 rounded-full mb-4">
                    Question 2 sur 4
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-[#10002c]">
                    Quel type de bâtiment habitez-vous?
                  </h2>
                  <p className="font-source-serif text-[#10002c]/70 mt-2">
                    Seules les maisons unifamiliales, jumelées et en rangée sont admissibles.
                  </p>
                </div>
                <div className="space-y-3">
                  <OptionCard
                    icon={Home}
                    label="Maison unifamiliale"
                    selected={answers.buildingType === "unifamiliale"}
                    onClick={() => selectAnswer("buildingType", "unifamiliale", "q3")}
                  />
                  <OptionCard
                    icon={Building2}
                    label="Jumelée ou en rangée"
                    selected={answers.buildingType === "jumelee"}
                    onClick={() => selectAnswer("buildingType", "jumelee", "q3")}
                  />
                  <OptionCard
                    icon={Building2}
                    label="Condo / Appartement"
                    selected={answers.buildingType === "condo"}
                    onClick={() => selectAnswer("buildingType", "condo", "q3")}
                  />
                  <OptionCard
                    icon={HelpCircle}
                    label="Autre"
                    selected={answers.buildingType === "autre"}
                    onClick={() => selectAnswer("buildingType", "autre", "q3")}
                  />
                </div>
              </div>
            )}

            {/* Q3: Chauffage */}
            {step === "q3" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <span className="inline-block bg-[#aedee5] text-[#002042] text-sm font-source-serif font-semibold px-3 py-1 rounded-full mb-4">
                    Question 3 sur 4
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-[#10002c]">
                    Votre maison est-elle chauffée principalement à l'électricité?
                  </h2>
                  <p className="font-source-serif text-[#10002c]/70 mt-2">
                    Le programme cible les maisons chauffées à l'électricité (Hydro-Québec).
                  </p>
                </div>
                <div className="space-y-3">
                  <OptionCard
                    icon={Zap}
                    label="Oui, électricité (Hydro-Québec)"
                    selected={answers.heating === "oui"}
                    onClick={() => selectAnswer("heating", "oui", "q4")}
                  />
                  <OptionCard
                    icon={Flame}
                    label="Non (gaz, mazout, autre)"
                    selected={answers.heating === "non"}
                    onClick={() => selectAnswer("heating", "non", "q4")}
                  />
                  <OptionCard
                    icon={HelpCircle}
                    label="Je ne sais pas"
                    selected={answers.heating === "nsp"}
                    onClick={() => selectAnswer("heating", "nsp", "q4")}
                  />
                </div>
              </div>
            )}

            {/* Q4: Isolation */}
            {step === "q4" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <span className="inline-block bg-[#aedee5] text-[#002042] text-sm font-source-serif font-semibold px-3 py-1 rounded-full mb-4">
                    Question 4 sur 4
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-[#10002c]">
                    Quel est l'état actuel de l'isolation de votre entretoit?
                  </h2>
                  <p className="font-source-serif text-[#10002c]/70 mt-2">
                    L'isolation doit atteindre au moins R-50 pour être admissible à la subvention.
                  </p>
                </div>
                <div className="space-y-3">
                  <OptionCard
                    icon={Layers}
                    label="Aucune ou très peu d'isolation"
                    selected={answers.insulation === "aucune"}
                    onClick={() => handleQ4Answer("aucune")}
                  />
                  <OptionCard
                    icon={Layers}
                    label="Isolation partielle"
                    selected={answers.insulation === "partielle"}
                    onClick={() => handleQ4Answer("partielle")}
                  />
                  <OptionCard
                    icon={Layers}
                    label="Isolation complète mais ancienne"
                    selected={answers.insulation === "ancienne"}
                    onClick={() => handleQ4Answer("ancienne")}
                  />
                  <OptionCard
                    icon={ThermometerSnowflake}
                    label="Isolation récente (déjà R-50+)"
                    selected={answers.insulation === "recente"}
                    onClick={() => handleQ4Answer("recente")}
                  />
                  <OptionCard
                    icon={HelpCircle}
                    label="Je ne sais pas"
                    selected={answers.insulation === "nsp"}
                    onClick={() => handleQ4Answer("nsp")}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ================================================================= */}
      {/* STEP: LEAD CAPTURE (inline form, subventions-styled)              */}
      {/* ================================================================= */}
      {step === "lead" && (
        <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-12">
          <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#aedee5] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#002042]" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#10002c] mb-2">
                Plus qu'une étape pour connaître votre admissibilité
              </h2>
              <p className="font-source-serif text-[#10002c]/70">
                Entrez vos coordonnées pour recevoir votre résultat d'admissibilité à la subvention.
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="bg-white rounded-[20px] border border-[#f2f2f7] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block font-source-serif text-sm font-semibold text-[#002042] mb-1">Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002042]/40" />
                    <input
                      id="firstName"
                      type="text"
                      value={leadForm.firstName}
                      onChange={(e) => setLeadForm((p) => ({ ...p, firstName: e.target.value }))}
                      disabled={isSubmittingLead}
                      className="w-full pl-10 pr-4 py-3 border border-[#f2f2f7] rounded-[12px] font-source-serif focus:border-[#002042] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Jean"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block font-source-serif text-sm font-semibold text-[#002042] mb-1">Nom de famille *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002042]/40" />
                    <input
                      id="lastName"
                      type="text"
                      value={leadForm.lastName}
                      onChange={(e) => setLeadForm((p) => ({ ...p, lastName: e.target.value }))}
                      disabled={isSubmittingLead}
                      className="w-full pl-10 pr-4 py-3 border border-[#f2f2f7] rounded-[12px] font-source-serif focus:border-[#002042] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Tremblay"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block font-source-serif text-sm font-semibold text-[#002042] mb-1">Adresse courriel *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002042]/40" />
                  <input
                    id="email"
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                    disabled={isSubmittingLead}
                    className="w-full pl-10 pr-4 py-3 border border-[#f2f2f7] rounded-[12px] font-source-serif focus:border-[#002042] focus:ring-0 focus:outline-none transition-colors"
                    placeholder="jean@exemple.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block font-source-serif text-sm font-semibold text-[#002042] mb-1">Numéro de téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002042]/40" />
                  <input
                    id="phone"
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                    disabled={isSubmittingLead}
                    className="w-full pl-10 pr-4 py-3 border border-[#f2f2f7] rounded-[12px] font-source-serif focus:border-[#002042] focus:ring-0 focus:outline-none transition-colors"
                    placeholder="(514) 123-4567"
                    required
                  />
                </div>
                {phoneError && (
                  <p className="font-source-serif text-sm text-red-600 mt-1">{phoneError}</p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leadForm.agreeToTerms}
                    onChange={(e) => setLeadForm((p) => ({ ...p, agreeToTerms: e.target.checked }))}
                    disabled={isSubmittingLead}
                    className="mt-1 w-4 h-4 rounded border-[#f2f2f7] text-[#002042] focus:ring-[#002042]"
                  />
                  <span className="font-source-serif text-sm text-[#10002c]/70">
                    J'accepte les{" "}
                    <a href="#" className="text-[#002042] hover:underline">Conditions d'utilisation</a>{" "}
                    et la{" "}
                    <a href="#" className="text-[#002042] hover:underline">Politique de confidentialité</a> *
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leadForm.agreeToContact}
                    onChange={(e) => setLeadForm((p) => ({ ...p, agreeToContact: e.target.checked }))}
                    disabled={isSubmittingLead}
                    className="mt-1 w-4 h-4 rounded border-[#f2f2f7] text-[#002042] focus:ring-[#002042]"
                  />
                  <span className="font-source-serif text-sm text-[#10002c]/70">
                    Je consens à être contacté par Soumission Confort concernant mon projet *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!isLeadFormValid() || isSubmittingLead}
                className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg disabled:opacity-50 hover:brightness-105 transition-all mt-4"
              >
                {isSubmittingLead ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Vérification en cours...</span>
                  </div>
                ) : (
                  <span>Découvrir mon admissibilité</span>
                )}
              </button>

              <div className="flex items-center justify-center flex-wrap gap-4 pt-2 text-xs text-[#10002c]/50 font-source-serif">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>100% Sécurisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Résultat instantané</span>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ================================================================= */}
      {/* STEP: RESULT                                                      */}
      {/* ================================================================= */}
      {step === "result" && (
        <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-12">
          <div className="w-full max-w-2xl mx-auto">
            {(() => {
              const { eligible, criteria } = computeEligibility(answers)

              if (eligible) {
                return (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Success card */}
                    <div className="bg-[#aedee5]/20 border-2 border-[#aedee5] rounded-[20px] p-8 md:p-12 text-center shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                      <div className="w-20 h-20 bg-[#002042] rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src="/icons/icon-check.svg" alt="" className="w-10 h-10 brightness-200" />
                      </div>
                      <h2 className="font-display text-2xl md:text-4xl font-bold text-[#10002c] mb-4">
                        Bonne nouvelle!
                      </h2>
                      <p className="font-source-serif text-lg md:text-xl text-[#10002c] mb-2">
                        Votre maison est <strong className="text-[#002042]">admissible</strong> à la subvention de
                      </p>
                      <p className="font-display text-5xl md:text-6xl font-bold text-[#002042] mb-6">
                        1&nbsp;500$
                      </p>

                      <div className="bg-white rounded-[16px] p-6 text-left space-y-3 mb-8 border border-[#f2f2f7]">
                        {criteria.map((c, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src="/icons/icon-check.svg" alt="" className="w-5 h-5 shrink-0" />
                            <span className="font-source-serif text-[#10002c]">{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/success")}
                      className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-5 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Leaf className="w-5 h-5" />
                        <span>Parler à un agent en optimisation éco-énergétique</span>
                        <ArrowRight className="w-5 h-5 shrink-0" />
                      </div>
                    </button>

                    <a
                      href="/"
                      className="flex items-center justify-center gap-3 w-full bg-white border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-5 px-8 rounded-full text-lg hover:bg-[#002042] hover:text-white transition-all"
                    >
                      <Calculator className="w-5 h-5" />
                      <span>Combien coûteraient les travaux?</span>
                      <ArrowRight className="w-5 h-5 shrink-0" />
                    </a>

                    <p className="font-source-serif text-sm text-[#10002c]/50 text-center">
                      100% gratuit • Sans engagement • Un expert vous rappelle sous 24h
                    </p>
                  </div>
                )
              }

              // Not eligible
              return (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-white border-2 border-[#f2f2f7] rounded-[20px] p-8 md:p-12 text-center shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                    <div className="w-20 h-20 bg-[#002042]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-10 h-10 text-[#002042]" />
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-[#10002c] mb-4">
                      Votre maison ne semble pas admissible à cette subvention
                    </h2>
                    <p className="font-source-serif text-[#10002c]/70 mb-6">
                      D'après vos réponses, les critères suivants ne sont pas remplis :
                    </p>

                    <div className="bg-[#fffff6] rounded-[16px] p-6 text-left space-y-3 mb-6 border border-[#f2f2f7]">
                      {criteria.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {c.met ? (
                            <img src="/icons/icon-check.svg" alt="" className="w-5 h-5 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                          )}
                          <span className={`font-source-serif ${c.met ? "text-[#10002c]" : "text-red-700 font-semibold"}`}>
                            {c.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="font-source-serif text-[#10002c]/70">
                      D'autres programmes pourraient s'appliquer à votre situation.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/success")}
                    className="w-full bg-[#002042] text-white font-source-serif font-bold py-5 px-8 rounded-full text-lg hover:brightness-110 transition-all"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      <span>Être contacté pour explorer mes options</span>
                      <ArrowRight className="w-5 h-5 shrink-0" />
                    </div>
                  </button>

                  <a
                    href="/"
                    className="flex items-center justify-center gap-3 w-full bg-white border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-5 px-8 rounded-full text-lg hover:bg-[#002042] hover:text-white transition-all"
                  >
                    <Calculator className="w-5 h-5" />
                    <span>Combien coûteraient les travaux?</span>
                    <ArrowRight className="w-5 h-5 shrink-0" />
                  </a>

                  <p className="font-source-serif text-sm text-[#10002c]/50 text-center">
                    100% gratuit • Sans engagement • Un expert vous rappelle sous 24h
                  </p>
                </div>
              )
            })()}
          </div>
        </main>
      )}
    </div>
  )
}
