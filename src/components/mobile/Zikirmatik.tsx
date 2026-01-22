"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Target, Settings2, Fingerprint, Volume2, VolumeX, History, Trophy } from "lucide-react";

export default function Zikirmatik() {
    const [count, setCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [target, setTarget] = useState(33);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hapticEnabled, setHapticEnabled] = useState(true);
    const [isTargetReached, setIsTargetReached] = useState(false);

    // Initialize from LocalStorage
    useEffect(() => {
        const savedCount = localStorage.getItem("zikir_count");
        const savedTotal = localStorage.getItem("zikir_total");
        const savedTarget = localStorage.getItem("zikir_target");

        if (savedCount) setCount(parseInt(savedCount));
        if (savedTotal) setTotalCount(parseInt(savedTotal));
        if (savedTarget) setTarget(parseInt(savedTarget));
    }, []);

    // Persist to LocalStorage
    useEffect(() => {
        localStorage.setItem("zikir_count", count.toString());
        localStorage.setItem("zikir_total", totalCount.toString());
        localStorage.setItem("zikir_target", target.toString());
    }, [count, totalCount, target]);

    const increment = useCallback(() => {
        const newCount = count + 1;
        setCount(newCount);
        setTotalCount(prev => prev + 1);

        // Haptic Feedback
        if (hapticEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(20);
        }

        // Sound Feedback (Optional: could add a tiny click sound file)
        // if (soundEnabled) { ... }

        // Target Reached Check
        if (newCount === target) {
            setIsTargetReached(true);
            if (hapticEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            setTimeout(() => setIsTargetReached(false), 3000);
        }
    }, [count, target, hapticEnabled]);

    const reset = () => {
        if (confirm("Mevcut zikri sıfırlamak istiyor musunuz?")) {
            setCount(0);
        }
    };

    const nextTarget = () => {
        const targets = [33, 99, 100, 500, 1000];
        const nextIdx = (targets.indexOf(target) + 1) % targets.length;
        setTarget(targets[nextIdx]);
    };

    return (
        <div className="flex flex-col items-center justify-between h-full bg-[#0b0c0f] p-6 text-white pb-20">
            {/* Top Stats */}
            <div className="w-full flex justify-between items-start pt-4">
                <div className="bg-[#15171c] px-4 py-2 rounded-2xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Toplam</p>
                    <p className="text-xl font-black font-mono">{totalCount.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => setHapticEnabled(!hapticEnabled)}
                        className={`p-3 rounded-xl border transition-all ${hapticEnabled ? 'bg-amber-600/10 border-amber-500/50 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                        <Fingerprint size={20} />
                    </button>
                    <button
                        onClick={nextTarget}
                        className="bg-[#15171c] px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2"
                    >
                        <Target size={14} className="text-amber-500" />
                        <span className="text-xs font-bold">{target}</span>
                    </button>
                </div>
            </div>

            {/* Main Counter Display */}
            <div className="relative flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {isTargetReached && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute -top-16 bg-amber-500 text-[#0b0c0f] px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-amber-500/40 z-20"
                        >
                            <Trophy size={16} />
                            Hicret Tamamlandı!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="text-center mb-10">
                    <motion.h2
                        key={count}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-9xl font-black font-mono tracking-tighter tabular-nums text-white"
                    >
                        {count}
                    </motion.h2>
                    <div className="w-32 h-1 bg-slate-800 mx-auto rounded-full mt-4 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / target) * 100}%` }}
                            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        />
                    </div>
                </div>
            </div>

            {/* Tactile Button Area */}
            <div className="w-full flex flex-col items-center gap-10">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={increment}
                    className="w-64 h-64 rounded-full bg-gradient-to-b from-slate-800 to-slate-900 border-[8px] border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.05)] active:shadow-inner flex items-center justify-center group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/5 to-amber-500/0 animate-pulse" />
                    <div className="w-48 h-48 rounded-full border border-slate-700/50 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-indigo-500/20 group-active:bg-amber-500/20 flex items-center justify-center transition-colors">
                            <Fingerprint size={64} className="text-slate-400 group-active:text-amber-500 transition-all duration-300 transform group-active:scale-110" />
                        </div>
                    </div>
                </motion.button>

                <div className="flex items-center gap-12">
                    <button
                        onClick={reset}
                        className="p-4 bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors border border-slate-700 active:rotate-180 duration-500"
                        title="Sıfırla"
                    >
                        <RotateCcw size={24} />
                    </button>
                    {/* Placeholder for history/settings */}
                    <button
                        className="p-4 bg-slate-800 rounded-full text-slate-500 border border-slate-700"
                        title="Geçmiş"
                    >
                        <History size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
