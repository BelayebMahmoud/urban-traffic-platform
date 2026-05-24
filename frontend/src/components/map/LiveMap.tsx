import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import type { Vehicle, TrafficZone, Incident } from '@/types';

// Leaflet accesses `window` at import time — must be client-only
const VehicleMapInner = dynamic(() => import('./VehicleMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Spinner />
    </div>
  ),
});

interface Props {
  vehicles: Vehicle[];
  zones: TrafficZone[];
  incidents: Incident[];
}

export function LiveMap({ vehicles, zones, incidents }: Props) {
  const tracked = vehicles.filter(
    (v) => v.positions && v.positions.length > 0,
  ).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-400" />
          Live Vehicle Map
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{' '}
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{' '}
            Maintenance
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />{' '}
            Inactive
          </span>
          <span>{tracked} tracked</span>
        </div>
      </div>
      <div className="h-[420px] rounded-xl overflow-hidden">
        <VehicleMapInner
          vehicles={vehicles}
          zones={zones}
          incidents={incidents}
        />
      </div>
    </div>
  );
}
