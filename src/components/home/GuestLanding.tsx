"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    BookOpen, Users, Clock, Award, Play, MessageSquare, Radio, Flame, Zap, Smartphone,
    WifiOff, ShieldCheck, ArrowRight, Search, Brain, GitCommit, Bell, Bookmark,
    TrendingUp, Globe, Sparkles, Code, Database, Lock
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function GuestLanding() {
    const { install, canInstall } = usePWAInstall();
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    return (
        <div className="bg-[#0b0c0f] text-white overflow-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-sm font-medium text-emerald-400">v1.1 Yayında</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                            Kuran'ın <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 bg-clip-text text-transparent">Dijital Çağı</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Yapay zeka destekli arama, sosyal etkileşim, oyunlaştırma ve daha fazlası.
                            Kuran'ı okumak, anlamak ve paylaşmak için tasarlanmış yeni nesil platform.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
                            <Link href="/kuran" className="group relative px-8 py-4 bg-emerald-600 rounded-2xl font-bold text-lg overflow-hidden transition-transform active:scale-95">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <span className="flex items-center gap-2">
                                    Keşfetmeye Başla <ArrowRight size={20} />
                                </span>
                            </Link>
                            <Link href="/sign-in" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-lg text-slate-200 transition-colors border border-slate-700 flex items-center justify-center">
                                Giriş Yap
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- AI SEARCH SECTION --- */}
            <section className="py-24 bg-[#08090b] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                                <Brain size={16} /> Yapay Zeka
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                Anlam Bazlı <br />
                                <span className="text-purple-500">Akıllı Arama</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Klasik kelime aramasını unutun. "Moralim bozuk" yazın, İnşirah suresini bulsun.
                                Llama-3.3-70b modeli ile donatılmış Cerebras altyapısı sayesinde saniyenin altında sonuç.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {[
                                    { title: "Doğal Dil İşleme", desc: "Günlük konuşma dilinizle arayın." },
                                    { title: "Bağlamsal Anlama", desc: "Kelimelerin ötesinde, anlamı yakalar." },
                                    { title: "Işık Hızı", desc: "Sub-second yanıt süresi." },
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        </div>
                                        <div>
                                            <strong className="block text-white">{item.title}</strong>
                                            <span className="text-slate-500 text-sm">{item.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex-1 relative">
                            <div className="relative z-10 bg-[#15171c] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <Search className="text-purple-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Örn: Sabır hakkında ne diyor?"
                                        className="bg-transparent outline-none text-white flex-1"
                                        disabled
                                    />
                                </div>
                                <div className="space-y-3">
                                    {['Bakara 153', 'Asr Suresi', 'Zümer 10'].map((result, i) => (
                                        <div key={i} className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 flex items-center gap-3">
                                            <Sparkles size={16} className="text-purple-400" />
                                            <span className="text-purple-300 font-medium">{result}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-24 bg-[#0b0c0f]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Tüm Özellikler</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Modern teknoloji ile dini deneyiminizi zenginleştirin
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: BookOpen, title: "Hibrit Okuma", desc: "Mushaf ve Meal modları arasında geçiş yapın", color: "emerald" },
                            { icon: Play, title: "Kesintisiz Ses", desc: "Arka planda çalma ve otomatik sure geçişi", color: "blue" },
                            { icon: Flame, title: "Streak Sistemi", desc: "Günlük okuma zincirinizi kırma, rozet kazanın", color: "amber" },
                            { icon: Users, title: "Sosyal Forum", desc: "Ayetler üzerine tartışın, yorum yapın", color: "purple" },
                            { icon: Clock, title: "Namaz Vakitleri", desc: "Şehir bazlı hassas vakit hesaplama", color: "indigo" },
                            { icon: Radio, title: "Canlı Radyo", desc: "7/24 Kuran tilaveti yayını", color: "pink" },
                            { icon: Bell, title: "Akıllı Bildirimler", desc: "Vakit, okuma ve sosyal hatırlatmalar", color: "rose" },
                            { icon: Bookmark, title: "Yer İmleri", desc: "Ayetleri kaydedin, istediğiniz zaman dönün", color: "cyan" },
                            { icon: GitCommit, title: "Sürüm Takibi", desc: "GitHub entegrasyonu ile şeffaf geliştirme", color: "teal" },
                            { icon: WifiOff, title: "Çevrimdışı Mod", desc: "İnternet olmadan okumaya devam edin", color: "orange" },
                            { icon: Smartphone, title: "PWA Desteği", desc: "Uygulama gibi yükleyin, kullanın", color: "lime" },
                            { icon: ShieldCheck, title: "Güvenlik", desc: "Verileriniz şifreli ve korumalı", color: "green" },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-[#15171c] rounded-2xl p-6 border border-slate-800 hover:border-${feature.color}-500/30 transition-colors group`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`text-${feature.color}-400`} size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TECH STACK --- */}
            <section className="py-24 bg-[#08090b]">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-block p-1 rounded-full bg-slate-800/50 border border-slate-700 mb-8">
                        <span className="bg-[#15171c] px-4 py-2 rounded-full text-sm font-bold text-slate-300">TEKNOLOJİ</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black mb-16">
                        Performansın <span className="text-emerald-500">Zirvesi</span>
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        {[
                            { icon: Zap, title: "Next.js 14", desc: "Edge mimarisi" },
                            { icon: Database, title: "Supabase", desc: "PostgreSQL veritabanı" },
                            { icon: Lock, title: "Clerk Auth", desc: "Güvenli kimlik doğrulama" },
                            { icon: Code, title: "TypeScript", desc: "Tip güvenli kod" },
                        ].map((tech, i) => (
                            <div key={i} className="p-6 bg-[#15171c] rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 transition-all">
                                <tech.icon className="mx-auto text-emerald-500 mb-4" size={32} />
                                <h4 className="font-bold text-white mb-2">{tech.title}</h4>
                                <p className="text-slate-500 text-sm">{tech.desc}</p>
                            </div>
                        ))}
                    </div>

                    {canInstall && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={install}
                            className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-purple-600/30"
                        >
                            Uygulamayı Cihazına İndir
                        </motion.button>
                    )}
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-900/20 to-transparent h-full pointer-events-none" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-5xl font-black text-white mb-8">Hazır mısınız?</h2>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12">
                        Binlerce kişilik topluluğumuzun bir parçası olun ve Kuran yolculuğunuzu derinleştirin.
                    </p>

                    <Link href="/kuran" className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold py-5 px-12 rounded-full hover:bg-slate-100 transition-colors shadow-2xl shadow-emerald-500/10 text-xl">
                        Hemen Başla
                    </Link>
                </div>
            </section>

        </div>
    );
}
