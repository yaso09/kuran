"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import GuestLanding from "@/components/home/GuestLanding";
import { ArrowRight, Book, Bookmark, Loader2, ArrowUpRight, Sparkles, Flame, Check, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SURAHS } from "@/lib/constants";
import { Verse } from "@/types/quran";

interface BookmarkedVerse extends Verse {
    surahId: number;
    surahName: string;
}

export default function HomeClient() {
    const { user, isLoaded } = useUser();
    const [savedVerses, setSavedVerses] = useState<BookmarkedVerse[]>([]);
    const [loadingBookmarks, setLoadingBookmarks] = useState(false);

    // AI Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // PWA Install
    const { canInstall, install } = usePWAInstall();

    // Track page visit
    usePageTracking('/', 'Ana Sayfa');

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!user || !user.unsafeMetadata.bookmarks) {
                setSavedVerses([]);
                return;
            }

            const rawBookmarks = user.unsafeMetadata.bookmarks as string[];
            // Filter out invalid keys to prevent 404s
            const bookmarkKeys = rawBookmarks.filter(k => k && typeof k === "string" && k.includes(":"));
            setLoadingBookmarks(true);

            try {
                // Fetch details for each bookmark
                const promises = bookmarkKeys.map(async (key) => {
                    try {
                        const res = await fetch(`/api/ayet/${key}`);
                        if (!res.ok) return null;
                        const verse: Verse & { sureNo: number } = await res.json();
                        const surah = SURAHS.find(s => s.id === verse.sureNo);
                        return {
                            ...verse,
                            surahId: verse.sureNo,
                            surahName: surah?.name || `Sure ${verse.sureNo}`
                        } as BookmarkedVerse;
                    } catch (e) {
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validResults = results.filter((v): v is BookmarkedVerse => v !== null);

                // Sort by Surah ID, then Verse ID
                validResults.sort((a, b) => {
                    if (a.surahId !== b.surahId) {
                        return a.surahId - b.surahId;
                    }
                    return a.verseNumber - b.verseNumber;
                });

                setSavedVerses(validResults);
            } catch (error) {
                console.error("Bookmark fetch error", error);
            } finally {
                setLoadingBookmarks(false);
            }
        };

        if (isLoaded && user) {
            fetchBookmarks();
        }
    }, [user, isLoaded]);

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
                    model: "llama-3.3-70b",
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


    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            {/* --- GUEST VIEW (LANDING PAGE) --- */}
            <SignedOut>
                <GuestLanding />
            </SignedOut>


            {/* --- USER VIEW (DASHBOARD) --- */}
            <SignedIn>
                <div className="relative overflow-hidden bg-[#0b0c0f] py-12 sm:py-16">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center z-10">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-serif">
                            Hoş Geldiniz, {user?.firstName}
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
                            Kaldığınız yerden devam edin veya yeni bir araştırma başlatın.
                        </p>

                        {/* AI Search Bar */}
                        <div className="mt-8 max-w-xl mx-auto relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <form onSubmit={handleSearch} className="relative flex items-center bg-[#15171c] rounded-lg p-2 ring-1 ring-slate-800 shadow-2xl">
                                <div className="pl-3 text-slate-500">
                                    <Sparkles size={20} className="text-amber-500" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ayetlerde ara (Örn: Sabır, Namaz, Cennet...)"
                                    className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-600 py-2 px-3 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {searching ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                                </button>
                            </form>
                            <p className="text-xs text-slate-600 mt-2 text-right italic">✨ Akıllı Arama Beta</p>
                        </div>

                        {/* Search Results Display */}
                        {showResults && (
                            <div className="mt-12 text-left bg-[#15171c] rounded-2xl border border-slate-800 shadow-2xl p-6 relative overflow-hidden max-w-3xl mx-auto">
                                {/* ... (Existing search results logic) ... */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-white font-bold text-lg">Arama Sonuçları</h3>
                                    <button
                                        onClick={() => setShowResults(false)}
                                        className="text-slate-500 hover:text-white text-xs uppercase font-bold tracking-widest"
                                    >
                                        Kapat
                                    </button>
                                </div>

                                {searching ? (
                                    <div className="flex flex-col items-center py-10 gap-4">
                                        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
                                        <p className="text-slate-500 text-sm italic">Ayetler taranıyor, tefekkür ediliyor...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {searchResults.map((result: any, i: number) => (
                                            <Link
                                                key={i}
                                                href={`/kuran/${result.surahId}/${result.verseNumber}`}
                                                className="block p-4 rounded-xl bg-[#0b0c0f] border border-slate-800 hover:border-amber-600/50 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-amber-500 font-bold text-xs uppercase tracking-tighter">
                                                        {result.surahName} / {result.verseNumber}
                                                    </span>
                                                    <ArrowUpRight className="text-slate-700 group-hover:text-amber-500 transition-colors" size={14} />
                                                </div>
                                                <p className="text-slate-200 text-sm leading-relaxed mb-3">{result.text}</p>
                                                <p className="text-slate-500 text-right font-arabic" dir="rtl">{result.arabic}</p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500 italic">Aradığınız kriterde bir ayet bulunamadı.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                            {canInstall && (
                                <button
                                    onClick={install}
                                    className="group relative inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all hover:scale-105"
                                >
                                    <Download size={18} className="group-hover:animate-bounce" />
                                    Uygulamayı İndir
                                </button>
                            )}

                            {user?.unsafeMetadata?.lastRead ? (
                                <Link
                                    href={(user.unsafeMetadata.lastRead as string) || "/kuran"}
                                    className="rounded-md bg-amber-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition-all flex items-center gap-2"
                                >
                                    <Book size={18} />
                                    Kaldığın Yerden Devam Et
                                </Link>
                            ) : (
                                <Link
                                    href="/kuran"
                                    className="rounded-md bg-amber-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition-all flex items-center gap-2"
                                >
                                    Hemen Başla <ArrowRight size={18} />
                                </Link>
                            )}

                            <Link href="/aktivite" className="text-sm font-semibold leading-6 text-white hover:text-amber-400 transition-colors">
                                Aktivitem <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        <div className="max-w-4xl mx-auto mt-16 pb-12">
                            <Link
                                href="/aktivite"
                                className="group relative bg-[#15171c]/50 backdrop-blur-sm border border-amber-500/10 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between overflow-hidden transition-all hover:bg-[#15171c] hover:border-amber-500/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.05)]"
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center gap-6 relative">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors duration-500 min-w-[64px]">
                                            <Flame size={32} className="text-amber-500 fill-amber-500 animate-flame" />
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                            {(user?.unsafeMetadata.streak as number) || 0} Günlük Seri
                                            <span className="text-[10px] bg-amber-500 text-[#0b0c0f] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">Harika</span>
                                        </h3>
                                        <p className="text-slate-400 text-sm font-medium mt-1">Okuma alışkanlığını bozma, takvimini ve istatistiklerini gör →</p>
                                    </div>
                                </div>

                                <div className="hidden md:flex items-center gap-2 relative mt-4 sm:mt-0">
                                    <div className="flex -space-x-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-4 border-[#0b0c0f] bg-slate-800 flex items-center justify-center text-amber-500">
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Saved Verses Section */}
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Bookmark {...({ className: "text-amber-500" } as any)} />
                            <h2 className="text-xl font-bold text-white">Kaydedilen Ayetler</h2>
                        </div>

                        {loadingBookmarks ? (
                            <div className="flex justify-center p-10">
                                <Loader2 className="animate-spin text-amber-500" size={32} />
                            </div>
                        ) : savedVerses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedVerses.map((verse) => (
                                    <Link
                                        key={verse.verseKey}
                                        href={`/kuran/${verse.surahId}/${verse.verseNumber}`}
                                        className="bg-[#15171c] p-6 rounded-2xl border border-slate-800 hover:border-amber-900/50 hover:bg-[#1a1c23] transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-amber-500 font-bold text-sm tracking-wider uppercase">{verse.surahName}</span>
                                                <span className="text-slate-500 text-xs">Ayet {verse.verseNumber}</span>
                                            </div>
                                            <ArrowUpRight className="text-slate-600 group-hover:text-amber-500 transition-colors" size={20} />
                                        </div>
                                        <p className="text-slate-300 line-clamp-3 text-sm leading-relaxed font-medium">
                                            {verse.turkish?.diyanet_vakfi}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-end">
                                            <p className="text-lg text-slate-400 font-arabic" dir="rtl">{verse.arabic}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-10 bg-[#15171c] rounded-2xl border border-slate-800 border-dashed">
                                <p className="text-slate-500">Henüz kaydedilmiş ayetiniz yok.</p>
                                <Link href="/kuran" className="text-amber-500 text-sm mt-2 inline-block hover:underline">
                                    Okumaya Başla
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </SignedIn>
        </div>
    );
}
