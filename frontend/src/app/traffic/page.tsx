'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { TrafficZoneCard } from '@/components/traffic/TrafficZoneCard';
import { Spinner, ErrorMessage } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TrafficZone, TrafficLevel } from '@/types';
import { trafficApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const LEVEL_FILTERS: Array<TrafficLevel | 'ALL'> = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];

export default function TrafficPage() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [levelFilter, setLevelFilter] = useState<TrafficLevel | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', latitude: 0, longitude: 0, radius: 500 });

    const { data, isLoading, error } = useQuery<TrafficZone[]>({
        queryKey: ['zones'],
        queryFn: trafficApi.list,
    });

    const create = useMutation({
        mutationFn: trafficApi.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['zones'] }); setShowForm(false); },
    });

    const updateDensity = useMutation({
        mutationFn: ({ zoneId, density }: { zoneId: string; density: number }) =>
            trafficApi.updateDensity(zoneId, density),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
    });

    const filtered = (data ?? []).filter(z => {
        if (levelFilter !== 'ALL' && z.level !== levelFilter) return false;
        if (search && !z.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const counts = {
        LOW: data?.filter(z => z.level === 'LOW').length ?? 0,
        MEDIUM: data?.filter(z => z.level === 'MEDIUM').length ?? 0,
        HIGH: data?.filter(z => z.level === 'HIGH').length ?? 0,
    };

    return (
        <DashboardLayout>
            <Header title="Traffic Zones" subtitle={`${data?.length ?? 0} zones monitored`} />

            <div className="px-8 py-6">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {(['LOW', 'MEDIUM', 'HIGH'] as TrafficLevel[]).map(level => (
                        <div key={level} className="card p-4 flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${level === 'HIGH' ? 'bg-red-500' : level === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'}`} />
                            <div>
                                <p className="text-2xl font-bold text-white">{counts[level]}</p>
                                <p className="text-xs text-slate-500">{level} density</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input className="input pl-9" placeholder="Search zone name…" value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        {LEVEL_FILTERS.map(l => (
                            <button key={l} onClick={() => setLevelFilter(l)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${levelFilter === l ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-white'
                                    }`}>{l}</button>
                        ))}
                    </div>
                    {isAdmin && (
                        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                            <Plus className="w-4 h-4" /> Add Zone
                        </button>
                    )}
                </div>

                {/* Create zone form — admin only */}
                {isAdmin && showForm && (
                    <div className="card p-6 mb-6 animate-slide-up">
                        <h3 className="text-sm font-semibold text-white mb-4">Create Traffic Zone</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <input className="input lg:col-span-2" placeholder="Zone name"
                                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                            <input className="input" placeholder="Latitude" type="number"
                                onChange={e => setForm(p => ({ ...p, latitude: parseFloat(e.target.value) }))} />
                            <input className="input" placeholder="Longitude" type="number"
                                onChange={e => setForm(p => ({ ...p, longitude: parseFloat(e.target.value) }))} />
                            <div className="lg:col-span-2 flex items-center gap-3">
                                <label className="text-xs text-slate-500 whitespace-nowrap">Radius (m): {form.radius}</label>
                                <input type="range" min={100} max={5000} step={100} value={form.radius}
                                    onChange={e => setForm(p => ({ ...p, radius: parseInt(e.target.value) }))}
                                    className="flex-1 accent-brand-500" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => create.mutate(form)} disabled={create.isPending || !form.name}
                                className="btn-primary">{create.isPending ? 'Creating…' : 'Create Zone'}</button>
                            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                        </div>
                    </div>
                )}

                {isLoading ? <Spinner /> :
                    error ? <ErrorMessage message="Could not load traffic zones." /> :
                        filtered.length === 0 ? <EmptyState icon={MapPin} title="No traffic zones" description="No zones match your filter." /> :
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filtered.map(z => (
                                    <TrafficZoneCard key={z.id} zone={z}
                                        onUpdateDensity={isAdmin ? (density) => updateDensity.mutate({ zoneId: z.id, density }) : undefined} />
                                ))}
                            </div>
                }
            </div>
        </DashboardLayout>
    );
}
