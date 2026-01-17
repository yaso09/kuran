"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Quote, Play, Pause, MessageSquare, Send, X, Heart } from "lucide-react";
import { SURAHS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import CommentItem from "@/components/CommentItem";

export default function MobileVerseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { id, verseId } = params as { id: string, verseId: string };
    const [verse, setVerse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<any[]>([]);
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const [replyingTo, setReplyingTo] = useState<{ commentId: string, userName: string } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const surahInfo = SURAHS.find(s => s.id === parseInt(id));
    const verseKey = `${id}:${verseId}`;

    useEffect(() => {
        async function fetchVerseAndComments() {
            setLoading(true);
            try {
                // 1. Fetch Verse
                const res = await fetch(`/api/ayet/${id}:${verseId}`);
                if (res.ok) {
                    const data = await res.json();
                    setVerse(data);
                }

                // 2. Fetch Comments
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

                // 3. Fetch Likes
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
        if (id && verseId) fetchVerseAndComments();
    }, [id, verseId, user, verseKey]);

    const handleSaveComment = async () => {
        if (!user) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        const textEl = document.getElementById('comment-input') as HTMLTextAreaElement;
        const text = textEl?.value;
        if (!text?.trim()) return;

        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    user_id: user.id,
                    verse_key: verseKey,
                    content: text,
                    parent_id: replyingTo?.commentId || null
                });

            if (error) throw error;

            if (textEl) textEl.value = '';
            setReplyingTo(null);

            // Re-fetch comments or local update
            window.location.reload();
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

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div></div>;
    if (!verse) return <div className="p-10 text-center text-slate-500 font-black uppercase italic">Ayet bulunamadı.</div>;

    return (
        <div className="pb-32 bg-[#0b0c0f] min-h-screen">
            {/* Header */}
            <div className="bg-[#15171c] p-6 border-b border-slate-800 mb-6 sticky top-0 z-30">
                <button onClick={() => router.back()} className="text-amber-500 flex items-center gap-1 text-xs font-black uppercase tracking-widest mb-4">
                    <ArrowLeft size={14} /> GERİ DÖN
                </button>
                <h1 className="text-xl font-black text-white italic uppercase">{surahInfo?.name} • {verseId}. AYET</h1>
            </div>

            <div className="px-4 space-y-8">
                {/* Arabic Card */}
                <div className="bg-[#15171c] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <Quote className="absolute -top-4 -left-4 text-slate-800/20 group-hover:text-amber-500/10 transition-colors" size={120} />
                    <p className="text-4xl text-right font-arabic leading-[2.5] text-white relative z-10" dir="rtl">
                        {verse.arabic}
                    </p>
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => {
                                if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                                else { audioRef.current?.play(); setIsPlaying(true); }
                            }}
                            className="bg-amber-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase italic shadow-lg shadow-amber-600/20 active:scale-95"
                        >
                            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            {isPlaying ? "DURAKLAT" : "DİNLE"}
                        </button>
                    </div>
                </div>

                {/* Translation */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <BookOpen size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Türkçe Mealler</span>
                    </div>
                    {Object.entries(verse.turkish || {}).map(([key, val]: [string, any]) => (
                        <div key={key} className="bg-[#15171c] p-5 rounded-3xl border border-slate-800">
                            <span className="text-[8px] font-black text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded-md mb-2 inline-block">
                                {key.replace('_', ' ').toUpperCase()}
                            </span>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium italic">{val as string}</p>
                        </div>
                    ))}
                </div>

                {/* Comments Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-2">
                            <MessageSquare size={18} className="text-amber-500" /> NOTLAR
                            <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-black ml-1">{comments.length}</span>
                        </h3>
                    </div>

                    {/* Input */}
                    <div className="bg-[#15171c] rounded-3xl border border-slate-800 p-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                {replyingTo ? `${replyingTo.userName} kullanıcısına yanıt veriliyor` : "Bir not bırakın"}
                            </span>
                            {replyingTo && <button onClick={() => setReplyingTo(null)} className="text-slate-500"><X size={14} /></button>}
                        </div>
                        <textarea
                            id="comment-input"
                            placeholder="Ayetle ilgili bir not veya düşünce..."
                            className="w-full bg-[#0b0c0f] border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-amber-500/50 min-h-[100px] resize-none"
                        />
                        <button
                            onClick={handleSaveComment}
                            className="w-full bg-amber-600 text-white font-black uppercase italic py-3 rounded-2xl mt-3 active:scale-95 transition-all text-xs"
                        >
                            {replyingTo ? "YANITLA" : "PAYLAŞ"}
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 text-slate-600 text-[10px] font-black uppercase tracking-widest italic border border-slate-800 border-dashed rounded-3xl">
                                Henüz not bırakılmamış.
                            </div>
                        ) : (
                            comments.map(c => (
                                <CommentItem
                                    key={c.id}
                                    comment={c}
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

            <audio ref={audioRef} src={verse.audio?.ghamadi} onEnded={() => setIsPlaying(false)} className="hidden" />
        </div>
    );
}
