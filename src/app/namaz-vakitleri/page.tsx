"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { usePageTracking } from '@/hooks/usePageTracking';
import { TURKISH_CITIES } from '@/lib/cities';
import {
    Clock,
    MapPin,
    Sunrise,
    Sunset,
    Moon,
    Sun,
    Loader2,
    Calendar,
    Navigation,
    Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';

interface PrayerTime {
    vakit: string;
    saat: string;
}

export default function NamazVakitleri() {
    const { user } = useUser();
    const [city, setCity] = useState("Istanbul");
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);

    usePageTracking('/namaz-vakitleri', 'Namaz Vakitleri');

    useEffect(() => {
        const fetchUserCity = async () => {
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('city')
                    .eq('id', user.id)
                    .single();
                if (data?.city) setCity(data.city);
            }
        };
        fetchUserCity();
    }, [user]);

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
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const sortedTimes = times.map(t => {
            const [h, m] = t.saat.split(':').map(Number);
            return { ...t, minutes: h * 60 + m };
        });

        const next = sortedTimes.find(t => t.minutes > currentTime) || sortedTimes[0];

        // Calculate remaining
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

    const getIcon = (vakit: string) => {
        switch (vakit.toLowerCase()) {
            case 'imsak': return <Moon className="text-blue-400" />;
            case 'güneş': return <Sunrise className="text-amber-400" />;
            case 'öğle': return <Sun className="text-amber-500" />;
            case 'ikindi': return <Sun className="text-orange-400" />;
            case 'akşam': return <Sunset className="text-orange-600" />;
            case 'yatsı': return <Moon className="text-indigo-400" />;
            default: return <Clock />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0c0f] text-slate-200">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Clock className="text-amber-500" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Namaz Vakitleri</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Günlük vakitleri takip edin ve ibadetlerinizi planlayın.</p>
                    </div>

                    <div className="relative group min-w-[200px]">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                        <div className="relative flex items-center bg-[#15171c] rounded-xl px-4 py-2 border border-slate-800">
                            <MapPin className="text-amber-500 mr-2" size={18} />
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="bg-transparent border-none text-white focus:ring-0 cursor-pointer w-full font-bold outline-none"
                            >
                                {TURKISH_CITIES.map(c => (
                                    <option key={c} value={c} className="bg-[#15171c]">{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Next Prayer Card */}
                {nextPrayer && !loading && (
                    <div className="relative group mb-12">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-amber-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-[#15171c] border border-amber-500/20 rounded-3xl p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transform rotate-12">
                                <Navigation size={120} className="text-white" />
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="text-center md:text-left">
                                    <p className="text-amber-500 font-black uppercase tracking-[0.2em] text-sm mb-1">SIRADAKİ VAKİT</p>
                                    <h2 className="text-5xl font-black text-white mb-2">{nextPrayer.name}</h2>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold">
                                        <Clock size={16} />
                                        <span>Saat: {nextPrayer.time}</span>
                                    </div>
                                </div>

                                <div className="h-20 w-px bg-slate-800 hidden md:block"></div>

                                <div className="text-center md:text-left">
                                    <p className="text-purple-400 font-black uppercase tracking-[0.2em] text-sm mb-1">KALAN SÜRE</p>
                                    <div className="text-4xl font-black text-white tabular-nums">
                                        {nextPrayer.remaining}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vakitler Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-amber-500" size={48} />
                        <p className="text-slate-500 animate-pulse font-medium">Vakitler yükleniyor...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-[#15171c] rounded-3xl border border-red-500/20 p-8">
                        <p className="text-red-500 font-bold">{error}</p>
                        <button onClick={() => setCity(city)} className="mt-4 text-amber-500 hover:underline">Tekrar Dene</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {prayerTimes.map((vakit, idx) => {
                            const isNext = nextPrayer?.name === vakit.vakit;
                            return (
                                <div
                                    key={idx}
                                    className={`
                                        p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3
                                        ${isNext
                                            ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                            : 'bg-[#15171c] border-slate-800 hover:border-slate-700'}
                                    `}
                                >
                                    <div className={`p-3 rounded-xl ${isNext ? 'bg-amber-500/20' : 'bg-slate-800/50'}`}>
                                        {getIcon(vakit.vakit)}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{vakit.vakit}</p>
                                        <p className="text-xl font-black text-white">{vakit.saat}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-16 bg-gradient-to-br from-[#15171c] to-[#0b0c0f] rounded-3xl border border-slate-800/50 p-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Bell className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Vakit Bildirimlerini Açın</h3>
                            <p className="text-slate-400 leading-relaxed mb-4">
                                Namaz vakitlerini kaçırmamak için bildirimleri aktif edebilirsiniz. Vakitlerde ve vakte 45 dakika kala size özel hatırlatıcılar gönderiyoruz.
                            </p>
                            <button
                                onClick={() => window.location.href = '/ayarlar'}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
                            >
                                Bildirim Ayarlarına Git
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
