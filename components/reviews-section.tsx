"use client"

import { Star } from 'lucide-react'

const reviews = [
  {
    id: 1,
    name: "Brian Grant Rogers",
    text: "Isolation de l'entre-toit impeccable! J'ai économisé 35% sur mes factures de chauffage. Service professionnel et rapide.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sophie Tremblay",
    text: "Trois soumissions reçues en 24h pour l'isolation de mon sous-sol. Prix compétitifs et entrepreneurs certifiés. Très satisfaite!",
    rating: 5,
  },
  {
    id: 3,
    name: "Marc Leblanc",
    text: "Plateforme simple et efficace. J'ai comparé les prix facilement et choisi le meilleur entrepreneur pour isoler mes murs. Excellent!",
    rating: 5,
  },
]

export function ReviewsSection() {
  return (
    <section className="bg-[#fffff6] py-16 sm:py-20 border-t border-[#e8e8e0]">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex flex-col items-center gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#10002c] tracking-tight">
            Ce que disent nos clients
          </h2>
          <p className="font-serif-body font-semibold text-lg text-[#375371] tracking-tight">
            Plus de 800 propriétaires ont amélioré leur confort grâce à notre plateforme
          </p>
          {/* Google badge */}
          <div className="flex items-center gap-2 bg-white border border-[#f2f2f7] rounded-full px-5 py-2 shadow-sm">
            <span className="font-serif-body font-semibold text-[#002042]">Google Reviews</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-serif-body font-bold text-[#002042]">4.9/5</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="font-serif-body text-[#b9e15c] text-4xl font-bold leading-none">"</div>
              <p className="font-serif-body text-[#375371] text-base leading-relaxed tracking-tight flex-1">
                {review.text}
              </p>
              <div className="flex items-center gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#002042] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-heading font-bold text-base">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-serif-body font-semibold text-[#10002c] text-base">{review.name}</p>
                  <p className="font-serif-body text-[#375371] text-sm">Client vérifié</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
