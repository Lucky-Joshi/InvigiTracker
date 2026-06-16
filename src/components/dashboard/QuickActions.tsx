import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Download, FileText } from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const defaultActions: QuickAction[] = [
    {
      label: 'Add Invigilator',
      icon: <Plus size={20} />,
      href: '/dashboard/invigilators/new',
    },
    {
      label: 'Schedule Exam',
      icon: <Plus size={20} />,
      href: '/dashboard/exams/new',
    },
    {
      label: 'Allocate Duty',
      icon: <Plus size={20} />,
      href: '/dashboard/duties/new',
    },
    {
      label: 'Export Report',
      icon: <Download size={20} />,
      href: '/dashboard/reports',
    },
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allActions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href || '#'}
              onClick={(e) => {
                if (!action.href && action.onClick) {
                  e.preventDefault();
                  action.onClick();
                }
              }}
            >
              <Button
                variant="outline"
                size="md"
                className="w-full flex flex-col items-center gap-2 h-auto py-4"
              >
                {action.icon}
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
