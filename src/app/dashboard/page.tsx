'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentActivities, getCentreStats } from '@/actions/activity-actions';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Users, BookOpen, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [centreStats, setCentreStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentActivities(),
      getCentreStats(),
    ]).then(([statsResult, activitiesResult, centreStatsResult]) => {
      if (statsResult.success) setStats(statsResult.data);
      if (activitiesResult.success) setActivities(activitiesResult.data || []);
      if (centreStatsResult.success) setCentreStats(centreStatsResult.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Invigilators',
      value: stats?.totalInvigilators || 0,
      icon: <Users size={24} />,
      description: 'Registered invigilators',
    },
    {
      title: 'Upcoming Exams',
      value: stats?.upcomingExams || 0,
      icon: <BookOpen size={24} />,
      description: 'Next 30 days',
    },
    {
      title: "Today's Duties",
      value: stats?.dutiesToday || 0,
      icon: <Clock size={24} />,
      description: 'Duties assigned today',
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: <AlertTriangle size={24} />,
      description: `${formatCurrency(stats?.totalPending || 0)} pending`,
    },
  ];

  const revenueData = [
    { name: 'Total Revenue', amount: stats?.totalRevenue || 0 },
    { name: 'Paid', amount: stats?.totalPaid || 0 },
    { name: 'Pending', amount: stats?.totalPending || 0 },
  ];

  const dutyAllocationData = (centreStats || []).map((cs: any) => ({
    name: cs.name,
    allocated: cs.dutyCount,
    completed: cs.examCount,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Overview of your invigilation management system
        </p>
      </div>

      <DashboardStats stats={statCards} />

      <DashboardCharts revenueData={revenueData} dutyAllocationData={dutyAllocationData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Centre-wise Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {centreStats.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No centres found</p>
              ) : (
                centreStats.map((cs: any) => (
                  <div
                    key={cs.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">{cs.name}</p>
                        <p className="text-sm text-slate-500">
                          {cs.invigilatorCount} invigilators
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {cs.examCount} exams
                      </p>
                      <p className="text-sm text-slate-500">{cs.dutyCount} duties</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <RecentActivities activities={activities} />
      </div>

      <QuickActions actions={[]} />
    </div>
  );
}
