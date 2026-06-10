'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getExamById, updateExam } from '@/actions/exam-actions';
import { getDutiesByExam } from '@/actions/duty-actions';
import { getAllCentres } from '@/actions/centre-actions';
import { ExamForm } from '@/components/forms/ExamForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { logActivity } from '@/actions/activity-actions';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function ExamDetailPage() {
  const params = useParams();
  const [exam, setExam] = useState<any>(null);
  const [duties, setDuties] = useState<any[]>([]);
  const [centres, setCentres] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const fetchData = async () => {
    const [exResult, dutiesResult, centresResult] = await Promise.all([
      getExamById(params.id as string),
      getDutiesByExam(params.id as string),
      getAllCentres(),
    ]);
    if (exResult.success && exResult.data) setExam(exResult.data);
    if (dutiesResult.success && dutiesResult.data) setDuties(dutiesResult.data);
    if (centresResult.success && centresResult.data) setCentres(centresResult.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const handleUpdate = async (data: any) => {
    const result = await updateExam(params.id as string, data);
    if (result.success) {
      await logActivity('Updated', 'Exam', params.id as string);
      addToast('Exam updated successfully', 'success');
      setEditing(false);
      fetchData();
    } else addToast(result.error || 'Failed to update exam', 'error');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!exam) return <div className="text-center py-20"><p className="text-slate-500">Exam not found</p></div>;

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto">
        <ExamForm
          onSubmit={handleUpdate}
          initialData={{
            title: exam.title,
            date: new Date(exam.date).toISOString().split('T')[0],
            shiftStart: exam.shiftStart,
            shiftEnd: exam.shiftEnd,
            invigilatorsRequired: exam.invigilatorsRequired,
            status: exam.status,
            centreId: exam.centreId,
            notes: exam.notes || '',
          }}
          centres={centres}
        />
        <button onClick={() => setEditing(false)} className="mt-4 text-sm text-blue-600 hover:underline">Cancel editing</button>
        <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    );
  }

  const dutyColumns: ColumnDef<any>[] = [
    { header: 'Invigilator', accessorKey: 'invigilator.firstName', cell: ({ row }) => `${row.original.invigilator?.firstName || ''} ${row.original.invigilator?.lastName || ''}` },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'success' : row.original.status === 'assigned' ? 'info' : 'warning'}>{row.original.status}</Badge> },
    { header: 'Attendance', accessorKey: 'attendance.status', cell: ({ row }) => row.original.attendance ? <Badge variant={row.original.attendance.status === 'present' ? 'success' : 'danger'}>{row.original.attendance.status}</Badge> : <Badge variant="default">Not marked</Badge> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{exam.title}</h1>
        <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">Edit</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Exam Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Calendar size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Date</p><p className="font-medium">{formatDate(exam.date)}</p></div></div>
            <div className="flex items-center gap-3"><Clock size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Shift</p><p className="font-medium">{exam.shiftStart} - {exam.shiftEnd}</p></div></div>
            <div className="flex items-center gap-3"><MapPin size={18} className="text-slate-400" /><div><p className="text-sm text-slate-500">Centre</p><p className="font-medium">{exam.centre?.name || '-'}</p></div></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600">Invigilators Required</span>
              <Badge variant="info">{exam.invigilatorsRequired}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600">Assigned</span>
              <Badge variant="success">{duties.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600">Status</span>
              <Badge variant={exam.status === 'completed' ? 'success' : exam.status === 'ongoing' ? 'warning' : 'info'}>{exam.status}</Badge>
            </div>
            <Link href="/dashboard/duties/new"><Button className="w-full mt-2">Allocate Duty</Button></Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Assigned Duties</CardTitle></CardHeader>
        <CardContent>
          <Table columns={dutyColumns} data={duties} />
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
