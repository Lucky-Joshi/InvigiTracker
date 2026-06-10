'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getInvigilatorById, updateInvigilator } from '@/actions/invigilator-actions';
import { getDutiesByInvigilator } from '@/actions/duty-actions';
import { getPaymentsByInvigilator } from '@/actions/payment-actions';
import { getAllCentres } from '@/actions/centre-actions';
import { InvigilatorForm } from '@/components/forms/InvigilatorForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { ColumnDef } from '@tanstack/react-table';
import { Phone, Mail, MapPin, PhoneCall, Star } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { logActivity } from '@/actions/activity-actions';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';

export default function InvigilatorDetailPage() {
  const params = useParams();
  const [invigilator, setInvigilator] = useState<any>(null);
  const [duties, setDuties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [centres, setCentres] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const fetchData = async () => {
    const [invResult, dutiesResult, paymentsResult, centresResult] = await Promise.all([
      getInvigilatorById(params.id as string),
      getDutiesByInvigilator(params.id as string),
      getPaymentsByInvigilator(params.id as string),
      getAllCentres(),
    ]);
    if (invResult.success && invResult.data) setInvigilator(invResult.data);
    if (dutiesResult.success && dutiesResult.data) setDuties(dutiesResult.data);
    if (paymentsResult.success && paymentsResult.data) setPayments(paymentsResult.data);
    if (centresResult.success && centresResult.data) setCentres(centresResult.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleUpdate = async (data: any) => {
    const result = await updateInvigilator(params.id as string, data);
    if (result.success) {
      await logActivity('Updated', 'Invigilator', params.id as string);
      addToast('Invigilator updated successfully', 'success');
      setEditing(false);
      fetchData();
    } else {
      addToast(result.error || 'Failed to update invigilator', 'error');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!invigilator) return <div className="text-center py-20"><p className="text-slate-500">Invigilator not found</p></div>;

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto">
        <InvigilatorForm
          onSubmit={handleUpdate}
          initialData={{
            firstName: invigilator.firstName,
            lastName: invigilator.lastName,
            email: invigilator.email,
            phone: invigilator.phone,
            address: invigilator.address,
            gender: invigilator.gender,
            paymentPerDuty: invigilator.paymentPerDuty,
            preferredCentre: invigilator.preferredCentre || '',
            experience: invigilator.experience || undefined,
            availabilityStatus: invigilator.availabilityStatus,
            emergencyContact: invigilator.emergencyContact || '',
            notes: invigilator.notes || '',
          }}
          isLoading={false}
          centres={centres}
        />
        <button onClick={() => setEditing(false)} className="mt-4 text-sm text-blue-600 hover:underline">
          Cancel editing
        </button>
        <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    );
  }

  const dutyColumns: ColumnDef<any>[] = [
    { header: 'Exam', accessorKey: 'exam.title', cell: ({ row }) => row.original.exam?.title || '-' },
    { header: 'Date', accessorKey: 'exam.date', cell: ({ row }) => row.original.exam?.date ? formatDate(row.original.exam.date) : '-' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'success' : row.original.status === 'assigned' ? 'info' : 'warning'} size="sm">{row.original.status}</Badge> },
    { header: 'Centre', accessorKey: 'centre.name', cell: ({ row }) => row.original.centre?.name || '-' },
  ];

  const paymentColumns: ColumnDef<any>[] = [
    { header: 'Amount', accessorKey: 'amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { header: 'Paid', accessorKey: 'paidAmount', cell: ({ row }) => formatCurrency(row.original.paidAmount) },
    { header: 'Pending', accessorKey: 'pendingAmount', cell: ({ row }) => formatCurrency(row.original.pendingAmount) },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'success' : row.original.status === 'partial' ? 'warning' : 'danger'} size="sm">{row.original.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {invigilator.firstName} {invigilator.lastName}
        </h1>
        <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">Edit</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><Mail size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Email</p><p className="font-medium">{invigilator.email}</p></div></div>
              <div className="flex items-center gap-3"><Phone size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Phone</p><p className="font-medium">{invigilator.phone}</p></div></div>
            </div>
            <div className="flex items-center gap-3"><MapPin size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Address</p><p className="font-medium">{invigilator.address}</p></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><Star size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Experience</p><p className="font-medium">{invigilator.experience || 0} years</p></div></div>
              <div className="flex items-center gap-3"><PhoneCall size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Emergency Contact</p><p className="font-medium">{invigilator.emergencyContact || 'N/A'}</p></div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Payment/Duty</span>
              <Badge variant="info">{formatCurrency(invigilator.paymentPerDuty)}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
              <Badge variant={invigilator.availabilityStatus ? 'success' : 'danger'}>{invigilator.availabilityStatus ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Duties</span>
              <Badge variant="info">{duties.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Earnings</span>
              <Badge variant="success">{formatCurrency(payments.reduce((s: number, p: any) => s + p.paidAmount, 0))}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Duty History</CardTitle></CardHeader>
        <CardContent>
          <Table columns={dutyColumns} data={duties} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          <Table columns={paymentColumns} data={payments} />
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
