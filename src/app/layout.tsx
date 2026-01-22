import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import PWARegistration from "@/components/PWARegistration";
import NotificationInitializer from "@/components/NotificationInitializer";
import { headers } from "next/headers";
import AppShell from "@/components/AppShell";
import Script from "next/script";

import StructuredData from "@/components/StructuredData";

const inter = Inter({ subsets: ["latin"] });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri"
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kurancilar.com'),
  title: {
    default: "Kur'ancılar | Dijital Kur'an Deneyimi",
    template: "%s | Kur'ancılar"
  },
  description: "Kur'an-ı Kerim okuma, meal karşılaştırma, sesli dinleme ve sosyal tefekkür platformu. Reklamsız ve modern Kur'an deneyimi.",
  keywords: ["kuran", "quran", "kuran oku", "meal", "kuran meali", "diyanet vakfı", "tefsir", "islam", "ayet", "sure"],
  authors: [{ name: "Kur'ancılar" }],
  creator: "Kur'ancılar",
  publisher: "Kur'ancılar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://kurancilar.com",
    siteName: "Kur'ancılar",
    title: "Kur'ancılar | Dijital Kur'an Deneyimi",
    description: "Kur'an-ı Kerim okuma, meal karşılaştırma ve sosyal tefekkür platformu.",
    images: [
      {
        url: "/vercel.svg", // Placeholder for actual social image
        width: 1200,
        height: 630,
        alt: "Kur'ancılar Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kur'ancılar | Modern Kur'an Okuyucu",
    description: "Reklamsız, modern ve sosyal Kur'an-ı Kerim platformu.",
    images: ["/vercel.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://kurancilar.com',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kur'ancılar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#d97706', // amber-600
          colorText: 'white',
          colorBackground: '#15171c',
          colorInputBackground: '#0b0c0f',
          colorInputText: 'white',
        }
      }}
    >
      <html lang="tr">
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-PVWM506F0M"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-PVWM506F0M');
            `}
          </Script>
        </head>
        <body
          className={`${inter.className} ${amiri.variable} antialiased`}
        >
          <StructuredData />
          <PWARegistration />
          <NotificationInitializer />
          <AppShell isMobile={isMobile}>
            {children}
          </AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
