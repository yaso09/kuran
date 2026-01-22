import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sureler ve Mealler",
    description: "Kur'an-ı Kerim'in 114 suresi, mealleri ve tefsirleri. Ayetler üzerinde tefekkür edin ve notlar alın.",
    alternates: {
        canonical: 'https://kurancilar.com/kuran',
    },
};

export default function KuranLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
