import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, subscription } = body;

        if (!userId || !subscription) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const { endpoint, keys } = subscription;

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return NextResponse.json({ error: "Invalid subscription format" }, { status: 400 });
        }

        // 1. Ensure profile exists to avoid foreign key violation
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({ id: userId }, { onConflict: "id" });

        if (profileError) {
            console.error("Profile upsert error in subscribe:", profileError);
            // We ignore this and try to proceed, or we could bail
        }

        // 2. Upsert push subscription
        const { error } = await supabase
            .from("push_subscriptions")
            .upsert({
                user_id: userId,
                endpoint: endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth
            }, { onConflict: "endpoint" });

        if (error) {
            console.error("Supabase upsert error:", error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Push subscribe API general error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
