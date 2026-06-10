'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExamForm } from '@/components/forms/ExamForm';
import { createExam } from '@/actions/exam-actions';
import { getAllCentres } from '@/actions/centre-actions';
import { logActivity } from '@/actions/activity-actions';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';

export default function NewExamPage() {
  const router = useRouter();
  const [centres, setCentres] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: (id) => setToasts((p) => p.filter((t) => t.id !== id)) }]);
  };

  useEffect(() => {
    getAllCentres().then((res) => { if (res.success && res.data) setCentres(res.data); });
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const result = await createExam(data);
    if (result.success && result.data) {
      await logActivity('Created', 'Exam', result.data.id);
      addToast('Exam scheduled successfully', 'success');
      setTimeout(() => router.push('/dashboard/exams'), 1000);
    } else addToast(result.error || 'Failed to create exam', 'error');
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ExamForm onSubmit={onSubmit} isLoading={isLoading} centres={centres} />
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
