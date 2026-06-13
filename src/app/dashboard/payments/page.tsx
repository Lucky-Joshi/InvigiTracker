'use client';

import { useState, useEffect } from 'react';
import { getPayments, getPaymentStats } from '@/actions/payment-actions';
import { Table } from '@/components/ui/Table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SkeletonLoader } from '@/components/ui/Spinner';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { IndianRupee, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const debouncedSearch = useDebounce(searchQuery);

  const fetchData = async () => {
    const [payResult, statsResult] = await Promise.all([getPayments(1, 100), getPaymentStats()]);
    if (payResult.success && payResult.data) setPayments(payResult.data.data);
    if (statsResult.success && statsResult.data) setStats(statsResult.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPayments = payments.filter(
    (p) =>
      `${p.invigilator?.firstName || ''} ${p.invigilator?.lastName || ''}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.status.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(stats?.totalAmount || 0), icon: <IndianRupee size={24} />, color: 'text-blue-600' },
    { title: 'Paid Amount', value: formatCurrency(stats?.paidAmount || 0), icon: <CheckCircle2 size={24} />, color: 'text-green-600' },
    { title: 'Pending Amount', value: formatCurrency(stats?.pendingAmount || 0), icon: <Clock size={24} />, color: 'text-yellow-600' },
    { title: 'Completed', value: stats?.completedPayments || 0, icon: <CheckCircle2 size={24} />, color: 'text-green-600' },
  ];

  const columns: ColumnDef<any>[] = [
    { header: 'Invigilator', accessorKey: 'invigilator.firstName', cell: ({ row }) => `${row.original.invigilator?.firstName || ''} ${row.original.invigilator?.lastName || ''}` },
    { header: 'Amount', accessorKey: 'amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { header: 'Paid', accessorKey: 'paidAmount', cell: ({ row }) => formatCurrency(row.original.paidAmount) },
    { header: 'Pending', accessorKey: 'pendingAmount', cell: ({ row }) => formatCurrency(row.original.pendingAmount) },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const variants: Record<string, 'success' | 'warning' | 'danger'> = { completed: 'success', partial: 'warning', pending: 'danger' };
        return <Badge variant={variants[row.original.status] || 'default'}>{row.original.status}</Badge>;
      },
    },
    { header: 'Paid Date', accessorKey: 'paidDate', cell: ({ row }) => (row.original.paidDate ? formatDate(row.original.paidDate) : '-') },
    { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt) },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Payments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track all payment records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">{stat.value}</p>
                </div>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Payments</CardTitle>
            <div className="w-72"><Input placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <SkeletonLoader count={5} /> : <Table columns={columns} data={filteredPayments} />}
        </CardContent>
      </Card>
    </div>
  );
}
