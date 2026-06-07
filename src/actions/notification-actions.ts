'use server';

import { prisma } from '@/lib/prisma';
import { Notification, ApiResponse } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, data: notifications };
  } catch (error) {
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function getUnreadCount(): Promise<ApiResponse<number>> {
  try {
    const count = await prisma.notification.count({ where: { read: false } });
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: 'Failed to fetch unread count' };
  }
}

export async function createNotification(
  type: string,
  title: string,
  message: string
): Promise<ApiResponse<Notification>> {
  try {
    const notification = await prisma.notification.create({
      data: { type, title, message },
    });
    revalidatePath('/dashboard/notifications');
    return { success: true, data: notification, message: 'Notification created' };
  } catch (error) {
    return { success: false, error: 'Failed to create notification' };
  }
}

export async function markAsRead(id: string): Promise<ApiResponse<Notification>> {
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { success: true, data: notification };
  } catch (error) {
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

export async function markAllAsRead(): Promise<ApiResponse<null>> {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    revalidatePath('/dashboard/notifications');
    return { success: true, message: 'All notifications marked as read' };
  } catch (error) {
    return { success: false, error: 'Failed to mark all as read' };
  }
}

export async function deleteNotification(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.notification.delete({ where: { id } });
    revalidatePath('/dashboard/notifications');
    return { success: true, message: 'Notification deleted' };
  } catch (error) {
    return { success: false, error: 'Failed to delete notification' };
  }
}

export async function generateSystemNotifications(): Promise<ApiResponse<number>> {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingExams = await prisma.exam.findMany({
      where: {
        date: { gte: now, lte: nextWeek },
        status: 'scheduled',
      },
      include: { centre: true },
    });

    let count = 0;

    for (const exam of upcomingExams) {
      const existing = await prisma.notification.findFirst({
        where: {
          type: 'exam_upcoming',
          message: { contains: exam.title },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            type: 'exam_upcoming',
            title: 'Upcoming Exam',
            message: `${exam.title} at ${exam.centre.name} on ${exam.date.toLocaleDateString()}`,
          },
        });
        count++;
      }
    }

    const unassignedDuties = await prisma.duty.findMany({
      where: { status: 'pending' },
      include: { exam: true, invigilator: true },
    });

    for (const duty of unassignedDuties) {
      const existing = await prisma.notification.findFirst({
        where: {
          type: 'duty_unassigned',
          message: { contains: duty.exam.title },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            type: 'duty_unassigned',
            title: 'Unassigned Duty',
            message: `Duty pending for ${duty.exam.title} - ${duty.invigilator.firstName} ${duty.invigilator.lastName}`,
          },
        });
        count++;
      }
    }

    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'pending' },
      include: { invigilator: true },
    });

    for (const payment of pendingPayments) {
      const existing = await prisma.notification.findFirst({
        where: {
          type: 'payment_pending',
          message: { contains: `${payment.invigilator.firstName} ${payment.invigilator.lastName}` },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            type: 'payment_pending',
            title: 'Pending Payment',
            message: `Payment of ₹${payment.pendingAmount} pending for ${payment.invigilator.firstName} ${payment.invigilator.lastName}`,
          },
        });
        count++;
      }
    }

    if (count > 0) revalidatePath('/dashboard/notifications');
    return { success: true, data: count, message: `${count} notifications generated` };
  } catch (error) {
    return { success: false, error: 'Failed to generate notifications' };
  }
}
