import React from 'react';

interface PieChartProps {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
}

export default function PieChart({ data }: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    let currentAngle = 0;
    const segments = data.map((item) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        return {
            ...item,
            percentage,
            startAngle,
            endAngle: currentAngle,
        };
    });

    const createArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(50, 50, 40, endAngle);
        const end = polarToCartesian(50, 50, 40, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        return [
            'M', 50, 50,
            'L', start.x, start.y,
            'A', 40, 40, 0, largeArcFlag, 0, end.x, end.y,
            'Z'
        ].join(' ');
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Pie Chart SVG */}
            <div className="relative w-64 h-64">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {segments.map((segment, index) => (
                        <path
                            key={index}
                            d={createArc(segment.startAngle, segment.endAngle)}
                            fill={segment.color}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' }}
                        />
                    ))}
                    {/* Center circle for donut effect */}
                    <circle cx="50" cy="50" r="25" fill="#0b0c0f" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-white text-2xl font-black">{total}</p>
                        <p className="text-slate-500 text-xs">Toplam</p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
                {segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: segment.color }}
                            />
                            <span className="text-slate-300 text-sm font-medium">{segment.label}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold text-sm">{segment.value}</p>
                            <p className="text-slate-500 text-xs">{segment.percentage.toFixed(1)}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
