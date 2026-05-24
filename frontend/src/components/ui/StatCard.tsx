'use client';

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: number | string;
    sub?: string;
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
    trend?: { value: number; label: string };
}

const colorMap = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', ring: 'ring-blue-500/20' },
    green: { bg: 'bg-green-500/10', icon: 'text-green-400', ring: 'ring-green-500/20' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', ring: 'ring-amber-500/20' },
    red: { bg: 'bg-red-500/10', icon: 'text-red-400', ring: 'ring-red-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', ring: 'ring-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', ring: 'ring-cyan-500/20' },
};

export function StatCard({ label, value, sub, icon: Icon, color = 'blue', trend }: StatCardProps) {
    const c = colorMap[color];
    return (
        <div className="card p-6 flex flex-col gap-4 hover:border-slate-700 transition-colors group animate-slide-up">
            <div className="flex items-start justify-between">
                <div className={cn('w-11 h-11 rounded-xl ring-1 flex items-center justify-center transition-transform group-hover:scale-110', c.bg, c.ring)}>
                    <Icon className={cn('w-5 h-5', c.icon)} />
                </div>
                {trend && (
                    <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
                        trend.value >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10')}>
                        {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
                <p className="text-sm font-medium text-slate-400 mt-1">{label}</p>
                {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}
