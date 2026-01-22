"use client";

import React, { useMemo } from "react";
import Navbar from "@/components/Navbar";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Flame, Calendar, Trophy, Target, BookOpen, Check, Coins, Snowflake, Loader2, Sparkles, TrendingUp, Info, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getFlameColor } from "@/lib/streak";

export default function ActivityPage() {
    const { user, isLoaded } = useUser();
    const [buying, setBuying] = React.useState(false);

    // Track page visit
    usePageTracking('/aktivite', 'Aktivite');

    const streak = (user?.unsafeMetadata.streak as number) || 0;
    const history = (user?.unsafeMetadata.readingHistory as string[]) || [];
    const coins = (user?.unsafeMetadata.coins as number) || 0;
    const freezes = user?.unsafeMetadata.freezes !== undefined ? (user.unsafeMetadata.freezes as number) : 2;

    const flameClass = getFlameColor(streak);

    const buyFreeze = async () => {
        if (!user || coins < 50 || buying) return;
        setBuying(true);
        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    coins: coins - 50,
                    freezes: freezes + 1
                }
            });
        } catch (error) {
            console.error("Satın alma hatası:", error);
        } finally {
            setBuying(false);
        }
    };

    // Annual Heatmap Generation
    const heatmapData = useMemo(() => {
        const data = [];
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        // Start from the beginning of the week one year ago
        const start = new Date(oneYearAgo);
        start.setDate(start.getDate() - start.getDay() + 1);

        for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
            data.push({
                dateString: d.toDateString(),
                attended: history.includes(d.toDateString()),
                month: d.getMonth(),
                day: d.getDate()
            });
        }
        return data;
    }, [history]);

    if (!isLoaded) return (
        <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0b0c0f] text-slate-200 selection:bg-amber-500/30">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-12 pb-32">
                <SignedIn>
                    <header className="mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                                    Manevi Yolculuğun <span className="text-amber-500">.</span>
                                </h1>
                                <p className="text-slate-500 font-medium">Aktivitelerini takip et, serini koruyun ve rozetler kazan.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="bg-[#15171c] border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Coins size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">BAKİYE</span>
                                        <span className="text-xl font-black text-white tracking-tighter">{coins} <span className="text-amber-500 text-xs uppercase ml-1">COIN</span></span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Stats Widgets */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-[#15171c] p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                        <Flame size={120} className={flameClass} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">GÜNCEL SERİ</span>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h2 className="text-7xl font-black text-white tracking-tighter">{streak}</h2>
                                        <span className="text-amber-500 font-bold text-xl uppercase italic">GÜN</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-900 rounded-full mt-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-tight">Haftalık hedefe %{Math.round(Math.min((streak / 7) * 100, 100))} yaklaşıldı</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-[#15171c] p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                        <BookOpen size={120} className="text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">TOPLAM OKUMA</span>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h2 className="text-7xl font-black text-white tracking-tighter">{history.length}</h2>
                                        <span className="text-blue-500 font-bold text-xl uppercase italic">GÜN</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-tight flex items-center gap-1.5">
                                        <TrendingUp size={12} className="text-green-500" /> İlk günden beri sürekli artıyor
                                    </p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-[#15171c] p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                        <Trophy size={120} className="text-purple-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">BAŞARILAR</span>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h2 className="text-7xl font-black text-white tracking-tighter">
                                            {streak >= 30 ? '3' : streak >= 7 ? '2' : '1'}
                                        </h2>
                                        <span className="text-purple-500 font-bold text-xl uppercase italic">ROZET</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight group-hover:text-purple-400 transition-colors">YENİ ROZET KİLİDİNE AZ KALDI</p>
                                </motion.div>
                            </div>

                            {/* Heatmap Area */}
                            <div className="bg-[#15171c] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase tracking-tight">Yıllık Aktivite</h3>
                                            <p className="text-xs text-slate-500">Son 1 yıl içerisindeki okuma grafiğin.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] font-black text-slate-600 uppercase">Az</span>
                                            <div className="w-3 h-3 bg-slate-900 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-amber-500/30 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-amber-500/60 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                                            <span className="text-[9px] font-black text-slate-600 uppercase">Çok</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto pb-4 scrollbar-hide">
                                    <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-max">
                                        {heatmapData.map((day, i) => (
                                            <motion.div
                                                key={day.dateString}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.001 }}
                                                className={`
                                                    w-3 h-3 rounded-sm transition-all duration-300
                                                    ${day.attended
                                                        ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                                        : 'bg-slate-900 hover:bg-slate-800 group relative'}
                                                `}
                                                title={`${day.dateString} ${day.attended ? '- Okundu' : ''}`}
                                            >
                                                {!day.attended && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0b0c0f] border border-slate-800 px-2 py-1 rounded text-[8px] font-black text-white whitespace-nowrap z-10">
                                                        {day.dateString}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Freeze Card */}
                            <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                                <Snowflake size={80} className="absolute -bottom-4 -right-4 text-white opacity-20 group-hover:rotate-45 transition-transform duration-700" />
                                <h3 className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4">MOLA HAKKI</h3>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-6xl font-black text-white tracking-tighter">{freezes}</span>
                                    <span className="text-blue-200 font-bold uppercase italic">ADET</span>
                                </div>
                                <p className="text-blue-100/70 text-[10px] font-medium leading-relaxed mb-6">
                                    Okumayı unuttuğun günlerde serini dondurarak korumanı sağlar.
                                </p>
                                <button
                                    onClick={buyFreeze}
                                    disabled={coins < 50 || buying}
                                    className="w-full py-4 bg-white text-blue-600 rounded-[1.25rem] text-xs font-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {buying ? <Loader2 size={16} className="animate-spin" /> : '50 COIN İLE AL'}
                                </button>
                            </div>

                            {/* Rewards Box */}
                            <div className="bg-[#15171c] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                                <Sparkles size={100} className="absolute -top-10 -left-10 text-amber-500 opacity-5" />
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">ÖDÜLLERİN</h3>
                                <div className="space-y-4">
                                    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border ${streak >= 7 ? 'border-amber-500/20' : 'border-slate-800 opacity-40'}`}>
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                                            <Trophy size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white leading-tight">Gümüş Ateş</p>
                                            <p className="text-[10px] text-slate-500">7 Günlük Seri</p>
                                        </div>
                                        {streak >= 7 && <Check size={14} className="ml-auto text-amber-500" />}
                                    </div>
                                    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border ${streak >= 14 ? 'border-purple-500/20' : 'border-slate-800 opacity-40'}`}>
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 flex-shrink-0">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white leading-tight">Yüce Mor</p>
                                            <p className="text-[10px] text-slate-500">14 Günlük Seri</p>
                                        </div>
                                        {streak >= 14 && <Check size={14} className="ml-auto text-purple-500" />}
                                    </div>
                                    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border ${streak >= 30 ? 'border-blue-500/20' : 'border-slate-800 opacity-40'}`}>
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white leading-tight">Mavi Yıldırım</p>
                                            <p className="text-[10px] text-slate-500">30 Günlük Seri</p>
                                        </div>
                                        {streak >= 30 && <Check size={14} className="ml-auto text-blue-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SignedIn>

                <SignedOut>
                    <div className="max-w-xl mx-auto text-center py-20">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#15171c] p-12 rounded-[3.5rem] border border-slate-800 shadow-3xl text-center"
                        >
                            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/10">
                                <Flame size={40} className="animate-pulse" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Kendi Hikayeni Yaz</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
                                Günlük okuma serini başlat, coinler kazan ve manevi gelişimini görsel grafiklerle takip et.
                            </p>
                            <SignInButton mode="modal">
                                <button className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-amber-600/20 active:scale-[0.98] uppercase tracking-widest text-sm">
                                    ŞİMDİ GİRİŞ YAP VE BAŞLA
                                </button>
                            </SignInButton>
                        </motion.div>
                    </div>
                </SignedOut>
            </main>
        </div>
    );
}
