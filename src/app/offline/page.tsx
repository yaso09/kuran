"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { WifiOff, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-[#0b0c0f] text-slate-300">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-32 text-center">
                <div className="bg-[#15171c] rounded-[40px] border border-slate-800 p-12 sm:p-16 shadow-2xl inline-block">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <WifiOff size={48} className="text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-6 uppercase italic tracking-tighter">
                        İnternet Bağlantısı Yok
                    </h1>
                    <p className="text-slate-400 max-w-sm mx-auto mb-10 text-lg leading-relaxed">
                        Üzgünüz, bu sayfa şu anda çevrimdışı görüntülenebilir değil. Lütfen internet bağlantınızı kontrol edin.
                    </p>
                    <Link
                        href="/"
                        className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-amber-600/20 inline-flex items-center gap-2 group"
                    >
                        <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                        ANA SAYFAYA DÖN
                    </Link>
                </div>
            </main>
        </div>
    );
}
