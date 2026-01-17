"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Loader2, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
    surahId: number;
    surahName: string;
    verseNumber: number;
    text: string;
    arabic: string;
}

export default function MobileSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length < 2) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResults(data.results || []);
        } catch (err) {
            setError("Arama sonuçları alınamadı.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed inset-0 z-[100] bg-[#0b0c0f] flex flex-col p-4"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Ayet veya konu ara (örn: sabır)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-[#15171c] border border-slate-800 rounded-2xl px-12 py-3 text-white outline-none focus:border-amber-500/50 transition-all text-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" size={18} />}
                        </form>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pb-10">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <Loader2 className="animate-spin mb-4 text-amber-500" size={32} />
                                <p className="text-xs font-black uppercase tracking-widest italic">Yapay Zeka Ayetleri Buluyor...</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{results.length} SONUÇ BULUNDU</p>
                                {results.map((res, i) => (
                                    <Link
                                        key={i}
                                        href={`/mobile/kuran/${res.surahId}/${res.verseNumber}`}
                                        onClick={onClose}
                                        className="block bg-[#15171c] p-6 rounded-[2rem] border border-slate-800 active:border-amber-500/30 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={14} className="text-amber-500" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{res.surahName} {res.verseNumber}</span>
                                            </div>
                                            <ArrowRight size={14} className="text-slate-600" />
                                        </div>
                                        <p className="text-right font-arabic text-lg text-slate-300 mb-3" dir="rtl">{res.arabic}</p>
                                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{res.text}</p>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!loading && query.length >= 2 && results.length === 0 && !error && (
                            <div className="text-center py-20">
                                <Search className="mx-auto text-slate-800 mb-4" size={48} />
                                <p className="text-slate-500 text-sm font-medium">Buna uygun bir ayet bulamadık.</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-20">
                                <p className="text-red-500/80 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {!loading && query.length < 2 && (
                            <div className="py-10 px-4">
                                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Önerilen Aramalar</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Namaz", "Sabır", "Cennet", "Zekat", "Güzel Ahlak"].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => { setQuery(tag); setTimeout(() => { handleSearch({ preventDefault: () => { } } as any) }, 100); }}
                                            className="px-4 py-2 bg-[#15171c] border border-slate-800 rounded-xl text-xs font-bold text-slate-400 active:border-amber-500 active:text-amber-500 transition-all"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
