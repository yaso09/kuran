"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Flame, Check } from "lucide-react";
import Link from "next/link";

export default function StreakDisplay() {
    const { user, isLoaded } = useUser();
    const [streak, setStreak] = useState<number>(0);
    const [animate, setAnimate] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            const currentStreak = (user.unsafeMetadata.streak as number) || 0;
            if (currentStreak !== streak) {
                setStreak(currentStreak);
                setAnimate(true);
                const timer = setTimeout(() => setAnimate(false), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, isLoaded, streak]);

    if (!isLoaded || !user || streak === 0) return null;

    const history = (user.unsafeMetadata.readingHistory as string[]) || [];

    // Last 7 days generation
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
        <div className="relative">
            <Link
                href="/aktivite"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 group transition-all hover:bg-amber-500/20 ${animate ? 'animate-streak-bounce' : ''}`}
                onMouseEnter={() => setShowCalendar(true)}
                onMouseLeave={() => setShowCalendar(false)}
            >
                <div className="relative transition-transform group-hover:scale-110">
                    <Flame
                        size={20}
                        className={`text-amber-500 fill-amber-500 transition-all duration-500 ${streak > 0 ? 'animate-flame' : 'opacity-50'}`}
                    />
                </div>
                <span className="font-bold text-amber-500 text-sm tracking-tight flex items-center">
                    {streak}
                </span>
            </Link>

            {showCalendar && (
                <div
                    className="absolute right-0 mt-3 w-64 bg-[#15171c] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200 pointer-events-none"
                    onMouseEnter={() => setShowCalendar(true)}
                    onMouseLeave={() => setShowCalendar(false)}
                >
                    <div className="absolute -top-1.5 right-10 w-3 h-3 bg-[#15171c] border-l border-t border-slate-800 rotate-45"></div>

                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                        Haftalık Okuma
                        <span className="text-amber-500">{streak} GÜNLÜK SERİ</span>
                    </h3>

                    <div className="flex justify-between items-center gap-1">
                        {weekDays.map((day) => {
                            const attended = history.includes(day.dateString);
                            return (
                                <div key={day.dateString} className="flex flex-col items-center gap-2">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
                                        ${attended
                                            ? 'bg-amber-500 text-[#0b0c0f] shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                            : 'bg-slate-800 text-slate-600'}
                                        ${day.isToday && !attended ? 'ring-2 ring-amber-500/40 ring-offset-2 ring-offset-[#15171c]' : ''}
                                    `}>
                                        {attended ? <Check size={16} strokeWidth={4} /> : <span className="text-[10px] font-black">{day.dayName}</span>}
                                    </div>
                                    <span className={`text-[9px] font-bold ${day.isToday ? 'text-amber-500' : 'text-slate-500'}`}>
                                        {day.isToday ? 'BUGÜN' : day.dayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                        <p className="text-[10px] text-slate-500 text-center font-medium leading-relaxed">
                            Detaylı takvim için tıkla ✨
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
