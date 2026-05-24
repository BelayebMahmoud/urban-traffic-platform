'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Plus, Filter, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { Spinner, ErrorMessage } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Vehicle, VehicleStatus, VehicleType } from '@/types';
import { vehicleApi } from '@/lib/api';

const STATUS_FILTERS: Array<VehicleStatus | 'ALL'> = ['ALL', 'ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export default function VehiclesPage() {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ plateNumber: '', type: 'CAR' as VehicleType, status: 'ACTIVE' as VehicleStatus });

    const { data, isLoading, error } = useQuery<Vehicle[]>({
        queryKey: ['vehicles'],
        queryFn: vehicleApi.list,
    });

    const create = useMutation({
        mutationFn: vehicleApi.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); setShowForm(false); },
    });

    const filtered = (data ?? []).filter(v => {
        if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
        if (search && !v.plateNumber.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <DashboardLayout>
            <Header title="Vehicles" subtitle={`${data?.length ?? 0} vehicles registered`} />

            <div className="px-8 py-6">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input className="input pl-9" placeholder="Search plate number…" value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        {STATUS_FILTERS.map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-white'
                                    }`}>{s}</button>
                        ))}
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        <Plus className="w-4 h-4" /> Add Vehicle
                    </button>
                </div>

                {/* Create form */}
                {showForm && (
                    <div className="card p-6 mb-6 animate-slide-up">
                        <h3 className="text-sm font-semibold text-white mb-4">Register New Vehicle</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <input className="input" placeholder="Plate number" value={form.plateNumber}
                                onChange={e => setForm(p => ({ ...p, plateNumber: e.target.value }))} />
                            <select className="input" value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value as VehicleType }))}>
                                {(['CAR', 'TRUCK', 'BUS', 'MOTORCYCLE'] as VehicleType[]).map(t => <option key={t}>{t}</option>)}
                            </select>
                            <select className="input" value={form.status}
                                onChange={e => setForm(p => ({ ...p, status: e.target.value as VehicleStatus }))}>
                                {(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as VehicleStatus[]).map(s => <option key={s}>{s}</option>)}
                            </select>

                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => create.mutate(form)} disabled={create.isPending} className="btn-primary">
                                {create.isPending ? 'Saving…' : 'Save Vehicle'}
                            </button>
                            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                        </div>
                        {create.error && <p className="text-red-400 text-xs mt-2">Failed to create vehicle.</p>}
                    </div>
                )}

                {isLoading ? <Spinner /> :
                    error ? <ErrorMessage message="Could not load vehicles." /> :
                        filtered.length === 0 ? <EmptyState icon={Car} title="No vehicles found" description="Register your first vehicle to get started." /> :
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filtered.map(v => <VehicleCard key={v.id} vehicle={v} />)}
                            </div>
                }
            </div>
        </DashboardLayout>
    );
}
