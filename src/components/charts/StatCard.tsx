import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function StatCard({ title, value, icon: Icon, subtitle, trend }: StatCardProps) {
    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-lg">
                        <Icon className="text-amber-500" size={24} />
                    </div>
                    {trend && (
                        <div className={`text-xs font-bold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </div>
                    )}
                </div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
                <p className="text-white text-3xl font-black mb-1">{value}</p>
                {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
            </div>
        </div>
    );
}
