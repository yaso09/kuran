"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Radio,
    Loader2,
    Music,
    Signal,
    Activity,
    ChevronDown,
    Check
} from "lucide-react";

interface RadioStation {
    id: string;
    name: string;
    url: string;
    description: string;
}

const STATIONS: RadioStation[] = [
    {
        id: "alukah-quran",
        name: "Kur'an Tilaveti",
        url: "https://radio.alukah.net/quran.mp3",
        description: "7/24 Kesintisiz Tilavet (Alukah)"
    }
];

export default function QuranRadio() {
    const [currentStation] = useState(STATIONS[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            startPlayback(currentStation.url);
        }
    };

    const startPlayback = (url: string) => {
        if (!audioRef.current) return;
        setIsLoading(true);
        // Canlı yayın olduğu için pause edildiğinde geri kaldığından 
        // her play dediğimizde URL'i yenileyerek güncel yayına bağlanıyoruz
        audioRef.current.src = url;
        audioRef.current.load();
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                setIsPlaying(true);
                setIsLoading(false);
            }).catch(error => {
                console.error("Playback failed:", error);
                setIsPlaying(false);
                setIsLoading(false);
            });
        }
    };

    return (
        <div className="relative group max-w-4xl mx-auto mb-12">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-600/20 to-amber-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative bg-[#15171c] border border-amber-500/20 rounded-[2rem] p-8 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 transform rotate-12">
                    <Radio size={120} className="text-white" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Visualizer / Logo Area */}
                    <div className="relative w-24 h-24 flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 shadow-inner group/logo overflow-hidden">
                        {isPlaying ? (
                            <div className="flex items-end gap-1 h-8">
                                <Activity className="text-amber-500 animate-pulse" size={40} />
                            </div>
                        ) : (
                            <Music className="text-slate-700" size={40} />
                        )}
                        <div className="absolute bottom-0 w-full h-1 bg-amber-500/20 overflow-hidden">
                            {isPlaying && <div className="h-full bg-amber-500 animate-progress-indefinite"></div>}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 text-center md:text-left relative">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                                {isPlaying ? <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> : null}
                                {isPlaying ? "CANLI YAYIN" : "RADYO"}
                            </span>
                            <Signal className={`${isPlaying ? 'text-amber-500' : 'text-slate-600'}`} size={14} />
                        </div>

                        <h2 className="text-2xl font-black text-white mb-1 uppercase">{currentStation.name}</h2>
                        <p className="text-slate-500 font-medium text-sm">{currentStation.description}</p>
                    </div>

                    {/* Controls Area */}
                    <div className="flex items-center gap-6">
                        {/* Audio Element */}
                        <audio
                            ref={audioRef}
                            onWaiting={() => setIsBuffering(true)}
                            onPlaying={() => setIsBuffering(false)}
                            onLoadStart={() => setIsLoading(true)}
                            onCanPlay={() => setIsLoading(false)}
                        />

                        {/* Volume Control */}
                        <div className="hidden lg:flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                        </div>

                        {/* Play/Pause Button */}
                        <button
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="w-16 h-16 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-600/20 transition-all hover:scale-110 active:scale-95 group/play"
                        >
                            {isLoading || isBuffering ? (
                                <Loader2 className="animate-spin" size={28} />
                            ) : isPlaying ? (
                                <Pause size={28} fill="currentColor" />
                            ) : (
                                <Play size={28} fill="currentColor" className="ml-1" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress-indefinite {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-indefinite {
                    animation: progress-indefinite 2s infinite linear;
                }
            `}</style>
        </div>
    );
}
