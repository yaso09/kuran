import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/ayarlar/', '/api/'],
        },
        sitemap: 'https://kurancilar.com/sitemap.xml',
    }
}
