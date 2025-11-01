"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from 'lucide-react'

export function SocialProofSection() {
  const testimonials = [
    {
      name: "Jean Dupont",
      location: "Sherbrooke, QC",
      avatar: "/jean.jpg?height=40&width=40",
      rating: 5,
      text: "J'ai reçu 3 soumissions en 24 heures! Ça m'a sauvé des semaines d'appels. Les prix étaient très précis.",
      verified: true,
    },
    {
      name: "Michael Bouchard",
      location: "Québec, QC",
      avatar: "/michael.jpg?height=40&width=40",
      rating: 5,
      text: "L'analyse par IA était incroyablement précise. Mon entrepreneur a confirmé toutes les mesures.",
      verified: true,
    },
    {
      name: "Carole Gagnon",
      location: "Laval, QC",
      avatar: "/CAROLE.jpg?height=40&width=40",
      rating: 5,
      text: "Entrepreneurs professionnels, prix équitables. Exactement ce dont j'avais besoin après la tempête de grêle.",
      verified: true,
    },
  ]

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            Approuvé par 50 000+ propriétaires canadiens
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Vrais résultats de vrais propriétaires</h2>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-700">4,9/5</span>
            <span className="text-gray-500">(2 847 avis)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                    <div className="flex space-x-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-6 h-6 text-blue-200" />
                  <p className="text-gray-700 italic pl-4">{testimonial.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust logos */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 mb-6">Approuvé par des organisations de premier plan</p>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">BBB A+</div>
            <div className="text-2xl font-bold text-gray-400">Google</div>
            <div className="text-2xl font-bold text-gray-400">HomeStars</div>
            <div className="text-2xl font-bold text-gray-400">CAA Québec</div>
          </div>
        </div>
      </div>
    </section>
  )
}
