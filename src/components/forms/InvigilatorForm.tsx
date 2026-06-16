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

const InvigilatorFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  gender: z.enum(['male', 'female', 'other']),
  paymentPerDuty: z.coerce.number().min(0, 'Payment must be non-negative'),
  preferredCentre: z.string().optional(),
  experience: z.coerce.number().min(0).optional(),
  availabilityStatus: z.boolean().default(true),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
});

type InvigilatorFormData = z.infer<typeof InvigilatorFormSchema>;

interface InvigilatorFormProps {
  onSubmit: (data: InvigilatorFormData) => Promise<void>;
  initialData?: Partial<InvigilatorFormData>;
  isLoading?: boolean;
  centres?: Array<{ id: string; name: string }>;
}

export function InvigilatorForm({
  onSubmit,
  initialData,
  isLoading = false,
  centres = [],
}: InvigilatorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvigilatorFormData>({
    resolver: zodResolver(InvigilatorFormSchema),
    defaultValues: initialData,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onFormSubmit = async (data: InvigilatorFormData) => {
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
        <CardTitle>{initialData ? 'Edit Invigilator' : 'Add New Invigilator'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
              disabled={isLoading}
            />
            <Input
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
            />
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              disabled={isLoading}
              placeholder="10-digit number"
            />
          </div>

          <Input
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Gender"
              {...register('gender')}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              error={errors.gender?.message}
              disabled={isLoading}
            />
            <Input
              label="Payment Per Duty (₹)"
              type="number"
              {...register('paymentPerDuty')}
              error={errors.paymentPerDuty?.message}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Preferred Centre"
              {...register('preferredCentre')}
              options={centres.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.preferredCentre?.message}
              disabled={isLoading}
            />
            <Input
              label="Experience (Years)"
              type="number"
              {...register('experience')}
              error={errors.experience?.message}
              disabled={isLoading}
            />
          </div>

          <Input
            label="Emergency Contact"
            {...register('emergencyContact')}
            error={errors.emergencyContact?.message}
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
              {initialData ? 'Update Invigilator' : 'Add Invigilator'}
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
