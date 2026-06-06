'use server';

import { prisma } from '@/lib/prisma';
import { Duty, ApiResponse, PaginatedResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getDuties(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Duty>>> {
  try {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.duty.findMany({
        skip,
        take: pageSize,
        include: { exam: true, invigilator: true, centre: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.duty.count(),
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
      error: 'Failed to fetch duties',
    };
  }
}

export async function getDutyById(id: string): Promise<ApiResponse<Duty>> {
  try {
    const duty = await prisma.duty.findUnique({
      where: { id },
      include: { exam: true, invigilator: true, centre: true, attendance: true, payment: true },
    });

    if (!duty) {
      return {
        success: false,
        error: 'Duty not found',
      };
    }

    return {
      success: true,
      data: duty,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch duty',
    };
  }
}

export async function createDuty(
  data: Omit<Duty, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Duty>> {
  try {
    const duty = await prisma.duty.create({
      data: {
        status: data.status,
        notes: data.notes,
        examId: data.examId,
        invigilatorsId: data.invigilatorsId,
        centreId: data.centreId,
      },
      include: { exam: true, invigilator: true, centre: true },
    });

    revalidatePath('/dashboard/duties');
    return {
      success: true,
      data: duty,
      message: 'Duty allocated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create duty';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateDuty(
  id: string,
  data: Partial<Omit<Duty, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Duty>> {
  try {
    const duty = await prisma.duty.update({
      where: { id },
      data,
      include: { exam: true, invigilator: true, centre: true },
    });

    revalidatePath('/dashboard/duties');
    return {
      success: true,
      data: duty,
      message: 'Duty updated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update duty';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteDuty(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.duty.delete({
      where: { id },
    });

    revalidatePath('/dashboard/duties');
    return {
      success: true,
      message: 'Duty deleted successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete duty';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getDutiesByExam(examId: string): Promise<ApiResponse<Duty[]>> {
  try {
    const duties = await prisma.duty.findMany({
      where: { examId },
      include: { invigilator: true, attendance: true },
    });

    return {
      success: true,
      data: duties,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch duties',
    };
  }
}

export async function getDutiesByInvigilator(invigilatorsId: string): Promise<ApiResponse<Duty[]>> {
  try {
    const duties = await prisma.duty.findMany({
      where: { invigilatorsId },
      include: { exam: true, centre: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: duties,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch duties',
    };
  }
}
