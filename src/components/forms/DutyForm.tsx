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

const DutyFormSchema = z.object({
  examId: z.string().min(1, 'Please select an exam'),
  invigilatorsId: z.string().min(1, 'Please select an invigilator'),
  centreId: z.string().min(1, 'Please select a centre'),
  status: z.enum(['assigned', 'pending', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

type DutyFormData = z.infer<typeof DutyFormSchema>;

interface DutyFormProps {
  onSubmit: (data: DutyFormData) => Promise<void>;
  initialData?: Partial<DutyFormData>;
  isLoading?: boolean;
  exams?: Array<{ id: string; title: string }>;
  invigilators?: Array<{ id: string; firstName: string; lastName: string }>;
  centres?: Array<{ id: string; name: string }>;
}

export function DutyForm({
  onSubmit,
  initialData,
  isLoading = false,
  exams = [],
  invigilators = [],
  centres = [],
}: DutyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DutyFormData>({
    resolver: zodResolver(DutyFormSchema),
    defaultValues: initialData,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onFormSubmit = async (data: DutyFormData) => {
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
        <CardTitle>{initialData ? 'Edit Duty' : 'Allocate New Duty'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Select
            label="Exam"
            {...register('examId')}
            options={exams.map((e) => ({ value: e.id, label: e.title }))}
            error={errors.examId?.message}
            disabled={isLoading}
          />

          <Select
            label="Invigilator"
            {...register('invigilatorsId')}
            options={invigilators.map((i) => ({
              value: i.id,
              label: `${i.firstName} ${i.lastName}`,
            }))}
            error={errors.invigilatorsId?.message}
            disabled={isLoading}
          />

          <Select
            label="Centre"
            {...register('centreId')}
            options={centres.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.centreId?.message}
            disabled={isLoading}
          />

          <Select
            label="Status"
            {...register('status')}
            options={[
              { value: 'assigned', label: 'Assigned' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            error={errors.status?.message}
            disabled={isLoading}
          />

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
              {initialData ? 'Update Duty' : 'Allocate Duty'}
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
