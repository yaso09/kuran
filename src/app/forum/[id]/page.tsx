"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import {
    Loader2, ArrowLeft, MessageSquare, Heart, Image, Flame,
    X, ChevronRight, BookOpen, User, MessageCircle, Send, Quote, Trash2
} from "lucide-react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Social Media Style Comment Component (Recycled for Forum)
const CommentItem = ({
    comment,
    postId,
    onReply,
    onDelete,
    onLike,
    likedComments,
    currentUserId,
    depth = 0
}: {
    comment: any,
    postId: string,
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
                        <span>{comment.likes} Beğeni</span>
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
                                postId={postId}
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

export default function ForumPostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoaded: userLoaded } = useUser();
    const postId = params.id as string;

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ commentId: string, userName: string } | null>(null);
    const [likedPost, setLikedPost] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const commentFormRef = useRef<HTMLDivElement>(null);

    const scrollToCommentForm = () => {
        if (commentFormRef.current) {
            commentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const input = document.getElementById('comment-input');
            if (input) input.focus();
        }
    };

    useEffect(() => {
        if (postId) {
            fetchPostAndComments();
        }
    }, [postId]);

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            // 1. Fetch Post
            const { data: postData, error: postError } = await supabase
                .from('forum_posts')
                .select('*, profiles!user_id(full_name, avatar_url)')
                .eq('id', postId)
                .single();

            if (postError) throw postError;
            setPost(postData);

            // 2. Fetch Comments
            const { data: dbComments, error: commentError } = await supabase
                .from('forum_comments')
                .select('*, profiles!user_id(full_name, avatar_url)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (commentError) throw commentError;

            // Normalize Comments (Hierarchical)
            const normalized: any[] = [];
            const commentMap: Record<string, any> = {};

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
                commentMap[c.id] = commentObj;
            });

            dbComments.forEach((c: any) => {
                if (c.parent_id && commentMap[c.parent_id]) {
                    commentMap[c.parent_id].replies.push(commentMap[c.id]);
                } else {
                    normalized.push(commentMap[c.id]);
                }
            });

            setComments(normalized);

            // 3. Fetch Likes Status
            if (user) {
                const { data: postLike } = await supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('post_id', postId)
                    .eq('user_id', user.id)
                    .single();
                setLikedPost(!!postLike);

                const { data: commentLikes } = await supabase
                    .from('forum_comment_likes')
                    .select('comment_id')
                    .eq('user_id', user.id);

                if (commentLikes) {
                    setLikedComments(new Set(commentLikes.map(l => l.comment_id)));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveComment = async () => {
        if (!user) {
            alert('Yorum yapmak için giriş yapmalısınız.');
            return;
        }

        const textEl = document.getElementById('comment-input') as HTMLTextAreaElement;
        const text = textEl?.value;
        if (!text?.trim()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('forum_comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: text,
                    parent_id: replyingTo?.commentId || null
                });

            if (error) throw error;

            if (textEl) textEl.value = '';
            setReplyingTo(null);
            fetchPostAndComments();
        } catch (err) {
            console.error(err);
            alert('Yorum gönderilirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (id: string) => {
        try {
            const { error } = await supabase.from('forum_comments').delete().eq('id', id);
            if (error) throw error;
            fetchPostAndComments();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePost = async () => {
        if (!user || !post || !confirm('Bu gönderiyi silmek istediğine emin misin?')) return;

        try {
            const { error } = await supabase
                .from('forum_posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user.id);

            if (error) throw error;
            router.push('/forum');
        } catch (err) {
            console.error(err);
            alert('Silme işlemi başarısız oldu.');
        }
    };

    const handleLikePost = async () => {
        if (!user || !post) return;

        const isLiked = likedPost;
        setLikedPost(!isLiked);
        setPost({ ...post, likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1 });

        await supabase.rpc('toggle_post_like', {
            target_post_id: postId,
            target_user_id: user.id
        });
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user) return;

        const isLiked = likedComments.has(commentId);

        // Optimistic UI updates
        setLikedComments(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(commentId);
            else next.add(commentId);
            return next;
        });

        const updateLikesRecursive = (list: any[]): any[] => {
            return list.map(c => {
                if (c.id === commentId) {
                    return { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateLikesRecursive(c.replies) };
                }
                return c;
            });
        };

        setComments(prev => updateLikesRecursive(prev));

        await supabase.rpc('toggle_forum_comment_like', {
            target_comment_id: commentId,
            target_user_id: user.id
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex flex-col items-center justify-center text-slate-400">
                <X size={64} className="mb-6 opacity-20" />
                <h1 className="text-2xl font-black uppercase italic">Konu Bulunamadı</h1>
                <Link href="/forum" className="mt-8 text-amber-500 font-bold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> FORUMA GERİ DÖN
                </Link>
            </div>
        );
    }

    const surahName = (verseKey: string) => {
        const sid = parseInt(verseKey.split(':')[0]);
        return SURAHS.find(s => s.id === sid)?.name || `Sure ${sid}`;
    };

    return (
        <div className="min-h-screen bg-[#0b0c0f] text-slate-300">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/forum" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest mb-12">
                    <ArrowLeft size={16} /> Foruma Geri Dön
                </Link>

                {/* Main Post */}
                <article className="bg-[#15171c] rounded-[40px] border border-slate-800 p-8 sm:p-12 shadow-2xl overflow-hidden relative group transition-all mb-12">
                    <div className="flex flex-col sm:flex-row gap-8">
                        {/* Sidebar: User Info */}
                        <div className="sm:w-32 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-lg group-hover:border-amber-500/50 transition-colors">
                                {post.profiles.avatar_url ? (
                                    <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-amber-500 font-black text-2xl">
                                        {post.profiles.full_name?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="text-xs font-black text-white block truncate w-32">{post.profiles.full_name}</span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase mt-1 block">Yazar</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-6">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${post.category === "Soru" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                        post.category === "Tartışma" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                            "bg-green-500/10 text-green-500 border border-green-500/20"
                                        }`}>
                                        {post.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                                        {post.title}
                                    </h1>
                                    {user?.id === post.user_id && (
                                        <button
                                            onClick={handleDeletePost}
                                            className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shrink-0"
                                            title="Gönderiyi Sil"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="text-slate-300 leading-relaxed prose prose-invert prose-lg max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {post.content}
                                </ReactMarkdown>
                            </div>

                            {post.tagged_verses.length > 0 && (
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/50">
                                    {post.tagged_verses.map((v: string) => (
                                        <Link
                                            key={v}
                                            href={`/kuran/${v.split(':')[0]}#ayet-${v.split(':')[1]}`}
                                            className="bg-[#0b0c0f] hover:bg-amber-500/10 text-slate-500 hover:text-amber-500 px-4 py-2 rounded-2xl text-xs font-black border border-slate-800 hover:border-amber-500/30 transition-all flex items-center gap-2"
                                        >
                                            <BookOpen size={14} />
                                            {surahName(v)} {v.split(':')[1]}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 flex items-center gap-6">
                                <button
                                    onClick={handleLikePost}
                                    className={`flex items-center gap-2 transition-colors bg-[#0b0c0f] px-4 py-2 rounded-2xl border ${likedPost ? 'text-red-500 border-red-500/20' : 'text-slate-500 hover:text-red-500 border-slate-800'}`}
                                >
                                    <Heart size={20} className={likedPost ? "fill-red-500" : ""} />
                                    <span className="text-sm font-black">{post.likes_count}</span>
                                </button>
                                <div className="flex items-center gap-2 text-slate-500 bg-[#0b0c0f] px-4 py-2 rounded-2xl border border-slate-800">
                                    <MessageSquare size={20} />
                                    <span className="text-sm font-black">{comments.length} Yanıt</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Comment Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-4">
                        Tartışma <div className="h-0.5 flex-1 bg-slate-800/50" />
                    </h2>

                    {/* Comment Form */}
                    <div ref={commentFormRef} className="bg-[#15171c] rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-600" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                {replyingTo ? (
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <MessageCircle size={14} />
                                        {replyingTo.userName} ADLI KULLANICIYA YANIT VERİLİYOR
                                    </div>
                                ) : (
                                    "BİR YANIT BIRAK"
                                )}
                            </div>
                            {replyingTo && (
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <textarea
                            id="comment-input"
                            className="w-full bg-[#0b0c0f] text-slate-200 p-6 rounded-2xl border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all resize-none shadow-inner text-base leading-relaxed"
                            placeholder={replyingTo ? "Yanıtınızı buraya yazın... (Markdown desteklenir)" : "Bu konu hakkında ne düşünüyorsunuz? (Markdown desteklenir)"}
                            rows={4}
                        />
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                <Quote size={12} className="text-amber-600/50" /> Markdown Destekleniyor
                            </div>
                            <button
                                onClick={handleSaveComment}
                                disabled={submitting}
                                className="px-10 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-600/20 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                {replyingTo ? "YANITLA" : "PAYLAŞ"}
                            </button>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4">
                        {comments.length > 0 ? (
                            comments.map((c: any) => (
                                <CommentItem
                                    key={c.id}
                                    comment={c}
                                    postId={postId}
                                    onReply={(id, name) => {
                                        setReplyingTo({ commentId: id, userName: name });
                                        scrollToCommentForm();
                                    }}
                                    onDelete={handleDeleteComment}
                                    onLike={handleLikeComment}
                                    likedComments={likedComments}
                                    currentUserId={user?.id}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-[#15171c]/50 rounded-3xl border border-slate-800 border-dashed">
                                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Henüz hiç yanıt yok. İlk sen ol!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
