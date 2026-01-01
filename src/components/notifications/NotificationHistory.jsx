import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, Clock, CheckCircle2, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function NotificationHistory({ darkMode }) {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Notification.filter(
        { user_email: user.email },
        '-created_date',
        100
      );
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const theme = {
    bg: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600'
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const typeIcons = {
    daily_quote: '💭',
    trade_alert: '📊',
    performance_summary: '📈',
    system: '⚙️'
  };

  if (isLoading) {
    return (
      <div className={`${theme.bg} rounded-xl p-6 border ${theme.border}`}>
        <div className="animate-pulse">Lädt...</div>
      </div>
    );
  }

  return (
    <div className={`${theme.bg} rounded-xl p-4 sm:p-6 border ${theme.border} space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-teal-600" />
          <h3 className={`text-lg font-bold tracking-wider ${theme.text}`}>BENACHRICHTIGUNGEN</h3>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="px-2 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
              filter === f
                ? 'bg-teal-600 text-white'
                : `${theme.border} border ${theme.text} hover:border-teal-600/50`
            }`}
          >
            {f === 'all' && 'ALLE'}
            {f === 'unread' && 'UNGELESEN'}
            {f === 'read' && 'GELESEN'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className={`w-12 h-12 mx-auto mb-3 ${theme.textSecondary}`} />
            <p className={`${theme.textSecondary} text-sm`}>Keine Benachrichtigungen</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${theme.bgCard} border ${theme.border} rounded-lg p-3 transition-all ${
                !notification.read ? 'border-l-4 border-l-teal-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{typeIcons[notification.type]}</span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`${theme.text} text-sm font-bold tracking-wider`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="text-teal-600 hover:text-teal-700"
                        title="Als gelesen markieren"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className={`${theme.textSecondary} text-xs font-sans mb-2`}>
                    {notification.body}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`${theme.textSecondary} text-xs font-sans flex items-center gap-1`}>
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(notification.created_date), { 
                        addSuffix: true,
                        locale: de 
                      })}
                    </span>
                    
                    <button
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      className={`${theme.textSecondary} hover:text-red-600 transition-colors`}
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}