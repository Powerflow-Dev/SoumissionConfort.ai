"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingDown, Shield, Users, CheckCircle, Award } from 'lucide-react'

export function FeatureCards() {
  const features = [
    {
      icon: Calculator,
      title: "Économisez jusqu'à 30%",
      description: "Comparez les prix de plusieurs entrepreneurs et choisissez la meilleure offre pour votre budget.",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: Shield,
      title: "Entrepreneurs Certifiés",
      description: "Tous nos partenaires sont licenciés, assurés et ont été vérifiés pour leur expertise.",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: TrendingDown,
      title: "Comparaison Transparente",
      description: "Recevez des devis détaillés et comparez facilement les services et les prix.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    }
  ]

  const stats = [
    { number: "50,000+", label: "Soumissions générées", color: "text-orange-600" },
    { number: "1,200+", label: "Clients satisfaits", color: "text-green-600" },
    { number: "500+", label: "Entrepreneurs partenaires", color: "text-blue-600" },
    { number: "4.9★", label: "Note moyenne", color: "text-purple-600" }
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Pourquoi Choisir Notre Plateforme ?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            La solution la plus simple et efficace pour comparer les prix de toiture au Québec
          </p>
        </div>

        {/* Feature Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.bgColor} ${feature.borderColor} border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full`}>
              <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                {/* Icon - Mobile Optimized */}
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}>
                  <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color}`} />
                </div>
                
                {/* Title - Mobile Optimized */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex-grow-0 leading-tight">
                  {feature.title}
                </h3>
                
                {/* Description - Mobile Optimized */}
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Statistics - Mobile Optimized */}
        <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Des Résultats qui Parlent
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Rejoignez des milliers de propriétaires qui nous font confiance
            </p>
          </div>

          {/* Stats Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color} mb-1 sm:mb-2`}>
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action - Mobile Optimized */}
          <div className="text-center mt-8 sm:mt-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">100% Gratuit</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Sans Engagement</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Résultats en 60s</span>
              </div>
            </div>
            
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-colors duration-300 shadow-lg text-sm sm:text-base">
              Commencer ma comparaison gratuite
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
