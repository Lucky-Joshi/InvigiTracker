'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const PaymentFormSchema = z.object({
  dutyId: z.string().min(1, 'Please select a duty'),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  status: z.enum(['pending', 'partial', 'completed']),
  paidAmount: z.coerce.number().min(0, 'Paid amount must be non-negative'),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof PaymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  initialData?: Partial<PaymentFormData>;
  isLoading?: boolean;
  duties?: Array<{ id: string; examId: string; invigilatorsId: string }>;
}

export function PaymentForm({
  onSubmit,
  initialData,
  isLoading = false,
  duties = [],
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: initialData,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onFormSubmit = async (data: PaymentFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Payment' : 'Record Payment'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Select
            label="Duty"
            {...register('dutyId')}
            options={duties.map((d) => ({ value: d.id, label: `Duty ${d.id.slice(0, 8)}` }))}
            error={errors.dutyId?.message}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Total Amount (₹)"
              type="number"
              {...register('amount')}
              error={errors.amount?.message}
              disabled={isLoading}
            />
            <Input
              label="Amount Paid (₹)"
              type="number"
              {...register('paidAmount')}
              error={errors.paidAmount?.message}
              disabled={isLoading}
            />
          </div>

          <Select
            label="Payment Status"
            {...register('status')}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'partial', label: 'Partial' },
              { value: 'completed', label: 'Completed' },
            ]}
            error={errors.status?.message}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              {...register('dueDate')}
              error={errors.dueDate?.message}
              disabled={isLoading}
            />
            <Input
              label="Paid Date"
              type="date"
              {...register('paidDate')}
              error={errors.paidDate?.message}
              disabled={isLoading}
            />
          </div>

          <Input
            label="Notes"
            {...register('notes')}
            error={errors.notes?.message}
            disabled={isLoading}
          />

          {submitError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner size="sm" className="mr-2" />}
              {initialData ? 'Update Payment' : 'Record Payment'}
            </Button>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
