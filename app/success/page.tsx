"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Home, Phone, ArrowRight } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero with background image */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/heroimage.jpg"
            alt="Travaux de toiture par des entrepreneurs professionnels"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-green-300 font-medium">Demande bien reçue</p>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Merci! Votre demande de soumission a été transmise
            </h1>
            <p className="text-base md:text-lg text-blue-100 max-w-2xl">
              Nous contactons les meilleurs entrepreneurs de votre région. Vous recevrez jusqu'à 3 soumissions
              détaillées dans les prochaines 24 heures.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="inline-flex">
                <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Home className="w-4 h-4 mr-2" /> Retour à l'accueil
                </Button>
              </Link>
              <a href="tel:+15149091526" className="inline-flex">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  <Phone className="w-4 h-4 mr-2" /> Nous contacter
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Validation de votre projet",
              desc:
                "Un membre de notre équipe valide rapidement les détails pour assurer un bon appariement avec les entrepreneurs.",
            },
            {
              title: "Appariement avec 3 entrepreneurs",
              desc:
                "Nous sélectionnons des entrepreneurs certifiés et bien notés disponibles dans votre secteur pour votre type de projet.",
            },
            {
              title: "Réception de soumissions détaillées",
              desc:
                "Comparez les prix, les matériaux et les délais. Notre objectif est de vous aider à économiser et choisir en confiance.",
            },
          ].map((item, idx) => (
            <Card key={idx} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center mb-4">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Optimisez vos chances d'obtenir le meilleur prix</h2>
            <p className="text-gray-600 mb-6 md:mb-8">
              Préparez quelques photos de votre toiture et vos préférences de matériaux. Cela accélère l'obtention de
              soumissions précises.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Parcourir nos conseils <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
