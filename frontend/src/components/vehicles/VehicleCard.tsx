'use client';

import { Car, MapPin, Navigation } from 'lucide-react';
import type { Vehicle } from '@/types';
import { VehicleStatusBadge, VehicleTypeBadge } from '@/components/ui/Badges';
import { relativeTime } from '@/lib/utils';
import Link from 'next/link';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
    const lastPos = vehicle.positions?.[vehicle.positions.length - 1];

    return (
        <Link href={`/vehicles/${vehicle.id}`}>
            <div className="card p-5 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                            <Car className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">{vehicle.plateNumber}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{vehicle.id.slice(0, 8)}…</p>
                        </div>
                    </div>
                    <VehicleStatusBadge status={vehicle.status} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <VehicleTypeBadge type={vehicle.type} />
                </div>

                {lastPos ? (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                        <Navigation className="w-3.5 h-3.5 text-brand-400" />
                        <span>{lastPos.latitude.toFixed(4)}, {lastPos.longitude.toFixed(4)}</span>
                        {lastPos.speed != null && (
                            <span className="ml-auto text-slate-600">{lastPos.speed} km/h</span>
                        )}
                    </div>
                ) : (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5" />
                        No position data
                    </div>
                )}

                <p className="text-xs text-slate-700 mt-2">
                    Added {relativeTime(vehicle.createdAt)}
                </p>
            </div>
        </Link>
    );
}
