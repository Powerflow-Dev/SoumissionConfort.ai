"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingDown, Shield, Users, CheckCircle, Award, Star, DollarSign, Home, Snowflake, Thermometer, Wind, TrendingUp, AlertTriangle, Droplets, Zap as Lightning } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { QuoteModal } from "@/components/quote-modal"

export function FeatureCards() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState("")

  const handleOpenModal = (serviceName: string) => {
    setSelectedService(serviceName)
    setIsModalOpen(true)
  }
  // Top 3 features with colored backgrounds
  const topFeatures = [
    {
      icon: Calculator,
      title: "Économisez sur l'Énergie",
      description: "Réduisez vos factures de chauffage et climatisation jusqu'à 40% avec une isolation de qualité.",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      iconBg: "bg-white",
      iconColor: "text-orange-500"
    },
    {
      icon: Shield,
      title: "Experts en Isolation",
      description: "Tous nos entrepreneurs sont certifiés, assurés et spécialisés en isolation résidentielle.",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      iconBg: "bg-white",
      iconColor: "text-green-500"
    },
    {
      icon: TrendingDown,
      title: "Soumissions Gratuites",
      description: "Recevez jusqu'à 3 soumissions détaillées et comparez les prix sans engagement.",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      iconBg: "bg-white",
      iconColor: "text-blue-500"
    }
  ]

  // Bottom 3 benefits with dark cards
  const benefits = [
    {
      icon: TrendingDown,
      title: "RÉDUIRE SA FACTURE D'ÉNERGIE",
      description: "Une isolation performante empêche les déperditions énergétiques. Moins consommer d'énergie pour son chauffage, c'est être moins impuissant face aux variations du coût de l'énergie.",
      iconBg: "bg-gradient-to-br from-blue-500/20 to-blue-600/20"
    },
    {
      icon: Thermometer,
      title: "UN CONFORT DE VIE OPTIMAL",
      description: "Une isolation efficace garantit une stabilité de la température intérieure en protégeant du froid en hiver, en générant moins de déperditions de chaleur, et du chaud en été, en faisant barrage à la chaleur.",
      iconBg: "bg-gradient-to-br from-orange-500/20 to-orange-600/20"
    },
    {
      icon: TrendingUp,
      title: "AJOUTEZ DE LA VALEUR À VOTRE MAISON",
      description: "Une maison conforme aux normes d'efficacité énergétique actuelles, c'est une maison plus saine, plus confortable et plus attrayante. C'est aussi une maison qui vaut plus cher.",
      iconBg: "bg-gradient-to-br from-purple-500/20 to-purple-600/20"
    }
  ]

  // Special services with images
  const specialServices = [
    {
      badge: "Vermiculite",
      title: "DÉCONTAMINATION D'AMIANTE",
      description: "Le Canada interdit maintenant l'amiante, matériau qui peut être contenu dans la vermiculite. Découvrez pourquoi il est mieux de procéder à la décontamination de vermiculite dans votre propriété.",
      image: "/images/decontamination-amiante.jpg", // Placeholder
      buttons: [
        { text: "EN SAVOIR PLUS", variant: "default" as const },
        { text: "OBTENIR UNE SOUMISSION", variant: "outline" as const }
      ]
    },
    {
      badge: "Efficacité Énergétique",
      title: "ISOLATION ÉCOLOGIQUE",
      description: "Optez pour des matériaux d'isolation écologiques et durables. Réduisez votre empreinte carbone tout en améliorant le confort de votre maison avec des solutions respectueuses de l'environnement.",
      image: "/images/isolation-ecologique.jpg", // Placeholder
      buttons: [
        { text: "DÉCOUVRIR", variant: "default" as const },
        { text: "DEMANDER UN DEVIS", variant: "outline" as const }
      ]
    },
    {
      badge: "Protection",
      title: "PARE-VAPEUR ET ÉTANCHÉITÉ",
      description: "Protégez votre maison contre l'humidité et les infiltrations d'eau. Une installation professionnelle de pare-vapeur garantit la durabilité de votre isolation et prévient les problèmes de moisissure.",
      image: "/images/pare-vapeur.jpg", // Placeholder
      buttons: [
        { text: "EN SAVOIR PLUS", variant: "default" as const },
        { text: "OBTENIR UNE SOUMISSION", variant: "outline" as const }
      ]
    }
  ]

  const stats = [
    { number: "5,000+", label: "Projets d'isolation", color: "text-orange-600" },
    { number: "800+", label: "Clients satisfaits", color: "text-green-600" },
    { number: "150+", label: "Entrepreneurs certifiés", color: "text-blue-600" },
    { number: "40%", label: "Économies moyennes", color: "text-purple-600" }
  ]

  return (
    <>
    {/* Hero-style intro section */}
    <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transformez Votre Maison
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed">
            Des solutions d'isolation sur mesure pour améliorer votre confort et réduire vos factures d'énergie
          </p>
        </div>
      </div>
    </section>

    {/* Main content section */}
    <section className="bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Benefits Section - Image/Text alternating layout */}
        <div className="space-y-24 py-12">
          {benefits.map((benefit, index) => (
            <div key={index} className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              {/* Image */}
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={`/images/benefit-${index + 1}.jpg`}
                    alt={benefit.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {benefit.title}
                </h2>
                
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
                  {benefit.description}
                </p>
                
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-full">
                  En savoir plus
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Top 3 Feature Cards - Clean minimal style */}
        <div className="py-20 bg-white rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Nos Avantages
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {topFeatures.map((feature, index) => (
              <div key={index} className="text-center group">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Services Grid - Clean cards */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des solutions adaptées à tous vos besoins en isolation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Isolation de l'Entre-toit", rating: "4.8", reviews: "320+", price: "Dès 2,500$", icon: Home },
              { name: "Isolation des Murs", rating: "4.7", reviews: "280+", price: "Dès 3,800$", icon: Shield },
              { name: "Isolation du Sous-sol", rating: "4.9", reviews: "410+", price: "Dès 2,200$", icon: TrendingDown },
              { name: "Isolation Soufflée", rating: "4.8", reviews: "195+", price: "Dès 1,800$", icon: Snowflake }
            ].map((service, index) => (
              <Card key={index} className="bg-white border-2 border-gray-100 hover:border-teal-400 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                      <service.icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-sm">{service.rating}</span>
                      <span className="text-gray-400 text-xs">({service.reviews})</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{service.name}</h3>
                  <div className="flex items-center space-x-1 text-teal-600 font-bold text-lg mb-4">
                    <span>{service.price}</span>
                  </div>
                  <Button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleOpenModal(service.name)
                    }}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-full text-sm font-semibold"
                  >
                    Obtenir une soumission
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Services Section - Modern layout */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Services Spécialisés
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expertise et solutions sur mesure
            </p>
          </div>

          <div className="space-y-12">
            {specialServices.map((service, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className={`relative aspect-[4/3] md:aspect-auto ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className={`p-8 sm:p-12 lg:p-16 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <span className="inline-block bg-teal-100 text-teal-700 text-sm font-bold px-4 py-2 rounded-full mb-6 w-fit">
                      {service.badge}
                    </span>

                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                      {service.title}
                    </h3>

                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                      {service.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-full">
                        {service.buttons[0].text}
                      </Button>
                      <Button variant="outline" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-6 text-lg rounded-full">
                        {service.buttons[1].text}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Trust Statistics - Clean modern style */}
        <div className="py-20 bg-white rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Ils Nous Font Confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des milliers de propriétaires satisfaits
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold px-12 py-6 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300">
              Commencer Maintenant
            </Button>
            <p className="text-gray-500 mt-6">Gratuit • Sans engagement • Réponse en 24h</p>
          </div>
        </div>
      </div>
    </section>

    {/* Quote Modal */}
    <QuoteModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      serviceName={selectedService}
    />
    </>
  )
}
