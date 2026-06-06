'use server';

import { prisma } from '@/lib/prisma';
import { Invigilator, ApiResponse, PaginatedResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getInvigilators(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Invigilator>>> {
  try {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.invigilator.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invigilator.count(),
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
      error: 'Failed to fetch invigilators',
    };
  }
}

export async function getInvigilatorById(id: string): Promise<ApiResponse<Invigilator>> {
  try {
    const invigilator = await prisma.invigilator.findUnique({
      where: { id },
    });

    if (!invigilator) {
      return {
        success: false,
        error: 'Invigilator not found',
      };
    }

    return {
      success: true,
      data: invigilator,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch invigilator',
    };
  }
}

export async function createInvigilator(
  data: Omit<Invigilator, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Invigilator>> {
  try {
    const invigilator = await prisma.invigilator.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        paymentPerDuty: data.paymentPerDuty,
        preferredCentre: data.preferredCentre,
        experience: data.experience,
        availabilityStatus: data.availabilityStatus,
        notes: data.notes,
        emergencyContact: data.emergencyContact,
        profilePhoto: data.profilePhoto,
        centreId: data.centreId,
      },
    });

    revalidatePath('/dashboard/invigilators');
    return {
      success: true,
      data: invigilator,
      message: 'Invigilator created successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create invigilator';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateInvigilator(
  id: string,
  data: Partial<Omit<Invigilator, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Invigilator>> {
  try {
    const invigilator = await prisma.invigilator.update({
      where: { id },
      data,
    });

    revalidatePath('/dashboard/invigilators');
    return {
      success: true,
      data: invigilator,
      message: 'Invigilator updated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update invigilator';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteInvigilator(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.invigilator.delete({
      where: { id },
    });

    revalidatePath('/dashboard/invigilators');
    return {
      success: true,
      message: 'Invigilator deleted successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete invigilator';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function searchInvigilators(query: string): Promise<ApiResponse<Invigilator[]>> {
  try {
    const invigilators = await prisma.invigilator.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: 10,
    });

    return {
      success: true,
      data: invigilators,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to search invigilators',
    };
  }
}
