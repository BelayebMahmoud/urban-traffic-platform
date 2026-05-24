'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Car, AlertTriangle, MapPin, Bell,
    Activity, ChevronRight, Zap, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const nav = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'Vehicles', icon: Car },
    { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { href: '/traffic', label: 'Traffic Zones', icon: MapPin },
    { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white leading-none">Urban Traffic</p>
                    <p className="text-xs text-slate-500 mt-0.5">Platform v1.0</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3">
                    Main Menu
                </p>
                {nav.map(({ href, label, icon: Icon }) => {
                    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                                active
                                    ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60',
                            )}
                        >
                            <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5 text-brand-400" />}
                        </Link>
                    );
                })}

                {/* Admin section — visible only to ADMIN role */}
                {isAdmin && (
                    <>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3 mt-5">
                            Administration
                        </p>
                        {[{ href: '/admin', label: 'Admin Panel', icon: ShieldCheck }].map(({ href, label, icon: Icon }) => {
                            const active = pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                                        active
                                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60',
                                    )}
                                >
                                    <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300')} />
                                    <span className="flex-1">{label}</span>
                                    {active && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900">
                    <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-300">System Status</p>
                        <p className="text-xs text-green-400">All services online</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
