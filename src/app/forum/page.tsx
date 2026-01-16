"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { usePageTracking } from "@/hooks/usePageTracking";
import {
    Loader2, MessageCircle, Heart, User, ArrowRight, BookOpen,
    Flame, Plus, Search, Tag, Filter, Send, X, ChevronDown,
    HelpCircle, Quote, MessageSquare, Trash2
} from "lucide-react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ForumPost = {
    id: string;
    user_id: string;
    title: string;
    content: string;
    tagged_verses: string[];
    category: string;
    likes_count: number;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
};

export default function ForumPage() {
    const { user, isLoaded: userLoaded } = useUser();
    const [posts, setPosts] = useState<ForumPost[]>([]);

    // Track page visit
    usePageTracking('/forum', 'Forum');
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [filter, setFilter] = useState("Hepsi");
    const [searchQuery, setSearchQuery] = useState("");
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    // Create post state
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        category: "Soru",
        taggedVerses: [] as string[]
    });
    const [verseSearch, setVerseSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (userLoaded && user) {
            syncProfile();
        }
        fetchPosts();
    }, [userLoaded, user]);

    const syncProfile = async () => {
        if (!user) return;
        try {
            await supabase.from('profiles').upsert({
                id: user.id,
                full_name: user.fullName,
                avatar_url: user.imageUrl,
                streak: (user.unsafeMetadata.streak as number) || 0,
                coins: (user.unsafeMetadata.coins as number) || 0,
                freezes: user.unsafeMetadata.freezes !== undefined ? (user.unsafeMetadata.freezes as number) : 2,
                last_read_date: user.unsafeMetadata.lastReadDate as string || null
            });
        } catch (err) {
            console.error("Profile sync error:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('forum_posts')
                .select('*, profiles!user_id(full_name, avatar_url)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);

            // Fetch liked posts if user exists
            if (user) {
                const { data: likes } = await supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('user_id', user.id);

                if (likes) {
                    setLikedPosts(new Set(likes.map(l => l.post_id)));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!user || !newPost.title || !newPost.content) return;
        setSubmitting(true);
        try {
            // Re-sync just in case
            await syncProfile();

            const { error } = await supabase.from('forum_posts').insert({
                user_id: user.id,
                title: newPost.title,
                content: newPost.content,
                category: newPost.category,
                tagged_verses: newPost.taggedVerses
            });

            if (error) throw error;

            setNewPost({ title: "", content: "", category: "Soru", taggedVerses: [] });
            setIsCreating(false);
            fetchPosts();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!user) return;

        const isLiked = likedPosts.has(postId);

        // Optimistic UI updates
        setLikedPosts(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(postId);
            else next.add(postId);
            return next;
        });

        setPosts(prev => prev.map(p =>
            p.id === postId
                ? { ...p, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1 }
                : p
        ));

        await supabase.rpc('toggle_post_like', {
            target_post_id: postId,
            target_user_id: user.id
        });
    };

    const handleDeletePost = async (postId: string) => {
        if (!user || !confirm('Bu gönderiyi silmek istediğine emin misin?')) return;

        try {
            const { error } = await supabase
                .from('forum_posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user.id);

            if (error) throw error;
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            console.error(err);
            alert('Silme işlemi başarısız oldu.');
        }
    };

    const getSurahName = (verseKey: string) => {
        const surahId = parseInt(verseKey.split(":")[0]);
        return SURAHS.find(s => s.id === surahId)?.name || `Sure ${surahId}`;
    };

    const filteredPosts = posts.filter(post => {
        const matchesFilter = filter === "Hepsi" || post.category === filter;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c0f] text-slate-300">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic bg-gradient-to-r from-amber-500 to-amber-200 bg-clip-text text-transparent">
                            TOPLULUK FORUMU
                        </h1>
                        <p className="text-slate-500 font-medium">Sorular sor, tefekkürlerini paylaş ve diğerleriyle tartış.</p>
                    </div>
                    {userLoaded && user && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-amber-600/20 active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={20} /> YENİ KONU AÇ
                        </button>
                    )}
                </div>

                {/* Filters and Search Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-8 bg-[#15171c] p-4 rounded-3xl border border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 bg-[#0b0c0f] border border-slate-700 px-4 py-2 rounded-2xl flex-1 min-w-[280px]">
                        <Search size={18} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Forumda ara..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {["Hepsi", "Soru", "Tartışma", "Tefekkür"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === cat
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                    : "bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create Post Modal */}
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#0b0c0f]/80 backdrop-blur-md" onClick={() => setIsCreating(false)}></div>
                        <div className="relative bg-[#15171c] w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-black text-white">YENİ KONU OLUŞTUR</h2>
                                <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Başlık</label>
                                    <input
                                        type="text"
                                        placeholder="Konu başlığını girin..."
                                        className="w-full bg-[#0b0c0f] border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-amber-500/50 transition-all text-white"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Kategori</label>
                                        <select
                                            className="w-full bg-[#0b0c0f] border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-amber-500/50 transition-all text-white appearance-none cursor-pointer"
                                            value={newPost.category}
                                            onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                        >
                                            <option value="Soru">Soru</option>
                                            <option value="Tartışma">Tartışma</option>
                                            <option value="Tefekkür">Tefekkür</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Ayet Etiketle (örn: 2:255)</label>
                                        <input
                                            type="text"
                                            placeholder="2:1, 2:2..."
                                            className="w-full bg-[#0b0c0f] border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-amber-500/50 transition-all text-white"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if (val) {
                                                        setNewPost({ ...newPost, taggedVerses: [...newPost.taggedVerses, val] });
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                {newPost.taggedVerses.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {newPost.taggedVerses.map(v => (
                                            <span key={v} className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black border border-amber-500/20 flex items-center gap-2">
                                                {v} <X size={10} className="cursor-pointer" onClick={() => setNewPost({ ...newPost, taggedVerses: newPost.taggedVerses.filter(x => x !== v) })} />
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">İçerik</label>
                                    <textarea
                                        placeholder="Mesajınızı yazın..."
                                        className="w-full bg-[#0b0c0f] border border-slate-800 rounded-2xl px-4 py-4 outline-none focus:border-amber-500/50 transition-all text-white min-h-[160px] resize-none"
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-[#1a1c23] border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={handleCreatePost}
                                    disabled={submitting}
                                    className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-10 py-3 rounded-2xl font-black transition-all flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    YAYINLA
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Feed */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <div key={post.id} className="bg-[#15171c] rounded-3xl border border-slate-800 p-6 hover:border-amber-500/30 transition-all group shadow-sm flex flex-col md:flex-row gap-6">
                                {/* Left Side: User Info & Meta */}
                                <div className="flex flex-row md:flex-col items-center md:items-start gap-4 shrink-0 md:w-32">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shadow-inner">
                                        {post.profiles.avatar_url ? (
                                            <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-amber-500">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col md:items-center w-full">
                                        <p className="text-white font-bold text-sm truncate w-full text-center">{post.profiles.full_name}</p>
                                        <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-0.5">TALİP</span>
                                    </div>
                                </div>

                                {/* Right Side: Post Content */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${post.category === "Soru" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                post.category === "Tartışma" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                    "bg-green-500/10 text-green-500 border border-green-500/20"
                                                }`}>
                                                {post.category}
                                            </span>
                                            <h2 className="text-xl font-black text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">
                                                {post.title}
                                            </h2>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="text-slate-400 text-sm leading-relaxed prose prose-invert prose-sm max-w-none line-clamp-6">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {post.content}
                                        </ReactMarkdown>
                                    </div>

                                    {post.tagged_verses.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {post.tagged_verses.map(v => (
                                                <Link
                                                    key={v}
                                                    href={`/kuran/${v.split(':')[0]}#ayet-${v.split(':')[1]}`}
                                                    className="bg-slate-800/50 hover:bg-amber-500/10 text-slate-500 hover:text-amber-500 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-800 hover:border-amber-500/30 transition-all flex items-center gap-2"
                                                >
                                                    <BookOpen size={12} />
                                                    {getSurahName(v)} {v.split(':')[1]}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-2 transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                                            >
                                                <Heart size={18} className={likedPosts.has(post.id) ? "fill-red-500" : ""} />
                                                <span className="text-xs font-black">{post.likes_count} Beğeni</span>
                                            </button>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <MessageSquare size={18} />
                                                <span className="text-xs font-black">0 Yanıt</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {user?.id === post.user_id && (
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                                    title="Gönderiyi Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <Link
                                                href={`/forum/${post.id}`}
                                                className="text-xs font-black text-amber-500 uppercase tracking-[0.1em] flex items-center gap-2 hover:translate-x-1 transition-transform"
                                            >
                                                DETAYLARI GÖR <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-[#15171c] rounded-[40px] border border-slate-800 border-dashed">
                            <HelpCircle size={64} className="mx-auto text-slate-700 mb-6" />
                            <h2 className="text-3xl font-black text-white mb-4">Forum Sessiz...</h2>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8">Henüz kimse bir soru sormamış veya paylaşım yapmamış. İlk adımı atmak ister misin?</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20"
                            >
                                KONU OLUŞTUR
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
