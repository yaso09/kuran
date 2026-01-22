import { Metadata } from "next";
import { SURAHS } from "@/lib/constants";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const id = (await params).id;
    const surahId = parseInt(id);
    const surahInfo = SURAHS.find(s => s.id === surahId);

    if (!surahInfo) {
        return {
            title: "Sure Bulunamadı",
        };
    }

    return {
        title: `${surahInfo.name} Suresi Oku ve Dinle`,
        description: `${surahInfo.name} Suresi mealleri, Arapça metni ve sesli tilaveti. ${surahInfo.verseCount} ayetten oluşan ${surahInfo.name} suresi üzerine tefekkür ve yorumlar.`,
        alternates: {
            canonical: `https://kurancilar.com/kuran/${id}`,
        },
        openGraph: {
            title: `${surahInfo.name} Suresi | Kur'ancılar`,
            description: `${surahInfo.name} Suresi mealleri ve tefsiri.`,
            url: `https://kurancilar.com/kuran/${id}`,
            images: [
                {
                    url: "/vercel.svg",
                    width: 800,
                    height: 600,
                    alt: `${surahInfo.name} Suresi`,
                },
            ],
        },
    };
}

export default function SurahLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
