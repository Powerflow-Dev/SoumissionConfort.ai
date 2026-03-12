"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { InsulationResults } from "@/components/insulation-results"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2 } from 'lucide-react'
import Link from "next/link"

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
        <div className="bg-white border border-[#aedee5] rounded-[20px] shadow-xl p-10 max-w-md mx-auto text-center">
          <div className="w-16 h-16 border-4 border-[#aedee5] border-t-[#002042] rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-heading text-2xl font-bold text-[#10002c] mb-2">Chargement de votre estimation...</h2>
          <p className="font-serif-body text-[#375371]">Veuillez patienter</p>
        </div>
      </div>
    )
  }

  if (error || !pricingData) {
    return (
      <div className="min-h-screen bg-[#fffff6] flex items-center justify-center p-4">
        <div className="bg-white border border-[#aedee5] rounded-[20px] shadow-xl p-10 max-w-md mx-auto text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-heading text-2xl font-bold text-[#10002c] mb-2">Erreur</h2>
          <p className="font-serif-body text-[#375371] mb-6">{error || "Données introuvables"}</p>
          <Link href="/" className="font-serif-body font-semibold text-[#002042] underline hover:opacity-70">
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
      <header className="bg-[#fffff6] border-b border-[#e8e8e0] sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between max-w-7xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <img src="/images/logo-icon.svg" alt="" className="h-7 md:h-[48px] w-auto" />
              <div className="font-heading font-bold text-[#002042] leading-[0.9] tracking-[-0.04em] text-[18px] md:text-[26px] whitespace-nowrap">
                <p>Soumission</p>
                <p>Confort</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {roofData?.address && (
              <div className="flex items-center gap-1.5 font-serif-body text-sm text-[#375371]">
                <MapPin className="w-3.5 h-3.5 text-[#002042]" />
                <span className="truncate max-w-[130px] md:max-w-xs">{roofData.address}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-[#b9e15c]/30 border border-[#b9e15c] rounded-full px-3 py-1">
              <span className="font-serif-body font-semibold text-[#002042] text-xs">Estimation prête</span>
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
        <div className="w-12 h-12 border-4 border-[#aedee5] border-t-[#002042] rounded-full animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
