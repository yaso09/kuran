"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/charts/StatCard';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import {
    getGlobalPlatformStats,
    getGlobalVisitTrends,
    getGlobalPopularPages,
    GlobalPlatformStats,
    DailyVisitTrend,
    PageVisitStats,
} from '@/lib/analytics';
import {
    BarChart3,
    Users,
    Eye,
    MessageSquare,
    TrendingUp,
    Calendar,
    MousePointer2,
} from 'lucide-react';

export default function AnalyticsPage() {
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
                getGlobalVisitTrends(14),
                getGlobalPopularPages(8),
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

    const pieChartColors = [
        '#f59e0b', // amber-500
        '#a855f7', // purple-500
        '#3b82f6', // blue-500
        '#10b981', // green-500
    ];

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-2xl">
                            <BarChart3 className="text-amber-500" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">Platform Nabzı</h1>
                            <p className="text-slate-400">Quran App evrensel kullanım istatistikleri</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-amber-500 mb-4"></div>
                        <p className="text-slate-400">Platform verileri analiz ediliyor...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Toplam Üye"
                                value={globalStats?.total_users || 0}
                                icon={Users}
                                subtitle="Kayıtlı topluluk üyeleri"
                                trend={globalStats?.growth_last_month ? {
                                    value: globalStats.growth_last_month,
                                    isPositive: true
                                } : undefined}
                            />
                            <StatCard
                                title="Toplam Etkileşim"
                                value={globalStats?.total_page_visits || 0}
                                icon={Eye}
                                subtitle="Sayfa görüntüleme"
                            />
                            <StatCard
                                title="Forum Aktivitesi"
                                value={(globalStats?.total_forum_posts || 0) + (globalStats?.total_comments || 0)}
                                icon={MessageSquare}
                                subtitle="Gönderi ve yorumlar"
                            />
                            <StatCard
                                title="Aktif Kullanıcılar"
                                value={globalStats?.active_users_24h || 0}
                                icon={TrendingUp}
                                subtitle="Son 24 saatte aktif"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Visit Trends Chart */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                                <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                                    <h2 className="text-white text-xl font-black mb-6 flex items-center gap-2">
                                        <Calendar className="text-amber-500" size={20} />
                                        Ziyaret Trendleri (Son 14 Gün)
                                    </h2>
                                    {visitTrends.length > 0 ? (
                                        <BarChart
                                            data={visitTrends.map((trend) => ({
                                                label: trend.date,
                                                value: trend.visit_count,
                                            }))}
                                        />
                                    ) : (
                                        <div className="h-[200px] flex items-center justify-center">
                                            <p className="text-slate-500 text-center">Trend verisi henüz oluşmamış</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity Distribution */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                                <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                                    <h2 className="text-white text-xl font-black mb-6 flex items-center gap-2">
                                        <BarChart3 className="text-purple-500" size={20} />
                                        Platform Dağılımı
                                    </h2>
                                    <PieChart
                                        data={[
                                            { label: 'Forum Gönderileri', value: globalStats?.total_forum_posts || 0, color: pieChartColors[0] },
                                            { label: 'Yorumlar', value: globalStats?.total_comments || 0, color: pieChartColors[1] },
                                            { label: 'Kayıtlı Üyeler', value: globalStats?.total_users || 0, color: pieChartColors[2] },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Popular Content */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                            <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-white text-xl font-black flex items-center gap-2">
                                        <MousePointer2 className="text-blue-500" size={20} />
                                        En Popüler Bölümler
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {popularPages.map((page, index) => (
                                        <div key={page.page_path} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800/50 hover:border-amber-500/30 transition-all group/item">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm group-hover/item:bg-amber-500/10 group-hover/item:text-amber-500 transition-colors">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-bold">{page.page_name}</p>
                                                <p className="text-slate-500 text-xs">{page.page_path}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-amber-500 font-black">{page.visit_count}</p>
                                                <p className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">Ziyaret</p>
                                            </div>
                                        </div>
                                    ))}
                                    {popularPages.length === 0 && (
                                        <p className="text-slate-500 text-center py-8">İçerik verisi henüz toplanmamış</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Public Data Footer */}
                        <div className="mt-8 text-center bg-slate-800/20 rounded-xl p-6 border border-slate-800/50">
                            <p className="text-slate-500 text-sm">
                                * Bu istatistikler platform genelindeki tüm kullanıcı etkileşimlerinin anonimleştirilmiş toplamıdır. Bireysel veriler paylaşılmaz.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
