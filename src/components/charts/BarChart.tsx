import React from 'react';

interface BarChartProps {
    data: {
        label: string;
        value: number;
        color?: string;
    }[];
    maxValue?: number;
}

export default function BarChart({ data, maxValue }: BarChartProps) {
    const max = maxValue || Math.max(...data.map(d => d.value));

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="text-amber-500 font-bold">{item.value}</span>
                    </div>
                    <div className="relative h-8 bg-slate-800 rounded-lg overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 ${item.color || 'bg-gradient-to-r from-amber-500 to-purple-600'} rounded-lg transition-all duration-500 flex items-center justify-end px-3`}
                            style={{ width: `${(item.value / max) * 100}%` }}
                        >
                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                {Math.round((item.value / max) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
