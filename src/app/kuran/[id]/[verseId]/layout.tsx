import { Metadata } from "next";
import { SURAHS } from "@/lib/constants";

type Props = {
    params: Promise<{ id: string, verseId: string }>;
};

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const resolvedParams = await params;
    const surahId = parseInt(resolvedParams.id);
    const verseId = resolvedParams.verseId;
    const surahInfo = SURAHS.find(s => s.id === surahId);

    if (!surahInfo) {
        return {
            title: "Ayet Bulunamadı",
        };
    }

    return {
        title: `${surahInfo.name} Suresi ${verseId}. Ayet Mealleri ve Yorumları`,
        description: `${surahInfo.name} suresi ${verseId}. ayet Arapça metni, farklı mealleri ve ayet hakkındaki kullanıcı yorumları.`,
        alternates: {
            canonical: `https://kurancilar.com/kuran/${surahId}/${verseId}`,
        },
    };
}

export default function VerseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
