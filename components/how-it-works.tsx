import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export function HowItWorks() {
  const { t } = useLanguage()

  const steps = [
    {
      number: "1",
      title: t.step1Title,
      description: t.step1Description,
      color: "bg-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      number: "2", 
      title: t.step2Title,
      description: t.step2Description,
      color: "bg-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      number: "3",
      title: t.step3Title,
      description: t.step3Description,
      color: "bg-green-500",
      bgColor: "bg-green-50"
    },
    {
      number: "4",
      title: t.step4Title,
      description: t.step4Description,
      color: "bg-purple-500",
      bgColor: "bg-purple-50"
    },
  ]

  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t.howItWorksTitle}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            {t.howItWorksSubtitle}
          </p>
        </div>

        {/* Steps Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className={`${step.bgColor} border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full`}>
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                  {/* Number Circle - Mobile Optimized */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}>
                    <span className="text-white text-lg sm:text-2xl font-bold">{step.number}</span>
                  </div>
                  
                  {/* Title - Mobile Optimized */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex-grow-0 leading-tight">
                    {step.title}
                  </h3>
                  
                  {/* Description - Mobile Optimized */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Connection Arrow - Hidden on Mobile */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action - Mobile Optimized */}
        <div className="text-center bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t.callToActionTitle}
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            {t.callToActionSubtitle}
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-colors duration-300 shadow-lg text-sm sm:text-base">
            {t.callToActionButton}
          </button>
        </div>
      </div>
    </section>
  )
}
