"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Play, Pause, Bookmark, MessageCircle, Volume2, ArrowLeft, Settings2, Book, Headphones, Sparkles } from "lucide-react";
import { SURAHS } from "@/lib/constants";
import { SurahData, Verse } from "@/types/quran";
import { useUser } from "@clerk/nextjs";

export default function MobileSurahPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const id = params?.id as string;

    const [data, setData] = useState<SurahData | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingVerse, setPlayingVerse] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBesmelePlaying, setIsBesmelePlaying] = useState(false);

    // Advanced Features State
    const [viewMode, setViewMode] = useState<'full' | 'reading'>('full');
    const [selectedMeal, setSelectedMeal] = useState<'diyanet_vakfi' | 'omer_nasuhi_bilmen' | 'hayrat_nesriyat'>('diyanet_vakfi');
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const surahId = parseInt(id);
    const surahInfo = SURAHS.find(s => s.id === surahId);

    useEffect(() => {
        if (user?.unsafeMetadata?.bookmarks) {
            setBookmarks(user.unsafeMetadata.bookmarks as string[]);
        }
    }, [user]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`/api/sure/${id}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchData();
    }, [id]);

    const playVerse = (verse: Verse) => {
        if (playingVerse === verse.verseKey) {
            if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
            else { audioRef.current?.play(); setIsPlaying(true); }
        } else {
            if (audioRef.current && verse.audio?.ghamadi) {
                audioRef.current.src = verse.audio.ghamadi;
                audioRef.current.play();
                setPlayingVerse(verse.verseKey);
                setIsPlaying(true);
                setIsBesmelePlaying(false);
            }
        }
    };

    const playFullSurah = () => {
        if (data && data.verses.length > 0) {
            if (surahId !== 1 && surahId !== 9) {
                const besmeleUrl = "https://raw.githubusercontent.com/kurancilar/json/refs/heads/main/audio/ghamadi/001/001.mp3";
                if (audioRef.current) {
                    audioRef.current.src = besmeleUrl;
                    audioRef.current.play().then(() => {
                        setIsBesmelePlaying(true);
                        setPlayingVerse("besmele");
                        setIsPlaying(true);
                    });
                }
            } else {
                playVerse(data.verses[0]);
            }
        }
    };

    const handleAudioEnded = () => {
        if (isBesmelePlaying) {
            setIsBesmelePlaying(false);
            if (data && data.verses.length > 0) {
                playVerse(data.verses[0]);
            }
            return;
        }
        if (data && playingVerse) {
            const currentIndex = data.verses.findIndex(v => v.verseKey === playingVerse);
            if (currentIndex >= 0 && currentIndex < data.verses.length - 1) {
                playVerse(data.verses[currentIndex + 1]);
            } else {
                setPlayingVerse(null);
                setIsPlaying(false);
            }
        }
    };

    const toggleBookmark = async (verseKey: string) => {
        if (!user) return;

        const isBookmarked = bookmarks.includes(verseKey);
        const newBookmarks = isBookmarked
            ? bookmarks.filter(b => b !== verseKey)
            : [...bookmarks, verseKey];

        setBookmarks(newBookmarks);

        try {
            await fetch("/api/user/bookmark", {
                method: "POST",
                body: JSON.stringify({ verseKey }),
            });
            // Update local user object too if needed, though clerk might sync
        } catch (error) {
            console.error(error);
            setBookmarks(bookmarks); // revert
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div></div>;
    if (!data) return <div className="p-10 text-center text-slate-500">Sure yüklenemedi.</div>;

    return (
        <div className="pb-32 bg-[#0b0c0f] min-h-screen">
            {/* Minimal Header */}
            <div className="bg-[#15171c]/80 backdrop-blur-md sticky top-0 z-40 p-5 border-b border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => router.back()} className="text-amber-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft size={14} /> GERİ
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={playFullSurah}
                            className="flex items-center gap-1.5 bg-amber-600/10 text-amber-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 active:scale-95 transition-transform"
                        >
                            <Headphones size={12} /> TAMAMINI DİNLE
                        </button>
                    </div>
                </div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">{surahInfo?.name}</h1>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">SURE {id} • {surahInfo?.verseCount} AYET</p>

                    {/* Mode Toggles */}
                    <div className="flex items-center gap-1 bg-[#0b0c0f] p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setViewMode('full')}
                            className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'full' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-500'}`}
                        >
                            MEAL
                        </button>
                        <button
                            onClick={() => setViewMode('reading')}
                            className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'reading' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-500'}`}
                        >
                            İBADET
                        </button>
                    </div>
                </div>

                {/* Meal Selector - Only in Full Mode */}
                {viewMode === 'full' && (
                    <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest shrink-0">MEAL:</span>
                        {[
                            { id: 'diyanet_vakfi', label: 'DİYANET' },
                            { id: 'hayrat_nesriyat', label: 'HAYRAT' },
                            { id: 'omer_nasuhi_bilmen', label: 'BİLMEN' }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMeal(m.id as any)}
                                className={`whitespace-nowrap px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${selectedMeal === m.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-slate-800 text-slate-500'}`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-4 mt-8 space-y-12">
                {data.verses.map((verse) => (
                    <div key={verse.id} className="relative group">
                        {/* Verse Meta Bar */}
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-3">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                                    {verse.verseNumber}
                                </span>
                                {playingVerse === verse.verseKey && (
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-amber-500 animate-pulse rounded-full" />)}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => playVerse(verse)}
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${playingVerse === verse.verseKey ? "bg-amber-600 text-white shadow-amber-600/30" : "bg-[#15171c] text-slate-400 border border-slate-800 hover:border-slate-700"}`}
                                >
                                    {playingVerse === verse.verseKey && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                </button>
                                <button
                                    onClick={() => toggleBookmark(verse.verseKey)}
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 border ${bookmarks.includes(verse.verseKey) ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/10" : "bg-[#15171c] border-slate-800 text-slate-500"}`}
                                >
                                    <Bookmark size={18} fill={bookmarks.includes(verse.verseKey) ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>

                        {/* Arabic Text */}
                        <div className={`text-right mb-8 ${viewMode === 'reading' ? 'px-2' : ''}`} dir="rtl">
                            <p className={`${viewMode === 'reading' ? 'text-5xl leading-[2.2]' : 'text-3xl leading-[2]'} font-arabic transition-all duration-700 ${playingVerse === verse.verseKey ? "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "text-slate-100"}`}>
                                {verse.arabic}
                            </p>
                        </div>

                        {/* Translation Area */}
                        {viewMode === 'full' && (
                            <Link href={`/mobile/kuran/${id}/${verse.verseNumber}`} className="block relative group/meal">
                                <div className="absolute -inset-2 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0 rounded-3xl opacity-0 group-active/meal:opacity-100 transition-opacity" />
                                <div className="relative bg-[#15171c]/30 p-5 rounded-3xl border border-slate-800/40 hover:border-slate-800 active:bg-slate-800/20 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest italic">
                                            {selectedMeal === 'diyanet_vakfi' ? 'DİYANET MEALİ' : selectedMeal === 'hayrat_nesriyat' ? 'HAYRAT MEALİ' : 'BİLMEN MEALİ'}
                                        </span>
                                        <Sparkles size={12} className="text-amber-500/20" />
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                        {verse.turkish?.[selectedMeal]}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between text-slate-500 group-active:text-amber-500 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <MessageCircle size={14} className="opacity-40" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Notlar & Tefsir</span>
                                        </div>
                                        <ArrowLeft size={14} className="rotate-180 opacity-40 group-active:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

            {/* Premium Mini Player */}
            {playingVerse && (
                <div className="fixed bottom-20 left-4 right-4 z-50">
                    <div className="bg-[#1a1c23]/95 backdrop-blur-xl rounded-[2.5rem] p-4 border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-500">
                        <div className="relative w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20 overflow-hidden">
                            <Volume2 size={24} className={isPlaying ? "animate-pulse" : ""} />
                            {isPlaying && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                                    <div className="h-full bg-white animate-progress-indefinite" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-sm uppercase italic truncate">
                                {isBesmelePlaying ? "BESMELE-İ ŞERİF" : `${surahInfo?.name}`}
                            </p>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                                {isBesmelePlaying ? "Okunuyor..." : `AYET ${playingVerse.split(':')[1]}`}
                            </p>
                        </div>
                        <button
                            onClick={() => { if (isPlaying) audioRef.current?.pause(); else audioRef.current?.play(); setIsPlaying(!isPlaying); }}
                            className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes progress-indefinite {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-indefinite {
                    animation: progress-indefinite 2s infinite linear;
                }
            `}</style>
        </div>
    );
}
