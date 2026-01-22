"use client";

import Navbar from "@/components/Navbar";
import Zikirmatik from "@/components/mobile/Zikirmatik";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ZikirmatikPage() {
    return (
        <div className="min-h-screen bg-[#0b0c0f] flex flex-col">
            <div className="px-6 pt-12 pb-4 flex items-center gap-4">
                <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold text-white uppercase tracking-widest">Zikirmatik</h1>
            </div>

            <div className="flex-1">
                <Zikirmatik />
            </div>
        </div>
    );
}
