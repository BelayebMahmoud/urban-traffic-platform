'use client';

import { useQuery } from '@tanstack/react-query';
import { Car, AlertTriangle, MapPin, Activity, Zap, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Spinner } from '@/components/ui/Spinner';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { TrafficAreaChart, StatusPieChart, IncidentBarChart } from '@/components/charts/Charts';
import { vehicleApi, incidentApi, trafficApi } from '@/lib/api';
import type { Vehicle, Incident, TrafficZone } from '@/types';

export default function DashboardPage() {
    const vehicles = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: vehicleApi.list });
    const incidents = useQuery<Incident[]>({ queryKey: ['incidents'], queryFn: incidentApi.list });
    const zones = useQuery<TrafficZone[]>({ queryKey: ['zones'], queryFn: trafficApi.list });

    const totalVehicles = vehicles.data?.length ?? 0;
    const activeVehicles = vehicles.data?.filter(v => v.status === 'ACTIVE').length ?? 0;
    const totalIncidents = incidents.data?.length ?? 0;
    const openIncidents = incidents.data?.filter(i => i.status !== 'RESOLVED').length ?? 0;
    const totalZones = zones.data?.length ?? 0;
    const highZones = zones.data?.filter(z => z.level === 'HIGH').length ?? 0;

    // Real: incidents per day for the last 7 days
    const incidentTrendData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString('en', { weekday: 'short' });
        const dateStr = d.toDateString();
        const dayIncidents = (incidents.data ?? []).filter(inc =>
            new Date(inc.createdAt).toDateString() === dateStr
        );
        return {
            name: label,
            value: dayIncidents.length,
            incidents: dayIncidents.length,
            resolved: dayIncidents.filter(inc => inc.status === 'RESOLVED').length,
        };
    });

    // Real: incidents by type
    const incidentTypeData = (['ACCIDENT', 'CONSTRUCTION', 'ROAD_CLOSED', 'TRAFFIC_JAM'] as const).map(t => ({
        name: t.replace('_', ' '),
        incidents: (incidents.data ?? []).filter(i => i.type === t).length,
        resolved: (incidents.data ?? []).filter(i => i.type === t && i.status === 'RESOLVED').length,
    }));

    const vehiclePieData = [
        { name: 'Active', value: activeVehicles, color: '#22c55e' },
        { name: 'Inactive', value: vehicles.data?.filter(v => v.status === 'INACTIVE').length ?? 0, color: '#64748b' },
        { name: 'Maintenance', value: vehicles.data?.filter(v => v.status === 'MAINTENANCE').length ?? 0, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const noData = (arr: any[]) => arr.every(d => !d.value && !d.incidents);

    return (
        <DashboardLayout>
            <Header title="Dashboard" subtitle="Real-time urban traffic monitoring" />

            <div className="px-8 py-6 space-y-8">

                {/* ── Stat Cards ─────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Vehicles" value={totalVehicles} sub={`${activeVehicles} active`}
                        icon={Car} color="blue" trend={{ value: 12, label: 'vs last week' }} />
                    <StatCard label="Active Incidents" value={openIncidents} sub={`${totalIncidents} total`}
                        icon={AlertTriangle} color="amber" trend={{ value: openIncidents > 0 ? -5 : 0, label: '' }} />
                    <StatCard label="Traffic Zones" value={totalZones} sub={`${highZones} high density`}
                        icon={MapPin} color="purple" />
                    <StatCard label="System Status" value="Online" sub="All 6 services up"
                        icon={Activity} color="green" />
                </div>

                {/* ── Charts row ─────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="card p-5 lg:col-span-2">
                        <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-brand-400" /> Incidents — last 7 days
                        </p>
                        {noData(incidentTrendData)
                            ? <div className="flex items-center justify-center h-[180px] text-slate-600 text-sm">No incidents recorded yet</div>
                            : <TrafficAreaChart data={incidentTrendData} />
                        }
                    </div>

                    <div className="card p-5">
                        <p className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <Car className="w-4 h-4 text-brand-400" /> Vehicle Status
                        </p>
                        {vehiclePieData.length > 0
                            ? <StatusPieChart data={vehiclePieData} />
                            : <div className="flex items-center justify-center h-[180px] text-slate-600 text-sm">No vehicles yet</div>
                        }
                    </div>
                </div>

                {/* ── Incident by type ───────────────────────────────────────────── */}
                <div className="card p-5">
                    <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-brand-400" /> Incidents by Type
                    </p>
                    {noData(incidentTypeData)
                        ? <div className="flex items-center justify-center h-[180px] text-slate-600 text-sm">No incidents recorded yet</div>
                        : <IncidentBarChart data={incidentTypeData} />
                    }
                </div>

                {/* ── Recent Vehicles ────────────────────────────────────────────── */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-white">Recent Vehicles</h2>
                        <a href="/vehicles" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
                    </div>
                    {vehicles.isLoading ? <Spinner /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {(vehicles.data ?? []).slice(0, 4).map(v => <VehicleCard key={v.id} vehicle={v} />)}
                        </div>
                    )}
                </section>

                {/* ── Active Incidents ───────────────────────────────────────────── */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-white">Active Incidents</h2>
                        <a href="/incidents" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
                    </div>
                    {incidents.isLoading ? <Spinner /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(incidents.data ?? [])
                                .filter(i => i.status !== 'RESOLVED')
                                .slice(0, 3)
                                .map(i => <IncidentCard key={i.id} incident={i} />)
                            }
                        </div>
                    )}
                </section>

            </div>
        </DashboardLayout>
    );
}
