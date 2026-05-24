'use client';

import { MapPin, Activity, Gauge } from 'lucide-react';
import { useState } from 'react';
import type { TrafficZone } from '@/types';
import { TrafficLevelBadge } from '@/components/ui/Badges';

const levelColor: Record<string, string> = {
    LOW: 'from-green-500/20 to-transparent',
    MEDIUM: 'from-amber-500/20 to-transparent',
    HIGH: 'from-red-500/20 to-transparent',
};

interface Props {
    zone: TrafficZone;
    onUpdateDensity?: (density: number) => void;
}

export function TrafficZoneCard({ zone, onUpdateDensity }: Props) {
    const [draft, setDraft] = useState<number | null>(null);
    const pct = Math.min(100, zone.density);

    return (
        <div className="card p-5 hover:border-slate-700 transition-all group overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${levelColor[zone.level]} opacity-30 pointer-events-none`} />

            <div className="relative flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm">{zone.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">r = {zone.radius} m</p>
                    </div>
                </div>
                <TrafficLevelBadge level={zone.level} />
            </div>

            {/* Density bar */}
            <div className="relative mt-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Density
                    </span>
                    <span className="text-xs font-medium text-slate-300">{zone.density.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${zone.level === 'HIGH' ? 'bg-red-500' :
                            zone.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            <div className="relative mt-2 flex items-center gap-1 text-xs text-slate-600">
                <MapPin className="w-3 h-3" />
                {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
            </div>

            {/* Update density */}
            {onUpdateDensity && (
                <div className="relative mt-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                        <Gauge className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <input type="range" min={0} max={100} step={1}
                            value={draft ?? zone.density}
                            onChange={e => setDraft(parseInt(e.target.value))}
                            className="flex-1 accent-brand-500 h-1"
                        />
                        <button
                            disabled={draft === null}
                            onClick={() => { if (draft !== null) { onUpdateDensity(draft); setDraft(null); } }}
                            className="text-xs px-2 py-1 rounded-lg bg-brand-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >{draft ?? Math.round(zone.density)}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
