'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { Spinner, ErrorMessage } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Notification } from '@/types';
import { notificationApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const { data, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['notifications', userId],
    queryFn: () => notificationApi.list(userId),
    enabled: !!userId,
  });

  const markRead = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <DashboardLayout>
      <Header title="Notifications" subtitle={`${unread} unread`} />

      <div className="px-8 py-6">
        {unread > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() =>
                data
                  ?.filter((n) => !n.isRead)
                  .forEach((n) => markRead.mutate(n.id))
              }
              className="btn-ghost text-xs"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          </div>
        )}

        {isLoading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message="Could not load notifications." />
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-2 max-w-2xl">
            {(data ?? []).map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={(id) => markRead.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
