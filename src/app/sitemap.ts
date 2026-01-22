import { MetadataRoute } from 'next'
import { SURAHS } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://kurancilar.com'

    // Static routes
    const staticRoutes = [
        '',
        '/kuran',
        '/dinle',
        '/forum',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Surah routes
    const surahRoutes = SURAHS.map((surah) => ({
        url: `${baseUrl}/kuran/${surah.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...staticRoutes, ...surahRoutes]
}
