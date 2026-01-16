import React, { ReactNode } from 'react';

interface AuthCardProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
    return (
        <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-600/20">
                    <span className="text-2xl font-black text-white">ق</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-400 text-sm">{subtitle}</p>
                )}
            </div>

            {/* Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-[#15171c] rounded-2xl p-8 border border-slate-800 shadow-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
