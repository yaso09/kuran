import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri"
});

export const metadata: Metadata = {
  title: "Kur'ancılar",
  description: "Kur'an Okuyucu ve Takip Uygulaması",
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
