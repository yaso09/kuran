"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // Added Clerk hook
import Navbar from "@/components/Navbar";
import { useMobile } from "@/context/MobileContext";
import { SurahData, Verse } from "@/types/quran";
import { Loader2, Play, Pause, ChevronLeft, ChevronRight, Volume2, ArrowLeft, Bookmark, MessageCircle, Heart, Image, Flame } from "lucide-react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { X, MessageSquare, Quote, CornerDownRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import CommentItem from "@/components/CommentItem";

export default function SurahPage() {
    const params = useParams();
    const { user } = useUser(); // Clerk Hook
    const { isMobile } = useMobile();
    const idUnwrapped = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "1";

    const [data, setData] = useState<SurahData | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingVerse, setPlayingVerse] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBesmelePlaying, setIsBesmelePlaying] = useState(false);

    // State for bookmarks
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'full' | 'reading'>('full');
    const [selectedMeal, setSelectedMeal] = useState<'diyanet_vakfi' | 'omer_nasuhi_bilmen' | 'hayrat_nesriyat'>('diyanet_vakfi');
    const [showCelebration, setShowCelebration] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const wakeLockRef = useRef<any>(null);
    const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const metadataUpdatedRef = useRef(false); // Ref to prevent infinite loops
    const lastSavedVerseRef = useRef<string | null>(null); // Ref to throttle metadata updates

    const surahId = parseInt(idUnwrapped);
    const surahInfo = SURAHS.find(s => s.id === surahId);

    // Sync Profile and Fetch Comments from Supabase
    useEffect(() => {
        if (user) {
            if (user.unsafeMetadata.bookmarks) {
                setBookmarks(user.unsafeMetadata.bookmarks as string[]);
            }

            const syncAndFetch = async () => {
                // 1. Sync Profile
                await supabase.from('profiles').upsert({
                    id: user.id,
                    full_name: user.fullName,
                    avatar_url: user.imageUrl,
                    streak: (user.unsafeMetadata.streak as number) || 0,
                    coins: (user.unsafeMetadata.coins as number) || 0,
                    freezes: user.unsafeMetadata.freezes !== undefined ? (user.unsafeMetadata.freezes as number) : 2,
                    last_read_date: user.unsafeMetadata.lastReadDate as string || null
                });
            };

            syncAndFetch();
        }
    }, [user, idUnwrapped]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch(`/api/sure/${idUnwrapped}`);
                if (!res.ok) throw new Error("Sure yüklenemedi");
                const json = await res.json();
                setData(json);

                // Streak Logic & Initial Metadata Update
                if (user && !metadataUpdatedRef.current) {
                    metadataUpdatedRef.current = true;
                    const today = new Date().toDateString();
                    const lastReadDate = user.unsafeMetadata.lastReadDate as string | undefined;
                    const currentStreak = (user.unsafeMetadata.streak as number) || 0;
                    const currentCoins = (user.unsafeMetadata.coins as number) || 0;
                    const currentFreezes = user.unsafeMetadata.freezes !== undefined
                        ? (user.unsafeMetadata.freezes as number)
                        : 2;

                    let newStreak = currentStreak;
                    let newCoins = currentCoins;
                    let newFreezes = currentFreezes;

                    if (lastReadDate !== today) {
                        // Earn coins for first read of the day
                        newCoins += 10;

                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);

                        if (lastReadDate === yesterday.toDateString()) {
                            newStreak += 1;
                            setShowCelebration(true);
                            setTimeout(() => setShowCelebration(false), 4000);
                        } else if (lastReadDate) {
                            // Missed day(s)
                            if (newFreezes > 0) {
                                newFreezes -= 1;
                                // Streak stays as is (frozen)
                                // Increment streak for today's read as well? 
                                // Usually freeze protects it, then today's action increments it.
                                // Logic: (Pre-missed streak) + 1
                                newStreak += 1;
                            } else {
                                newStreak = 1;
                            }
                        } else {
                            newStreak = 1;
                        }
                    }

                    // Update Metadata (Fire and forget)
                    user.update({
                        unsafeMetadata: {
                            ...user.unsafeMetadata,
                            lastVerse: `/kuran/${idUnwrapped}`,
                            lastReadDate: today,
                            streak: newStreak,
                            coins: newCoins,
                            freezes: newFreezes
                        }
                    }).catch(e => console.error("Streak sync failed", e));
                }

                // Restore Scroll Position
                if (user?.unsafeMetadata?.lastVerse) {
                    const lastVerse = user.unsafeMetadata.lastVerse as string;
                    if (lastVerse.startsWith(`${idUnwrapped}:`)) {
                        setTimeout(() => {
                            const el = verseRefs.current[lastVerse];
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 500);
                    }
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (idUnwrapped) fetchData();
    }, [idUnwrapped, !!user]); // Only depend on whether user is logged in, not the full user object

    // Intersection Observer for Scroll Tracking
    const [currentVisibleVerse, setCurrentVisibleVerse] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!data || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const verseKey = entry.target.getAttribute('data-verse-key');
                        if (verseKey) {
                            setCurrentVisibleVerse(verseKey);

                            // Update progress
                            const idx = data.verses.findIndex(v => v.verseKey === verseKey);
                            if (idx !== -1) {
                                setProgress(((idx + 1) / data.verses.length) * 100);
                            }

                            // Save to metadata if changed
                            if (user && lastSavedVerseRef.current !== verseKey) {
                                lastSavedVerseRef.current = verseKey; // Update ref immediately

                                const currentProgress = (user.unsafeMetadata.surahProgress as Record<string, number>) || {};
                                const newProgress = Math.round(((idx + 1) / data.verses.length) * 100);

                                user.update({
                                    unsafeMetadata: {
                                        ...user.unsafeMetadata,
                                        lastVerse: verseKey,
                                        lastRead: `/kuran/${idUnwrapped}#ayet-${verseKey.split(':')[1]}`,
                                        surahProgress: {
                                            ...currentProgress,
                                            [idUnwrapped]: Math.max(currentProgress[idUnwrapped] || 0, newProgress)
                                        }
                                    }
                                }).catch(() => { });
                            }
                        }
                    }
                });
            },
            { threshold: 0.5, rootMargin: "-10% 0px -40% 0px" }
        );

        Object.values(verseRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [data, loading, idUnwrapped, !!user]); // Stable dependencies

    useEffect(() => {
        if (playingVerse && verseRefs.current[playingVerse]) {
            verseRefs.current[playingVerse]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [playingVerse]);

    const toggleBookmark = async (verseKey: string) => {
        if (!user) return; // Should probably prompt login, but for now just return

        // Optimistic Update
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
        } catch (error) {
            console.error("Bookmark error", error);
            // Revert on error
            setBookmarks(bookmarks);
        }
    };

    // Wake Lock Management
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                console.log('Wake Lock activated');
            }
        } catch (err) {
            console.error('Wake Lock error:', err);
        }
    };

    const releaseWakeLock = async () => {
        try {
            if (wakeLockRef.current) {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                console.log('Wake Lock released');
            }
        } catch (err) {
            console.error('Wake Lock release error:', err);
        }
    };

    // Audio Playback Handler
    const playVerse = (verse: Verse) => {
        if (playingVerse === verse.verseKey) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
                releaseWakeLock();
            } else {
                audioRef.current?.play();
                setIsPlaying(true);
                requestWakeLock();
            }
        } else {
            const url = verse.audio?.ghamadi;
            if (audioRef.current && url) {
                audioRef.current.src = url;
                audioRef.current.play().then(() => {
                    setPlayingVerse(verse.verseKey);
                    setIsPlaying(true);
                    requestWakeLock();
                }).catch(e => console.error("Audio Error:", e));
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
                        requestWakeLock();
                    }).catch(e => {
                        console.error("Besmele playback error", e);
                        playVerse(data.verses[0]);
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
                releaseWakeLock();
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
            </div>
        );
    }

    if (!data) return <div className="text-center py-20 text-slate-400">Sure bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            {/* Streak Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="bg-[#15171c]/90 backdrop-blur-xl border border-amber-500/30 p-12 rounded-3xl shadow-[0_0_100px_rgba(245,158,11,0.2)] flex flex-col items-center gap-6 animate-in zoom-in duration-500 scale-110">
                        <div className="relative">
                            <Flame size={120} className="text-amber-500 fill-amber-500 animate-flame" />
                            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-50 animate-pulse"></div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">TEBRİKLER!</h2>
                            <p className="text-amber-500 font-bold text-xl uppercase tracking-widest">SERİNİZ ARTTI</p>
                        </div>
                        <div className="bg-amber-600 text-white px-8 py-3 rounded-2xl text-4xl font-black shadow-xl animate-bounce">
                            {(user?.unsafeMetadata.streak as number) || 1} GÜN
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Sticky Header */}
            <div className={`bg-[#0b0c0f]/95 backdrop-blur-md border-b border-slate-800 sticky ${isMobile ? 'top-0' : 'top-16'} z-30 shadow-sm transition-all group/header`}>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-300 ease-out z-40" style={{ width: `${progress}%` }}></div>

                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/kuran" className="p-2 -ml-2 text-slate-400 hover:text-amber-500 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-slate-200 text-lg leading-none flex items-center gap-2">
                                {surahInfo?.name}
                                <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-black">%{Math.round(progress)}</span>
                            </h1>
                            <span className="text-xs text-slate-500 font-medium tracking-wide">SURE {surahId} • {surahInfo?.verseCount} AYET</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* View Mode Toggle */}
                        <div className="flex bg-slate-800/50 p-1 rounded-full border border-slate-700">
                            <button
                                onClick={() => setViewMode('full')}
                                className={`px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'full' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Mealli
                            </button>
                            <button
                                onClick={() => setViewMode('reading')}
                                className={`px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'reading' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                İbadet
                            </button>
                        </div>

                        {/* Meal Selection */}
                        {viewMode === 'full' && (
                            <select
                                value={selectedMeal}
                                onChange={(e) => setSelectedMeal(e.target.value as any)}
                                className="bg-slate-800 text-slate-300 text-[9px] sm:text-[10px] font-black uppercase py-1.5 px-2 sm:px-3 rounded-full border border-slate-700 outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
                            >
                                <option value="diyanet_vakfi">Diyanet</option>
                                <option value="omer_nasuhi_bilmen">Ö. Nasuhi</option>
                                <option value="hayrat_nesriyat">Hayrat</option>
                            </select>
                        )}

                        <button
                            onClick={playFullSurah}
                            className="flex items-center gap-2 bg-amber-600 text-white p-1.5 sm:px-4 sm:py-1.5 rounded-full text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm hover:shadow-md hover:shadow-amber-600/20"
                            title="Sureyi Dinle"
                        >
                            <Play size={14} fill="currentColor" />
                            <span className="hidden sm:inline">Sureyi Dinle</span>
                        </button>

                        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-1">
                            {surahId > 1 && (
                                <Link href={`/kuran/${surahId - 1}`} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-500 hover:shadow-sm rounded-full transition-all border border-transparent hover:border-slate-800" title="Önceki">
                                    <ChevronLeft size={20} />
                                </Link>
                            )}
                            {surahId < 114 && (
                                <Link href={`/kuran/${surahId + 1}`} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-500 hover:shadow-sm rounded-full transition-all border border-transparent hover:border-slate-800" title="Sonraki">
                                    <ChevronRight size={20} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-10 pb-40">
                {/* Besmele Decoration */}
                {surahId !== 1 && surahId !== 9 && (
                    <div className="flex justify-center mb-12 relative">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent"></div>
                        <div className="relative bg-[#0b0c0f] px-6">
                            <span className={`font-arabic text-3xl transition-all duration-1000 ${isBesmelePlaying ? 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110' : 'text-amber-500/80'}`}>
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                            </span>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {data.verses.map((verse) => {
                        const isBookmarked = bookmarks.includes(verse.verseKey);

                        return (
                            <div
                                key={verse.id}
                                id={`ayet-${verse.verseNumber}`}
                                data-verse-key={verse.verseKey}
                                ref={el => { if (el) verseRefs.current[verse.verseKey] = el; }}
                                onClick={(e) => {
                                    // Navigate to verse page unless a button or link was clicked
                                    const target = e.target as HTMLElement;
                                    if (!target.closest('button') && !target.closest('a')) {
                                        window.location.href = `/kuran/${surahId}/${verse.verseNumber}`;
                                    }
                                }}
                                className={`
                                    relative p-4 sm:p-6 transition-all duration-1000 group cursor-pointer
                                    ${viewMode === 'reading' ? 'bg-transparent border-transparent shadow-none' : 'bg-[#15171c] border-slate-800 rounded-2xl border shadow-sm hover:shadow-md hover:border-slate-700'}
                                    ${playingVerse === verse.verseKey && viewMode !== 'reading'
                                        ? 'border-amber-500/50 shadow-[0_0_30px_-5px_rgba(217,119,6,0.1)] ring-1 ring-amber-900/30 scale-[1.01] z-10'
                                        : ''}
                                `}
                            >
                                {/* Floating Number */}
                                {viewMode !== 'reading' && (
                                    <Link
                                        href={`/kuran/${surahId}/${verse.verseNumber}`}
                                        className="absolute -left-3 top-6 hidden lg:flex w-8 h-8 bg-[#0b0c0f] border border-slate-800 items-center justify-center rounded-full text-xs font-bold text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-all z-20 group-hover:scale-110"
                                    >
                                        {verse.verseNumber}
                                    </Link>
                                )}

                                {/* Actions Row */}
                                {viewMode !== 'reading' && (
                                    <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/kuran/${surahId}/${verse.verseNumber}`}
                                                className="lg:hidden bg-slate-800 text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md hover:bg-amber-600 hover:text-white transition-colors"
                                            >
                                                {verse.verseNumber}
                                            </Link>
                                            <button
                                                onClick={() => playVerse(verse)}
                                                className={`
                                                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                                                    ${playingVerse === verse.verseKey
                                                        ? 'bg-amber-600 text-white w-24 justify-center shadow-lg shadow-amber-600/20'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-amber-500 w-20 justify-center'}
                                                `}
                                            >
                                                {playingVerse === verse.verseKey && isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                                                {playingVerse === verse.verseKey && isPlaying ? 'Duraklat' : 'Dinle'}
                                            </button>

                                            <button
                                                onClick={() => toggleBookmark(verse.verseKey)}
                                                className={`p-2 rounded-full transition-colors ${isBookmarked
                                                    ? 'text-amber-500 bg-amber-900/20'
                                                    : 'text-slate-600 hover:text-amber-500 hover:bg-slate-800'
                                                    }`}
                                                title={user ? "İşaretle" : "İşaretlemek için giriş yapın"}
                                            >
                                                <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                                            </button>

                                            <Link
                                                href={`/kuran/${surahId}/${verse.verseNumber}`}
                                                className={`p-2 rounded-full transition-colors text-slate-600 hover:text-amber-500 hover:bg-slate-800`}
                                                title={user ? "Not Ekle" : "Not eklemek için giriş yapın"}
                                            >
                                                <MessageCircle size={18} fill="none" />
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Arabic Verse */}
                                <div className={`${viewMode === 'reading' ? 'text-center' : 'text-right'} mb-8 leading-[2.5]`} dir="rtl">
                                    <p className={`
                                        ${viewMode === 'reading' ? 'text-5xl sm:text-6xl lg:text-7xl mb-12' : 'text-3xl sm:text-4xl lg:text-5xl'} 
                                        font-medium font-arabic leading-[2.2] transition-colors duration-700
                                        ${playingVerse === verse.verseKey ? 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-slate-200'}
                                    `}>
                                        {verse.arabic}
                                    </p>
                                </div>

                                {/* Translations */}
                                {viewMode === 'full' && (
                                    <div className="space-y-6">
                                        <div className="bg-[#0b0c0f]/50 p-4 rounded-xl border border-slate-800 group/meal transition-colors hover:border-amber-500/30">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">
                                                    {selectedMeal === 'diyanet_vakfi' ? 'Diyanet Vakfı' :
                                                        selectedMeal === 'omer_nasuhi_bilmen' ? 'Ömer Nasuhi Bilmen' : 'Hayrat Neşriyat'}
                                                </div>
                                                <Link
                                                    href={`/kuran/${surahId}/${verse.verseNumber}`}
                                                    className="opacity-0 group-hover/meal:opacity-100 transition-opacity text-[10px] font-black text-slate-500 hover:text-amber-500 uppercase tracking-widest"
                                                >
                                                    Tüm Mealler ve Yorumlar →
                                                </Link>
                                            </div>
                                            <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                                {verse.turkish?.[selectedMeal]}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

            {/* Floating Player Bar */}
            {playingVerse && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#15171c]/90 backdrop-blur-xl border-t border-amber-900/30 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-50">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-900/50">
                                {isPlaying ? <Volume2 className="animate-pulse" size={24} /> : <Pause size={24} />}
                            </div>
                            <div>
                                <p className="font-bold text-slate-200 line-clamp-1">
                                    {isBesmelePlaying ? "Besmele-i Şerif" : `${surahInfo?.name} Suresi, ${playingVerse?.split(':')[1]}. Ayet`}
                                </p>
                                <p className="text-xs text-slate-500">Okunuyor...</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                                    else { audioRef.current?.play(); setIsPlaying(true); }
                                }}
                                className="bg-amber-600 text-white p-3 rounded-full hover:bg-amber-700 transition-transform active:scale-95 shadow-lg shadow-amber-600/30"
                            >
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
