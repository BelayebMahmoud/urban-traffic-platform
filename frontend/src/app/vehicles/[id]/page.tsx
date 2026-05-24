'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Navigation, Zap } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Spinner, ErrorMessage } from '@/components/ui/Spinner';
import { VehicleStatusBadge, VehicleTypeBadge } from '@/components/ui/Badges';
import { TrafficAreaChart } from '@/components/charts/Charts';
import { vehicleApi } from '@/lib/api';
import type { Vehicle } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailPage({ params }: Props) {
  const { id } = use(params);
  const qc = useQueryClient();

  const {
    data: vehicle,
    isLoading,
    error,
  } = useQuery<Vehicle>({
    queryKey: ['vehicles', id],
    queryFn: () => vehicleApi.get(id),
  });

  const [simForm, setSimForm] = useState({
    latitude: '',
    longitude: '',
    speed: '',
  });

  const simulate = useMutation({
    mutationFn: (body: {
      latitude: number;
      longitude: number;
      speed?: number;
    }) => vehicleApi.simulate(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles', id] }),
  });

  if (isLoading)
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  if (error || !vehicle)
    return (
      <DashboardLayout>
        <ErrorMessage message="Vehicle not found." />
      </DashboardLayout>
    );

  const speedData = (vehicle.positions ?? []).slice(-20).map((p, i) => ({
    name: `T-${i}`,
    value: p.speed ?? 0,
  }));

  return (
    <DashboardLayout>
      <Header
        title={vehicle.plateNumber}
        subtitle="Vehicle detail & GPS history"
      />
      <div className="px-8 py-6 space-y-6">
        {/* Back */}
        <Link href="/vehicles" className="btn-ghost text-sm w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Simulate Position form */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" /> Simulate GPS Position
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              className="input"
              type="number"
              placeholder="Latitude (−90 to 90)"
              value={simForm.latitude}
              min={-90}
              max={90}
              step="any"
              onChange={(e) =>
                setSimForm((p) => ({ ...p, latitude: e.target.value }))
              }
            />
            <input
              className="input"
              type="number"
              placeholder="Longitude (−180 to 180)"
              value={simForm.longitude}
              min={-180}
              max={180}
              step="any"
              onChange={(e) =>
                setSimForm((p) => ({ ...p, longitude: e.target.value }))
              }
            />
            <input
              className="input"
              type="number"
              placeholder="Speed km/h (optional)"
              value={simForm.speed}
              min={0}
              max={300}
              step="any"
              onChange={(e) =>
                setSimForm((p) => ({ ...p, speed: e.target.value }))
              }
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() =>
                simulate.mutate({
                  latitude: parseFloat(simForm.latitude),
                  longitude: parseFloat(simForm.longitude),
                  speed: simForm.speed ? parseFloat(simForm.speed) : undefined,
                })
              }
              disabled={
                simulate.isPending || !simForm.latitude || !simForm.longitude
              }
              className="btn-primary"
            >
              <Zap className="w-4 h-4" />
              {simulate.isPending ? 'Saving…' : 'Record Position'}
            </button>
            {simulate.isSuccess && (
              <span className="text-xs text-green-400">Position recorded</span>
            )}
            {simulate.isError && (
              <span className="text-xs text-red-400">
                Failed to record position
              </span>
            )}
          </div>
        </div>

        {/* Info card */}
        <div className="card p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Plate</p>
            <p className="text-white font-semibold">{vehicle.plateNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Type</p>
            <VehicleTypeBadge type={vehicle.type} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <VehicleStatusBadge status={vehicle.status} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Registered</p>
            <p className="text-white text-sm">
              {formatDate(vehicle.createdAt)}
            </p>
          </div>
        </div>

        {/* Speed chart */}
        {speedData.length > 0 && (
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-400" /> Speed (last 20
              readings, km/h)
            </p>
            <TrafficAreaChart data={speedData} />
          </div>
        )}

        {/* Positions table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-300">
              GPS History ({vehicle.positions?.length ?? 0})
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Timestamp', 'Latitude', 'Longitude', 'Speed'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...(vehicle.positions ?? [])]
                  .reverse()
                  .slice(0, 50)
                  .map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3 text-slate-400">
                        {formatDate(p.timestamp)}
                      </td>
                      <td className="px-5 py-3 text-slate-300 font-mono">
                        {p.latitude.toFixed(6)}
                      </td>
                      <td className="px-5 py-3 text-slate-300 font-mono">
                        {p.longitude.toFixed(6)}
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        {p.speed != null ? `${p.speed} km/h` : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
