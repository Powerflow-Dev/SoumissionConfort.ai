import type { MetadataRoute } from "next"
import { municipalities } from "@/lib/municipalities"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://soumissionconfort.com"

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/soumission-rapide`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/soumission-rapide/questionnaire`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/subventions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/thermopompes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pour-entrepreneurs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ]

  const cityPages: MetadataRoute.Sitemap = municipalities.map((m) => ({
    url: `${baseUrl}/soumission-rapide/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...cityPages]
}
