'use client';

import { useState, useEffect } from 'react';
import { getMonthlyReport, getCentreWiseReport, getPaymentReport, getInvigilatorPerformanceReport } from '@/actions/report-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs } from '@/components/ui/Tabs';
import { Table } from '@/components/ui/Table';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/lib/utils';
import { Download, FileText, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [centreReport, setCentreReport] = useState<any[]>([]);
  const [paymentReport, setPaymentReport] = useState<any[]>([]);
  const [performanceReport, setPerformanceReport] = useState<any[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingCentre, setLoadingCentre] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    setLoadingMonth(true);
    getMonthlyReport(month, year).then((res) => { if (res.success) setMonthlyReport(res.data); setLoadingMonth(false); });
  }, [month, year]);

  useEffect(() => {
    setLoadingCentre(true);
    getCentreWiseReport().then((res) => { if (res.success) setCentreReport(res.data || []); setLoadingCentre(false); });
    setLoadingPayment(true);
    getPaymentReport(month, year).then((res) => { if (res.success) setPaymentReport(res.data || []); setLoadingPayment(false); });
    setLoadingPerformance(true);
    getInvigilatorPerformanceReport().then((res) => { if (res.success) setPerformanceReport(res.data || []); setLoadingPerformance(false); });
  }, [month, year]);

  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map((row) => headers.map((h) => `"${row[h]}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2024, i).toLocaleString('default', { month: 'long' }) }));
  const years = Array.from({ length: 5 }, (_, i) => ({ value: String(new Date().getFullYear() - 2 + i), label: String(new Date().getFullYear() - 2 + i) }));

  const paymentColumns: ColumnDef<any>[] = [
    { header: 'Invigilator', accessorKey: 'invigilatorName' },
    { header: 'Duties', accessorKey: 'totalDuties' },
    { header: 'Total Amount', accessorKey: 'totalAmount', cell: ({ row }) => formatCurrency(row.original.totalAmount) },
    { header: 'Paid', accessorKey: 'paidAmount', cell: ({ row }) => formatCurrency(row.original.paidAmount) },
    { header: 'Pending', accessorKey: 'pendingAmount', cell: ({ row }) => formatCurrency(row.original.pendingAmount) },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'success' : 'warning'}>{row.original.status}</Badge> },
  ];

  const performanceColumns: ColumnDef<any>[] = [
    { header: 'Name', accessorKey: 'invigilatorName' },
    { header: 'Total Duties', accessorKey: 'totalDuties' },
    { header: 'Completed', accessorKey: 'completedDuties' },
    { header: 'Attendance Rate', accessorKey: 'attendanceRate', cell: ({ row }) => `${row.original.attendanceRate}%` },
    { header: 'Earnings', accessorKey: 'totalEarnings', cell: ({ row }) => formatCurrency(row.original.totalEarnings) },
    { header: 'Experience', accessorKey: 'experience', cell: ({ row }) => row.original.experience ? `${row.original.experience} yrs` : '-' },
    { header: 'Centre', accessorKey: 'centreName', cell: ({ row }) => row.original.centreName || '-' },
  ];

  const centreColumns: ColumnDef<any>[] = [
    { header: 'Centre', accessorKey: 'centreName' },
    { header: 'Exams', accessorKey: 'totalExams' },
    { header: 'Duties', accessorKey: 'totalDuties' },
    { header: 'Invigilators', accessorKey: 'totalInvigilators' },
    { header: 'Total Payment', accessorKey: 'totalPaymentAmount', cell: ({ row }) => formatCurrency(row.original.totalPaymentAmount) },
    { header: 'Paid', accessorKey: 'totalPaidAmount', cell: ({ row }) => formatCurrency(row.original.totalPaidAmount) },
  ];

  const tabs = [
    {
      label: 'Monthly Summary',
      value: 'monthly',
      content: (
        <div>
          <div className="flex gap-4 mb-6">
            <Select options={months} value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} className="w-48" />
            <Select options={years} value={String(year)} onChange={(e) => setYear(Number(e.target.value))} className="w-32" />
            <Button variant="outline" onClick={() => monthlyReport && exportCSV([monthlyReport], `monthly-report-${month}-${year}`)}>
              <Download size={16} className="mr-2" />Export CSV
            </Button>
          </div>
          {loadingMonth ? <Spinner /> : monthlyReport ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Total Exams</p><p className="text-2xl font-bold">{monthlyReport.totalExams}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Total Duties</p><p className="text-2xl font-bold">{monthlyReport.totalDuties}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Revenue</p><p className="text-2xl font-bold">{formatCurrency(monthlyReport.totalAmount)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Attendance Rate</p><p className="text-2xl font-bold">{monthlyReport.attendanceRate}%</p></CardContent></Card>
            </div>
          ) : <p className="text-slate-500">No data for this period</p>}
        </div>
      ),
    },
    {
      label: 'Centre-wise',
      value: 'centre',
      content: (
        <div>
          <Button variant="outline" className="mb-4" onClick={() => exportCSV(centreReport, 'centre-report')}>
            <Download size={16} className="mr-2" />Export CSV
          </Button>
          {loadingCentre ? <Spinner /> : <Table columns={centreColumns} data={centreReport} pagination={false} />}
        </div>
      ),
    },
    {
      label: 'Payment Report',
      value: 'payment',
      content: (
        <div>
          <Button variant="outline" className="mb-4" onClick={() => exportCSV(paymentReport, 'payment-report')}>
            <Download size={16} className="mr-2" />Export CSV
          </Button>
          {loadingPayment ? <Spinner /> : <Table columns={paymentColumns} data={paymentReport} />}
        </div>
      ),
    },
    {
      label: 'Performance',
      value: 'performance',
      content: (
        <div>
          <Button variant="outline" className="mb-4" onClick={() => exportCSV(performanceReport, 'performance-report')}>
            <Download size={16} className="mr-2" />Export CSV
          </Button>
          {loadingPerformance ? <Spinner /> : <Table columns={performanceColumns} data={performanceReport} />}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Reports</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and export reports</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs tabs={tabs} />
        </CardContent>
      </Card>
    </div>
  );
}
