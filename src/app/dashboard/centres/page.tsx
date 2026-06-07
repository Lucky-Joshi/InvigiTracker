'use client';

import { useState, useEffect } from 'react';
import { getCentres, deleteCentre } from '@/actions/centre-actions';
import { createNotification } from '@/actions/notification-actions';
import { logActivity } from '@/actions/activity-actions';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner, SkeletonLoader } from '@/components/ui/Spinner';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useDebounce } from '@/hooks/useDebounce';
import { Centre } from '@/types';
import { formatDate } from '@/lib/utils';

export default function CentresPage() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const debouncedSearch = useDebounce(searchQuery);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const fetchCentres = async () => {
    setLoading(true);
    const result = await getCentres(1, 50);
    if (result.success && result.data) {
      setCentres(result.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteCentre(deleteId);
    if (result.success) {
      addToast('Centre deleted successfully', 'success');
      await logActivity('Deleted', 'Centre', deleteId);
      fetchCentres();
    } else {
      addToast(result.error || 'Failed to delete centre', 'error');
    }
    setDeleteId(null);
  };

  const filteredCentres = centres.filter(
    (c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const columns: ColumnDef<Centre>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <Link href={`/dashboard/centres/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      header: 'Address',
      accessorKey: 'address',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400" />
          <span>{row.original.address}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      header: 'Capacity',
      accessorKey: 'capacity',
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/centres/${row.original.id}`}>
            <Button size="sm" variant="ghost">
              <Edit size={16} />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(row.original.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Centres</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage examination centres</p>
        </div>
        <Link href="/dashboard/centres/new">
          <Button>
            <Plus size={20} className="mr-2" />
            Add Centre
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Centres</CardTitle>
            <div className="w-72">
              <Input
                placeholder="Search centres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLoader count={5} />
          ) : (
            <Table columns={columns} data={filteredCentres} />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Centre" size="sm">
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete this centre? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
