"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import {
    BarChart3, Users, Eye, MessageSquare, TrendingUp, Calendar,
    MousePointer2, ArrowLeft, Activity, Target, Zap
} from 'lucide-react';
import {
    getGlobalPlatformStats,
    getGlobalVisitTrends,
    getGlobalPopularPages,
    GlobalPlatformStats,
    DailyVisitTrend,
    PageVisitStats,
} from '@/lib/analytics';

export default function MobileAnalyticsPage() {
    const router = useRouter();
    const [globalStats, setGlobalStats] = useState<GlobalPlatformStats | null>(null);
    const [visitTrends, setVisitTrends] = useState<DailyVisitTrend[]>([]);
    const [popularPages, setPopularPages] = useState<PageVisitStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGlobalAnalytics();
    }, []);

    const loadGlobalAnalytics = async () => {
        setLoading(true);
        try {
            const [stats, trends, pages] = await Promise.all([
                getGlobalPlatformStats(),
                getGlobalVisitTrends(7), // Mobil için 7 gün yeterli
                getGlobalPopularPages(5), // Mobil için ilk 5 yeterli
            ]);

            setGlobalStats(stats);
            setVisitTrends(trends);
            setPopularPages(pages);
        } catch (error) {
            console.error('Error loading global analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div></div>;

    return (
        <div className="pb-32 min-h-screen bg-[#0b0c0f]">
            {/* Header */}
            <div className="bg-[#15171c] p-6 border-b border-slate-800 mb-6">
                <button onClick={() => router.back()} className="text-amber-500 flex items-center gap-1 text-xs font-black uppercase tracking-widest mb-4">
                    <ArrowLeft size={14} /> GERİ DÖN
                </button>
                <h1 className="text-2xl font-black text-white italic uppercase">PLATFORM NABZI</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">GÜNCEL KULLANIM VERİLERİ</p>
            </div>

            <div className="px-4 space-y-6">
                {/* Real-time Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#15171c] p-4 rounded-3xl border border-slate-800">
                        <Users className="text-amber-500 mb-3" size={20} />
                        <p className="text-2xl font-black text-white italic">{globalStats?.total_users || 0}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">TOPLAM ÜYE</p>
                    </div>
                    <div className="bg-[#15171c] p-4 rounded-3xl border border-slate-800">
                        <Activity className="text-blue-500 mb-3" size={20} />
                        <p className="text-2xl font-black text-white italic">{globalStats?.active_users_24h || 0}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">AKTİF (24S)</p>
                    </div>
                    <div className="bg-[#15171c] p-4 rounded-3xl border border-slate-800">
                        <Zap className="text-purple-500 mb-3" size={20} />
                        <p className="text-2xl font-black text-white italic">{globalStats?.total_page_visits || 0}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">ETKİLEŞİM</p>
                    </div>
                    <div className="bg-[#15171c] p-4 rounded-3xl border border-slate-800">
                        <MessageSquare className="text-green-500 mb-3" size={20} />
                        <p className="text-2xl font-black text-white italic">{(globalStats?.total_forum_posts || 0) + (globalStats?.total_comments || 0)}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">TOPLULUK</p>
                    </div>
                </div>

                {/* Popular Pages Section */}
                <div className="bg-[#15171c] rounded-[2rem] border border-slate-800 p-6">
                    <h2 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <Target className="text-amber-500" size={18} />
                        Popüler Bölümler
                    </h2>
                    <div className="space-y-4">
                        {popularPages.map((page, index) => (
                            <div key={page.page_path} className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-xl bg-[#0b0c0f] border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-amber-500 transition-colors">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-xs font-bold uppercase">{page.page_name}</p>
                                    <div className="w-full h-1 bg-[#0b0c0f] rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full bg-amber-600 rounded-full"
                                            style={{ width: `${Math.min(100, (page.visit_count / (popularPages[0]?.visit_count || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-black text-xs italic">{page.visit_count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trends Summary */}
                <div className="bg-amber-600 rounded-[2rem] p-6 text-white shadow-xl shadow-amber-900/20">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp size={24} />
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-tighter opacity-70">HAFTALIK TREND</p>
                            <p className="text-xl font-black italic">YÜKSELİŞTE</p>
                        </div>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">Platform etkileşimi son 7 günde stabil bir artış gösteriyor. Topluluğumuz her geçen gün büyümeye devam ediyor.</p>
                </div>

                {/* Footer Note */}
                <p className="text-[9px] text-slate-600 text-center font-black uppercase tracking-widest px-10">
                    * Veriler gerçek zamanlı olarak anonimleştirilmiş ziyaretlerden toplanmaktadır.
                </p>
            </div>
        </div>
    );
}
