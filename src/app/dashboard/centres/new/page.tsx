'use client';

import { useRouter } from 'next/navigation';
import { CentreForm } from '@/components/forms/CentreForm';
import { createCentre } from '@/actions/centre-actions';
import { logActivity } from '@/actions/activity-actions';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import { useState } from 'react';

export default function NewCentrePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const result = await createCentre({
      name: data.name,
      address: data.address,
      phone: data.phone || undefined,
      email: data.email || undefined,
      capacity: data.capacity,
    });
    if (result.success && result.data) {
      await logActivity('Created', 'Centre', result.data.id);
      addToast('Centre created successfully', 'success');
      setTimeout(() => router.push('/dashboard/centres'), 1000);
    } else {
      addToast(result.error || 'Failed to create centre', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <CentreForm onSubmit={onSubmit} isLoading={isLoading} />
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
