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

const ExamFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  date: z.string(),
  shiftStart: z.string(),
  shiftEnd: z.string(),
  invigilatorsRequired: z.coerce.number().min(1, 'At least 1 invigilator required'),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']),
  centreId: z.string().min(1, 'Please select a centre'),
  notes: z.string().optional(),
});

type ExamFormData = z.infer<typeof ExamFormSchema>;

interface ExamFormProps {
  onSubmit: (data: ExamFormData) => Promise<void>;
  initialData?: Partial<ExamFormData>;
  isLoading?: boolean;
  centres?: Array<{ id: string; name: string }>;
}

export function ExamForm({
  onSubmit,
  initialData,
  isLoading = false,
  centres = [],
}: ExamFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(ExamFormSchema),
    defaultValues: initialData,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onFormSubmit = async (data: ExamFormData) => {
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
        <CardTitle>{initialData ? 'Edit Exam' : 'Schedule New Exam'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Input
            label="Exam Title"
            {...register('title')}
            error={errors.title?.message}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              {...register('date')}
              error={errors.date?.message}
              disabled={isLoading}
            />
            <Input
              label="Shift Start"
              type="time"
              {...register('shiftStart')}
              error={errors.shiftStart?.message}
              disabled={isLoading}
            />
            <Input
              label="Shift End"
              type="time"
              {...register('shiftEnd')}
              error={errors.shiftEnd?.message}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Invigilators Required"
              type="number"
              {...register('invigilatorsRequired')}
              error={errors.invigilatorsRequired?.message}
              disabled={isLoading}
            />
            <Select
              label="Centre"
              {...register('centreId')}
              options={centres.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.centreId?.message}
              disabled={isLoading}
            />
          </div>

          <Select
            label="Status"
            {...register('status')}
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'ongoing', label: 'Ongoing' },
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
              {initialData ? 'Update Exam' : 'Schedule Exam'}
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
