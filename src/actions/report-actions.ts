'use server';

import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export interface MonthlyReport {
  month: string;
  year: number;
  totalExams: number;
  totalDuties: number;
  totalInvigilators: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  attendanceRate: number;
}

export async function getMonthlyReport(
  month: number,
  year: number
): Promise<ApiResponse<MonthlyReport>> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [exams, duties, payments, attendances] = await Promise.all([
      prisma.exam.count({
        where: { date: { gte: startDate, lte: endDate } },
      }),
      prisma.duty.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.payment.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.attendance.findMany({
        where: { timestamp: { gte: startDate, lte: endDate } },
      }),
    ]);

    const invigilators = await prisma.invigilator.count();

    const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
    const paidAmount = payments.reduce((s, p) => s + p.paidAmount, 0);
    const pendingAmount = payments.reduce((s, p) => s + p.pendingAmount, 0);

    const presentCount = attendances.filter((a) => a.status === 'present').length;
    const attendanceRate = attendances.length > 0
      ? Math.round((presentCount / attendances.length) * 100)
      : 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      success: true,
      data: {
        month: monthNames[month - 1],
        year,
        totalExams: exams,
        totalDuties: duties,
        totalInvigilators: invigilators,
        totalAmount,
        paidAmount,
        pendingAmount,
        attendanceRate,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to generate monthly report' };
  }
}

export async function getCentreWiseReport(): Promise<
  ApiResponse<
    Array<{
      centreId: string;
      centreName: string;
      totalExams: number;
      totalDuties: number;
      totalInvigilators: number;
      totalPaymentAmount: number;
      totalPaidAmount: number;
    }>
  >
> {
  try {
    const centres = await prisma.centre.findMany({
      include: {
        _count: { select: { exams: true, duties: true, invigilators: true } },
        duties: { include: { payment: true } },
      },
    });

    return {
      success: true,
      data: centres.map((c) => {
        const totalPaymentAmount = c.duties.reduce(
          (s, d) => s + (d.payment?.amount || 0),
          0
        );
        const totalPaidAmount = c.duties.reduce(
          (s, d) => s + (d.payment?.paidAmount || 0),
          0
        );

        return {
          centreId: c.id,
          centreName: c.name,
          totalExams: c._count.exams,
          totalDuties: c._count.duties,
          totalInvigilators: c._count.invigilators,
          totalPaymentAmount,
          totalPaidAmount,
        };
      }),
    };
  } catch (error) {
    return { success: false, error: 'Failed to generate centre-wise report' };
  }
}

export async function getPaymentReport(
  month?: number,
  year?: number
): Promise<
  ApiResponse<
    Array<{
      invigilatorName: string;
      totalDuties: number;
      totalAmount: number;
      paidAmount: number;
      pendingAmount: number;
      status: string;
    }>
  >
> {
  try {
    const whereClause: any = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      whereClause.createdAt = { gte: startDate, lte: endDate };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: { invigilator: true },
    });

    const grouped = payments.reduce(
      (acc: Record<string, any>, p) => {
        const key = p.invigilatorsId;
        if (!acc[key]) {
          acc[key] = {
            invigilatorName: `${p.invigilator.firstName} ${p.invigilator.lastName}`,
            totalDuties: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            status: 'pending',
          };
        }
        acc[key].totalDuties++;
        acc[key].totalAmount += p.amount;
        acc[key].paidAmount += p.paidAmount;
        acc[key].pendingAmount += p.pendingAmount;
        if (p.status === 'completed') acc[key].status = 'completed';
        else if (p.status === 'partial') acc[key].status = 'partial';
        return acc;
      },
      {}
    );

    return { success: true, data: Object.values(grouped) };
  } catch (error) {
    return { success: false, error: 'Failed to generate payment report' };
  }
}

export async function getInvigilatorPerformanceReport(): Promise<
  ApiResponse<
    Array<{
      invigilatorName: string;
      totalDuties: number;
      completedDuties: number;
      attendanceRate: number;
      totalEarnings: number;
      experience: number | null;
      centreName: string | null;
    }>
  >
> {
  try {
    const invigilators = await prisma.invigilator.findMany({
      include: {
        duties: { include: { attendance: true, payment: true } },
        centre: true,
      },
    });

    return {
      success: true,
      data: invigilators.map((inv) => {
        const total = inv.duties.length;
        const completed = inv.duties.filter((d) => d.status === 'completed').length;
        const presentAttendances = inv.duties.filter(
          (d) => d.attendance?.status === 'present'
        ).length;
        const attendanceRate = total > 0
          ? Math.round((presentAttendances / total) * 100)
          : 0;
        const totalEarnings = inv.duties.reduce(
          (s, d) => s + (d.payment?.paidAmount || 0),
          0
        );

        return {
          invigilatorName: `${inv.firstName} ${inv.lastName}`,
          totalDuties: total,
          completedDuties: completed,
          attendanceRate,
          totalEarnings,
          experience: inv.experience,
          centreName: inv.centre?.name || null,
        };
      }),
    };
  } catch (error) {
    return { success: false, error: 'Failed to generate performance report' };
  }
}
