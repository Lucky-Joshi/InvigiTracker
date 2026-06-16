import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardStats({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-slate-500 mt-2">{stat.description}</p>
                )}
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                {stat.icon}
              </div>
            </div>
            {stat.trend && (
              <div className="flex items-center gap-1 mt-4 text-sm">
                {stat.trend.isPositive ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : (
                  <TrendingDown size={16} className="text-red-600" />
                )}
                <span className={stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(stat.trend.value)}% from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
