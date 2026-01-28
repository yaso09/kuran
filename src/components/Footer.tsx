import Link from 'next/link';
import { BookOpen, Github, Mail, Heart, GitCommit } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0b0c0f] border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                <BookOpen size={20} className="text-white" />
                            </div>
                            <span className="font-bold text-xl text-white">Kur'ancılar</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Modern teknoloji ile Kuran'ı okumak, anlamak ve paylaşmak için tasarlanmış platform.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Hızlı Erişim</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/kuran" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                                    Oku
                                </Link>
                            </li>
                            <li>
                                <Link href="/dinle" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                                    Dinle
                                </Link>
                            </li>
                            <li>
                                <Link href="/namaz-vakitleri" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                                    Namaz Vakitleri
                                </Link>
                            </li>
                            <li>
                                <Link href="/forum" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                                    Forum
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Hakkında</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/surumler" className="text-slate-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                                    <GitCommit size={14} />
                                    Sürüm Geçmişi
                                </Link>
                            </li>
                            <li>
                                <a href="https://github.com/yaso09/kuran" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                                    <Github size={14} />
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-white mb-4">İletişim</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:iletisim@yasireymen.com" className="text-slate-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                                    <Mail size={14} />
                                    iletisim@yasireymen.com
                                </a>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/kur.ancilar/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                    Instagram
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2026 Kur'ancılar. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span>Sevgiyle yapıldı</span>
                        <Heart size={14} className="text-red-500 fill-red-500" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
