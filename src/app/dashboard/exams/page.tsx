'use client';

import { useState, useEffect } from 'react';
import { getExams, deleteExam } from '@/actions/exam-actions';
import { logActivity } from '@/actions/activity-actions';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SkeletonLoader } from '@/components/ui/Spinner';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Exam } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const fetchExams = async () => {
    setLoading(true);
    const result = await getExams(1, 50);
    if (result.success && result.data) setExams(result.data.data);
    setLoading(false);
  };

  useEffect(() => { fetchExams(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteExam(deleteId);
    if (result.success) {
      addToast('Exam deleted successfully', 'success');
      await logActivity('Deleted', 'Exam', deleteId);
      fetchExams();
    } else addToast(result.error || 'Failed to delete exam', 'error');
    setDeleteId(null);
  };

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.centre?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <Link href={`/dashboard/exams/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.title}
        </Link>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          {formatDate(row.original.date)}
        </div>
      ),
    },
    {
      header: 'Shift',
      id: 'shift',
      cell: ({ row }) => `${row.original.shiftStart} - ${row.original.shiftEnd}`,
    },
    {
      header: 'Centre',
      accessorKey: 'centre.name',
      cell: ({ row }) => row.original.centre?.name || '-',
    },
    {
      header: 'Required',
      accessorKey: 'invigilatorsRequired',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const variants: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
          scheduled: 'info',
          ongoing: 'warning',
          completed: 'success',
          cancelled: 'danger',
        };
        return <Badge variant={variants[row.original.status] || 'default'} size="sm">{row.original.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/exams/${row.original.id}`}><Button size="sm" variant="ghost"><Edit size={16} /></Button></Link>
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(row.original.id)} className="text-red-600"><Trash2 size={16} /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Exams</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Schedule and manage exams</p>
        </div>
        <Link href="/dashboard/exams/new"><Button><Plus size={20} className="mr-2" />Schedule Exam</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Exams</CardTitle>
            <div className="w-72"><Input placeholder="Search exams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <SkeletonLoader count={5} /> : <Table columns={columns} data={filteredExams} />}
        </CardContent>
      </Card>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Exam" size="sm">
        <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure? This will also remove associated duties.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
