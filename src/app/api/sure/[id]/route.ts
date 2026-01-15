import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const remoteUrl = `https://kurancilar.github.io/json/sure/${id}.json`;
        const response = await fetch(remoteUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: "Sûre alınamadı" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Hata oluştu: " + error.message },
            { status: 500 }
        );
    }
}
