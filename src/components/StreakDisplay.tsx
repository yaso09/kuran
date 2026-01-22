"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Flame, Check, Snowflake, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { getFlameColor } from "@/lib/streak";
import { motion, AnimatePresence } from "framer-motion";

export default function StreakDisplay() {
    const { user, isLoaded } = useUser();
    const [streak, setStreak] = useState<number>(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            const currentStreak = (user.unsafeMetadata.streak as number) || 0;
            setStreak(currentStreak);
        }
    }, [user, isLoaded]);

    if (!isLoaded || !user) return null;

    const history = (user.unsafeMetadata.readingHistory as string[]) || [];
    const freezes = user.unsafeMetadata.freezes !== undefined ? (user.unsafeMetadata.freezes as number) : 2;
    const coins = (user.unsafeMetadata.coins as number) || 0;

    const flameClass = getFlameColor(streak);

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                dateString: d.toDateString(),
                dayName: d.toLocaleDateString('tr-TR', { weekday: 'short' }).charAt(0).toUpperCase(),
                isToday: d.toDateString() === new Date().toDateString()
            });
        }
        return days;
    };

    const weekDays = getLast7Days();

    return (
        <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Link
                href="/aktivite"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group`}
            >
                <motion.div
                    animate={streak > 0 ? {
                        scale: [1, 1.2, 1],
                        filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Flame
                        size={18}
                        className={`${flameClass} transition-all duration-500`}
                    />
                </motion.div>
                <span className={`font-black text-sm tracking-tighter ${streak > 0 ? 'text-white' : 'text-slate-500'}`}>
                    {streak}
                </span>
            </Link>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-72 bg-[#0b0c0f] border border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 z-50 backdrop-blur-xl"
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800`}>
                                        <Trophy size={16} className="text-amber-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GÜNLÜK SERİ</span>
                                        <span className="text-sm font-black text-white">{streak} GÜN</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                    <Zap size={12} className="text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-amber-500">{coins}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1.5 py-2">
                                {weekDays.map((day) => {
                                    const attended = history.includes(day.dateString);
                                    return (
                                        <div key={day.dateString} className="flex flex-col items-center gap-1.5">
                                            <div className={`
                                                w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                                                ${attended
                                                    ? 'bg-amber-500 text-[#0b0c0f] shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                                    : 'bg-slate-900 border border-slate-800 text-slate-700'}
                                                ${day.isToday && !attended ? 'border-amber-500/50 bg-amber-500/5' : ''}
                                            `}>
                                                {attended ? <Check size={14} strokeWidth={4} /> : <span className="text-[9px] font-black">{day.dayName}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-3 border-t border-slate-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Snowflake size={14} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">DONDURMA HAKKI</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-full">{freezes}</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                                        className="h-full bg-amber-500"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 text-center font-bold mt-2 uppercase tracking-tighter">
                                    HAFTALIK HEDEFE %{Math.round(Math.min((streak / 7) * 100, 100))} YAKLAŞTIN
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
