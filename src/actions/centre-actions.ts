'use server';

import { prisma } from '@/lib/prisma';
import { Centre, ApiResponse, PaginatedResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getCentres(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Centre>>> {
  try {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.centre.findMany({
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.centre.count(),
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
      error: 'Failed to fetch centres',
    };
  }
}

export async function getAllCentres(): Promise<ApiResponse<Centre[]>> {
  try {
    const centres = await prisma.centre.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: centres,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch centres',
    };
  }
}

export async function getCentreById(id: string): Promise<ApiResponse<Centre>> {
  try {
    const centre = await prisma.centre.findUnique({
      where: { id },
      include: {
        invigilators: true,
        exams: true,
        duties: true,
      },
    });

    if (!centre) {
      return {
        success: false,
        error: 'Centre not found',
      };
    }

    return {
      success: true,
      data: centre,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch centre',
    };
  }
}

export async function createCentre(
  data: Omit<Centre, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Centre>> {
  try {
    const centre = await prisma.centre.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        capacity: data.capacity,
      },
    });

    revalidatePath('/dashboard/centres');
    return {
      success: true,
      data: centre,
      message: 'Centre created successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create centre';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateCentre(
  id: string,
  data: Partial<Omit<Centre, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Centre>> {
  try {
    const centre = await prisma.centre.update({
      where: { id },
      data,
    });

    revalidatePath('/dashboard/centres');
    return {
      success: true,
      data: centre,
      message: 'Centre updated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update centre';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteCentre(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.centre.delete({
      where: { id },
    });

    revalidatePath('/dashboard/centres');
    return {
      success: true,
      message: 'Centre deleted successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete centre';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function searchCentres(query: string): Promise<ApiResponse<Centre[]>> {
  try {
    const centres = await prisma.centre.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { address: { contains: query } },
        ],
      },
      take: 10,
    });

    return {
      success: true,
      data: centres,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to search centres',
    };
  }
}
