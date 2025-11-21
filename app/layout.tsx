import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Soumission Confort - Estimation Gratuite d'Isolation d'Entretoit au Québec",
  description: "Obtenez votre estimation gratuite d'isolation d'entretoit en 60 secondes. Connectez-vous avec des entrepreneurs certifiés RBQ. Économisez jusqu'à 30% sur vos factures de chauffage. Subventions disponibles avec Hydro-Québec et RénoClimat.",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Soumission Confort - Estimation Gratuite d'Isolation d'Entretoit au Québec",
    description: "Obtenez votre estimation gratuite d'isolation d'entretoit en 60 secondes. Connectez-vous avec des entrepreneurs certifiés RBQ. Économisez jusqu'à 30% sur vos factures de chauffage. Subventions disponibles avec Hydro-Québec et RénoClimat.",
    url: 'https://soumissionconfort.ai',
    siteName: 'Soumission Confort',
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
    "name": "Soumission Confort",
    "description": "Estimation gratuite d'isolation d'entretoit au Québec. Entrepreneurs certifiés RBQ, subventions disponibles avec Hydro-Québec, LogisVert et RénoClimat.",
    "url": "https://soumissionconfort.ai",
    "telephone": "+1-800-CONFORT",
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
      "Isolation d'entretoit",
      "Estimation isolation gratuite", 
      "Isolation soufflée",
      "Isolation cellulose",
      "Amélioration efficacité énergétique",
      "Subventions isolation Hydro-Québec",
      "Programme RénoClimat",
      "Programme LogisVert"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services d'isolation d'entretoit",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Isolation d'entretoit soufflée",
            "description": "Installation d'isolation cellulose ou fibre de verre soufflée pour améliorer l'efficacité énergétique"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Estimation gratuite d'isolation",
            "description": "Évaluation instantanée avec 3 gammes de prix et calcul des économies d'énergie"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Aide aux subventions",
            "description": "Accompagnement pour obtenir les subventions Hydro-Québec, LogisVert et RénoClimat"
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
                  fbq('init', '1508005413751111');
                  fbq('track', 'PageView');
                `
              }}
            />
            <noscript>
              <img 
                height="1" 
                width="1" 
                style={{display:'none'}}
                src="https://www.facebook.com/tr?id=1508005413751111&ev=PageView&noscript=1"
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
