'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InvigilatorForm } from '@/components/forms/InvigilatorForm';
import { createInvigilator } from '@/actions/invigilator-actions';
import { getAllCentres } from '@/actions/centre-actions';
import { logActivity } from '@/actions/activity-actions';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';

export default function NewInvigilatorPage() {
  const router = useRouter();
  const [centres, setCentres] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  useEffect(() => {
    getAllCentres().then((res) => {
      if (res.success && res.data) setCentres(res.data);
    });
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const result = await createInvigilator({
      ...data,
      centreId: data.preferredCentre || undefined,
    });
    if (result.success && result.data) {
      await logActivity('Created', 'Invigilator', result.data.id);
      addToast('Invigilator created successfully', 'success');
      setTimeout(() => router.push('/dashboard/invigilators'), 1000);
    } else {
      addToast(result.error || 'Failed to create invigilator', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <InvigilatorForm onSubmit={onSubmit} isLoading={isLoading} centres={centres} />
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
