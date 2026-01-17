"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Bell, Loader2, MessageSquare, Info, ChevronRight, Inbox } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Notification {
    id: string;
    user_id: string;
    title: string;
    body: string;
    url: string;
    read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const { user, isLoaded } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        async function fetchNotifications() {
            try {
                if (!user?.id) return;
                const { data, error } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching notifications:", error);
                } else {
                    setNotifications(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();
    }, [user, isLoaded]);

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-[#0b0c0f]">
                <Navbar />
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c0f] text-slate-200">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                        <Bell className="text-amber-500" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">BİLDİRİMLER</h1>
                        <p className="text-slate-500 font-medium">Etkileşimlerinizden haberdar olun.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <Link
                                key={notif.id}
                                href={notif.url || "#"}
                                className={`block p-6 rounded-3xl border transition-all group ${notif.read
                                    ? "bg-[#15171c]/50 border-slate-800 opacity-70"
                                    : "bg-[#15171c] border-amber-500/20 shadow-lg shadow-amber-500/5 hover:border-amber-500/40"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl mt-1 ${notif.title.includes("Yorum") ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                                        }`}>
                                        <MessageSquare size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-white group-hover:text-amber-500 transition-colors">
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] font-black text-slate-600 uppercase">
                                                {new Date(notif.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                            {notif.body}
                                        </p>
                                    </div>
                                    <ChevronRight className="text-slate-700 group-hover:text-amber-500 transition-colors self-center" size={20} />
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-[#15171c] rounded-[40px] border border-slate-800 border-dashed">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Inbox size={32} className="text-slate-600" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Gelen Kutusu Boş</h2>
                            <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Henüz bir bildirim almadınız. Etkileşimler burada görünecektir.</p>
                            <Link href="/forum" className="px-8 py-3 bg-amber-600/10 text-amber-500 border border-amber-500/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all">
                                FORUMA GÖZ AT
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-start gap-4">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <div className="text-xs text-slate-500 leading-relaxed font-medium">
                        Push bildirimlerini alamıyorsanız tarayıcı ayarlarından izin verdiğinizden emin olun. Ayrıca <Link href="/ayarlar" className="text-blue-500 hover:underline">Ayarlar</Link> sayfasından bildirim durumunuzu kontrol edebilirsiniz.
                    </div>
                </div>
            </main>
        </div>
    );
}
