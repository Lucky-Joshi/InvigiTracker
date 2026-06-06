'use server';

import { prisma } from '@/lib/prisma';
import { Attendance, ApiResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function markAttendance(
  dutyId: string,
  invigilatorsId: string,
  status: string,
  notes?: string
): Promise<ApiResponse<Attendance>> {
  try {
    const existing = await prisma.attendance.findUnique({
      where: { dutyId },
    });

    let attendance;
    if (existing) {
      attendance = await prisma.attendance.update({
        where: { dutyId },
        data: { status, notes, invigilatorsId },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: { dutyId, invigilatorsId, status, notes },
      });
    }

    revalidatePath('/dashboard/duties');
    return { success: true, data: attendance, message: 'Attendance marked' };
  } catch (error) {
    return { success: false, error: 'Failed to mark attendance' };
  }
}

export async function getAttendanceByDuty(dutyId: string): Promise<ApiResponse<Attendance | null>> {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { dutyId },
    });
    return { success: true, data: attendance };
  } catch (error) {
    return { success: false, error: 'Failed to fetch attendance' };
  }
}
