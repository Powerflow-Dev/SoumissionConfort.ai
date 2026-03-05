"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { InsulationResults } from "@/components/insulation-results"
import { MapPin, Loader2 } from 'lucide-react'
import Link from "next/link"
import { NavLogo } from "@/components/nav-logo"

function PricingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pricingData, setPricingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const leadId = searchParams.get("leadId")

  useEffect(() => {
    const fetchPricingData = async () => {
      if (!leadId) {
        setError("Aucun ID de lead fourni")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/pricing-data?leadId=${leadId}`)

        if (!response.ok) {
          throw new Error("Impossible de récupérer les données de pricing")
        }

        const data = await response.json()
        setPricingData(data)
      } catch (err) {
        console.error("Error fetching pricing data:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    fetchPricingData()
  }, [leadId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffff6] flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 text-center">
          <div className="w-16 h-16 bg-[#002042] rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#10002c] mb-2">Chargement de votre estimation...</h2>
          <p className="font-source-serif text-[#10002c]/70">Veuillez patienter</p>
        </div>
      </div>
    )
  }

  if (error || !pricingData) {
    return (
      <div className="min-h-screen bg-[#fffff6] flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-display text-2xl font-bold text-[#10002c] mb-2">Erreur</h2>
          <p className="font-source-serif text-[#10002c]/70 mb-4">{error || "Données introuvables"}</p>
          <Link
            href="/"
            className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full shadow-[-2px_4px_0px_0px_#002042] hover:brightness-105 transition-all inline-block"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const { roofData, userAnswers, leadData } = pricingData

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <NavLogo />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#002042]/40" />
                <span className="font-source-serif text-sm text-[#10002c] truncate max-w-xs">{roofData?.address || "Adresse"}</span>
              </div>
              <span className="bg-[#b9e15c] text-[#002042] font-source-serif font-semibold text-sm px-3 py-1.5 rounded-full border border-[#002042]">
                Estimation Prête
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <InsulationResults
          roofData={roofData}
          userAnswers={userAnswers}
          leadData={leadData}
          onComplete={() => router.push("/success")}
        />
      </main>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fffff6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#002042] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
