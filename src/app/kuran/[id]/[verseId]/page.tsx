"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { SurahData, Verse } from "@/types/quran";
import { Loader2, Play, Pause, ChevronLeft, ChevronRight, ArrowLeft, MessageSquare, Quote, CornerDownRight, X, Heart } from "lucide-react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import CommentItem from "@/components/CommentItem";

export default function VersePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();

    const surahId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "1";
    const verseId = params?.verseId ? (Array.isArray(params.verseId) ? params.verseId[0] : params.verseId) : "1";
    const verseKey = `${surahId}:${verseId}`;

    const [surahData, setSurahData] = useState<SurahData | null>(null);
    const [verse, setVerse] = useState<Verse | null>(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<any[]>([]);
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const [replyingTo, setReplyingTo] = useState<{ commentId: string, userName: string } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const surahInfo = SURAHS.find(s => s.id === parseInt(surahId));

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch(`/api/sure/${surahId}`);
                if (!res.ok) throw new Error("Veri alınamadı");
                const data: SurahData = await res.json();
                setSurahData(data);

                const foundVerse = data.verses.find(v => v.verseNumber === parseInt(verseId));
                if (foundVerse) setVerse(foundVerse);

                // Fetch Comments
                const { data: dbComments, error } = await supabase
                    .from('comments')
                    .select('*, profiles!user_id(full_name, avatar_url)')
                    .eq('verse_key', verseKey)
                    .order('created_at', { ascending: true });

                if (!error && dbComments) {
                    const normalized: any[] = [];
                    const map: Record<string, any> = {};

                    dbComments.forEach((c: any) => {
                        const commentObj = {
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
                        map[c.id] = commentObj;
                    });

                    dbComments.forEach((c: any) => {
                        if (c.parent_id && map[c.parent_id]) {
                            map[c.parent_id].replies.push(map[c.id]);
                        } else {
                            normalized.push(map[c.id]);
                        }
                    });
                    setComments(normalized);
                }

                // Fetch Likes
                if (user) {
                    const { data: likes } = await supabase
                        .from('comment_likes')
                        .select('comment_id')
                        .eq('user_id', user.id);
                    if (likes) setLikedComments(new Set(likes.map(l => l.comment_id)));
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (surahId && verseId) fetchData();
    }, [surahId, verseId, user, verseKey]);

    const handleSaveComment = async () => {
        if (!user) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        const textEl = document.getElementById('comment-input') as HTMLTextAreaElement;
        const text = textEl?.value;
        if (!text?.trim()) return;

        try {
            const { data: newComment, error } = await supabase
                .from('comments')
                .insert({
                    user_id: user.id,
                    verse_key: verseKey,
                    content: text,
                    parent_id: replyingTo?.commentId || null
                })
                .select('*, profiles!user_id(full_name, avatar_url)')
                .single();

            if (error) throw error;

            if (textEl) textEl.value = '';
            setReplyingTo(null);

            // Refresh comments locally or refetch
            router.refresh();
            // Better to refetch manually here for SPA feel
            window.location.reload(); // Simple solution for now
        } catch (err) {
            console.error(err);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user) return;
        const isLiked = likedComments.has(commentId);

        setLikedComments(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(commentId);
            else next.add(commentId);
            return next;
        });

        await supabase.rpc('toggle_comment_like', {
            target_comment_id: commentId,
            target_user_id: user.id
        });
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user) return;
        await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
            </div>
        );
    }

    if (!verse) return <div className="text-center py-20 text-slate-400">Ayet bulunamadı.</div>;

    const nextVerse = surahData?.verses.find(v => v.verseNumber === parseInt(verseId) + 1);
    const prevVerse = surahData?.verses.find(v => v.verseNumber === parseInt(verseId) - 1);

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <Link href={`/kuran/${surahId}`} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">{surahInfo?.name} Suresine Dön</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {prevVerse && (
                            <Link href={`/kuran/${surahId}/${prevVerse.verseNumber}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-amber-500 transition-all border border-slate-700">
                                <ChevronLeft size={20} />
                            </Link>
                        )}
                        <div className="px-4 py-1.5 bg-amber-600/10 border border-amber-500/20 rounded-full">
                            <span className="text-amber-500 font-black text-xs uppercase tracking-tighter">{surahId}:{verseId}</span>
                        </div>
                        {nextVerse && (
                            <Link href={`/kuran/${surahId}/${nextVerse.verseNumber}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-amber-500 transition-all border border-slate-700">
                                <ChevronRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Arabic Card */}
                <div className="bg-[#15171c] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden mb-8 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full" />

                    <div className="text-right leading-[2.2]" dir="rtl">
                        <p className="text-4xl sm:text-5xl lg:text-6xl text-slate-200 font-medium font-arabic mb-8">
                            {verse.arabic}
                        </p>
                    </div>

                    <div className="flex justify-start">
                        <button
                            onClick={() => {
                                if (isPlaying) {
                                    audioRef.current?.pause();
                                    setIsPlaying(false);
                                } else {
                                    audioRef.current?.play();
                                    setIsPlaying(true);
                                }
                            }}
                            className="flex items-center gap-3 bg-amber-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-95"
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            {isPlaying ? 'DURAKLAT' : 'AYETİ DİNLE'}
                        </button>
                    </div>
                </div>

                {/* Translations Grid */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-black mb-4">Diyanet Vakfı Meali</div>
                        <p className="text-slate-200 text-xl leading-relaxed font-medium">{verse.turkish.diyanet_vakfi}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/20 p-6 rounded-3xl border border-slate-800/30">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3">Ömer Nasuhi Bilmen</div>
                            <p className="text-slate-300 text-sm leading-relaxed">{verse.turkish.omer_nasuhi_bilmen}</p>
                        </div>
                        <div className="bg-slate-900/20 p-6 rounded-3xl border border-slate-800/30">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3">Hayrat Neşriyat</div>
                            <p className="text-slate-300 text-sm leading-relaxed">{verse.turkish.hayrat_nesriyat}</p>
                        </div>
                    </div>
                </div>

                {/* Discussion Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <MessageSquare className="text-amber-500" />
                            Ayet Hakkında Notlar
                            <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">{comments.length}</span>
                        </h3>
                    </div>

                    {/* Comment Input */}
                    <div className="bg-[#15171c] rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-600" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                {replyingTo ? (
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <MessageSquare size={14} />
                                        {replyingTo.userName} ADLI KULLANICIYA YANIT VERİLYOR
                                    </div>
                                ) : (
                                    "BİR NOT BIRAK"
                                )}
                            </div>
                            {replyingTo && (
                                <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <textarea
                            id="comment-input"
                            placeholder={replyingTo ? "Yanıtınızı buraya yazın..." : "Bu ayetle ilgili bir not veya düşünce paylaşın..."}
                            className="w-full bg-[#0b0c0f] text-slate-200 p-4 rounded-2xl border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all resize-none shadow-inner text-sm leading-relaxed mb-4"
                            rows={3}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                <Quote size={12} className="opacity-50" /> Markdown Desteklenir
                            </span>
                            <button
                                onClick={handleSaveComment}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-600/20 active:scale-95 uppercase tracking-widest"
                            >
                                {replyingTo ? "YANITLA" : "PAYLAŞ"}
                            </button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800 text-slate-500 text-sm italic">
                                Henüz yorum yapılmamış. İlk notu siz bırakın!
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    verseKey={verseKey}
                                    onReply={(id, name) => {
                                        setReplyingTo({ commentId: id, userName: name });
                                        document.getElementById('comment-input')?.focus();
                                    }}
                                    onDelete={handleDeleteComment}
                                    onLike={handleLikeComment}
                                    likedComments={likedComments}
                                    currentUserId={user?.id}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <audio ref={audioRef} src={verse.audio.ghamadi} onEnded={() => setIsPlaying(false)} className="hidden" />
        </div>
    );
}
