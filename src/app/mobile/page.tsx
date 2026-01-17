"use client";

import React from "react";
import Link from "next/link";
import { Book, PlayCircle, MessageSquare, Clock, Star, Flame, BarChart3, MessageCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function MobileDashboard() {
    const { user } = useUser();

    return (
        <div className="px-4 py-6 space-y-8">
            {/* Greeting & Stats */}
            <section className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        SELAM, <span className="text-amber-500 uppercase">{user?.firstName || "KARDEŞİM"}</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Bugün ne okumak istersin?</p>
                </div>
                {user && (
                    <div className="flex flex-col items-center bg-amber-600/10 border border-amber-600/20 px-3 py-2 rounded-2xl animate-pulse">
                        <Flame className="text-amber-500" size={24} />
                        <span className="text-[10px] font-black text-amber-500 mt-0.5">{(user.unsafeMetadata.streak as number) || 0} GÜN</span>
                    </div>
                )}
            </section>

            {/* Main Cards Grid */}
            <section className="grid grid-cols-2 gap-3">
                <Link href="/mobile/kuran" className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-[2rem] aspect-square flex flex-col justify-between shadow-xl shadow-indigo-900/20 active:scale-95 transition-transform">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Book className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg leading-none uppercase">AYETLERİ<br />OKU</h3>
                        <p className="text-white/60 text-[10px] mt-1 font-bold uppercase tracking-wider">Tüm Sureler</p>
                    </div>
                </Link>

                <Link href="/mobile/sohbet" className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-[2rem] aspect-square flex flex-col justify-between shadow-xl shadow-purple-900/20 active:scale-95 transition-transform">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                        <MessageCircle className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg leading-none uppercase">AI<br />SOHBET</h3>
                        <p className="text-white/60 text-[10px] mt-1 font-bold uppercase tracking-wider">Yapay Zeka Asistan</p>
                    </div>
                </Link>
            </section>

            {/* Middle Section */}
            <section className="grid grid-cols-2 gap-3">
                <Link href="/mobile/dinle" className="bg-[#15171c] p-5 rounded-[2rem] border border-slate-800 flex flex-col gap-3 active:bg-slate-800 transition-colors">
                    <PlayCircle className="text-amber-500" size={24} />
                    <div>
                        <h4 className="text-white font-bold text-sm">Dinle</h4>
                        <p className="text-slate-500 text-[10px]">Radyo & Sesler</p>
                    </div>
                </Link>
                <Link href="/mobile/analizler" className="bg-[#15171c] p-5 rounded-[2rem] border border-slate-800 flex flex-col gap-3 active:bg-slate-800 transition-colors">
                    <BarChart3 size={24} className="text-blue-500" />
                    <div>
                        <h4 className="text-white font-bold text-sm">Analizler</h4>
                        <p className="text-slate-500 text-[10px]">Platform Nabzı</p>
                    </div>
                </Link>
            </section>

            {/* List Section */}
            <section className="space-y-3">
                <Link href="/mobile/namaz-vakitleri" className="flex items-center gap-4 bg-[#15171c] p-4 rounded-3xl border border-slate-800 active:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                        <Clock className="text-blue-500" size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-bold">Namaz Vakitleri</h4>
                        <p className="text-slate-500 text-xs text-[10px]">Şehrinizdeki ezan saatleri</p>
                    </div>
                    <div className="text-amber-500 text-[10px] font-black uppercase">VAKİT GELİYOR</div>
                </Link>

                <Link href="/mobile/forum" className="flex items-center gap-4 bg-[#15171c] p-4 rounded-3xl border border-slate-800 active:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="text-purple-500" size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-bold">Topluluk Forumu</h4>
                        <p className="text-slate-500 text-xs text-[10px]">Sorular ve Tartışmalar</p>
                    </div>
                    <Star className="text-slate-700" size={20} />
                </Link>
            </section>

            {/* Last Read Sticker */}
            {user?.unsafeMetadata.lastRead && (
                <Link href={user.unsafeMetadata.lastRead as string} className="block mt-10">
                    <div className="bg-amber-600/5 border border-amber-600/20 p-4 rounded-[2rem] border-dashed">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-lg">KALDIĞIN YER</span>
                            <Clock size={14} className="text-amber-500/40" />
                        </div>
                        <h5 className="text-white font-bold line-clamp-1">Devam etmeye hazır mısın?</h5>
                        <p className="text-slate-500 text-xs mt-1">Son okuduğun ayetten devam et.</p>
                    </div>
                </Link>
            )}
        </div>
    );
}
