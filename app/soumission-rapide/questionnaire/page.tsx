"use client"

import type React from "react"
import { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Check, CheckCircle, Loader2, MapPin } from "lucide-react"
import { getCurrentUTMParameters, type UTMParameters } from "@/lib/utm-utils"
import { getMunicipalityBySlug } from "@/lib/municipalities"
import { AddressInput } from "@/components/address-input"

declare global {
  interface Window {
    fbq: (...args: any[]) => void
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

/* ────────────────────────────────────────────
   Step option data — matches live soumissionconfort.com
   ──────────────────────────────────────────── */

const HABITATION_OPTIONS = [
  { value: "unifamiliale", label: "Maison unifamiliale" },
  { value: "multiplex", label: "Multiplex" },
]

const OWNERSHIP_OPTIONS = [
  { value: "proprietaire", label: "Je suis déjà propriétaire" },
  { value: "achat", label: "En processus d'achat" },
  { value: "vente", label: "En processus de vente" },
]

const INSULATION_OPTIONS = [
  { value: "insuffisante", label: "Oui, mais l'isolation est insuffisante" },
  { value: "non", label: "Non / très peu isolé" },
  { value: "inconnue", label: "Je ne sais pas" },
]

const STEP_CONFIG = [
  { key: "habitation", title: "Type d'habitation", subtitle: "Quel type d'habitation souhaitez-vous isoler ?", options: HABITATION_OPTIONS },
  { key: "ownership", title: "Êtes-vous propriétaire ?", subtitle: "Êtes-vous en processus d'achat ou de vente de l'habitation ?", options: OWNERSHIP_OPTIONS },
  { key: "insulation", title: "État de l'isolation", subtitle: "Savez-vous si votre entretoit est déjà isolé ?", options: INSULATION_OPTIONS },
]

const STEPS_TOTAL = STEP_CONFIG.length + 1 // +1 for address step

/* ────────────────────────────────────────────
   Analytics helpers
   ──────────────────────────────────────────── */

function trackStepEvent(stepNumber: number, stepName: string, stepValue: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "questionnaire_step", {
      event_category: "pSEO Questionnaire",
      step_number: stepNumber,
      step_name: stepName,
      step_value: stepValue,
    })
  }
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", "QuestionnaireStep", {
      step_number: stepNumber,
      step_name: stepName,
      step_value: stepValue,
      source: "soumission-rapide",
    })
  }
}

function trackQuestionnaireStart(ville: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "questionnaire_start", {
      event_category: "pSEO Questionnaire",
      ville: ville,
    })
  }
}

function trackQuestionnaireComplete(ville: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "questionnaire_complete", {
      event_category: "pSEO Questionnaire",
      ville: ville,
    })
  }
}

function trackLeadSubmit(ville: string, eventId: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      event_category: "pSEO Questionnaire",
      ville: ville,
      event_id: eventId,
    })
  }
}

/* ────────────────────────────────────────────
   Questionnaire content
   ──────────────────────────────────────────── */

function QuestionnaireContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const villeSlug = searchParams.get("ville") || ""
  const timeline = searchParams.get("timeline") || "exploring"

  const municipality = getMunicipalityBySlug(villeSlug)
  const cityName = municipality?.name || villeSlug

  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [showAddressStep, setShowAddressStep] = useState(false)
  const [address, setAddress] = useState("")
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const submittingRef = useRef(false)
  const [utmParams, setUtmParams] = useState<UTMParameters>({})

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agreeToTerms: false,
    agreeToContact: false,
  })

  useEffect(() => {
    setUtmParams(getCurrentUTMParameters())
    trackQuestionnaireStart(villeSlug)
  }, [villeSlug])

  const handleSelect = useCallback((stepKey: string, value: string) => {
    setSelections((prev) => ({ ...prev, [stepKey]: value }))
    trackStepEvent(currentStep + 1, stepKey, value)

    setTimeout(() => {
      if (currentStep < STEP_CONFIG.length - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        // Show address step
        setShowAddressStep(true)
      }
    }, 350)
  }, [currentStep])

  const handleAddressContinue = () => {
    if (!address.trim()) return
    trackStepEvent(STEP_CONFIG.length + 1, "address", address)
    trackQuestionnaireComplete(villeSlug)
    setShowAddressStep(false)
    setShowLeadForm(true)
  }

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.agreeToTerms &&
      formData.agreeToContact
    )
  }

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid() || submittingRef.current) return
    submittingRef.current = true

    setIsSubmittingLead(true)
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          ville: villeSlug,
          address: address,
          source: "soumission-rapide",
          leadType: "isolation",
          userAnswers: {
            habitation: selections.habitation || "",
            ownership: selections.ownership || "",
            insulationState: selections.insulation || "",
            timeline: timeline,
          },
          utmParams,
          eventId,
        }),
      })

      if (!res.ok) throw new Error(`leads api ${res.status}`)
      const result = await res.json()

      // Meta Pixel — Lead event
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          currency: "CAD",
          ...(utmParams.utm_source && { utm_source: utmParams.utm_source }),
          ...(utmParams.utm_campaign && { utm_campaign: utmParams.utm_campaign }),
          ...(utmParams.utm_medium && { utm_medium: utmParams.utm_medium }),
          ...(utmParams.utm_content && { utm_content: utmParams.utm_content }),
        }, { eventID: eventId })
      }

      trackLeadSubmit(villeSlug, eventId)

      sessionStorage.setItem(
        "soumission-rapide-lead",
        JSON.stringify({
          firstName: formData.firstName,
          ville: cityName,
          villeSlug,
          leadId: result.leadId,
          timeline,
        })
      )

      router.push("/soumission-rapide/merci")
    } catch (err) {
      console.error("Lead submission error:", err)
      sessionStorage.setItem(
        "soumission-rapide-lead",
        JSON.stringify({
          firstName: formData.firstName,
          ville: cityName,
          villeSlug,
          timeline,
        })
      )
      router.push("/soumission-rapide/merci")
    } finally {
      setIsSubmittingLead(false)
    }
  }

  const getStepNumber = () => {
    if (showLeadForm) return STEPS_TOTAL
    if (showAddressStep) return STEP_CONFIG.length + 1
    return currentStep + 1
  }

  const progressPercent = showLeadForm ? 100 : (getStepNumber() / STEPS_TOTAL) * 100

  const handleBack = () => {
    if (showLeadForm) {
      setShowLeadForm(false)
      setShowAddressStep(true)
    } else if (showAddressStep) {
      setShowAddressStep(false)
      setCurrentStep(STEP_CONFIG.length - 1)
    } else if (currentStep > 0) {
      setCurrentStep((p) => p - 1)
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFF6] flex flex-col" style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-[#FFFFF6] border-b border-[#e8e8e0]">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logosoumissionconfort-1.png" alt="Soumission Confort" className="h-12 md:h-16 w-auto" />
          </Link>
          {cityName && (
            <span className="hidden md:inline-block bg-[#AEDEE5] rounded-full px-4 py-1.5 font-bold text-[#1B2244] text-sm">
              {cityName}
            </span>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center pt-6 pb-20 px-4">
        <div className="w-full max-w-2xl">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm font-medium text-[#375371] hover:text-[#002042] transition-colors"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
            <span className="text-sm text-[#375371] font-medium" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Étape {getStepNumber()} / {STEPS_TOTAL}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#e8e8e0] rounded-full h-3 mb-10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #AEDEE5 0%, #b9e15c 100%)",
              }}
            />
          </div>

          {/* Option steps */}
          {!showAddressStep && !showLeadForm && (
            <>
              <div className="text-center mb-8">
                <h2
                  className="text-2xl md:text-3xl font-bold text-[#10002C] mb-2"
                  style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}
                >
                  {STEP_CONFIG[currentStep].title}
                </h2>
                <p className="text-[#375371] text-base" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  {STEP_CONFIG[currentStep].subtitle}
                </p>
              </div>

              <div className={`grid gap-4 ${STEP_CONFIG[currentStep].options.length <= 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                {STEP_CONFIG[currentStep].options.map((opt) => {
                  const isSelected = selections[STEP_CONFIG[currentStep].key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(STEP_CONFIG[currentStep].key, opt.value)}
                      className={`relative flex flex-col items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg select-none text-center ${
                        isSelected
                          ? "border-[#86a735] bg-[#ecf8cf] shadow-md"
                          : "border-[#AEDEE5] bg-white hover:bg-[#f0fafb] hover:border-[#002042]"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#86a735] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-[#10002C] leading-tight" style={{ fontFamily: "'Source Serif 4', serif" }}>
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Address step */}
          {showAddressStep && !showLeadForm && (
            <>
              <div className="text-center mb-8">
                <h2
                  className="text-2xl md:text-3xl font-bold text-[#10002C] mb-2"
                  style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}
                >
                  Où se trouve votre propriété?
                </h2>
                <p className="text-[#375371] text-base" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  Pour trouver des entrepreneurs près de chez vous et estimer vos économies potentielles.
                </p>
              </div>

              <div className="bg-white border-2 border-[#AEDEE5] rounded-[20px] shadow-md p-6 lg:p-8">
                <AddressInput
                  onAddressSelect={(selectedAddress) => setAddress(selectedAddress)}
                  onAnalyze={handleAddressContinue}
                  className="w-full"
                />
                <button
                  onClick={handleAddressContinue}
                  disabled={!address.trim()}
                  className="w-full mt-6 bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-[-2px_4px_0_0_#002042] hover:shadow-[-1px_2px_0_0_#002042] hover:translate-y-0.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                  style={{ fontFamily: "'Radio Canada Big', sans-serif" }}
                >
                  Continuer
                </button>
              </div>
            </>
          )}

          {/* Lead form */}
          {showLeadForm && (
            <div className="bg-white border-2 border-[#AEDEE5] rounded-[20px] shadow-md p-6 lg:p-8">
              <div className="text-center mb-6">
                <h2
                  className="text-xl md:text-2xl font-bold text-[#10002C] mb-2"
                  style={{ fontFamily: "'Radio Canada Big', 'Inter', sans-serif" }}
                >
                  Recevez jusqu'à 3 soumissions d'entrepreneurs certifiés
                </h2>
                <p className="text-[#375371] text-base">
                  Entrez vos coordonnées pour recevoir vos soumissions et discuter de votre projet.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#375371] mb-1">
                      Votre prénom*
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      disabled={isSubmittingLead}
                      className="w-full border-2 border-[#e8e8e0] focus:border-[#002042] rounded-lg px-4 py-3 text-base outline-none transition-colors"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#375371] mb-1">
                      Nom de famille*
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      disabled={isSubmittingLead}
                      className="w-full border-2 border-[#e8e8e0] focus:border-[#002042] rounded-lg px-4 py-3 text-base outline-none transition-colors"
                      placeholder="Tremblay"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#375371] mb-1">
                    Adresse courriel*
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmittingLead}
                    className="w-full border-2 border-[#e8e8e0] focus:border-[#002042] rounded-lg px-4 py-3 text-base outline-none transition-colors"
                    placeholder="jean@exemple.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#375371] mb-1">
                    Numéro de téléphone*
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={isSubmittingLead}
                    className="w-full border-2 border-[#e8e8e0] focus:border-[#002042] rounded-lg px-4 py-3 text-base outline-none transition-colors"
                    placeholder="(514) 555-5555"
                    required
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }))}
                      disabled={isSubmittingLead}
                      className="mt-1 w-4 h-4 rounded border-[#e8e8e0] text-[#002042] focus:ring-[#002042] flex-shrink-0"
                    />
                    <span className="text-sm text-[#375371] leading-relaxed">
                      J'accepte les{" "}
                      <a href="/politique-de-confidentialite" className="text-[#002042] underline hover:opacity-70">
                        Conditions d'utilisation
                      </a>{" "}
                      et la{" "}
                      <a href="/politique-de-confidentialite" className="text-[#002042] underline hover:opacity-70">
                        Politique de confidentialité
                      </a>{" "}
                      *
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToContact}
                      onChange={(e) => setFormData((prev) => ({ ...prev, agreeToContact: e.target.checked }))}
                      disabled={isSubmittingLead}
                      className="mt-1 w-4 h-4 rounded border-[#e8e8e0] text-[#002042] focus:ring-[#002042] flex-shrink-0"
                    />
                    <span className="text-sm text-[#375371] leading-relaxed">
                      Je consens à être contacté par Soumission Confort concernant mon projet *
                    </span>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={!isFormValid() || isSubmittingLead}
                    className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-[-2px_4px_0_0_#002042] hover:shadow-[-1px_2px_0_0_#002042] hover:translate-y-0.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                    style={{ fontFamily: "'Radio Canada Big', sans-serif" }}
                  >
                    {isSubmittingLead ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </span>
                    ) : (
                      "Obtenir mes 3 soumissions"
                    )}
                  </button>
                </div>
              </form>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-5 pt-4 border-t border-[#e8e8e0]">
                {[
                  "Gratuit et sans obligation",
                  "Entrepreneurs certifiés RBQ",
                  "Soumissions en 48h",
                ].map((label) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm text-[#375371]">
                    <CheckCircle className="w-4 h-4 text-[#AEDEE5]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* What happens next */}
              <div className="mt-6 pt-5 border-t border-[#e8e8e0]">
                <p className="text-center text-sm font-semibold text-[#375371] mb-3">
                  Que se passe-t-il ensuite ?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      num: "1",
                      title: "Nous lançons la recherche",
                      desc: "Notre équipe analyse votre projet et lance la recherche dans notre réseau d'entrepreneurs certifiés près de chez vous.",
                    },
                    {
                      num: "2",
                      title: "Nous discutons avec les entrepreneurs",
                      desc: "Nous validons avec eux les détails de votre projet pour trouver les entrepreneurs les plus pertinents.",
                    },
                    {
                      num: "3",
                      title: "Vous recevez jusqu'à 3 soumissions",
                      desc: "Nous vous faisons parvenir jusqu'à 3 soumissions d'entrepreneurs prêts à prendre en charge votre projet.",
                    },
                  ].map((step) => (
                    <div
                      key={step.num}
                      className="bg-[#FFFFF6] border border-[#AEDEE5]/50 rounded-xl p-3"
                    >
                      <p className="text-xs font-bold text-[#002042] mb-1" style={{ fontFamily: "'Radio Canada Big', sans-serif" }}>
                        {step.num}. {step.title}
                      </p>
                      <p className="text-xs text-[#375371] leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFFF6] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#AEDEE5] border-t-[#002042] rounded-full animate-spin" />
        </div>
      }
    >
      <QuestionnaireContent />
    </Suspense>
  )
}
