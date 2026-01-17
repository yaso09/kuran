"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Heart, MessageCircle, User, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MobileForumPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const { data, error } = await supabase
                    .from("forum_posts")
                    .select("*, profiles!user_id(full_name, avatar_url), forum_comments(count)")
                    .order("created_at", { ascending: false });

                if (!error) setPosts(data || []);
                else console.error("Forum query failed:", error);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    return (
        <div className="px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">FORUM</h2>
                    <p className="text-slate-500 text-sm font-medium">Toplulukla etkileşim kurun</p>
                </div>
                <button className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20 active:scale-90 transition-transform">
                    <Plus size={24} />
                </button>
            </div>

            {/* Trending / Category Section (Compact) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                {["Hepsi", "Soru", "Tartışma", "Ayet Paylaşımı", "Dua"].map(cat => (
                    <button key={cat} className="whitespace-nowrap px-4 py-2 bg-[#15171c] border border-slate-800 rounded-full text-[10px] font-black uppercase text-slate-400 active:border-amber-500 active:text-amber-500 transition-colors">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Post Feed */}
            <div className="space-y-4 mt-4">
                {posts.map((post, i) => (
                    <Link key={i} href={`/forum/${post.id}`} className="block">
                        <div className="bg-[#15171c] p-6 rounded-[2.5rem] border border-slate-800 active:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center">
                                    {post.profiles?.avatar_url ? (
                                        <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} className="text-slate-600" />
                                    )}
                                </div>
                                <div>
                                    <h5 className="text-slate-200 text-xs font-black uppercase italic">{post.profiles?.full_name || "İsimsiz"}</h5>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <h4 className="text-white font-bold text-lg leading-tight mb-3 italic">{post.title}</h4>
                            <p className="text-slate-400 text-sm line-clamp-2 font-medium mb-6">
                                {post.content}
                            </p>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-800/50">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Heart size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{post.likes_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <MessageCircle size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{post.forum_comments?.[0]?.count || 0} Yanıt</span>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 text-amber-500/40">
                                    <TrendingUp size={14} />
                                    <span className="text-[8px] font-black uppercase tracking-tight">Popüler</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {loading && posts.length === 0 && (
                <div className="text-center py-20 text-slate-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Gönderiler Yükleniyor...
                </div>
            )}
        </div>
    );
}
