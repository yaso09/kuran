import { NextRequest, NextResponse } from "next/server";
import { SURAHS } from "@/lib/constants";
import { SurahData } from "@/types/quran";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        // g4f.dev API Request to get references
        // Using the recommended endpoint g4f.dev/api/auto/chat/completions
        const aiResponse = await fetch("https://g4f.dev/api/auto/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4.1", // As suggested by user
                messages: [
                    {
                        role: "system",
                        content: "Sen Kur'an konusunda uzman bir yardımcısın. Kullanıcının sorusuna/konusuna en uygun ayetleri bulup SADECE 'SureNo:AyetNo' formatında döndür. Aralara virgül koy. Başka açıklama yapma. Örnek: 2:153, 3:10, 103:3"
                    },
                    {
                        role: "user",
                        content: `Şu konuyla ilgili en alakalı ayetleri bul: ${query}`
                    }
                ],
                stream: false
            })
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("G4F API Error response:", errorText);
            throw new Error("AI API hatası");
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;

        // Parse references like "2:153, 3:10"
        const refs = content.split(",").map((s: string) => s.trim()).filter((s: string) => s.includes(":"));

        const results = await Promise.all(refs.map(async (ref: string) => {
            const [sureNo, ayetNo] = ref.split(":");
            try {
                const res = await fetch(`https://kurancilar.github.io/json/sure/${sureNo}.json`);
                if (!res.ok) return null;
                const data: SurahData = await res.json();
                const v = data.verses.find(verse => String(verse.verseNumber) === String(ayetNo));
                if (!v) return null;

                return {
                    surahId: Number(sureNo),
                    surahName: SURAHS.find(s => s.id === Number(sureNo))?.name || `Sure ${sureNo}`,
                    verseNumber: v.verseNumber,
                    text: v.turkish?.diyanet_vakfi,
                    arabic: v.arabic
                };
            } catch (e) {
                return null;
            }
        }));

        const filteredResults = results.filter(r => r !== null);

        return NextResponse.json({
            results: filteredResults
        });

    } catch (error: any) {
        console.error("Search API Error:", error);
        // Fallback to simple keyword search if AI fails
        return NextResponse.json({ error: "Arama sırasında bir hata oluştu" }, { status: 500 });
    }
}
