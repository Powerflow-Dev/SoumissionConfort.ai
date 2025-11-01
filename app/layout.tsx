import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Soumission Toiture AI - Devis de Toiture Instantanés au Canada",
  description: "Obtenez une analyse de toit alimentée par l'IA et connectez-vous avec des entrepreneurs locaux certifiés partout au Canada. Soumissions instantanées en 60 secondes.",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico',
  },
  viewport: 'width=device-width, initial-scale=1',
  charset: 'UTF-8',
  openGraph: {
    title: "Soumission Toiture AI - Devis de Toiture Instantanés au Canada",
    description: "Obtenez une analyse de toit alimentée par l'IA et connectez-vous avec des entrepreneurs locaux certifiés partout au Canada. Soumissions instantanées en 60 secondes.",
    url: 'https://soumission-toiture.ai',
    siteName: 'Soumission Toiture AI',
    locale: 'fr_CA',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Soumission Toiture AI",
    "description": "Soumission toiture gratuite au Québec. Réparation toiture urgente 24h, couvreurs certifiés.",
    "url": "https://soumission-toiture.ai",
    "telephone": "+1-800-TOITURE",
    "priceRange": "$$",
    "areaServed": [
      {
        "@type": "State",
        "name": "Québec"
      },
      {
        "@type": "City", 
        "name": "Shawinigan"
      },
      {
        "@type": "City",
        "name": "Magog" 
      },
      {
        "@type": "City",
        "name": "Saguenay"
      }
    ],
    "serviceType": [
      "Réparation toiture urgente",
      "Soumission toiture gratuite", 
      "Estimation toiture",
      "Couvreur certifié",
      "Fuite toit urgence",
      "Infiltration eau toiture"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services de toiture",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Réparation toiture urgente 24h",
            "description": "Service d'urgence pour réparation de toit, fuite et infiltration d'eau"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Soumission toiture gratuite",
            "description": "Estimation gratuite et instantanée pour tous travaux de toiture"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1247"
    }
  }

  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17524782837"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17524782837');
            `
          }}
        />

        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            {/* Meta Pixel Code */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                  fbq('track', 'PageView');
                `
              }}
            />
            <noscript>
              <img 
                height="1" 
                width="1" 
                style={{display:'none'}}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
            {/* End Meta Pixel Code */}
          </>
        )}
      </head>
      <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
