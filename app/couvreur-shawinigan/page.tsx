"use client"

import { AddressInput } from "@/components/address-input"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingDown, Shield, Clock, Users, MapPin, CheckCircle, Award } from 'lucide-react'
import { useState } from "react"
import { useRouter } from "next/navigation"

function ToitureShawiniganPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [address, setAddress] = useState("")

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/images/logo-fr.png" alt="Toiture Shawinigan" className="h-[80px] w-auto" />
          </div>
          <Badge className="bg-orange-500 text-white border-orange-500 px-4 py-2">
            Service Local Shawinigan
          </Badge>
        </div>
      </header>

      {/* Hero Section - Craver Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url('/images/heroimage.jpg?v=${Date.now()}')`
          }}
        />
        
        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-6 flex items-center justify-center min-h-screen">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl w-full">
            
            {/* Left Side - Content */}
            <div className="text-white">
              <div className="mb-6">
                <Badge className="bg-orange-500 text-white border-orange-500 px-4 py-2 text-sm font-medium">
                  Entrepreneurs Locaux Shawinigan
                </Badge>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                Toiture à
                <br />
                <span className="text-orange-400">Shawinigan</span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
                Comparez les prix des meilleurs entrepreneurs en toiture de Shawinigan et région. 
                Obtenez plusieurs soumissions gratuites en quelques minutes.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Calculator className="w-6 h-6 text-orange-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Estimation Gratuite</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingDown className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Économisez 30%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Entrepreneurs Locaux</span>
                </div>
              </div>

              {/* Local Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Entrepreneurs Certifiés RBQ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>500+ Projets à Shawinigan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Réponse Rapide</span>
                </div>
              </div>
            </div>

            {/* Right Side - Solid Box Form */}
            <div className="w-full">
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    Entrepreneurs Toiture Shawinigan
                  </h2>
                  <p className="text-gray-600">
                    Comparez les prix des meilleurs entrepreneurs locaux de Shawinigan
                  </p>
                </div>

                {/* Address Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Votre adresse à Shawinigan
                  </label>
                  <AddressInput
                    onAddressSelect={setAddress}
                    onAnalyze={() => {
                      if (address.trim()) {
                        router.push(`/analysis?address=${encodeURIComponent(address)}&region=shawinigan`)
                      }
                    }}
                  />
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Entrepreneurs locaux de Shawinigan</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Connaissance du climat local</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Prix compétitifs région Mauricie</span>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="text-center text-xs text-gray-500">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Tous nos entrepreneurs sont certifiés RBQ</span>
                  </div>
                  <p>Service 100% gratuit • Aucune inscription requise</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Local Advantages Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi Choisir des Entrepreneurs de Shawinigan?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les entrepreneurs locaux connaissent parfaitement le climat et les défis spécifiques de la région Mauricie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Connaissance du Climat Local",
                description: "Expertise des conditions hivernales rigoureuses et des défis climatiques de la Mauricie",
                color: "text-blue-500",
                bgColor: "bg-blue-50"
              },
              {
                title: "Disponibilité Rapide",
                description: "Entrepreneurs basés à Shawinigan pour une intervention rapide et un service personnalisé",
                color: "text-green-500",
                bgColor: "bg-green-50"
              },
              {
                title: "Prix Compétitifs",
                description: "Tarifs adaptés au marché local de Shawinigan, sans frais de déplacement élevés",
                color: "text-orange-500",
                bgColor: "bg-orange-50"
              },
              {
                title: "Matériaux Adaptés",
                description: "Sélection de matériaux résistants aux conditions climatiques de la région",
                color: "text-purple-500",
                bgColor: "bg-purple-50"
              },
              {
                title: "Références Locales",
                description: "Nombreux projets réalisés à Shawinigan avec références vérifiables dans votre quartier",
                color: "text-indigo-500",
                bgColor: "bg-indigo-50"
              },
              {
                title: "Service Après-Vente",
                description: "Suivi et garanties assurés par des entrepreneurs établis dans la région",
                color: "text-red-500",
                bgColor: "bg-red-50"
              }
            ].map((advantage, index) => (
              <div key={index} className={`${advantage.bgColor} rounded-2xl p-6 hover:shadow-lg transition-shadow`}>
                <h3 className={`text-xl font-bold ${advantage.color} mb-3`}>{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Notre Impact à Shawinigan
            </h2>
            <p className="text-xl text-gray-600">
              Des résultats concrets pour les propriétaires de Shawinigan et région
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl lg:text-5xl font-bold text-orange-500 mb-3">500+</div>
              <div className="text-gray-600 font-medium">Projets à Shawinigan</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl lg:text-5xl font-bold text-green-500 mb-3">25+</div>
              <div className="text-gray-600 font-medium">Entrepreneurs Locaux</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl lg:text-5xl font-bold text-blue-500 mb-3">4.8★</div>
              <div className="text-gray-600 font-medium">Note Moyenne Locale</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl lg:text-5xl font-bold text-purple-500 mb-3">35%</div>
              <div className="text-gray-600 font-medium">Économies Moyennes</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Prêt à Comparer les Prix à Shawinigan?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connectez-vous avec les meilleurs entrepreneurs en toiture de Shawinigan et économisez sur votre projet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Entrepreneurs Locaux Certifiés</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <CheckCircle className="w-5 h-5" />
              <span>Prix Compétitifs Région</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <CheckCircle className="w-5 h-5" />
              <span>Service 100% Gratuit</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ToitureShawiniganPage;
