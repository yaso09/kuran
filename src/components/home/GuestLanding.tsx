"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    BookOpen, Users, Clock, Award, ChevronRight, Play,
    MessageSquare, Heart, Radio, Flame, Zap, Smartphone,
    WifiOff, ShieldCheck, ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { SignInButton } from '@clerk/nextjs';

export default function GuestLanding() {
    const { install, canInstall } = usePWAInstall();
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    const features = [
        { icon: BookOpen, title: "Hibrit Okuma", desc: "Mushaf ve Meal bir arada", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { icon: Users, title: "Sosyal Ağ", desc: "Ayetler üzerine tartışın", color: "text-blue-400", bg: "bg-blue-500/10" },
        { icon: Clock, title: "İbadet Asistanı", desc: "Namaz vakitleri ve Radyo", color: "text-amber-400", bg: "bg-amber-500/10" },
        { icon: Award, title: "Oyunlaştırma", desc: "Zincirleri kırma, rozet kazan", color: "text-purple-400", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="bg-[#0b0c0f] text-white overflow-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* Animated Background */}
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

                        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Sadece okumak için değil; anlamak, hissetmek ve toplulukla paylaşmak için tasarlandı. Reklamsız, odaklı ve tamamen modern.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
                            <Link href="/kuran" className="group relative px-8 py-4 bg-emerald-600 rounded-2xl font-bold text-lg overflow-hidden transition-transform active:scale-95">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <span className="flex items-center gap-2">
                                    Keşfetmeye Başla <ArrowRight size={20} />
                                </span>
                            </Link>
                            <SignInButton mode="modal">
                                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-lg text-slate-200 transition-colors border border-slate-700">
                                    Giriş Yap
                                </button>
                            </SignInButton>
                        </div>

                        {/* Floating Cards (Decorative) */}
                        <motion.div
                            style={{ opacity, scale }}
                            className="relative w-full max-w-5xl mx-auto h-[300px] md:h-[500px] perspective-1000"
                        >
                            <div className="absolute top-10 left-10 md:left-0 md:top-20 z-20 transform -rotate-6 transition-transform hover:rotate-0 duration-500 hover:z-30">
                                <div className="w-64 h-80 bg-[#15171c] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <BookOpen size={16} className="text-emerald-500" />
                                        </div>
                                        <div className="h-2 w-20 bg-slate-800 rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-slate-800 rounded-full" />
                                        <div className="h-2 w-3/4 bg-slate-800 rounded-full" />
                                    </div>
                                    <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800/50 border-dashed flex items-center justify-center">
                                        <span className="text-6xl">📖</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-0 right-10 md:right-0 z-10 transform rotate-6 transition-transform hover:rotate-0 duration-500 hover:z-30">
                                <div className="w-64 h-80 bg-[#15171c] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <MessageSquare size={16} className="text-blue-500" />
                                        </div>
                                        <div className="h-2 w-20 bg-slate-800 rounded-full" />
                                    </div>
                                    <div className="mt-2 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                        <p className="text-xs text-blue-300">Bu ayet gerçekten çok etkileyici...</p>
                                    </div>
                                    <div className="mt-auto flex justify-end">
                                        <div className="w-8 h-8 bg-slate-800 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute hidden md:block top-32 left-1/2 transform -translate-x-1/2 z-30 hover:scale-105 transition-transform duration-500">
                                <div className="w-80 h-96 bg-[#1a1c23] border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-4 flex flex-col">
                                    <div className="w-full h-40 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-xl mb-4 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <h3 className="text-4xl font-black text-white/20">KURAN</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 w-3/4 bg-slate-700/50 rounded" />
                                        <div className="h-3 w-1/2 bg-slate-800 rounded" />
                                    </div>
                                    <div className="mt-auto flex gap-2">
                                        <div className="flex-1 h-10 bg-emerald-600 rounded-lg" />
                                        <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- BENTO GRID FEATURE --- */}
            <section className="py-24 bg-[#08090b] relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Large Card: Hybrid Reading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 bg-[#15171c] rounded-3xl p-8 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                                    <BookOpen className="text-emerald-400" size={24} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Hibrit Okuma deneyimi</h3>
                                <p className="text-slate-400 text-lg max-w-md">
                                    İsterseniz klasik "Mushaf" modunda dikkatiniz dağılmadan okuyun,
                                    isterseniz "Meal" modunda her kelimenin anlamına derinlemesine inin.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card: Audio */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#15171c] rounded-3xl p-8 border border-slate-800 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
                        >
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                                    <Play className="text-blue-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Kesintisiz Dinleme</h3>
                                <p className="text-slate-400 text-sm">
                                    Arka planda çalma, sureler arası otomatik geçiş ve hafız seçimi.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card: Gamification */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#15171c] rounded-3xl p-8 border border-slate-800 relative overflow-hidden group hover:border-amber-500/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                                    <Flame className="text-amber-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Zinciri Kırma</h3>
                                <p className="text-slate-400 text-sm">
                                    Her gün okuyarak serini koru, rozetler kazan ve istikrarını kanıtla.
                                </p>
                            </div>
                        </motion.div>

                        {/* Large Card: Community */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-2 bg-[#15171c] rounded-3xl p-8 border border-slate-800 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
                        >
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                                    <Users className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Canlı Sosyal Etkileşim</h3>
                                <p className="text-slate-400 text-lg max-w-md">
                                    Tek başınıza değilsiniz. Ayetlere yorum yapın, başkalarının tefekkürlerini okuyun ve anlam dünyanızı genişletin.
                                </p>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* --- DEEP DRIVE: WORSHIP ASSISTANT --- */}
            <section className="py-24 bg-[#0b0c0f]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                                <Clock size={16} /> İbadet Asistanı
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                Vaktinde, <br />
                                <span className="text-indigo-500">Huzurla.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Sadece Kuran değil, günlük ibadetleriniz için de yanınızda.
                                Gelişmiş algoritmalar ile şehir bazlı en doğru namaz vakitleri,
                                kerahat uyarıları ve yaklaşan vaktin geri sayımı.
                            </p>

                            <ul className="space-y-4 pt-4">
                                {[
                                    { title: "Hassas Vakitler", desc: "Diyanet uyumlu, ilçe bazlı hesaplama." },
                                    { title: "Akıllı Bildirimler", desc: "Vakit girmeden önce zarif hatırlatmalar." },
                                    { title: "Kuran Radyo", desc: "7/24 Kesintisiz Tilavet yayını." },
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        </div>
                                        <div>
                                            <strong className="block text-white">{item.title}</strong>
                                            <span className="text-slate-500 text-sm">{item.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual Representation */}
                        <div className="flex-1 relative">
                            <div className="relative z-10 bg-[#15171c] border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
                                {/* Mock UI for Prayer Times */}
                                <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                                    <div>
                                        <span className="text-slate-400 text-sm">Sonraki Vakit</span>
                                        <h4 className="text-3xl font-bold text-white">İkindi</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-indigo-400 font-mono text-2xl">00:42:15</span>
                                        <span className="text-slate-500 text-xs block">Kalan Süre</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'].map((vakit, i) => (
                                        <div key={i} className={`flex justify-between p-3 rounded-lg ${i === 3 ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-slate-900/50'}`}>
                                            <span className={i === 3 ? 'text-indigo-300 font-bold' : 'text-slate-400'}>{vakit}</span>
                                            <span className={i === 3 ? 'text-indigo-300 font-bold' : 'text-slate-500'}>--:--</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Radio Mini Player */}
                                <div className="mt-8 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                        <Radio size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <span className="block text-white font-bold text-sm">Canlı Yayın</span>
                                        <span className="text-amber-200 text-xs">Kuran Radyo</span>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="flex gap-1 items-end h-4">
                                            {[1, 2, 3, 4, 3, 2].map((h, i) => (
                                                <div key={i} className="w-1 bg-white/50 rounded-full" style={{ height: `${h * 4}px` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* --- TECH SHOWCASE --- */}
            <section className="py-24 bg-[#08090b] text-center">
                <div className="container mx-auto px-4">
                    <div className="inline-block p-1 rounded-full bg-slate-800/50 border border-slate-700 mb-8">
                        <span className="bg-[#15171c] px-4 py-2 rounded-full text-sm font-bold text-slate-300">TEKNOLOJİ</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black mb-16">
                        Performansın <span className="text-emerald-500">Zirvesi</span>
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        <div className="p-6 bg-[#15171c] rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 transition-all">
                            <Zap className="mx-auto text-emerald-500 mb-4" size={32} />
                            <h4 className="font-bold text-white mb-2">Işık Hızı</h4>
                            <p className="text-slate-500 text-sm">Next.js Edge mimarisi ile milisaniyeler içinde açılan sayfalar.</p>
                        </div>
                        <div className="p-6 bg-[#15171c] rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
                            <Smartphone className="mx-auto text-blue-500 mb-4" size={32} />
                            <h4 className="font-bold text-white mb-2">PWA Uyumlu</h4>
                            <p className="text-slate-500 text-sm">Uygulama mağazasına gerek yok. Tarayıcıdan bir tıkla yükle.</p>
                        </div>
                        <div className="p-6 bg-[#15171c] rounded-2xl border border-slate-800/50 hover:border-amber-500/30 transition-all">
                            <WifiOff className="mx-auto text-amber-500 mb-4" size={32} />
                            <h4 className="font-bold text-white mb-2">Çevrimdışı Mod</h4>
                            <p className="text-slate-500 text-sm">İnternetiniz kesilse bile okumaya devam edin.</p>
                        </div>
                        <div className="p-6 bg-[#15171c] rounded-2xl border border-slate-800/50 hover:border-purple-500/30 transition-all">
                            <ShieldCheck className="mx-auto text-purple-500 mb-4" size={32} />
                            <h4 className="font-bold text-white mb-2">Veri Gizliliği</h4>
                            <p className="text-slate-500 text-sm">Okuma verileriniz cihazınızda ve güvenli sunucularda şifreli.</p>
                        </div>
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

            {/* --- FOOTER CTA --- */}
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
