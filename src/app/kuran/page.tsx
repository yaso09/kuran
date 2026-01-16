"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SURAHS } from "@/lib/constants";
import { useUser } from "@clerk/nextjs";
import { usePageTracking } from "@/hooks/usePageTracking";
import { Check } from "lucide-react";

export default function KuranPage() {
    const { user, isLoaded } = useUser();

    // Track page visit
    usePageTracking('/kuran', 'Sureler');

    if (!isLoaded) return null;

    const progressMap = (user?.unsafeMetadata.surahProgress as Record<string, number>) || {};

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 pl-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Sureler</h1>
                    <p className="text-slate-400 mt-2">Kur'an-ı Kerim'in 114 suresi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SURAHS.map((surah) => {
                        const progress = progressMap[surah.id.toString()] || 0;
                        const isCompleted = progress === 100;

                        return (
                            <Link
                                key={surah.id}
                                href={`/kuran/${surah.id}`}
                                className="block group"
                            >
                                <div className="bg-[#15171c] border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:border-amber-900/40 hover:bg-[#1a1d23] transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                                    <div className="flex justify-between items-start z-10 relative">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-500
                                                ${isCompleted
                                                    ? 'bg-amber-500 text-[#0b0c0f] shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                                    : 'bg-slate-800 text-slate-400 group-hover:bg-amber-600/20 group-hover:text-amber-500'}
                                            `}>
                                                {isCompleted ? <Check size={20} strokeWidth={4} /> : surah.id}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-200 text-lg group-hover:text-amber-500 transition-colors">{surah.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-slate-500 font-medium">{surah.verseCount} Ayet</p>
                                                    {progress > 0 && (
                                                        <>
                                                            <span className="text-slate-700">•</span>
                                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isCompleted ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                                                                %{progress}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-3xl opacity-5 text-white font-serif absolute right-0 -bottom-2 group-hover:opacity-10 group-hover:scale-110 transition-all pointer-events-none">
                                            ﷽
                                        </span>
                                    </div>

                                    {/* Mini Progress Bar */}
                                    {progress > 0 && (
                                        <div className="mt-6 w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-amber-600/50'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
