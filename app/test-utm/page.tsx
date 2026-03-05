"use client"

import { useState, useEffect } from "react"
import { getCurrentUTMParameters, extractUTMParameters, type UTMParameters } from "@/lib/utm-utils"
import { Code, RefreshCw, ExternalLink } from "lucide-react"
import { NavLogo } from "@/components/nav-logo"

export default function TestUTMPage() {
  const [utmParams, setUtmParams] = useState<UTMParameters>({})
  const [urlParams, setUrlParams] = useState<UTMParameters>({})
  const [storedParams, setStoredParams] = useState<UTMParameters>({})

  const refreshParams = () => {
    const currentUrl = extractUTMParameters()
    setUrlParams(currentUrl)
    const stored = getCurrentUTMParameters()
    setStoredParams(stored)
    const combined = getCurrentUTMParameters()
    setUtmParams(combined)
  }

  useEffect(() => {
    refreshParams()
  }, [])

  const testUrls = [
    {
      name: "Facebook Campaign",
      url: "?utm_source=facebook&utm_campaign=toiture2024&utm_content=hero-cta&utm_medium=social&utm_term=reparation-toit"
    },
    {
      name: "Google Ads",
      url: "?utm_source=google&utm_campaign=urgence-toiture&utm_content=ad-text&utm_medium=cpc&utm_term=fuite-toit-urgence"
    },
    {
      name: "Email Newsletter",
      url: "?utm_source=newsletter&utm_campaign=winter2024&utm_content=email-banner&utm_medium=email"
    }
  ]

  const simulateWebhook = async () => {
    const testPayload = {
      firstName: "Test",
      lastName: "UTM",
      email: "test@utm.com",
      phone: "514-123-4567",
      roofData: {
        address: "123 Test Street, Montreal, QC",
        roofArea: 1500,
        buildingHeight: 2
      },
      userAnswers: {
        roofAge: "5-15",
        roofMaterial: "asphalt",
        propertyAccess: "easy",
        serviceType: ["completeReplacement"],
        timeline: "soon",
        contactTime: "morning"
      },
      pricingData: {
        lowEstimate: 12000,
        highEstimate: 18000,
        materialType: "Standard",
        complexity: "moderate"
      },
      utmParams: utmParams
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      })
      const result = await response.json()
      console.log('🧪 Test webhook response:', result)
      alert('Test webhook envoyé ! Vérifiez la console et Make.com pour les résultats.')
    } catch (error) {
      console.error('❌ Test webhook error:', error)
      alert('Erreur lors du test webhook. Vérifiez la console.')
    }
  }

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLogo />
          <span className="bg-[#aedee5] text-[#002042] font-source-serif font-semibold text-sm px-3 py-1.5 rounded-full">
            Dev Tools
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-[#10002c] mb-4">🧪 Test des Paramètres UTM</h1>
          <p className="font-source-serif text-xl text-[#10002c]/70">
            Testez la capture et transmission des paramètres UTM publicitaires
          </p>
        </div>

        {/* Current URL and Parameters */}
        <div className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Code className="w-5 h-5 text-[#002042]" />
            <h2 className="font-display text-xl font-bold text-[#10002c]">URL Actuelle et Paramètres</h2>
          </div>
          <p className="font-source-serif text-sm text-[#10002c]/60 mb-6">
            URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side rendering'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-source-serif font-semibold text-sm text-[#002042] mb-2">URL Actuelle</h4>
              <div className="bg-[#fffff6] border border-[#f2f2f7] p-3 rounded-[12px] text-sm">
                {Object.keys(urlParams).length > 0 ? (
                  Object.entries(urlParams).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-mono text-[#002042]">{key}:</span>
                      <span className="font-mono text-[#10002c]">{value}</span>
                    </div>
                  ))
                ) : (
                  <span className="font-source-serif text-[#10002c]/50">Aucun paramètre UTM dans l'URL</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-source-serif font-semibold text-sm text-[#002042] mb-2">SessionStorage</h4>
              <div className="bg-[#fffff6] border border-[#f2f2f7] p-3 rounded-[12px] text-sm">
                {Object.keys(storedParams).length > 0 ? (
                  Object.entries(storedParams).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-mono text-[#002042]">{key}:</span>
                      <span className="font-mono text-[#10002c]">{value}</span>
                    </div>
                  ))
                ) : (
                  <span className="font-source-serif text-[#10002c]/50">Aucun paramètre stocké</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-source-serif font-semibold text-sm text-[#002042] mb-2">Paramètres Finaux</h4>
              <div className="bg-[#aedee5]/20 border border-[#aedee5] p-3 rounded-[12px] text-sm">
                {Object.keys(utmParams).length > 0 ? (
                  Object.entries(utmParams).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-mono text-[#002042]">{key}:</span>
                      <span className="font-mono font-semibold text-[#002042]">{value}</span>
                    </div>
                  ))
                ) : (
                  <span className="font-source-serif text-[#10002c]/50">Aucun paramètre UTM détecté</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={refreshParams}
              className="flex items-center gap-2 border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-2 px-4 rounded-full hover:bg-[#002042] hover:text-white transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={simulateWebhook}
              className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-2 px-4 rounded-full shadow-[-2px_3px_0px_0px_#002042] hover:brightness-105 transition-all text-sm"
            >
              🧪 Tester le Webhook
            </button>
          </div>
        </div>

        {/* Test URLs */}
        <div className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8 mb-6">
          <h2 className="font-display text-xl font-bold text-[#10002c] mb-1">🔗 URLs de Test</h2>
          <p className="font-source-serif text-sm text-[#10002c]/60 mb-6">
            Cliquez sur ces liens pour tester différents scénarios UTM
          </p>
          <div className="space-y-4">
            {testUrls.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-[#f2f2f7] rounded-[12px]">
                <div>
                  <h4 className="font-source-serif font-semibold text-[#10002c]">{test.name}</h4>
                  <code className="text-sm text-[#002042] bg-[#fffff6] px-2 py-1 rounded border border-[#f2f2f7]">
                    {test.url}
                  </code>
                </div>
                <button
                  onClick={() => window.location.href = test.url}
                  className="flex items-center gap-2 border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-2 px-4 rounded-full hover:bg-[#002042] hover:text-white transition-all text-sm shrink-0 ml-4"
                >
                  <ExternalLink className="w-4 h-4" />
                  Tester
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-[#10002c] mb-4">📋 Instructions de Test</h2>
          <ol className="list-decimal list-inside space-y-2 font-source-serif text-sm text-[#10002c]/70">
            <li>Cliquez sur un des liens de test ci-dessus pour ajouter des paramètres UTM à l'URL</li>
            <li>Vérifiez que les paramètres sont correctement détectés dans les sections ci-dessus</li>
            <li>Cliquez sur "Tester le Webhook" pour simuler une soumission de lead</li>
            <li>Vérifiez dans Make.com que les paramètres UTM sont bien reçus dans les colonnes T, U, V, W, X</li>
            <li>Testez la persistance en naviguant vers la page d'accueil puis en revenant ici</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
