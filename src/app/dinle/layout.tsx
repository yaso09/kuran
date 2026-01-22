import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kur'an Dinle & Radyo",
    description: "Seçkin hafızlardan Kur'an-ı Kerim tilavetleri ve 7/24 kesintisiz Kur'an radyosu.",
    alternates: {
        canonical: 'https://kurancilar.com/dinle',
    },
};

export default function DinleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
