"use client";

import React, { useState } from "react";
import BottomNav from "@/mobile/BottomNav";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import MobileSearch from "@/components/MobileSearch";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0b0c0f] pb-20">
            {/* Mobile Specialized Header */}
            <header className="sticky top-0 z-50 bg-[#0b0c0f]/80 backdrop-blur-md border-b border-slate-800 px-4 h-14 flex items-center justify-between">
                <Link href="/mobile" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                        <BookOpen size={18} />
                    </div>
                    <span className="font-black text-lg text-slate-100 italic">KURANCILAR</span>
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="text-slate-400 p-2 active:scale-95 transition-transform"
                    >
                        <Search size={20} />
                    </button>
                    <SignedIn>
                        <Link href="/mobile/ayarlar" className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-500/20 active:scale-90 transition-transform">
                            <img src={user?.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <Link href="/sign-in" className="text-xs font-black text-amber-500 uppercase tracking-widest border border-amber-500/20 px-3 py-1.5 rounded-xl">
                            GİRİŞ
                        </Link>
                    </SignedOut>
                </div>
            </header>

            <MobileSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Main Content Area */}
            <main className="animate-in fade-in duration-500 overflow-x-hidden">
                {children}
            </main>

            {/* Global Mobile Navigation */}
            <BottomNav />
        </div>
    );
}
