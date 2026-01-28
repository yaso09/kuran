"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import { SURAHS } from "@/lib/constants";
import { ArrowLeft, BookOpen, Bookmark, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser } from "@clerk/nextjs";

type TafseerAuthor = 'elmalili';

const AUTHORS: { id: TafseerAuthor; name: string }[] = [
    { id: 'elmalili', name: 'Elmalılı Hamdi Yazır' },
    // Future authors can be added here
];

export default function TafseerPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();

    // Handle params.id which might be string or array
    const idParam = params?.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const surahId = parseInt(id || "1");
    const surahInfo = SURAHS.find(s => s.id === surahId);

    const [selectedAuthor, setSelectedAuthor] = useState<TafseerAuthor>('elmalili');
    const [readingProgress, setReadingProgress] = useState(0);
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scrollRestored, setScrollRestored] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    // Fetch Tafseer Content
    useEffect(() => {
        async function fetchTafseer() {
            try {
                setLoading(true);
                setError(null);

                // Construct URL based on author and surah ID
                // User provided example: https://raw.githubusercontent.com/kurancilar/json/refs/heads/main/tafseer/elmalili/1.md
                const url = `https://raw.githubusercontent.com/kurancilar/json/refs/heads/main/tafseer/${selectedAuthor}/${surahId}.md`;

                const res = await fetch(url);
                if (!res.ok) throw new Error("Tefsir yüklenemedi");

                const text = await res.text();
                setContent(text);

            } catch (err: any) {
                console.error("Tafseer fetch error:", err);
                setError(err.message || "Tefsir yüklenirken bir sorun oluştu.");
            } finally {
                setLoading(false);
            }
        }

        if (surahId) {
            fetchTafseer();
        }
    }, [surahId, selectedAuthor]);

    // Restore Progress
    useEffect(() => {
        if (!loading && content && user && !scrollRestored) {
            const savedProgress = user.unsafeMetadata.tafseerProgress as Record<string, number> | undefined;
            const key = `${surahId}_${selectedAuthor}`;

            if (savedProgress && savedProgress[key]) {
                const scrollY = savedProgress[key];
                // Use a small timeout to let layout settle
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollY,
                        behavior: 'smooth'
                    });
                }, 500);
            }
            setScrollRestored(true);
        }
    }, [loading, content, user, surahId, selectedAuthor, scrollRestored]);

    // Save Progress Logic with Debounce
    useEffect(() => {
        if (!user || loading || !content) return;

        const handleScroll = () => {
            const currentScroll = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollHeight > 0) {
                const progress = Math.min(Math.max((currentScroll / scrollHeight) * 100, 0), 100);
                setReadingProgress(progress);
            }

            lastScrollY.current = currentScroll;
        };

        const saveInterval = setInterval(() => {
            if (lastScrollY.current > 0) {
                const key = `${surahId}_${selectedAuthor}`;
                const currentMeta = (user.unsafeMetadata.tafseerProgress as Record<string, number>) || {};

                // Only update if difference is significant (> 50px)
                if (Math.abs((currentMeta[key] || 0) - lastScrollY.current) > 50) {
                    user.update({
                        unsafeMetadata: {
                            ...user.unsafeMetadata,
                            tafseerProgress: {
                                ...currentMeta,
                                [key]: lastScrollY.current
                            }
                        }
                    }).catch(console.error);
                }
            }
        }, 3000); // Check every 3 seconds

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(saveInterval);
        };
    }, [user, loading, content, surahId, selectedAuthor]);

    if (!surahInfo) return null;

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#0b0c0f]/95 backdrop-blur-md border-b border-slate-800">
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-300 ease-out z-40" style={{ width: `${readingProgress}%` }}></div>

                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href={`/kuran/${surahId}`}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Sureye Dön</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {/* Navigation Arrows */}
                            {surahId > 1 && (
                                <Link href={`/kuran/${surahId - 1}/tefsir`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                                    <ChevronLeft size={20} />
                                </Link>
                            )}
                            <h1 className="text-sm md:text-base font-bold text-slate-200 text-center">
                                {surahInfo.name} Suresi Tefsiri
                            </h1>
                            {surahId < 114 && (
                                <Link href={`/kuran/${surahId + 1}/tefsir`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                                    <ChevronRight size={20} />
                                </Link>
                            )}
                        </div>

                        <div className="w-[70px]"></div> {/* Spacer for alignment */}
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                        {AUTHORS.map(author => (
                            <button
                                key={author.id}
                                onClick={() => {
                                    setSelectedAuthor(author.id);
                                    setScrollRestored(false); // Reset scroll restore logic for new author
                                }}
                                className={`
                                    whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all
                                    ${selectedAuthor === author.id
                                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
                                `}
                            >
                                {author.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl inline-block mb-4">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-200">Tefsir Yüklenemedi</h3>
                        <p className="text-slate-500 mt-2 text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 text-amber-500 hover:text-amber-400 font-bold text-sm"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                ) : (
                    <article ref={contentRef} className="prose prose-invert prose-lg max-w-none prose-headings:text-amber-500 prose-p:text-slate-300 prose-p:leading-8 prose-strong:text-white prose-a:text-amber-500 prose-blockquote:border-l-amber-500 prose-blockquote:bg-slate-800/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </article>
                )}
            </main>
        </div>
    );
}
