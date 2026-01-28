import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPrayerTimes } from "@/lib/pray";
import { sendPushNotification } from "@/lib/webpush";

export async function GET(request: NextRequest) {
    // For security, you might want to check a CRON_SECRET header here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    // Vercel Hobby Plan Limit Workaround:
    // Since Vercel Cron only runs daily on Hobby plan, we recommend using an external 
    // free cron service (like cron-job.org or GitHub Actions) to hit this endpoint 
    // every 10-15 minutes.
    // GET /api/cron/prayer-notifications

    try {
        // 1. Get all users with notifications enabled
        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id, city, notifications_enabled")
            .eq("notifications_enabled", true);

        if (profileError) throw profileError;
        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ message: "No users with notifications enabled" });
        }

        // 2. Group users by city
        const cityGroups: Record<string, string[]> = {};
        profiles.forEach(p => {
            if (p.city) {
                if (!cityGroups[p.city]) cityGroups[p.city] = [];
                cityGroups[p.city].push(p.id);
            }
        });

        const results: any[] = [];
        const now = new Date();
        // Convert to Turkey time (TRT is UTC+3)
        const trNow = new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60000);
        const currentHours = trNow.getHours();
        const currentMinutes = trNow.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;

        // 3. Process each city
        for (const city of Object.keys(cityGroups)) {
            try {
                const prayerData = await getPrayerTimes(city);
                if (!prayerData.success || !prayerData.result) continue;

                for (const prayer of prayerData.result) {
                    const [h, m] = prayer.saat.split(":").map(Number);
                    const prayerTimeInMinutes = h * 60 + m;

                    let shouldNotifyVakit = false;
                    let shouldNotify45Min = false;

                    // Exact time (10 minute window)
                    if (currentTimeInMinutes >= prayerTimeInMinutes && currentTimeInMinutes < prayerTimeInMinutes + 10) {
                        shouldNotifyVakit = true;
                    }

                    // 45 minutes before (10 minute window)
                    if (currentTimeInMinutes >= prayerTimeInMinutes - 45 && currentTimeInMinutes < prayerTimeInMinutes - 35) {
                        shouldNotify45Min = true;
                    }

                    if (shouldNotifyVakit || shouldNotify45Min) {
                        const title = shouldNotify45Min
                            ? `${prayer.vakit} Vaktine 45 Dakika Kaldı`
                            : `${prayer.vakit} Vakti Geldi`;
                        const body = shouldNotify45Min
                            ? `${city} için ${prayer.vakit} vaktine az kaldı. Abdestinizi tazelemeyi unutmayın.`
                            : `${city} için ${prayer.vakit} vakti. Namazınızı huzurla kılın.`;

                        // Notify all users in this city
                        const userIds = cityGroups[city];
                        for (const uid of userIds) {
                            try {
                                // 1. Save to notifications table
                                await supabase.from("notifications").insert({
                                    user_id: uid,
                                    title,
                                    body,
                                    url: '/namaz-vakitleri',
                                    read: false
                                });

                                // 2. Get subscriptions
                                const { data: subscriptions } = await supabase
                                    .from("push_subscriptions")
                                    .select("*")
                                    .eq("user_id", uid);

                                if (subscriptions && subscriptions.length > 0) {
                                    await Promise.all(subscriptions.map(sub =>
                                        sendPushNotification({
                                            endpoint: sub.endpoint,
                                            keys: { p256dh: sub.p256dh, auth: sub.auth }
                                        }, {
                                            title,
                                            body,
                                            icon: "/icons/icon-192x192.png",
                                            url: '/namaz-vakitleri'
                                        })
                                    ));
                                }
                            } catch (err) {
                                console.error(`Failed to notify user ${uid}:`, err);
                            }
                        }

                        results.push({ city, vakit: prayer.vakit, type: shouldNotify45Min ? '45min' : 'exact' });
                    }
                }
            } catch (cityErr) {
                console.error(`Error processing city ${city}:`, cityErr);
            }
        }

        console.log(`Cron processed ${results.length} notifications across ${Object.keys(cityGroups).length} cities.`);
        return NextResponse.json({
            success: true,
            processed: results,
            cityCount: Object.keys(cityGroups).length,
            notificationCount: results.length
        });
    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
