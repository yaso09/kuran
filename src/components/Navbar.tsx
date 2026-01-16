"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu, X, BookOpen } from "lucide-react";
import { useState } from "react";
import StreakDisplay from "./StreakDisplay";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-[#0b0c0f]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                                <BookOpen size={20} />
                            </div>
                            <span className="font-bold text-xl text-slate-100 tracking-tight">Kur'ancılar</span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        <Link href="/namaz-vakitleri" className="text-slate-300 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Namaz Vakitleri
                        </Link>
                        <Link href="/kuran" className="text-slate-300 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Oku
                        </Link>
                        <Link href="/dinle" className="text-slate-300 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Dinle
                        </Link>
                        <Link href="/sohbet" className="text-slate-300 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Sohbet
                        </Link>
                        <Link href="/forum" className="text-slate-300 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Forum
                        </Link>
                        <Link href="/analizler" className="text-slate-300 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Analizler
                        </Link>

                        <div className="ml-4 flex items-center gap-4">
                            <SignedIn>
                                <StreakDisplay />
                                <ProfileDropdown />
                            </SignedIn>
                            <SignedOut>
                                <Link href="/sign-in">
                                    <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm hover:shadow-md hover:shadow-amber-600/20">
                                        Giriş Yap
                                    </button>
                                </Link>
                            </SignedOut>
                        </div>
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
                        >
                            <span className="sr-only">Menüyü aç</span>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden bg-[#15171c] border-b border-slate-800">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            href="/kuran"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500"
                        >
                            Oku
                        </Link>
                        <Link
                            href="/dinle"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500"
                        >
                            Dinle
                        </Link>
                        <Link
                            href="/sohbet"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500"
                        >
                            Sohbet
                        </Link>
                        <Link
                            href="/forum"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500"
                        >
                            Forum
                        </Link>
                        <Link
                            href="/analizler"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500"
                        >
                            Analizler
                        </Link>
                        <Link
                            href="/namaz-vakitleri"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500"
                        >
                            Namaz Vakitleri
                        </Link>
                        <SignedIn>
                            <Link
                                href="/ayarlar"
                                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500"
                            >
                                Ayarlar
                            </Link>
                        </SignedIn>
                        <div className="pl-3 pr-4 py-2">
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                            <SignedOut>
                                <Link href="/sign-in">
                                    <button className="w-full text-left font-medium text-amber-500">Giriş Yap</button>
                                </Link>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
