"use client";

import React, { useEffect, useState } from "react";
import { Bell, Inbox, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function MobileNotifications() {
    const { user, isLoaded } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!isLoaded || !user) return;

        async function fetchNotifications() {
            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            setNotifications(data || []);
        }
        fetchNotifications();
    }, [user, isLoaded]);

    return (
        <div className="px-4 py-8">
            <div className="mb-8 pl-1">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">MESAJLAR</h2>
                <p className="text-slate-500 text-sm font-medium">Size gelen bildirimler</p>
            </div>

            <div className="space-y-3">
                {notifications.length > 0 ? (
                    notifications.map((notif, i) => (
                        <Link key={i} href={notif.url || "#"} className="block">
                            <div className={`bg-[#15171c] p-5 rounded-[2.25rem] border ${notif.read ? "border-slate-800 opacity-60" : "border-amber-500/20 shadow-lg shadow-amber-500/5"} flex items-start gap-4 active:bg-slate-800 transition-all`}>
                                <div className="w-10 h-10 bg-amber-600/10 rounded-2xl flex items-center justify-center text-amber-500 mt-1">
                                    <MessageSquare size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-white font-bold text-sm">{notif.title}</h4>
                                        <span className="text-[8px] font-black text-slate-600 uppercase">
                                            {new Date(notif.created_at).getHours()}:{new Date(notif.created_at).getMinutes()}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                        {notif.body}
                                    </p>
                                </div>
                                <ChevronRight className="text-slate-800 self-center" size={16} />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-24 bg-[#15171c] rounded-[3rem] border border-slate-800 border-dashed">
                        <Inbox className="mx-auto text-slate-700 mb-4" size={40} />
                        <h3 className="text-white font-black text-sm uppercase tracking-widest">Henüz mesaj yok</h3>
                        <p className="text-slate-600 text-xs mt-2 uppercase font-bold px-10">Biri size yanıt verdiğinde burada görünecektir.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
