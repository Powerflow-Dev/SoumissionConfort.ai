"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { NavLogo } from "@/components/nav-logo"
import { CheckCircle, TrendingUp, Zap, Users, DollarSign, Award, Mail, Phone } from "lucide-react"

export default function PourEntrepreneursPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    rbqNumber: "",
    serviceArea: "",
    yearsExperience: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/contractor-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Failed to submit")
      setIsSubmitted(true)
      setTimeout(() => router.push("/success?type=contractor"), 2000)
    } catch (error) {
      console.error("Error submitting contractor lead:", error)
      alert("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.companyName && formData.firstName && formData.lastName && formData.email && formData.phone && formData.rbqNumber

  const inputClass =
    "w-full px-4 py-3 border-2 border-[#f2f2f7] rounded-[12px] font-source-serif text-[16px] text-[#10002c] focus:border-[#002042] focus:ring-0 focus:outline-none transition-colors bg-white"

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#fffff6] flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-[#b9e15c] border-2 border-[#002042] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[-2px_4px_0px_0px_#002042]">
            <CheckCircle className="w-10 h-10 text-[#002042]" />
          </div>
          <h1 className="font-display font-bold text-[40px] text-[#002042] tracking-tight mb-4">Merci de votre intérêt!</h1>
          <p className="font-source-serif text-[20px] text-[#10002c]">
            Notre équipe examinera votre demande et vous contactera sous peu.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffff6]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffff6]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLogo />
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="font-source-serif font-semibold text-[16px] text-[#002042] hover:opacity-70 transition-opacity">
              Accueil
            </a>
            <a href="#avantages" className="font-source-serif font-semibold text-[16px] text-[#002042] hover:opacity-70 transition-opacity">
              Avantages
            </a>
            <a
              href="#formulaire"
              className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-3 px-6 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-[16px] hover:brightness-105 transition-all"
            >
              Rejoignez-nous
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#fffff6] py-16">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left: value proposition */}
            <div>
              <div className="mb-6" style={{ transform: "rotate(-3deg)", display: "inline-block" }}>
                <div className="bg-[#aedee5] inline-flex items-center gap-1.5 px-4 py-2 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                  <span className="font-source-serif font-bold text-[16px] text-[#002042]">Réseau #1 au Québec</span>
                </div>
              </div>

              <h1 className="font-display font-bold text-[40px] md:text-[52px] text-[#002042] tracking-tight leading-none mb-6">
                Développez votre entreprise avec Soumission Confort
              </h1>

              <p className="font-source-serif text-[18px] text-[#10002c] mb-8 leading-snug">
                Rejoignez notre réseau d'entrepreneurs certifiés et recevez des leads qualifiés pour vos projets d'isolation.
              </p>

              <div className="flex flex-col gap-5 mb-8">
                {[
                  { icon: CheckCircle, title: "Leads qualifiés", desc: "Recevez uniquement des clients prêts à démarrer leurs projets" },
                  { icon: TrendingUp, title: "Augmentez votre chiffre d'affaires", desc: "Accédez à un flux constant de nouveaux projets" },
                  { icon: Zap, title: "Aucun frais fixe", desc: "Payez uniquement pour les leads que vous acceptez" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#b9e15c] border-2 border-[#002042] rounded-full flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#002042]" />
                    </div>
                    <div>
                      <p className="font-source-serif font-bold text-[18px] text-[#002042]">{title}</p>
                      <p className="font-source-serif text-[16px] text-[#10002c]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-[#aedee5] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-8 flex gap-8 justify-around">
                <div className="text-center">
                  <p className="font-source-serif font-bold text-[36px] text-[#002042] tracking-tight leading-none">4.9/5</p>
                  <p className="font-source-serif text-[16px] text-[#002042]">150+ entrepreneurs</p>
                </div>
                <div className="text-center">
                  <p className="font-source-serif font-bold text-[36px] text-[#002042] tracking-tight leading-none">800+</p>
                  <p className="font-source-serif text-[16px] text-[#002042]">Projets complétés</p>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div id="formulaire" className="lg:sticky lg:top-24">
              <div className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] overflow-hidden">
                <div className="bg-[#002042] text-white p-6 text-center">
                  <h2 className="font-display font-bold text-[28px] mb-1 tracking-tight">Rejoignez notre réseau</h2>
                  <p className="font-source-serif text-[16px] text-white/80">Commencez à recevoir des leads dès aujourd'hui</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-4">
                  <div>
                    <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Nom de l'entreprise *</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required className={inputClass} placeholder="Votre entreprise" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Prénom *</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className={inputClass} placeholder="Jean" />
                    </div>
                    <div>
                      <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Nom *</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className={inputClass} placeholder="Tremblay" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Email professionnel *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClass} placeholder="contact@entreprise.com" />
                  </div>

                  <div>
                    <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Téléphone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className={inputClass} placeholder="514-555-0123" />
                  </div>

                  <div>
                    <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Numéro RBQ *</label>
                    <input type="text" name="rbqNumber" value={formData.rbqNumber} onChange={handleInputChange} required className={inputClass} placeholder="1234-5678-90" />
                  </div>

                  <div>
                    <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Région desservie</label>
                    <input type="text" name="serviceArea" value={formData.serviceArea} onChange={handleInputChange} className={inputClass} placeholder="Ex: Montréal, Laval, Rive-Sud" />
                  </div>

                  <div>
                    <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Années d'expérience</label>
                    <select name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} className={inputClass}>
                      <option value="">Sélectionnez</option>
                      <option value="0-2">0-2 ans</option>
                      <option value="3-5">3-5 ans</option>
                      <option value="6-10">6-10 ans</option>
                      <option value="10+">10+ ans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-source-serif font-semibold text-[14px] text-[#002042] mb-1">Message (optionnel)</label>
                    <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} className={`${inputClass} resize-none`} placeholder="Parlez-nous de votre entreprise..." />
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg disabled:opacity-50 hover:brightness-105 transition-all mt-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#002042] border-t-transparent rounded-full animate-spin" />
                        Envoi en cours...
                      </span>
                    ) : (
                      "Rejoindre le réseau"
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-6 pt-1 text-[13px] text-[#10002c]/60">
                    <div className="flex items-center gap-1">
                      <img src="/icons/icon-check.svg" alt="" className="w-4 h-4" />
                      <span>Gratuit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/icons/icon-shield.svg" alt="" className="w-4 h-4" />
                      <span>Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/icons/icon-check.svg" alt="" className="w-4 h-4" />
                      <span>Réponse rapide</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="avantages" className="bg-white py-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          <div className="flex flex-col gap-4 items-center text-center">
            <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] tracking-tight">
              Pourquoi rejoindre Soumission Confort ?
            </h2>
            <p className="font-source-serif font-semibold text-[18px] text-[#10002c] tracking-tight">
              Nous vous connectons avec des clients qualifiés qui recherchent activement des services d'isolation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Leads Qualifiés", desc: "Tous nos leads sont pré-qualifiés et prêts à recevoir des soumissions. Concentrez-vous sur ce que vous faites de mieux." },
              { icon: DollarSign, title: "Tarification Transparente", desc: "Aucun frais caché. Payez uniquement pour les leads que vous acceptez. Modèle simple et équitable." },
              { icon: Award, title: "Support Dédié", desc: "Notre équipe est là pour vous aider à réussir. Support technique et commercial disponible." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#f2f2f7] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 bg-[#b9e15c] border-2 border-[#002042] rounded-[16px] flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[#002042]" />
                </div>
                <p className="font-source-serif font-bold text-[20px] text-[#002042]">{title}</p>
                <p className="font-source-serif text-[16px] text-[#10002c] leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-8 pb-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="font-display font-bold text-[32px] md:text-[40px] text-[#10002c] tracking-tight">
              Comment ça fonctionne ?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: "1", title: "Inscription", desc: "Remplissez le formulaire et notre équipe validera votre profil" },
              { n: "2", title: "Recevez des leads", desc: "Accédez aux projets correspondant à votre zone de service" },
              { n: "3", title: "Contactez le client", desc: "Présentez votre soumission et décrochez le contrat" },
              { n: "4", title: "Réalisez le projet", desc: "Complétez le travail et recevez votre paiement" },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-[#002042] text-white rounded-full flex items-center justify-center font-display font-bold text-[22px]">
                  {n}
                </div>
                <p className="font-source-serif font-bold text-[17px] text-[#002042]">{title}</p>
                <p className="font-source-serif text-[14px] text-[#10002c] leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA block */}
      <section className="bg-white py-8 pb-16">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div
            className="rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 md:px-12 py-16 flex flex-col items-center gap-6 text-center"
            style={{ background: "linear-gradient(135deg, #002042 0%, #002042 100%)" }}
          >
            <h2 className="font-display font-semibold text-[32px] md:text-[48px] text-white tracking-tight leading-none">
              Prêt à développer votre entreprise ?
            </h2>
            <p className="font-source-serif text-[18px] text-white/80 max-w-lg">
              Rejoignez les 150+ entrepreneurs qui font confiance à Soumission Confort
            </p>
            <a
              href="#formulaire"
              className="bg-[#b9e15c] border-2 border-[#002042] text-[#002042] font-source-serif font-bold py-4 px-8 rounded-full shadow-[-2px_4px_0px_0px_#002042] text-lg hover:brightness-105 transition-all"
            >
              Rejoindre maintenant
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002042] text-white py-12">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="font-source-serif font-bold text-[18px] mb-4">Contact</p>
              <div className="flex flex-col gap-2 font-source-serif text-[16px] text-white/70">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>pro@soumissionconfort.ai</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>1-800-CONFORT</span></div>
              </div>
            </div>
            <div>
              <p className="font-source-serif font-bold text-[18px] mb-4">Liens rapides</p>
              <ul className="flex flex-col gap-2 font-source-serif text-[16px] text-white/70">
                <li><a href="/" className="hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#avantages" className="hover:text-white transition-colors">Avantages</a></li>
                <li><a href="#formulaire" className="hover:text-white transition-colors">Rejoignez-nous</a></li>
              </ul>
            </div>
            <div>
              <p className="font-source-serif font-bold text-[18px] mb-4">Horaires</p>
              <p className="font-source-serif text-[16px] text-white/70">Lundi - Vendredi<br />9h00 - 17h00</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center font-source-serif text-[14px] text-white/50">
            © 2025 Soumission Confort. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
