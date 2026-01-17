import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import NotificationInitializer from "@/components/NotificationInitializer";

const inter = Inter({ subsets: ["latin"] });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri"
});

export const viewport: Viewport = {
  themeColor: "#0b0c0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Kur'ancılar",
  description: "Kur'an Okuyucu ve Takip Uygulaması",
  manifest: "/manifest.json",
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
          <NotificationInitializer />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
