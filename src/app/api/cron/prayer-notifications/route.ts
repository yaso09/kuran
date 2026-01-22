import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPrayerTimes } from "@/lib/pray";

export async function GET(request: NextRequest) {
    // For security, you might want to check a CRON_SECRET header here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

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

                        // Send notifications to all users in this city
                        for (const userId of cityGroups[city]) {
                            // We trigger the send API internally (or we could call the function directly)
                            // Calling the function directly is better
                            await fetch(`${request.nextUrl.origin}/api/notifications/send`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId,
                                    title,
                                    body,
                                    url: '/namaz-vakitleri'
                                })
                            });
                        }

                        results.push({ city, vakit: prayer.vakit, type: shouldNotify45Min ? '45min' : 'exact' });
                    }
                }
            } catch (cityErr) {
                console.error(`Error processing city ${city}:`, cityErr);
            }
        }

        return NextResponse.json({ success: true, processed: results });
    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
