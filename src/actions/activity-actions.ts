'use server';

import { prisma } from '@/lib/prisma';
import { ActivityLog, ApiResponse } from '@/types';

export async function getRecentActivities(limit: number = 10): Promise<ApiResponse<ActivityLog[]>> {
  try {
    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, data: activities };
  } catch (error) {
    return { success: false, error: 'Failed to fetch activities' };
  }
}

export async function logActivity(
  action: string,
  entity: string,
  entityId: string,
  changes?: string
): Promise<ApiResponse<ActivityLog>> {
  try {
    const activity = await prisma.activityLog.create({
      data: { action, entity, entityId, changes },
    });
    return { success: true, data: activity };
  } catch (error) {
    return { success: false, error: 'Failed to log activity' };
  }
}

export async function getDashboardStats(): Promise<
  ApiResponse<{
    totalInvigilators: number;
    upcomingExams: number;
    dutiesToday: number;
    pendingPayments: number;
    completedPayments: number;
    totalCentres: number;
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
  }>
> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalInvigilators,
      totalCentres,
      upcomingExams,
      dutiesToday,
      allPayments,
    ] = await Promise.all([
      prisma.invigilator.count(),
      prisma.centre.count(),
      prisma.exam.count({
        where: {
          date: { gte: now, lte: next30Days },
          status: 'scheduled',
        },
      }),
      prisma.duty.count({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.payment.findMany(),
    ]);

    const paymentStats = allPayments.reduce(
      (acc, p) => ({
        totalRevenue: acc.totalRevenue + p.amount,
        totalPaid: acc.totalPaid + p.paidAmount,
        totalPending: acc.totalPending + p.pendingAmount,
        pendingPayments: acc.pendingPayments + (p.status === 'pending' ? 1 : 0),
        completedPayments: acc.completedPayments + (p.status === 'completed' ? 1 : 0),
      }),
      { totalRevenue: 0, totalPaid: 0, totalPending: 0, pendingPayments: 0, completedPayments: 0 }
    );

    return {
      success: true,
      data: {
        totalInvigilators,
        upcomingExams,
        dutiesToday,
        pendingPayments: paymentStats.pendingPayments,
        completedPayments: paymentStats.completedPayments,
        totalCentres,
        totalRevenue: paymentStats.totalRevenue,
        totalPaid: paymentStats.totalPaid,
        totalPending: paymentStats.totalPending,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}

export async function getCentreStats(): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      invigilatorCount: number;
      examCount: number;
      dutyCount: number;
    }>
  >
> {
  try {
    const centres = await prisma.centre.findMany({
      include: {
        _count: {
          select: { invigilators: true, exams: true, duties: true },
        },
      },
    });

    return {
      success: true,
      data: centres.map((c) => ({
        id: c.id,
        name: c.name,
        invigilatorCount: c._count.invigilators,
        examCount: c._count.exams,
        dutyCount: c._count.duties,
      })),
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch centre stats' };
  }
}
