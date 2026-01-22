"use client";

import Script from "next/script";

export default function StructuredData() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Kur'ancılar",
        "url": "https://kurancilar.com", // Assuming domain
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://kurancilar.com/kuran?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        },
        "description": "Kur'an-ı Kerim Okuma, Meal Karşılaştırma ve Sosyal Tefekkür Platformu",
        "publisher": {
            "@type": "Organization",
            "name": "Kur'ancılar",
            "logo": {
                "@type": "ImageObject",
                "url": "https://kurancilar.com/vercel.svg" // Placeholder for actual logo
            }
        }
    };

    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
