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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chargement de votre estimation...</h2>
            <p className="text-gray-600">Veuillez patienter</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !pricingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{error || "Données introuvables"}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Retour à l'accueil
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { roofData, userAnswers, leadData } = pricingData

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/images/logosoumissionconfort-1.png" alt="Soumission Confort AI" className="h-[120px] md:h-[140px] w-auto" />
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate max-w-xs">{roofData?.address || "Adresse"}</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Estimation Prête
              </Badge>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
