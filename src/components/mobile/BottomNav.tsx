"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Headphones, Users, Clock } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Ev", href: "/", icon: Home },
        { name: "Oku", href: "/kuran", icon: BookOpen },
        { name: "Dinle", href: "/dinle", icon: Headphones },
        { name: "Vakitler", href: "/namaz-vakitleri", icon: Clock },
        { name: "Forum", href: "/forum", icon: Users },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b0c0f]/80 backdrop-blur-xl border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center px-2 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 group ${isActive ? "text-amber-500" : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <div className={`
                p-1.5 rounded-xl transition-all mb-1
                ${isActive ? "bg-amber-500/10" : "group-hover:bg-slate-800"}
              `}>
                                <item.icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? "fill-amber-500/20" : ""}
                                />
                            </div>
                            <span className={`text-[10px] font-medium leading-none ${isActive ? "text-amber-500" : "text-slate-500"}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
