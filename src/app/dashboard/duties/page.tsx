'use client';

import { useState, useEffect } from 'react';
import { getDuties, deleteDuty } from '@/actions/duty-actions';
import { markAttendance } from '@/actions/attendance-actions';
import { createPayment } from '@/actions/payment-actions';
import { logActivity } from '@/actions/activity-actions';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { SkeletonLoader } from '@/components/ui/Spinner';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import Link from 'next/link';
import { Plus, Search, CheckCircle, XCircle, IndianRupee, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export default function DutiesPage() {
  const [duties, setDuties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [markDutyId, setMarkDutyId] = useState<string | null>(null);
  const [markStatus, setMarkStatus] = useState('present');
  const [payDutyId, setPayDutyId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const debouncedSearch = useDebounce(searchQuery);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const fetchDuties = async () => {
    setLoading(true);
    const result = await getDuties(1, 100);
    if (result.success && result.data) setDuties(result.data.data);
    setLoading(false);
  };

  useEffect(() => { fetchDuties(); }, []);

  const handleMarkAttendance = async () => {
    if (!markDutyId) return;
    const duty = duties.find((d) => d.id === markDutyId);
    if (!duty) return;
    const result = await markAttendance(markDutyId, duty.invigilatorsId, markStatus);
    if (result.success) {
      addToast('Attendance marked', 'success');
      await logActivity('Marked Attendance', 'Duty', markDutyId);
      fetchDuties();
    } else addToast(result.error || 'Failed to mark attendance', 'error');
    setMarkDutyId(null);
  };

  const handlePayment = async () => {
    if (!payDutyId) return;
    const duty = duties.find((d) => d.id === payDutyId);
    if (!duty) return;
    const result = await createPayment({
      dutyId: payDutyId,
      invigilatorsId: duty.invigilatorsId,
      amount: payAmount,
      paidAmount: payAmount,
      pendingAmount: 0,
      status: 'completed',
      paidDate: new Date(),
    } as any);
    if (result.success) {
      addToast('Payment completed', 'success');
      await logActivity('Processed Payment', 'Duty', payDutyId);
      fetchDuties();
    } else addToast(result.error || 'Failed to process payment', 'error');
    setPayDutyId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteDuty(deleteId);
    if (result.success) {
      addToast('Duty deleted', 'success');
      fetchDuties();
    } else addToast(result.error || 'Failed to delete', 'error');
    setDeleteId(null);
  };

  const filteredDuties = duties.filter(
    (d) =>
      `${d.invigilator?.firstName || ''} ${d.invigilator?.lastName || ''}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.exam?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.centre?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { header: 'Invigilator', accessorKey: 'invigilator.firstName', cell: ({ row }) => `${row.original.invigilator?.firstName || ''} ${row.original.invigilator?.lastName || ''}` },
    { header: 'Exam', accessorKey: 'exam.title', cell: ({ row }) => row.original.exam?.title || '-' },
    { header: 'Centre', accessorKey: 'centre.name', cell: ({ row }) => row.original.centre?.name || '-' },
    { header: 'Date', accessorKey: 'exam.date', cell: ({ row }) => row.original.exam?.date ? formatDate(row.original.exam.date) : '-' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'success' : row.original.status === 'assigned' ? 'info' : 'warning'}>{row.original.status}</Badge>,
    },
    {
      header: 'Attendance',
      accessorKey: 'attendance.status',
      cell: ({ row }) => {
        const att = row.original.attendance;
        if (!att) return <Badge variant="default">Pending</Badge>;
        return <Badge variant={att.status === 'present' ? 'success' : 'danger'}>{att.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {!row.original.attendance && (
            <Button size="sm" variant="ghost" onClick={() => { setMarkDutyId(row.original.id); setMarkStatus('present'); }} title="Mark Present">
              <CheckCircle size={16} className="text-green-600" />
            </Button>
          )}
          {!row.original.payment && (
            <Button size="sm" variant="ghost" onClick={() => { setPayDutyId(row.original.id); setPayAmount(row.original.invigilator?.paymentPerDuty || 0); }} title="Process Payment">
              <IndianRupee size={16} className="text-blue-600" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(row.original.id)} className="text-red-600">
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Duties</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage duty allocations</p>
        </div>
        <Link href="/dashboard/duties/new"><Button><Plus size={20} className="mr-2" />Allocate Duty</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Duties</CardTitle>
            <div className="w-72"><Input placeholder="Search duties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <SkeletonLoader count={5} /> : <Table columns={columns} data={filteredDuties} />}
        </CardContent>
      </Card>

      <Modal isOpen={!!markDutyId} onClose={() => setMarkDutyId(null)} title="Mark Attendance" size="sm">
        <Select label="Attendance Status" options={[{ value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }]} value={markStatus} onChange={(e) => setMarkStatus(e.target.value)} />
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={() => setMarkDutyId(null)}>Cancel</Button>
          <Button onClick={handleMarkAttendance}>Mark {markStatus}</Button>
        </div>
      </Modal>

      <Modal isOpen={!!payDutyId} onClose={() => setPayDutyId(null)} title="Process Payment" size="sm">
        <Input label="Payment Amount (₹)" type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} />
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={() => setPayDutyId(null)}>Cancel</Button>
          <Button onClick={handlePayment}>Pay ₹{payAmount}</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Duty" size="sm">
        <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button className="bg-red-600" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
