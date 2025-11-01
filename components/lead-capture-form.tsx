"use client"

import React, { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { CheckCircle, Star, MapPin, Clock, Shield, Trophy, Users } from "lucide-react"

interface LeadCaptureFormProps {
  roofData: any
  userAnswers: any
  leadData: any
  onComplete: (pricingData: any) => void
}

export function LeadCaptureForm({ roofData, userAnswers, leadData, onComplete }: LeadCaptureFormProps) {
  const { t } = useLanguage()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pricingData, setPricingData] = useState<any>(null)
  const [showForm, setShowForm] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('� FORM SUBMIT HANDLER CALLED!')
    console.log('🟢 Event:', e)
    console.log('🟢 Form data state:', formData)
    console.log('�🚀 FORM SUBMITTED! Starting lead submission process...')
    console.log('📝 Form data:', formData)
    console.log('🏠 Roof data:', roofData)
    console.log('❓ User answers:', userAnswers)
    setIsSubmitting(true)
    setShowForm(false)
    
    try {
      // Prepare complete lead data with user input
      const leadPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        roofData,
        userAnswers,
        pricingData
      }
      
      console.log('📤 CALLING /api/leads with payload:', leadPayload)
      console.log('🌐 Current URL:', window.location.href)
      
      const startTime = Date.now()
      
      console.log('🚀 About to make fetch request...')
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      }).catch(fetchError => {
        console.error('🔥 FETCH ERROR CAUGHT:', fetchError)
        console.error('🔥 FETCH ERROR TYPE:', typeof fetchError)
        console.error('🔥 FETCH ERROR MESSAGE:', fetchError.message)
        console.error('🔥 FETCH ERROR STACK:', fetchError.stack)
        throw fetchError
      })
      
      console.log('✅ Fetch completed successfully, got response object')
      
      const endTime = Date.now()
      console.log(`⏱️ API call took ${endTime - startTime}ms`)
      console.log('📥 Response status:', response.status)
      console.log('📥 Response ok:', response.ok)
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        console.log('❌ Response not OK, getting error text...')
        const errorText = await response.text()
        console.error('❌ API ERROR - Status:', response.status)
        console.error('❌ API ERROR - Text:', errorText)
        throw new Error(`API call failed: ${response.status}`)
      }
      
      console.log('✅ Response OK, parsing JSON...')
      const result = await response.json()
      console.log('✅ LEAD SUBMITTED SUCCESSFULLY:', result)
      setPricingData(result.pricingData)
      onComplete(result.pricingData)
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR submitting lead:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Still show success to user, but log the error
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
      console.log('🏁 Lead submission process COMPLETED')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone
  
  // Debug form validation
  console.log('🔍 FORM VALIDATION DEBUG:')
  console.log('📝 Form data:', formData)
  console.log('✅ firstName valid:', !!formData.firstName)
  console.log('✅ lastName valid:', !!formData.lastName)
  console.log('✅ email valid:', !!formData.email)
  console.log('✅ phone valid:', !!formData.phone)
  console.log('🎯 isFormValid:', isFormValid)

  // Show loading state while submitting
  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Envoi en cours...</h2>
        <p className="text-gray-600">Nous transmettons vos informations aux entrepreneurs</p>
      </div>
    )
  }

  // Show contact form first
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🎯 Obtenez vos soumissions</h1>
          <p className="text-xl text-gray-600">
            Entrez vos coordonnées pour recevoir des soumissions personnalisées de nos entrepreneurs certifiés
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Vos informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dupont"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jean.dupont@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="514-555-0123"
                />
              </div>

              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                🚀 Obtenir mes soumissions gratuites
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                ⚡ Résultats instantanés • 🔒 100% sécurisé • 📞 Aucun appel non sollicité
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show success page with pricing after submission
  if (isSubmitted && pricingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🎉 Demande envoyée avec succès!</h1>
          <p className="text-xl text-gray-600">
            Vos informations ont été transmises aux entrepreneurs. Voici votre estimation personnalisée:
          </p>
        </div>

        {/* Pricing Results */}
        <Card className="shadow-2xl border-0 mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl">Votre soumission personnalisée</CardTitle>
            <p className="text-gray-600">Basée sur l'analyse de votre toit et vos préférences</p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Investment Range */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl mb-8 text-center">
              <h3 className="text-2xl font-bold mb-4">💰 Investissement estimé</h3>
              <div className="text-5xl font-bold mb-2">
                ${pricingData.lowEstimate?.toLocaleString()} - ${pricingData.highEstimate?.toLocaleString()}
              </div>
              <p className="text-blue-100">Installation professionnelle incluse</p>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{roofData.roofArea}</div>
                <div className="text-gray-600">pi² de toiture</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{pricingData.materialType || 'Standard'}</div>
                <div className="text-gray-600">Matériau recommandé</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">24-48h</div>
                <div className="text-gray-600">Délai de réponse</div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">📋 Prochaines étapes</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Les entrepreneurs examineront les détails de votre projet</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Vous recevrez des appels/emails des entrepreneurs intéressés</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Planifiez des évaluations sur site pour des devis détaillés</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Comparez les devis et choisissez votre entrepreneur préféré</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Confirmation */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📞 Vos informations de contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nom:</span> {formData.firstName} {formData.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {formData.email}
              </div>
              <div>
                <span className="font-medium">Téléphone:</span> {formData.phone}
              </div>
              <div>
                <span className="font-medium">Adresse:</span> {roofData.address}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
