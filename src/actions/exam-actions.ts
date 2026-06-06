'use server';

import { prisma } from '@/lib/prisma';
import { Exam, ApiResponse, PaginatedResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getExams(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Exam>>> {
  try {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.exam.findMany({
        skip,
        take: pageSize,
        include: { centre: true },
        orderBy: { date: 'desc' },
      }),
      prisma.exam.count(),
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
      error: 'Failed to fetch exams',
    };
  }
}

export async function getExamById(id: string): Promise<ApiResponse<Exam>> {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { centre: true, duties: true },
    });

    if (!exam) {
      return {
        success: false,
        error: 'Exam not found',
      };
    }

    return {
      success: true,
      data: exam,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch exam',
    };
  }
}

export async function createExam(
  data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Exam>> {
  try {
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        shiftStart: data.shiftStart,
        shiftEnd: data.shiftEnd,
        invigilatorsRequired: data.invigilatorsRequired,
        status: data.status,
        notes: data.notes,
        centreId: data.centreId,
      },
      include: { centre: true },
    });

    revalidatePath('/dashboard/exams');
    return {
      success: true,
      data: exam,
      message: 'Exam created successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create exam';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateExam(
  id: string,
  data: Partial<Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Exam>> {
  try {
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: { centre: true },
    });

    revalidatePath('/dashboard/exams');
    return {
      success: true,
      data: exam,
      message: 'Exam updated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update exam';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteExam(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.exam.delete({
      where: { id },
    });

    revalidatePath('/dashboard/exams');
    return {
      success: true,
      message: 'Exam deleted successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete exam';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getUpcomingExams(days: number = 30): Promise<ApiResponse<Exam[]>> {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const exams = await prisma.exam.findMany({
      where: {
        date: {
          gte: now,
          lte: futureDate,
        },
      },
      include: { centre: true },
      orderBy: { date: 'asc' },
    });

    return {
      success: true,
      data: exams,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch upcoming exams',
    };
  }
}
