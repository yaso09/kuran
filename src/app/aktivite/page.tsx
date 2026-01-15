"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Flame, Calendar, Trophy, Target, BookOpen, Check } from "lucide-react";
import Link from "next/link";

export default function ActivityPage() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return null;

    const streak = (user?.unsafeMetadata.streak as number) || 0;
    const history = (user?.unsafeMetadata.readingHistory as string[]) || [];

    // Full Month Calendar Generation
    const getCalendarDays = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const days = [];
        // Fill empty days for start of week
        const startDay = startOfMonth.getDay();
        for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
            days.push(null);
        }

        for (let i = 1; i <= endOfMonth.getDate(); i++) {
            const d = new Date(now.getFullYear(), now.getMonth(), i);
            days.push({
                day: i,
                dateString: d.toDateString(),
                isToday: d.toDateString() === now.toDateString()
            });
        }
        return days;
    };

    const calendarDays = getCalendarDays();
    const monthName = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-12">
                <SignedIn>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-[#15171c] p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy size={80} className="text-amber-500" />
                                </div>
                                <div className="relative mb-6">
                                    <Flame size={100} className="text-amber-500 fill-amber-500 animate-flame" />
                                    <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 animate-pulse"></div>
                                </div>
                                <h1 className="text-6xl font-black text-white mb-2">{streak}</h1>
                                <p className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm">GÜNLÜK SERİ</p>
                                <div className="mt-8 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="mt-3 text-xs text-slate-500 font-medium">Haftalık hedefe %{Math.round(Math.min((streak / 7) * 100, 100))} yaklaştın</p>
                            </div>

                            <div className="bg-[#15171c] p-6 rounded-3xl border border-slate-800 space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Toplam Okuma</p>
                                        <p className="text-lg font-black text-white">{history.length} Gün</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Aktif Ay</p>
                                        <p className="text-lg font-black text-white">{history.filter(d => d.includes(new Date().getFullYear().toString())).length} Gün</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Column */}
                        <div className="lg:col-span-2">
                            <div className="bg-[#15171c] rounded-3xl border border-slate-800 p-8 shadow-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-white capitalize">{monthName}</h2>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Okundu</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-4 mb-2">
                                    {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                                        <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-4">
                                    {calendarDays.map((day, idx) => {
                                        if (!day) return <div key={`empty-${idx}`} />;
                                        const attended = history.includes(day.dateString);
                                        return (
                                            <div
                                                key={day.dateString}
                                                className={`
                                                    aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300
                                                    ${attended
                                                        ? 'bg-amber-500 text-[#0b0c0f] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                                        : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'}
                                                    ${day.isToday && !attended ? 'border-2 border-amber-500/30' : ''}
                                                `}
                                            >
                                                <span className={`text-sm font-black ${attended ? '' : 'text-slate-200'}`}>{day.day}</span>
                                                {attended && <Check size={12} strokeWidth={4} className="mt-1" />}
                                                {day.isToday && !attended && (
                                                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-12 p-6 bg-amber-600/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white tracking-tight">Eksik Kalma!</h4>
                                            <p className="text-xs text-slate-400">Bugünkü okumanı henüz tamamlamadın.</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/kuran"
                                        className="bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-600/20"
                                    >
                                        HEMEN OKU
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </SignedIn>

                <SignedOut>
                    <div className="text-center py-24 bg-[#15171c] rounded-3xl border border-slate-800 border-dashed">
                        <Flame size={64} className="mx-auto text-slate-700 mb-6" />
                        <h2 className="text-3xl font-black text-white mb-4">Aktivitelerini Takip Et</h2>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">Serini görmek ve günlük okuma alışkanlığı kazanmak için giriş yapmalısın.</p>
                        <SignInButton mode="modal">
                            <button className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20">
                                GİRİŞ YAP
                            </button>
                        </SignInButton>
                    </div>
                </SignedOut>
            </main>
        </div>
    );
}
