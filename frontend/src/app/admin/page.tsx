'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  ToggleLeft,
  ToggleRight,
  Bell,
  Send,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Spinner, ErrorMessage } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/StatCard';
import { adminApi, notificationApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'OPERATOR';
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/');
  }, [user, router]);

  const { data, isLoading, error } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
    enabled: user?.role === 'ADMIN',
  });

  const toggle = useMutation({
    mutationFn: adminApi.toggleUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const [notifForm, setNotifForm] = useState({
    userId: '',
    title: '',
    message: '',
  });
  const sendNotif = useMutation({
    mutationFn: notificationApi.send,
    onSuccess: () => setNotifForm({ userId: '', title: '', message: '' }),
  });

  const total = data?.length ?? 0;
  const admins = data?.filter((u) => u.role === 'ADMIN').length ?? 0;
  const active = data?.filter((u) => u.isActive).length ?? 0;
  const inactive = total - active;

  if (user?.role !== 'ADMIN') return null;

  return (
    <DashboardLayout>
      <Header
        title="Admin Panel"
        subtitle="User management and system overview"
      />

      <div className="px-8 py-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={total}
            sub={`${admins} admin(s)`}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Active Users"
            value={active}
            sub="can log in"
            icon={UserCheck}
            color="green"
          />
          <StatCard
            label="Inactive Users"
            value={inactive}
            sub="access suspended"
            icon={UserX}
            color="amber"
          />
          <StatCard
            label="Your Role"
            value="ADMIN"
            sub="full access"
            icon={ShieldCheck}
            color="purple"
          />
        </div>

        {/* User table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">All Users</h2>
          </div>

          {isLoading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorMessage message="Could not load users." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(data ?? []).map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-brand-400">
                              {u.firstName[0]}
                              {u.lastName[0]}
                            </span>
                          </div>
                          <span className="font-medium text-slate-200">
                            {u.firstName} {u.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                            u.isActive
                              ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                              : 'bg-red-500/15 text-red-400 border border-red-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-400' : 'bg-red-400'}`}
                          />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Can't toggle yourself */}
                        {u.id !== user?.id ? (
                          <button
                            onClick={() => toggle.mutate(u.id)}
                            disabled={toggle.isPending}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              u.isActive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                            }`}
                          >
                            {u.isActive ? (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5" />{' '}
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-3.5 h-3.5" /> Activate
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Send Notification */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">
              Send Notification
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className="input"
              value={notifForm.userId}
              onChange={(e) =>
                setNotifForm((p) => ({ ...p, userId: e.target.value }))
              }
            >
              <option value="">Select user…</option>
              {(data ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Title"
              value={notifForm.title}
              onChange={(e) =>
                setNotifForm((p) => ({ ...p, title: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Message"
              value={notifForm.message}
              onChange={(e) =>
                setNotifForm((p) => ({ ...p, message: e.target.value }))
              }
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => sendNotif.mutate(notifForm)}
              disabled={
                sendNotif.isPending ||
                !notifForm.userId ||
                !notifForm.title ||
                !notifForm.message
              }
              className="btn-primary"
            >
              <Send className="w-3.5 h-3.5" />
              {sendNotif.isPending ? 'Sending…' : 'Send'}
            </button>
            {sendNotif.isSuccess && (
              <span className="text-xs text-green-400">Notification sent!</span>
            )}
            {sendNotif.isError && (
              <span className="text-xs text-red-400">Failed to send.</span>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
