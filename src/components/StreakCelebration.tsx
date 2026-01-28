"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Coins, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StreakCelebrationProps {
    show: boolean;
    streak: number;
    coinsEarned: number;
    onClose: () => void;
}

export default function StreakCelebration({ show, streak, coinsEarned, onClose }: StreakCelebrationProps) {
    const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        if (show) {
            // Generate confetti particles
            const particles = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 2
            }));
            setConfetti(particles);

            // Auto-close after 4 seconds
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Confetti */}
                    {confetti.map((particle) => (
                        <motion.div
                            key={particle.id}
                            initial={{ y: -20, x: `${particle.x}vw`, opacity: 1 }}
                            animate={{ y: '100vh', opacity: 0 }}
                            transition={{ duration: particle.duration, delay: particle.delay, ease: 'linear' }}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                            }}
                        />
                    ))}

                    {/* Main Card */}
                    <motion.div
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.5, y: 50 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="relative bg-gradient-to-br from-[#1a1c23] to-[#0b0c0f] rounded-3xl p-8 border border-amber-500/30 shadow-2xl max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Flame Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                            className="flex justify-center mb-6"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                >
                                    <Flame size={80} className="text-amber-500 fill-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
                                </motion.div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                                >
                                    +1
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Streak Count */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-6"
                        >
                            <h2 className="text-6xl font-black text-white mb-2">{streak}</h2>
                            <p className="text-amber-400 text-xl font-bold uppercase tracking-wide">
                                Günlük Seri
                            </p>
                        </motion.div>

                        {/* Coins Earned */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6"
                        >
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                                <Coins size={32} className="text-amber-400" />
                            </motion.div>
                            <div>
                                <p className="text-2xl font-black text-amber-400">+{coinsEarned}</p>
                                <p className="text-xs text-slate-400 uppercase">Coin Kazandın</p>
                            </div>
                        </motion.div>

                        {/* Message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-center"
                        >
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                                <Sparkles size={16} className="text-emerald-400" />
                                <span>Harika gidiyorsun! Devam et!</span>
                                <Sparkles size={16} className="text-emerald-400" />
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
