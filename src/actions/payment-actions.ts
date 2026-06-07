'use server';

import { prisma } from '@/lib/prisma';
import { Payment, ApiResponse, PaginatedResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getPayments(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Payment>>> {
  try {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: pageSize,
        include: { invigilator: true, duty: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count(),
    ]);

    return {
      success: true,
      data: {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch payments',
    };
  }
}

export async function getPaymentById(id: string): Promise<ApiResponse<Payment>> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invigilator: true, duty: true },
    });

    if (!payment) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch payment',
    };
  }
}

export async function createPayment(
  data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Payment>> {
  try {
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        status: data.status,
        paidAmount: data.paidAmount,
        pendingAmount: data.pendingAmount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paidDate: data.paidDate ? new Date(data.paidDate) : null,
        notes: data.notes,
        dutyId: data.dutyId,
        invigilatorsId: data.invigilatorsId,
      },
      include: { invigilator: true, duty: true },
    });

    revalidatePath('/dashboard/payments');
    return {
      success: true,
      data: payment,
      message: 'Payment recorded successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updatePayment(
  id: string,
  data: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Payment>> {
  try {
    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.paidDate) updateData.paidDate = new Date(data.paidDate);

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: { invigilator: true, duty: true },
    });

    revalidatePath('/dashboard/payments');
    return {
      success: true,
      data: payment,
      message: 'Payment updated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update payment';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deletePayment(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.payment.delete({
      where: { id },
    });

    revalidatePath('/dashboard/payments');
    return {
      success: true,
      message: 'Payment deleted successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getPaymentsByInvigilator(invigilatorsId: string): Promise<ApiResponse<Payment[]>> {
  try {
    const payments = await prisma.payment.findMany({
      where: { invigilatorsId },
      include: { duty: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: payments,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch payments',
    };
  }
}

export async function getPaymentStats(): Promise<ApiResponse<{
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  completedPayments: number;
  pendingPayments: number;
}>> {
  try {
    const payments = await prisma.payment.findMany();

    const stats = payments.reduce(
      (acc, payment) => ({
        totalAmount: acc.totalAmount + payment.amount,
        paidAmount: acc.paidAmount + payment.paidAmount,
        pendingAmount: acc.pendingAmount + payment.pendingAmount,
        completedPayments:
          acc.completedPayments + (payment.status === 'completed' ? 1 : 0),
        pendingPayments:
          acc.pendingPayments + (payment.status === 'pending' ? 1 : 0),
      }),
      {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        completedPayments: 0,
        pendingPayments: 0,
      }
    );

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch payment stats',
    };
  }
}
