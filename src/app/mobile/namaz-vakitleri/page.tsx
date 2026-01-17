"use client";

import React, { useEffect, useState } from "react";
import { Clock, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { TURKISH_CITIES } from "@/lib/cities";
import { useRouter } from "next/navigation";

interface PrayerTime {
    vakit: string;
    saat: string;
}

export default function MobilePrayerTimes() {
    const router = useRouter();
    const [city, setCity] = useState("Istanbul");
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);

    useEffect(() => {
        async function fetchTimes() {
            setLoading(true);
            try {
                const res = await fetch(`/api/pray-times?city=${city}`);
                const data = await res.json();
                if (data.success && data.result) {
                    setPrayerTimes(data.result);
                    calculateNextPrayer(data.result);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchTimes();
    }, [city]);

    const calculateNextPrayer = (times: PrayerTime[]) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const sortedTimes = times.map(t => {
            const [h, m] = t.saat.split(':').map(Number);
            return { ...t, minutes: h * 60 + m };
        });

        const next = sortedTimes.find(t => t.minutes > currentTime) || sortedTimes[0];

        let diff = next.minutes - currentTime;
        if (diff < 0) diff += 24 * 60;

        const h = Math.floor(diff / 60);
        const m = diff % 60;

        setNextPrayer({
            name: next.vakit,
            time: next.saat,
            remaining: `${h} sa ${m} dk`
        });
    };

    return (
        <div className="pb-32 min-h-screen bg-[#0b0c0f]">
            {/* Header */}
            <div className="bg-[#15171c] p-6 border-b border-slate-800 mb-6 sticky top-0 z-30">
                <button onClick={() => router.back()} className="text-amber-500 flex items-center gap-1 text-xs font-black uppercase tracking-widest mb-4">
                    <ArrowLeft size={14} /> GERİ DÖN
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">NAMAZ</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">VAKİTLER VE HATIRLATICILAR</p>
                    </div>
                    <div className="relative">
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="bg-slate-800 text-white text-[10px] font-black uppercase py-2 px-3 rounded-xl border border-slate-700 outline-none appearance-none pr-8 shadow-lg shadow-black/20"
                        >
                            {TURKISH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" size={12} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Vakitler Alınıyor...</p>
                </div>
            ) : (
                <div className="px-4 space-y-6">
                    {/* Next Prayer Card */}
                    {nextPrayer && (
                        <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-[2.5rem] shadow-xl shadow-amber-900/40 relative overflow-hidden group">
                            <Clock className="absolute top-4 right-4 text-white/10 group-hover:scale-125 transition-transform duration-500" size={100} />
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 block">SIRADAKİ VAKİT</span>
                                <h3 className="text-4xl font-black text-white tracking-tight uppercase italic">{nextPrayer.name}</h3>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white italic tabular-nums">{nextPrayer.time}</span>
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-[8px] font-black uppercase tracking-tighter">KALAN SÜRE</span>
                                        <span className="text-white text-xs font-black italic tabular-nums">{nextPrayer.remaining}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vakit List */}
                    <div className="space-y-3">
                        {prayerTimes.map((v: PrayerTime, i: number) => {
                            const isNext = nextPrayer?.name === v.vakit;
                            return (
                                <div key={i} className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${isNext ? "bg-amber-600/10 border-amber-600/40 shadow-lg shadow-amber-900/10 scale-[1.02]" : "bg-[#15171c] border-slate-800"}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isNext ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-500"}`}>
                                            {i + 1}
                                        </div>
                                        <span className={`font-black uppercase tracking-tight ${isNext ? "text-white italic" : "text-slate-300"}`}>{v.vakit}</span>
                                    </div>
                                    <span className={`font-black text-xl italic tabular-nums ${isNext ? "text-amber-500" : "text-slate-400"}`}>{v.saat}</span>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-[9px] text-slate-600 font-black text-center uppercase tracking-[0.2em] pt-4 italic">
                        * Vakitler seçilen şehre göre diyanet verileridir.
                    </p>
                </div>
            )}
        </div>
    );
}
