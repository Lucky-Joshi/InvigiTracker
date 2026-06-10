'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DutyForm } from '@/components/forms/DutyForm';
import { createDuty } from '@/actions/duty-actions';
import { getExams } from '@/actions/exam-actions';
import { getInvigilators } from '@/actions/invigilator-actions';
import { getAllCentres } from '@/actions/centre-actions';
import { logActivity } from '@/actions/activity-actions';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';

export default function NewDutyPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Array<{ id: string; title: string }>>([]);
  const [invigilators, setInvigilators] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [centres, setCentres] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  useEffect(() => {
    Promise.all([
      getExams(1, 100),
      getInvigilators(1, 100),
      getAllCentres(),
    ]).then(([exRes, invRes, cenRes]) => {
      if (exRes.success && exRes.data) setExams(exRes.data.data);
      if (invRes.success && invRes.data) setInvigilators(invRes.data.data);
      if (cenRes.success && cenRes.data) setCentres(cenRes.data);
    });
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const result = await createDuty(data);
    if (result.success && result.data) {
      await logActivity('Allocated Duty', 'Duty', result.data.id);
      addToast('Duty allocated successfully', 'success');
      setTimeout(() => router.push('/dashboard/duties'), 1000);
    } else addToast(result.error || 'Failed to allocate duty', 'error');
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <DutyForm onSubmit={onSubmit} isLoading={isLoading} exams={exams} invigilators={invigilators} centres={centres} />
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
