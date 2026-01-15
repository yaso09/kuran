import Navbar from "@/components/Navbar";
import { Headphones, PlayCircle, Play } from "lucide-react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";

export default function DinlePage() {
    const popularSurahs = [1, 18, 36, 67, 78]; // Fatiha, Kehf, Yasin, Mulk, Nebe

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                        <Headphones size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Kur'an Dinle</h1>
                        <p className="text-slate-400">Seçkin hafızlardan sureleri dinleyin.</p>
                    </div>
                </div>

                {/* Featured Section */}
                <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                    <PlayCircle size={20} className="text-amber-500" />
                    Sık Dinlenenler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {popularSurahs.map(id => {
                        const surah = SURAHS.find(s => s.id === id);
                        return (
                            <Link
                                key={id}
                                href={`/kuran/${id}`}
                                className="bg-[#15171c] p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-lg hover:border-amber-900/50 hover:bg-[#1a1d23] transition-all group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            {id}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-200 group-hover:text-amber-500 transition-colors">{surah?.name}</h3>
                                            <p className="text-xs text-slate-500">{surah?.verseCount} Ayet</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <Play size={12} fill="currentColor" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* All Surahs */}
                <h2 className="text-xl font-bold text-slate-200 mb-6">Tüm Sureler</h2>
                <div className="bg-[#15171c] rounded-3xl border border-slate-800 p-2 shadow-sm">
                    {SURAHS.map((surah) => (
                        <Link
                            key={surah.id}
                            href={`/kuran/${surah.id}`}
                            className="flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-2xl transition-colors group border-b border-slate-800 last:border-0"
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-8 text-center text-slate-500 font-medium group-hover:text-amber-500 transition-colors">{surah.id}</span>
                                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{surah.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm">
                                <span>{surah.verseCount} ayet</span>
                                <Play size={16} className="group-hover:text-amber-500 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
