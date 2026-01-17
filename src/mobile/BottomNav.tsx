"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Radio, MessageSquare, Bell, User, Home } from "lucide-react";

const NAV_ITEMS = [
    { label: "Ana Sayfa", icon: Home, href: "/mobile" },
    { label: "Ayetler", icon: BookOpen, href: "/mobile/kuran" },
    { label: "Dinle", icon: Radio, href: "/mobile/dinle" },
    { label: "Forum", icon: MessageSquare, href: "/mobile/forum" },
    { label: "Ayarlar", icon: User, href: "/mobile/ayarlar" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0b0c0f]/95 backdrop-blur-xl border-t border-slate-800 pb-safe-area-inset-bottom z-50">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${isActive ? "text-amber-500 scale-110" : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-bold tracking-tight uppercase">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
