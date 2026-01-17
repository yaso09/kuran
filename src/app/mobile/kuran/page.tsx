"use client";

import React from "react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";
import { useUser } from "@clerk/nextjs";
import { Check, ChevronRight, BookOpen } from "lucide-react";

export default function MobileKuranPage() {
    const { user } = useUser();
    const progressMap = (user?.unsafeMetadata.surahProgress as Record<string, number>) || {};

    return (
        <div className="px-4 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">SURELER</h2>
                <p className="text-slate-500 text-sm font-medium">Kur'an-ı Kerim'in 114 suresi</p>
            </div>

            <div className="space-y-3">
                {SURAHS.map((surah) => {
                    const progress = progressMap[surah.id.toString()] || 0;
                    const isCompleted = progress === 100;

                    return (
                        <Link
                            key={surah.id}
                            href={`/mobile/kuran/${surah.id}`}
                            className="block"
                        >
                            <div className="bg-[#15171c] border border-slate-800 rounded-3xl p-4 flex items-center justify-between active:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isCompleted ? "bg-amber-500 text-black" : "bg-slate-800 text-slate-400"
                                        }`}>
                                        {isCompleted ? <Check size={20} /> : surah.id}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{surah.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                                            {surah.verseCount} AYET {progress > 0 && `• %${progress}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {progress > 0 && !isCompleted && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    )}
                                    <ChevronRight className="text-slate-700" size={20} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
