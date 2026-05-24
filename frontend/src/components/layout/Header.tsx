'use client';

import { Bell, Search, LogOut, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { notificationApi } from '@/lib/api';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const { data: notifs } = useQuery<{ id: string; isRead: boolean }[]>({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationApi.list(user!.id),
        enabled: !!user?.id,
        refetchInterval: 30000,
    });
    const unreadCount = notifs?.filter(n => !n.isRead).length ?? 0;

    function handleLogout() {
        logout();
        router.push('/login');
    }

    return (
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
            <div>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input placeholder="Search..." className="input pl-9 w-56 h-9 text-sm" />
                </div>


                {/* User menu */}
                {user && (
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-brand-600/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-xs font-medium text-slate-300 leading-none">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{user.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors text-slate-500 ml-1"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
