'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCentreById, updateCentre } from '@/actions/centre-actions';
import { CentreForm } from '@/components/forms/CentreForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { MapPin, Phone, Mail, Users, BookOpen } from 'lucide-react';
import { logActivity } from '@/actions/activity-actions';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';

export default function CentreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [centre, setCentre] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  useEffect(() => {
    const fetchCentre = async () => {
      const result = await getCentreById(params.id as string);
      if (result.success && result.data) {
        setCentre(result.data);
      }
      setLoading(false);
    };
    fetchCentre();
  }, [params.id]);

  const handleUpdate = async (data: any) => {
    const result = await updateCentre(params.id as string, {
      name: data.name,
      address: data.address,
      phone: data.phone || undefined,
      email: data.email || undefined,
      capacity: data.capacity,
    });
    if (result.success) {
      await logActivity('Updated', 'Centre', params.id as string);
      addToast('Centre updated successfully', 'success');
      setEditing(false);
      const refresh = await getCentreById(params.id as string);
      if (refresh.success && refresh.data) setCentre(refresh.data);
    } else {
      addToast(result.error || 'Failed to update centre', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Centre not found</p>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto">
        <CentreForm
          onSubmit={handleUpdate}
          initialData={{
            name: centre.name,
            address: centre.address,
            phone: centre.phone || '',
            email: centre.email || '',
            capacity: centre.capacity,
          }}
        />
        <button onClick={() => setEditing(false)} className="mt-4 text-sm text-blue-600 hover:underline">
          Cancel editing
        </button>
        <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{centre.name}</h1>
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit Centre
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Centre Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium">{centre.address}</p>
              </div>
            </div>
            {centre.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{centre.phone}</p>
                </div>
              </div>
            )}
            {centre.email && (
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{centre.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Users size={18} className="text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Capacity</p>
                <p className="font-medium">{centre.capacity} seats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Invigilators</span>
              <Badge variant="info">{centre.invigilators?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Exams</span>
              <Badge variant="info">{centre.exams?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Duties</span>
              <Badge variant="info">{centre.duties?.length || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
