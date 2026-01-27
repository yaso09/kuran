import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface PrayerTime {
    vakit: string;
    saat: string;
}

export interface NextPrayerInfo {
    name: string;
    time: string;
    remaining: string;
    diffMinutes: number;
}

export function usePrayerTimes(manualCity?: string) {
    const { user } = useUser();
    const [city, setCity] = useState(manualCity || "Istanbul");
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);

    // Sync manual city if changed externally
    useEffect(() => {
        if (manualCity) {
            setCity(manualCity);
        } else if (user) {
            // Only fetch user city if no manual city provided
            const fetchUserCity = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('city')
                    .eq('id', user.id)
                    .single();
                if (data?.city) setCity(data.city);
            };
            fetchUserCity();
        }
    }, [user, manualCity]);

    // Fetch times when city changes
    useEffect(() => {
        const fetchTimes = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/pray-times?city=${city}`);
                const data = await res.json();
                if (data.success && data.result) {
                    setPrayerTimes(data.result);
                    calculateNextPrayer(data.result);
                } else {
                    setError("Vakitler alınamadı.");
                }
            } catch (err) {
                setError("Bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        fetchTimes();
    }, [city]);

    const calculateNextPrayer = (times: PrayerTime[]) => {
        if (!times.length) return;

        const now = new Date();
        const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        const sortedTimes = times.map(t => {
            const [h, m] = t.saat.split(':').map(Number);
            return { ...t, seconds: h * 3600 + m * 60 };
        });

        // Find next prayer (compare seconds)
        const next = sortedTimes.find(t => t.seconds > currentSeconds) || sortedTimes[0];

        // Calculate remaining seconds
        let diff = next.seconds - currentSeconds;
        if (diff < 0) diff += 24 * 3600; // Wrap around

        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;

        // Valid Check (prevent negative flush)
        if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(s)) return;

        setNextPrayer({
            name: next.vakit,
            time: next.saat,
            remaining: `${h} sa ${m} dk ${s} sn`,
            diffMinutes: Math.floor(diff / 60)
        });
    };

    // Live countdown effect
    useEffect(() => {
        if (!prayerTimes.length) return;

        const timer = setInterval(() => {
            calculateNextPrayer(prayerTimes);
        }, 1000); // Update every second

        // Initial update
        calculateNextPrayer(prayerTimes);

        return () => clearInterval(timer);
    }, [prayerTimes]);

    return {
        city,
        setCity,
        prayerTimes,
        loading,
        error,
        nextPrayer
    };
}
