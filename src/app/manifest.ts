import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Kur'ancılar",
        short_name: "Kur'ancılar",
        description: "Modern ve Sosyal Kur'an-ı Kerim Platformu",
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0c0f',
        theme_color: '#0b0c0f',
        icons: [
            {
                src: '/icons/36x36.png',
                sizes: '36x36',
                type: 'image/png',
            },
            {
                src: '/icons/48x48.png',
                sizes: '48x48',
                type: 'image/png',
            },
            {
                src: '/icons/72x72.png',
                sizes: '72x72',
                type: 'image/png',
            },
            {
                src: '/icons/96x96.png',
                sizes: '96x96',
                type: 'image/png',
            },
            {
                src: '/icons/144x144.png',
                sizes: '144x144',
                type: 'image/png',
            },
            {
                src: '/icons/192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
