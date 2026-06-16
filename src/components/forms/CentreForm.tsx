'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const CentreFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
});

type CentreFormData = z.infer<typeof CentreFormSchema>;

interface CentreFormProps {
  onSubmit: (data: CentreFormData) => Promise<void>;
  initialData?: Partial<CentreFormData>;
  isLoading?: boolean;
}

export function CentreForm({
  onSubmit,
  initialData,
  isLoading = false,
}: CentreFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CentreFormData>({
    resolver: zodResolver(CentreFormSchema),
    defaultValues: initialData,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onFormSubmit = async (data: CentreFormData) => {
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
        <CardTitle>{initialData ? 'Edit Centre' : 'Add New Centre'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Input
            label="Centre Name"
            {...register('name')}
            error={errors.name?.message}
            disabled={isLoading}
          />

          <Input
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              disabled={isLoading}
              placeholder="10-digit number (optional)"
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
              placeholder="Optional"
            />
          </div>

          <Input
            label="Capacity"
            type="number"
            {...register('capacity')}
            error={errors.capacity?.message}
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
              {initialData ? 'Update Centre' : 'Add Centre'}
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
