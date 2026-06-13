'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, generateSystemNotifications } from '@/actions/notification-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await getNotifications();
    if (result.success && result.data) setNotifications(result.data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleGenerate = async () => {
    const result = await generateSystemNotifications();
    if (result.success) {
      addToast(result.message || 'Notifications generated', 'success');
      fetchNotifications();
    } else addToast(result.error || 'Failed to generate', 'error');
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    addToast('All marked as read', 'success');
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    fetchNotifications();
  };

  const typeIcons: Record<string, string> = {
    exam_upcoming: '📝',
    duty_unassigned: '⚠️',
    payment_pending: '💰',
    attendance_alert: '📋',
  };

  const typeVariants: Record<string, 'info' | 'warning' | 'danger' | 'success'> = {
    exam_upcoming: 'info',
    duty_unassigned: 'warning',
    payment_pending: 'danger',
    attendance_alert: 'success',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {notifications.filter((n) => !n.read).length} unread notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate}>
            <RefreshCw size={16} className="mr-2" />Generate
          </Button>
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck size={16} className="mr-2" />Mark All Read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner />
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No notifications yet</p>
              <Button variant="outline" className="mt-4" onClick={handleGenerate}>
                Generate notifications
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    n.read
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <span className="text-xl">{typeIcons[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${n.read ? 'text-slate-900 dark:text-slate-50' : 'text-blue-900 dark:text-blue-100'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                      </div>
                      <Badge variant={typeVariants[n.type] || 'default'} size="sm" className="shrink-0">
                        {n.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!n.read && (
                      <Button size="sm" variant="ghost" onClick={() => { markAsRead(n.id); fetchNotifications(); }}>
                        <CheckCheck size={16} />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)} className="text-red-600">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
