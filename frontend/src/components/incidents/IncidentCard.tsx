'use client';

import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import type { Incident } from '@/types';
import { IncidentTypeBadge, IncidentStatusBadge } from '@/components/ui/Badges';
import { relativeTime } from '@/lib/utils';

interface IncidentCardProps {
    incident: Incident;
    onStatusChange?: (id: string, status: string) => void;
}

const typeIcon: Record<string, string> = {
    ACCIDENT: '🚨',
    CONSTRUCTION: '🏗️',
    ROAD_CLOSED: '🚧',
    TRAFFIC_JAM: '🚗',
};

export function IncidentCard({ incident, onStatusChange }: IncidentCardProps) {
    return (
        <div className="card p-5 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {typeIcon[incident.type] ?? '⚠️'}
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm">{incident.id.slice(0, 8)}…</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <IncidentTypeBadge type={incident.type} />
                        </div>
                    </div>
                </div>
                <IncidentStatusBadge status={incident.status} />
            </div>

            <p className="text-sm text-slate-400 mt-2 line-clamp-2">{incident.description}</p>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    {relativeTime(incident.createdAt)}
                </span>
            </div>

            {onStatusChange && incident.status !== 'RESOLVED' && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                    {incident.status === 'REPORTED' && (
                        <button
                            onClick={() => onStatusChange(incident.id, 'IN_PROGRESS')}
                            className="btn-ghost text-xs py-1.5 px-3"
                        >
                            Mark In Progress
                        </button>
                    )}
                    <button
                        onClick={() => onStatusChange(incident.id, 'RESOLVED')}
                        className="btn-primary text-xs py-1.5 px-3 ml-auto"
                    >
                        Resolve
                    </button>
                </div>
            )}
        </div>
    );
}
