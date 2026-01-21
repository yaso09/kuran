"use client";

import Link from "next/link";
import {
    ArrowRight, Book, Smartphone, Headphones, Moon, Download, Star,
    Search, Sparkles, Flame, Clock, Bookmark, MessageSquare, Users,
    Menu, X, Calendar, ChevronRight, PlayCircle, LogIn, Loader2, ArrowUpRight
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useEffect, useState } from "react";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { SURAHS } from "@/lib/constants";

// Helper for Greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "Hayırlı Geceler";
    if (hour < 11) return "Hayırlı Sabahlar";
    if (hour < 18) return "Hayırlı Günler";
    return "Hayırlı Akşamlar";
};

// Random Verse Logic (Simplified for client-side demo, ideally server-side or API)
const getRandomVerse = () => {
    // Just a placeholder implementation. 
    // In a real app, this should come from an API or a pre-determined daily selection.
    return {
        text: "Şüphesiz Allah, adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder; hayâsızlığı, fenalık ve azgınlığı da yasaklar. O, düşünüp tutasınız diye size öğüt veriyor.",
        source: "Nahl Suresi, 90. Ayet"
    };
};

export default function MobileLanding() {
    const { canInstall, install } = usePWAInstall();
    const { user, isLoaded } = useUser();
    const [mounted, setMounted] = useState(false);
    const [dailyVerse, setDailyVerse] = useState<{ text: string, source: string } | null>(null);

    // AI Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setMounted(true);
        setDailyVerse(getRandomVerse());
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setShowResults(true);
        setSearchResults([]);

        try {
            const cerebrasApiKey = process.env.NEXT_PUBLIC_CEREBRAS_API_KEY;

            if (!cerebrasApiKey) {
                console.error('Cerebras API key not found');
                setSearchResults([]);
                return;
            }

            const aiResponse = await fetch("https://api.cerebras.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cerebrasApiKey}`
                },
                body: JSON.stringify({
                    model: "llama3.1-8b",
                    messages: [
                        {
                            role: "system",
                            content: "Sen Kur'an konusunda uzman bir yardımcısın. Kullanıcının sorusuna/konusuna en uygun ayetleri bulup SADECE 'SureNo:AyetNo' formatında döndür. Aralara virgül koy. Başka açıklama yapma. Örnek: 2:153, 3:10, 103:3"
                        },
                        {
                            role: "user",
                            content: `Şu konuyla ilgili en alakalı ayetleri bul: ${searchQuery}`
                        }
                    ],
                    stream: false,
                    max_completion_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!aiResponse.ok) throw new Error("AI hatası");
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || "";

            // Parse references
            const refs = content.split(",").map((s: string) => s.trim()).filter((s: string) => s.includes(":"));

            // Fetch detailed data
            const detailedResults = await Promise.all(refs.map(async (ref: string) => {
                try {
                    const res = await fetch(`/api/ayet/${ref}`);
                    if (!res.ok) return null;
                    const data = await res.json();
                    return {
                        surahId: data.sureNo,
                        surahName: SURAHS.find((s: any) => s.id === data.sureNo)?.name || `Sure ${data.sureNo}`,
                        verseNumber: data.verseNumber,
                        text: data.turkish?.diyanet_vakfi,
                        arabic: data.arabic
                    };
                } catch (e) {
                    return null;
                }
            }));

            setSearchResults(detailedResults.filter(r => r !== null));
        } catch (error) {
            console.error("Search error", error);
        } finally {
            setSearching(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col min-h-screen bg-[#0b0c0f] text-white overflow-x-hidden pb-10">
            {/* Header Section */}
            <header className="px-6 pt-12 pb-6 flex justify-between items-start z-10 sticky top-0 bg-[#0b0c0f]/80 backdrop-blur-xl border-b border-slate-800/50">
                <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{getGreeting()}</p>
                    <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                        {isLoaded && user ? (
                            <span>{user.firstName || "Kardeşim"}</span>
                        ) : (
                            <span>Misafir</span>
                        )}
                        {isLoaded && user && (
                            <span className="text-amber-500 animate-pulse">👋</span>
                        )}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <Link href="/sign-in" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-amber-500">
                            <LogIn size={18} />
                        </Link>
                    </SignedOut>
                </div>
            </header>

            <main className="px-5 space-y-6 pt-6">

                {/* AI Search Bar */}
                <div className="relative group z-20">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <form onSubmit={handleSearch} className="relative bg-[#15171c] rounded-2xl flex items-center p-1.5 ring-1 ring-slate-800 shadow-xl">
                        <div className="pl-3 pr-2 text-amber-500">
                            <Sparkles size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Ayetlerde ara (Örn: Sabır...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 flex-1 h-10 px-1 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={searching}
                            className="bg-slate-800 text-slate-300 p-2.5 rounded-xl hover:bg-slate-700 transition"
                        >
                            {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        </button>
                    </form>
                </div>

                {/* AI Search Results */}
                {showResults && (
                    <div className="bg-[#15171c] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-5 py-3 border-b border-slate-800 bg-slate-800/30">
                            <h3 className="font-bold text-sm text-amber-500 flex items-center gap-2">
                                <Search size={14} />
                                Arama Sonuçları
                            </h3>
                            <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                            {searching ? (
                                <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-amber-500" size={24} />
                                    <p className="text-xs">Hikmetli ayetler aranıyor...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map((res: any, i) => (
                                        <Link href={`/kuran/${res.surahId}#ayet-${res.verseNumber}`} key={i} className="block bg-[#0b0c0f] p-4 rounded-2xl border border-slate-800 active:bg-slate-900 transition-colors">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-amber-500 font-bold text-xs uppercase">{res.surahName} • {res.verseNumber}</span>
                                                <ArrowUpRight size={14} className="text-slate-600" />
                                            </div>
                                            <p className="text-slate-300 text-sm line-clamp-3">{res.text}</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <p className="text-sm">Sonuç bulunamadı.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* User Stats / Streak */}
                {isLoaded && user && typeof user.unsafeMetadata?.streak === 'number' && (
                    <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/5 border border-amber-500/20 p-5 rounded-3xl flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex flex-col z-10">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Günlük Seri</span>
                            <span className="text-3xl font-black text-white">{(user.unsafeMetadata.streak as number)} Gün</span>
                            <p className="text-[10px] text-slate-400 mt-1">Maşallah, istikrarını koruyorsun!</p>
                        </div>
                        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] z-10 animate-pulse">
                            <Flame size={28} className="text-[#0b0c0f] fill-[#0b0c0f]" />
                        </div>
                    </div>
                )}

                {/* Continue Reading */}
                {isLoaded && user && typeof user.unsafeMetadata?.lastRead === 'string' && (
                    <Link href={(user.unsafeMetadata.lastRead as string)} className="block bg-[#15171c] p-1 rounded-3xl border border-slate-800 shadow-lg active:scale-[0.98] transition-all">
                        <div className="bg-[#0b0c0f] p-4 rounded-[20px] flex items-center justify-between border border-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Book size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Kaldığın Yerden</p>
                                    <p className="font-bold text-slate-200 text-sm">Okumaya Devam Et</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-500">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </Link>
                )}

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-4 gap-3">
                    <Link href="/kuran" className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all duration-300 shadow-sm">
                            <Book size={24} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">Sureler</span>
                    </Link>
                    <Link href="/namaz-vakitleri" className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all duration-300 shadow-sm">
                            <Clock size={24} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">Vakitler</span>
                    </Link>
                    <Link href="/dinle" className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-300 shadow-sm">
                            <Headphones size={24} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">Dinle</span>
                    </Link>
                    <Link href="/forum" className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 shadow-sm">
                            <Users size={24} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">Forum</span>
                    </Link>
                </div>

                {/* Daily Verse Card */}
                {dailyVerse && (
                    <div className="relative overflow-hidden rounded-[32px] bg-[#15171c] border border-slate-800 p-6 shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500"></div>
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                Günün Ayeti
                            </span>
                        </div>

                        <blockquote className="relative">
                            <span className="absolute -top-4 -left-2 text-6xl text-slate-800 font-serif leading-none opacity-50">“</span>
                            <p className="text-lg font-serif italic text-slate-200 leading-relaxed relative z-10 px-2">
                                {dailyVerse.text}
                            </p>
                            <cite className="block mt-4 text-sm font-medium text-slate-500 not-italic text-right">
                                — {dailyVerse.source}
                            </cite>
                        </blockquote>

                        <div className="flex gap-2 mt-6 justify-end">
                            <button className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition">
                                <Bookmark size={18} />
                            </button>
                            <button className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Install Prompts */}
                {canInstall && (
                    <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Download size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">Uygulamayı Yükle</p>
                                <p className="text-[10px] text-slate-300">Daha hızlı erişim için</p>
                            </div>
                        </div>
                        <button onClick={install} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:scale-105 transition-transform">
                            Yükle
                        </button>
                    </div>
                )}

                <div className="h-20"></div>
            </main>
        </div>
    );
}
