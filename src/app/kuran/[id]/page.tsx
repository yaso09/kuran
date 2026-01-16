"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // Added Clerk hook
import Navbar from "@/components/Navbar";
import { SurahData, Verse } from "@/types/quran";
import { Loader2, Play, Pause, ChevronLeft, ChevronRight, Volume2, ArrowLeft, Bookmark, MessageCircle, Heart, Image, Flame } from "lucide-react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { X, MessageSquare, Quote, CornerDownRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Social Media Style Comment Component
const CommentItem = ({
    comment,
    verseKey,
    onReply,
    onDelete,
    onLike,
    likedComments,
    currentUserId,
    depth = 0
}: {
    comment: any,
    verseKey: string,
    onReply: (id: string, name: string) => void,
    onDelete: (id: string) => void,
    onLike: (id: string) => void,
    likedComments: Set<string>,
    currentUserId?: string,
    depth?: number
}) => {
    return (
        <div className={`flex gap-4 ${depth > 0 ? 'ml-8 sm:ml-12 mt-4' : 'mt-6'}`}>
            <div className={`shrink-0 ${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-slate-800 border border-slate-700 overflow-hidden`}>
                {comment.userImage ? (
                    <img src={comment.userImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-500 font-bold text-xs uppercase">
                        {comment.userName?.[0]}
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{comment.userName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(comment.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                </div>
                <div className="bg-[#1a1c23] p-3 rounded-2xl rounded-tl-none border border-slate-800 text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {comment.text}
                    </ReactMarkdown>
                </div>
                <div className="flex items-center gap-4 px-1">
                    <button
                        onClick={() => onReply(comment.id, comment.userName)}
                        className="text-[10px] font-bold text-slate-500 hover:text-amber-500 uppercase tracking-wider transition-colors"
                    >
                        Yanıtla
                    </button>
                    <button
                        onClick={() => onLike(comment.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${likedComments.has(comment.id) ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                    >
                        <Heart size={10} className={likedComments.has(comment.id) ? "fill-red-500" : ""} />
                        <span>{comment.likes || 0} Beğeni</span>
                    </button>
                    {currentUserId === comment.userId && (
                        <button
                            onClick={() => { if (confirm('Silmek istediğine emin misin?')) onDelete(comment.id); }}
                            className="text-[10px] font-bold text-slate-600 hover:text-red-500 uppercase tracking-wider transition-colors"
                        >
                            Sil
                        </button>
                    )}
                </div>

                {/* Render Replies Recursive */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-4">
                        {comment.replies.map((reply: any) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                verseKey={verseKey}
                                onReply={onReply}
                                onDelete={onDelete}
                                onLike={onLike}
                                likedComments={likedComments}
                                currentUserId={currentUserId}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SurahPage() {
    const params = useParams();
    const { user } = useUser(); // Clerk Hook
    const idUnwrapped = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "1";

    const [data, setData] = useState<SurahData | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingVerse, setPlayingVerse] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bookmarks, setBookmarks] = useState<string[]>([]); // Local state for optimistic updates

    // Type definition for a Comment (Supabase Style)
    type Comment = {
        id: string;
        text: string;
        timestamp: number;
        userId: string;
        userName: string;
        userImage?: string;
        parentId?: string | null;
        replies?: Comment[];
        likes?: number;
    };

    const [comments, setComments] = useState<Record<string, Comment[]>>({}); // Updated to store array of comments
    const [expandedCommentVerse, setExpandedCommentVerse] = useState<string | null>(null);
    const [gifSearchOpen, setGifSearchOpen] = useState<string | null>(null);
    const [reputations, setReputations] = useState<Record<string, number>>({}); // Mock reputation state for "Like"
    const [showCelebration, setShowCelebration] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ commentId: string, userName: string } | null>(null);
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

                // 2. Fetch Comments for this Surah
                const { data: dbComments, error } = await supabase
                    .from('comments')
                    .select('*, profiles!user_id(full_name, avatar_url)')
                    .filter('verse_key', 'ilike', `${idUnwrapped}:%`)
                    .order('created_at', { ascending: true });

                if (!error && dbComments) {
                    const normalized: Record<string, Comment[]> = {};
                    dbComments.forEach((c: any) => {
                        const vKey = c.verse_key;
                        if (!normalized[vKey]) normalized[vKey] = [];

                        const commentObj: Comment = {
                            id: c.id,
                            text: c.content,
                            timestamp: new Date(c.created_at).getTime(),
                            userId: c.user_id,
                            userName: c.profiles?.full_name || "Kullanıcı",
                            userImage: c.profiles?.avatar_url,
                            parentId: c.parent_id,
                            likes: c.likes_count,
                            replies: []
                        };

                        if (c.parent_id) {
                            // Find parent and append
                            const parent = normalized[vKey].find(p => p.id === c.parent_id);
                            if (parent) {
                                if (!parent.replies) parent.replies = [];
                                parent.replies.push(commentObj);
                            }
                        } else {
                            normalized[vKey].push(commentObj);
                        }
                    });
                    setComments(normalized);

                    // 3. Fetch Comment Likes Status
                    if (user) {
                        const { data: likes } = await supabase
                            .from('comment_likes')
                            .select('comment_id')
                            .eq('user_id', user.id);

                        if (likes) {
                            setLikedComments(new Set(likes.map(l => l.comment_id)));
                        }
                    }
                }
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
                            lastRead: `/kuran/${idUnwrapped}`,
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

    const handleSaveComment = async (verseKey: string, text: string) => {
        if (!user || text.trim() === "") return;

        const parentId = replyingTo?.commentId || null;

        try {
            const { data: newComment, error } = await supabase
                .from('comments')
                .insert({
                    user_id: user.id,
                    verse_key: verseKey,
                    content: text,
                    parent_id: parentId
                })
                .select('*, profiles!user_id(full_name, avatar_url)')
                .single();

            if (error) throw error;

            const commentObj: Comment = {
                id: newComment.id,
                text: newComment.content,
                timestamp: new Date(newComment.created_at).getTime(),
                userId: newComment.user_id,
                userName: newComment.profiles?.full_name || "Kullanıcı",
                userImage: newComment.profiles?.avatar_url,
                parentId: newComment.parent_id,
                likes: 0,
                replies: []
            };

            setComments(prev => {
                const verseComments = prev[verseKey] || [];
                if (parentId) {
                    // Update parent's replies
                    return {
                        ...prev,
                        [verseKey]: verseComments.map(p =>
                            p.id === parentId
                                ? { ...p, replies: [...(p.replies || []), commentObj] }
                                : p
                        )
                    };
                } else {
                    return {
                        ...prev,
                        [verseKey]: [...verseComments, commentObj]
                    };
                }
            });

            setReplyingTo(null);
            // Clear input
            const input = document.getElementById(`comment-input-${verseKey}`) as HTMLTextAreaElement;
            if (input) input.value = '';

        } catch (error) {
            console.error("Comment error", error);
        }
    };

    const handleLikeComment = async (commentId: string, verseKey: string) => {
        if (!user) return;

        const isLiked = likedComments.has(commentId);

        // Optimistic UI updates
        setLikedComments(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(commentId);
            else next.add(commentId);
            return next;
        });

        const updateLikesRecursive = (list: Comment[]): Comment[] => {
            return list.map(c => {
                if (c.id === commentId) {
                    return { ...c, likes: isLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1 };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateLikesRecursive(c.replies) };
                }
                return c;
            });
        };

        setComments(prev => ({
            ...prev,
            [verseKey]: updateLikesRecursive(prev[verseKey] || [])
        }));

        await supabase.rpc('toggle_comment_like', {
            target_comment_id: commentId,
            target_user_id: user.id
        });
    };

    const handleDeleteComment = async (verseKey: string, commentId: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId)
                .eq('user_id', user.id);

            if (error) throw error;

            setComments(prev => {
                const verseComments = prev[verseKey] || [];
                // Check if it's a top-level comment
                if (verseComments.some(c => c.id === commentId)) {
                    return {
                        ...prev,
                        [verseKey]: verseComments.filter(c => c.id !== commentId)
                    };
                }
                // Check if it's a reply
                return {
                    ...prev,
                    [verseKey]: verseComments.map(p => ({
                        ...p,
                        replies: p.replies?.filter(r => r.id !== commentId)
                    }))
                };
            });
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const handleLike = (commentId: string) => {
        setReputations(prev => ({
            ...prev,
            [commentId]: (prev[commentId] || 0) + 1
        }));
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
            playVerse(data.verses[0]);
        }
    };

    const handleAudioEnded = () => {
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
            <div className="bg-[#0b0c0f]/95 backdrop-blur-md border-b border-slate-800 sticky top-16 z-30 shadow-sm transition-all group/header">
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

                    <div className="flex items-center gap-2">
                        <button
                            onClick={playFullSurah}
                            className="hidden sm:flex items-center gap-2 bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm hover:shadow-md hover:shadow-amber-600/20"
                        >
                            <Play size={14} fill="currentColor" />
                            Sureyi Dinle
                        </button>

                        <div className="h-6 w-px bg-slate-800 mx-2 hidden sm:block"></div>

                        {surahId > 1 && (
                            <Link href={`/kuran/${surahId - 1}`} className="p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-500 hover:shadow-sm rounded-full transition-all border border-transparent hover:border-slate-800" title="Önceki">
                                <ChevronLeft size={20} />
                            </Link>
                        )}
                        {surahId < 114 && (
                            <Link href={`/kuran/${surahId + 1}`} className="p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-500 hover:shadow-sm rounded-full transition-all border border-transparent hover:border-slate-800" title="Sonraki">
                                <ChevronRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-10 pb-40">
                {/* Besmele Decoration */}
                {surahId !== 1 && surahId !== 9 && (
                    <div className="flex justify-center mb-12 relative">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent"></div>
                        <div className="relative bg-[#0b0c0f] px-6">
                            <span className="font-arabic text-3xl text-amber-500/80">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                            </span>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {data.verses.map((verse) => {
                        const isBookmarked = bookmarks.includes(verse.verseKey);
                        const verseComments = comments[verse.verseKey] || [];
                        const hasComment = verseComments.length > 0;
                        const isExpanded = expandedCommentVerse === verse.verseKey;

                        return (
                            <div
                                key={verse.id}
                                id={`ayet-${verse.verseNumber}`}
                                data-verse-key={verse.verseKey}
                                ref={el => { if (el) verseRefs.current[verse.verseKey] = el; }}
                                className={`
                                    relative bg-[#15171c] p-6 sm:p-8 rounded-2xl border transition-all duration-500 group
                                    ${playingVerse === verse.verseKey
                                        ? 'border-amber-500/50 shadow-[0_0_30px_-5px_rgba(217,119,6,0.1)] ring-1 ring-amber-900/30 scale-[1.01] z-10'
                                        : 'border-slate-800 shadow-sm hover:shadow-md hover:border-slate-700'}
                                `}
                            >
                                {/* Floating Number */}
                                <div className="absolute -left-3 top-6 hidden lg:flex w-8 h-8 bg-[#0b0c0f] border border-slate-800 items-center justify-center rounded-full text-xs font-bold text-slate-500">
                                    {verse.verseNumber}
                                </div>

                                {/* Actions Row */}
                                <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="lg:hidden bg-slate-800 text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md">
                                            {verse.verseNumber}
                                        </span>
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

                                        {/* Bookmark Button */}
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

                                        {/* Comment Button */}
                                        <button
                                            onClick={() => setExpandedCommentVerse(isExpanded ? null : verse.verseKey)}
                                            className={`p-2 rounded-full transition-colors ${hasComment
                                                ? 'text-amber-500 bg-amber-900/20'
                                                : 'text-slate-600 hover:text-amber-500 hover:bg-slate-800'
                                                }`}
                                            title={user ? "Not Ekle" : "Not eklemek için giriş yapın"}
                                        >
                                            <MessageCircle size={18} fill={hasComment ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>

                                {/* Arabic Verse */}
                                <div className="text-right mb-8 leading-[2.5]" dir="rtl">
                                    <p className="text-3xl sm:text-4xl lg:text-5xl text-slate-200 font-medium font-arabic leading-[2.2]">
                                        {verse.arabic}
                                    </p>
                                </div>

                                {/* Translations */}
                                <div className="space-y-6">
                                    {/* Diyanet */}
                                    <div className="bg-[#0b0c0f]/50 p-4 rounded-xl border border-slate-800">
                                        <div className="text-[10px] uppercase tracking-wider text-amber-500 font-bold mb-1">Diyanet Vakfı</div>
                                        <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                            {verse.turkish?.diyanet_vakfi}
                                        </p>
                                    </div>

                                    {/* Diğer Mealler */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60 hover:opacity-100 transition-opacity">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Ömer Nasuhi Bilmen</div>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {verse.turkish?.omer_nasuhi_bilmen}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Hayrat Neşriyat</div>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {verse.turkish?.hayrat_nesriyat}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Comment & Forum Thread Area */}
                                {(isExpanded || hasComment) && (
                                    <div className={`mt-6 pt-6 border-t border-slate-800/50 ${!isExpanded && !hasComment && "hidden"}`}>

                                        {/* Existing Comments Thread (Social Style) */}
                                        <div className="space-y-4">
                                            {verseComments.map((comment) => (
                                                <CommentItem
                                                    key={comment.id}
                                                    comment={comment}
                                                    verseKey={verse.verseKey}
                                                    onReply={(id, name) => setReplyingTo({ commentId: id, userName: name })}
                                                    onDelete={(id) => handleDeleteComment(verse.verseKey, id)}
                                                    onLike={(id) => handleLikeComment(id, verse.verseKey)}
                                                    likedComments={likedComments}
                                                    currentUserId={user?.id}
                                                />
                                            ))}
                                        </div>

                                        {/* New Comment Form (Only if expanded) */}
                                        {isExpanded && (
                                            <div className="bg-[#1a1c23] rounded-3xl border border-slate-800 p-6 mt-8 shadow-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                                        {replyingTo ? (
                                                            <div className="flex items-center gap-2 text-amber-500">
                                                                <MessageCircle size={14} />
                                                                {replyingTo.userName} ADLI KULLANICIYA YANIT VERİLİYOR
                                                            </div>
                                                        ) : (
                                                            "BİR NOT BIRAK"
                                                        )}
                                                    </div>
                                                    {replyingTo && (
                                                        <button
                                                            onClick={() => setReplyingTo(null)}
                                                            className="text-slate-500 hover:text-white transition-colors"
                                                            title="Yanıtı iptal et"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <textarea
                                                        className="w-full bg-[#0b0c0f] text-slate-200 p-4 rounded-2xl border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all resize-none shadow-inner text-sm leading-relaxed"
                                                        placeholder={replyingTo ? "Yanıtınızı buraya yazın..." : "Bu ayet hakkında ne düşünüyorsunuz?"}
                                                        id={`comment-input-${verse.verseKey}`}
                                                        rows={3}
                                                    />

                                                    {/* GIF Search Results */}
                                                    {gifSearchOpen === verse.verseKey && (
                                                        <div className="bg-[#15171c] p-2 border border-slate-800 h-48 overflow-y-auto grid grid-cols-3 gap-2 rounded-xl">
                                                            {[
                                                                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXN6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zg/3o7TKr3nzbh5WgCFxe/giphy.gif",
                                                                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXN6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zmx6Zg/l0HlHFRbmaZtBRhXG/giphy.gif",
                                                                "https://media.giphy.com/media/3o6gbbuLW76jkt8vIc/giphy.gif",
                                                                "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif"
                                                            ].map((url, i) => (
                                                                <img
                                                                    key={i}
                                                                    src={url}
                                                                    className="w-full h-auto cursor-pointer hover:opacity-80 border border-slate-800 rounded-lg"
                                                                    onClick={() => {
                                                                        const el = document.getElementById(`comment-input-${verse.verseKey}`) as HTMLTextAreaElement;
                                                                        if (el) el.value += ` ![gif](${url}) `;
                                                                        setGifSearchOpen(null);
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center px-1">
                                                        <button
                                                            onClick={() => setGifSearchOpen(gifSearchOpen === verse.verseKey ? null : verse.verseKey)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                                                        >
                                                            <Image size={14} /> GIF Ekle
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const el = document.getElementById(`comment-input-${verse.verseKey}`) as HTMLTextAreaElement;
                                                                if (el && el.value.trim()) {
                                                                    handleSaveComment(verse.verseKey, el.value);
                                                                }
                                                            }}
                                                            className="px-8 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/20 active:scale-95 transition-all uppercase tracking-widest"
                                                        >
                                                            {replyingTo ? "PANELİ KAPAT VE YANITLA" : "PAYLAŞ"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                {isPlaying ? <Volume2 {...({ className: "animate-pulse", size: 24 } as any)} /> : <Pause size={24} />}
                            </div>
                            <div>
                                <p className="font-bold text-slate-200 line-clamp-1">
                                    {surahInfo?.name} Suresi, {playingVerse.split(':')[1]}. Ayet
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
                                {isPlaying ? <Pause size={24} {...({ className: "fill-current" } as any)} /> : <Play size={24} {...({ className: "fill-current" } as any)} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
