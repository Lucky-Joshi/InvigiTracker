'use client';

import { useState, useEffect } from 'react';
import { getInvigilators, deleteInvigilator } from '@/actions/invigilator-actions';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SkeletonLoader } from '@/components/ui/Spinner';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useDebounce } from '@/hooks/useDebounce';
import { Invigilator } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { logActivity } from '@/actions/activity-actions';

export default function InvigilatorsPage() {
  const [invigilators, setInvigilators] = useState<Invigilator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const debouncedSearch = useDebounce(searchQuery);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const fetchInvigilators = async () => {
    setLoading(true);
    const result = await getInvigilators(1, 100);
    if (result.success && result.data) {
      setInvigilators(result.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvigilators();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteInvigilator(deleteId);
    if (result.success) {
      addToast('Invigilator deleted successfully', 'success');
      await logActivity('Deleted', 'Invigilator', deleteId);
      fetchInvigilators();
    } else {
      addToast(result.error || 'Failed to delete invigilator', 'error');
    }
    setDeleteId(null);
  };

  const filteredInvigilators = invigilators.filter(
    (i) =>
      `${i.firstName} ${i.lastName}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.phone.includes(debouncedSearch)
  );

  const columns: ColumnDef<Invigilator>[] = [
    {
      header: 'Name',
      accessorKey: 'firstName',
      cell: ({ row }) => (
        <Link href={`/dashboard/invigilators/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.firstName} {row.original.lastName}
        </Link>
      ),
    },
    {
      header: 'Contact',
      id: 'contact',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail size={12} className="text-slate-400" />
            {row.original.email}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone size={12} className="text-slate-400" />
            {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      header: 'Gender',
      accessorKey: 'gender',
      cell: ({ row }) => <Badge variant="default" size="sm">{row.original.gender}</Badge>,
    },
    {
      header: 'Payment/Duty',
      accessorKey: 'paymentPerDuty',
      cell: ({ row }) => formatCurrency(row.original.paymentPerDuty),
    },
    {
      header: 'Experience',
      accessorKey: 'experience',
      cell: ({ row }) => (row.original.experience ? `${row.original.experience} yrs` : '-'),
    },
    {
      header: 'Status',
      accessorKey: 'availabilityStatus',
      cell: ({ row }) => (
        <Badge variant={row.original.availabilityStatus ? 'success' : 'danger'} size="sm">
          {row.original.availabilityStatus ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/invigilators/${row.original.id}`}>
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Invigilators</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all invigilators</p>
        </div>
        <Link href="/dashboard/invigilators/new">
          <Button>
            <Plus size={20} className="mr-2" />
            Add Invigilator
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invigilators</CardTitle>
            <div className="w-72">
              <Input
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLoader count={8} />
          ) : (
            <Table columns={columns} data={filteredInvigilators} />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Invigilator" size="sm">
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete this invigilator? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
