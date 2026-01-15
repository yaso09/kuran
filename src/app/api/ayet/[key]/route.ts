import { NextRequest, NextResponse } from "next/server";
import { SurahData } from "@/types/quran";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        // key format: "1:1" for Surah 1, Verse 1
        // or we might handle just ":key" -> "1:1"
        // The route is /api/ayet/[key]
        const { key } = await params;

        // Split 1:1 -> surahNo: 1, verseNo: 1
        const parts = key.split(":");
        if (parts.length !== 2) {
            return NextResponse.json({ error: "Geçersiz format. Örnek: 1:1" }, { status: 400 });
        }

        const sureNo = parts[0];
        const ayetNo = parts[1];

        const remoteUrl = `https://kurancilar.github.io/json/sure/${sureNo}.json`;
        const response = await fetch(remoteUrl);

        if (!response.ok) {
            return NextResponse.json({ error: "Sûre alınamadı" }, { status: 500 });
        }

        const sureData: SurahData = await response.json();

        if (!sureData.verses || !Array.isArray(sureData.verses)) {
            return NextResponse.json({ error: "Veri formatı hatalı" }, { status: 500 });
        }

        const verse = sureData.verses.find(v => String(v.verseNumber) === String(ayetNo));

        if (!verse) {
            return NextResponse.json({ error: "Ayet bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({
            id: verse.id,
            sureNo: Number(sureNo),
            verseNumber: verse.verseNumber,
            verseKey: verse.verseKey,
            arabic: verse.arabic,
            english: verse.english,
            turkish: verse.turkish,
            audio: verse.audio
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Hata oluştu: " + error.message },
            { status: 500 }
        );
    }
}
