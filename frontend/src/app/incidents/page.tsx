'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { Spinner, ErrorMessage } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Incident, IncidentStatus, IncidentType } from '@/types';
import { incidentApi } from '@/lib/api';

const STATUS_FILTERS: Array<IncidentStatus | 'ALL'> = ['ALL', 'REPORTED', 'IN_PROGRESS', 'RESOLVED'];

export default function IncidentsPage() {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        type: 'ACCIDENT' as IncidentType,
        description: '',
        latitude: 0,
        longitude: 0,
    });

    const { data, isLoading, error } = useQuery<Incident[]>({
        queryKey: ['incidents'],
        queryFn: incidentApi.list,
    });

    const create = useMutation({
        mutationFn: incidentApi.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); setShowForm(false); },
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            incidentApi.updateStatus(id, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
    });

    const filtered = (data ?? []).filter(i => {
        if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
        if (search && !i.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <DashboardLayout>
            <Header title="Incidents" subtitle={`${data?.filter(i => i.status !== 'RESOLVED').length ?? 0} active`} />

            <div className="px-8 py-6">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input className="input pl-9" placeholder="Search description…" value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        {STATUS_FILTERS.map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-white'
                                    }`}>{s.replace('_', ' ')}</button>
                        ))}
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        <Plus className="w-4 h-4" /> Report Incident
                    </button>
                </div>

                {/* Create form */}
                {showForm && (
                    <div className="card p-6 mb-6 animate-slide-up">
                        <h3 className="text-sm font-semibold text-white mb-4">Report New Incident</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <select className="input" value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value as IncidentType }))}>
                                {(['ACCIDENT', 'CONSTRUCTION', 'ROAD_CLOSED', 'TRAFFIC_JAM'] as IncidentType[]).map(t => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                            <input className="input" placeholder="Latitude" type="number"
                                onChange={e => setForm(p => ({ ...p, latitude: parseFloat(e.target.value) }))} />
                            <input className="input" placeholder="Longitude" type="number"
                                onChange={e => setForm(p => ({ ...p, longitude: parseFloat(e.target.value) }))} />
                            <input className="input lg:col-span-3" placeholder="Description"
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => create.mutate(form)} disabled={create.isPending} className="btn-primary">
                                {create.isPending ? 'Submitting…' : 'Submit Report'}
                            </button>
                            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                        </div>
                    </div>
                )}

                {isLoading ? <Spinner /> :
                    error ? <ErrorMessage message="Could not load incidents." /> :
                        filtered.length === 0 ? <EmptyState icon={AlertTriangle} title="No incidents found" description="All clear!" /> :
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map(i => (
                                    <IncidentCard key={i.id} incident={i}
                                        onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />
                                ))}
                            </div>
                }
            </div>
        </DashboardLayout>
    );
}
