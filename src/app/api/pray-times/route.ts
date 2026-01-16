import { NextRequest, NextResponse } from "next/server";
import { getPrayerTimes } from "@/lib/pray";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city) {
        return NextResponse.json({ error: "Şehir belirtilmedi" }, { status: 400 });
    }

    try {
        const data = await getPrayerTimes(city);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Prayer Times API Error:", error);
        return NextResponse.json({
            error: error.message,
            details: "API anahtarınızın eksik veya hatalı olmadığını kontrol edin."
        }, { status: 500 });
    }
}
