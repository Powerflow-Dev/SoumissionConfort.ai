"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { X, Loader2, Shield, Clock, Star, Gift, ArrowRight } from 'lucide-react'
import { track } from '@vercel/analytics'

interface LeadCapturePopupProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (leadData: LeadData) => void
  isSubmitting?: boolean
  roofData?: any
}

export interface LeadData {
  firstName: string
  lastName: string
  email: string
  phone: string
  agreeToTerms: boolean
  agreeToContact: boolean
  leadId?: string // Optional leadId added after submission
}

export function LeadCapturePopup({ isOpen, onClose, onSubmit, isSubmitting = false, roofData }: LeadCapturePopupProps) {
  const { t } = useLanguage()
  
  // Calculate maximum potential savings based on roof area
  // Premium insulation can save up to $1,200/year on average
  // We use a conservative estimate based on roof area
  const estimatedMaxSavings = roofData?.roofArea 
    ? Math.round((roofData.roofArea / 2000) * 1200) // Scale based on average 2000 sq ft = $1200/year
    : 1200 // Default fallback
  const [formData, setFormData] = useState<LeadData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agreeToTerms: false,
    agreeToContact: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      // Track lead submission
      track('Lead Submitted', {
        firstName: formData.firstName,
        email: formData.email
      })
      
      // Meta Pixel tracking is handled in user-questionnaire.tsx via fbq('track', 'Lead')
      // Server-side tracking is handled in the webhook endpoint
      console.log('Lead form submitted - tracking handled elsewhere')

      onSubmit(formData)
    }
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

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-lg max-h-[95vh] overflow-y-auto overflow-x-hidden border-0 shadow-2xl p-3 sm:p-4">
        {/* Header with value proposition */}
        <DialogHeader className="text-center pb-2 border-b border-gray-100">
          <div className="flex items-center justify-end mb-2">
            {!isSubmitting && (
              <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 text-center">
            Plus qu'une étape avant d'obtenir votre estimation de prix
          </h2>
        </DialogHeader>

        {/* Form container with max width to keep content contained */}
        <form onSubmit={handleSubmit} className="space-y-2 max-w-md mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                {t.firstName} *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                disabled={isSubmitting}
                className="mt-1 border-2 focus:border-blue-500 rounded-lg"
                placeholder="Jean"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                {t.lastName} *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                disabled={isSubmitting}
                className="mt-1 border-2 focus:border-blue-500 rounded-lg"
                placeholder="Tremblay"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t.emailAddress} *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={isSubmitting}
              className="mt-1 border-2 focus:border-blue-500 rounded-lg"
              placeholder="jean@exemple.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              {t.phoneNumber} *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              disabled={isSubmitting}
              className="mt-1 border-2 focus:border-blue-500 rounded-lg"
              placeholder="(514) 123-4567"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                disabled={isSubmitting}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-600">
                J'accepte les{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Conditions d'utilisation
                </a>{" "}
                et la{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Politique de confidentialité
                </a>{" "}
                *
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="contact"
                checked={formData.agreeToContact}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToContact: checked as boolean }))}
                disabled={isSubmitting}
                className="mt-1"
              />
              <Label htmlFor="contact" className="text-sm leading-relaxed text-gray-600">
                Je consens à être contacté par Soumission Confort concernant mon projet *
              </Label>
            </div>
          </div>

          {/* Action button - Full width CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 text-base sm:text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  Découvrir mon estimation maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {/* Energy savings box - Below CTA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 mt-3 text-center">
              <p className="text-sm font-semibold text-green-800 mb-1">
                Économie d'énergie potentielle:
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-green-700">
                Jusqu'à {estimatedMaxSavings.toLocaleString()}$
              </p>
              <p className="text-sm text-green-600 font-medium mb-1">
                par année
              </p>
              <p className="text-xs text-green-600">
                Données estimées par notre IA.
              </p>
            </div>
            
            {/* Trust indicators - Moved below CTA */}
            <div className="flex flex-wrap justify-center gap-3 py-2 mt-2">
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-blue-700">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>100% Sécurisé</span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-green-700">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Estimation instantanée</span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-purple-700">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Gratuit</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full mt-1 text-gray-500 hover:text-gray-700 text-sm"
            >
              Plus tard
            </Button>
          </div>
        </form>

        {/* Benefits - After form */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100 mt-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Ce que vous obtiendrez instantanément :</h4>
          <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
            <li>• Analyse détaillée de votre isolation</li>
            <li>• Estimation de prix précise</li>
            <li>• 3 entrepreneurs certifiés jumelés</li>
            <li>• Support prioritaire</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center space-x-4">
          <span>• SSL Sécurisé</span>
          <span>• Aucun spam</span>
          <span>• Résultats instantanés</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
