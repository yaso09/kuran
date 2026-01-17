"use client";

import React from "react";
import { Play, Pause, Radio as RadioIcon, Volume2, ShieldCheck } from "lucide-react";

const STATIONS = [
    { name: "Kur'an Meali", desc: "Alukah Kesintisiz Tilavet", url: "https://radio.alukah.net/quran.mp3" },
];

export default function MobileDinlePage() {
    return (
        <div className="px-4 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">DİNLE</h2>
                <p className="text-slate-500 text-sm font-medium">Canlı Kur'an yayınları</p>
            </div>

            {/* Currently Playing Hero */}
            <div className="bg-[#15171c] border border-slate-800 rounded-[2.5rem] p-8 mb-8 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
                <div className="w-24 h-24 bg-amber-600/10 rounded-full flex items-center justify-center mb-6 border border-amber-600/20">
                    <RadioIcon className="text-amber-500 animate-pulse" size={40} />
                </div>
                <h3 className="text-white font-black text-2xl uppercase tracking-tight">YAYIN SEÇİN</h3>
                <p className="text-slate-500 text-sm mt-1 uppercase font-black tracking-widest">Çalmaya Başlat</p>

                <div className="flex items-center gap-6 mt-10">
                    <button className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-600/20 active:scale-90 transition-transform">
                        <Play size={28} fill="currentColor" />
                    </button>
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 text-amber-500">
                            <Volume2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Canlı Yayın</span>
                        </div>
                        <div className="text-white font-black text-lg mt-1 italic">HAZIR</div>
                    </div>
                </div>
            </div>

            {/* Station List */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2 mb-2">İSTASYONLAR</h4>
                {STATIONS.map((station, i) => (
                    <div key={i} className="bg-[#15171c] p-5 rounded-3xl border border-slate-800 flex items-center justify-between active:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500">
                                <RadioIcon size={20} />
                            </div>
                            <div>
                                <h5 className="text-white font-bold">{station.name}</h5>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{station.desc}</p>
                            </div>
                        </div>
                        <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-amber-500">
                            <Play size={18} fill="currentColor" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-center gap-4">
                <ShieldCheck className="text-amber-500" size={24} />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Yayınlar internet üzerinden canlı olarak aktarılmaktadır. Veri kullanımı için Wi-Fi önerilir.
                </p>
            </div>
        </div>
    );
}
