import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { ActivityLog } from '@/types';

export function RecentActivities({ activities }: { activities: ActivityLog[] }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">No recent activities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {activities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                  {activity.action} on {activity.entity}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDateTime(activity.createdAt)}
                </p>
              </div>
              <Badge variant="info" size="sm" className="shrink-0">
                {activity.action}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
