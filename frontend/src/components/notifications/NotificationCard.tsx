'use client';

import { Bell, Check, Clock } from 'lucide-react';
import type { Notification } from '@/types';
import { relativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  return (
    <div
      className={cn(
        'card p-4 flex items-start gap-4 hover:border-slate-700 transition-all',
        !notification.isRead && 'border-brand-600/30 bg-brand-600/5',
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
          notification.isRead ? 'bg-slate-800' : 'bg-brand-600/20',
        )}
      >
        <Bell
          className={cn(
            'w-4 h-4',
            notification.isRead ? 'text-slate-600' : 'text-brand-400',
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className={cn('text-xs font-semibold uppercase tracking-wider mb-0.5', notification.isRead ? 'text-slate-600' : 'text-brand-400')}>
            {notification.title}
          </p>
        )}
        <p
          className={cn(
            'text-sm',
            notification.isRead ? 'text-slate-400' : 'text-white font-medium',
          )}
        >
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-slate-600" />
          <span className="text-xs text-slate-600">
            {relativeTime(notification.createdAt)}
          </span>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-brand-500 ml-1" />
          )}
        </div>
      </div>

      {!notification.isRead && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          title="Mark as read"
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-green-500/20 hover:text-green-400 flex items-center justify-center transition-colors text-slate-600"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
