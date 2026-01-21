import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import PWARegistration from "@/components/PWARegistration";
import NotificationInitializer from "@/components/NotificationInitializer";
import { headers } from "next/headers";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri"
});

export const metadata: Metadata = {
  title: "Kur'ancılar",
  description: "Kur'an Okuyucu ve Takip Uygulaması",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kur'ancılar",
  },
  formatDetection: {
    telephone: false,
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
        <body
          className={`${inter.className} ${amiri.variable} antialiased`}
        >
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
