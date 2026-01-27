import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendPushNotification } from "@/lib/webpush";

export async function POST(request: NextRequest) {
    try {
        const { userId, title, body, url } = await request.json();

        if (!userId || !title || !body) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Save to notifications table for the in-app list
        try {
            await supabase.from("notifications").insert({
                user_id: userId,
                title,
                body,
                url: url || "/",
                read: false
            });
        } catch (dbErr) {
            console.error("Failed to save notification to DB:", dbErr);
            // We continue to send push even if DB save fails
        }

        // 2. Get user's push subscriptions from Supabase
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", userId);

        if (error) throw error;
        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ success: true, message: "No subscriptions found for user" });
        }

        const results = await Promise.all(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };
                const result = await sendPushNotification(pushSubscription, {
                    title,
                    body,
                    icon: "/icons/icon-192x192.png",
                    url: url || "/"
                });

                // Clean up invalid subscriptions
                if (!result.success && (result.statusCode === 410 || result.statusCode === 404)) {
                    console.log(`Deleting expired subscription for user ${userId}`);
                    await supabase
                        .from("push_subscriptions")
                        .delete()
                        .eq("endpoint", sub.endpoint);
                }

                return result;
            })
        );

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Notification API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
