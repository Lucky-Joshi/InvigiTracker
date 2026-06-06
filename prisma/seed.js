const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    await prisma.payment.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.duty.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.invigilator.deleteMany({});
    await prisma.centre.deleteMany({});

    // Create centres
    const nspCentre = await prisma.centre.create({
      data: {
        name: 'NSP Centre',
        address: '123 Main Street, Delhi',
        phone: '+91-11-1234-5678',
        email: 'nsp@example.com',
        capacity: 150,
      },
    });

    const punjabiBaghCentre = await prisma.centre.create({
      data: {
        name: 'Punjabi Bagh Centre',
        address: '456 Park Avenue, Delhi',
        phone: '+91-11-8765-4321',
        email: 'punjabibagh@example.com',
        capacity: 120,
      },
    });

    // Create invigilators
    const invigilators = await Promise.all([
      prisma.invigilator.create({
        data: {
          firstName: 'Rajesh',
          lastName: 'Kumar',
          email: 'rajesh@example.com',
          phone: '+91-98765-43210',
          address: 'New Delhi',
          gender: 'Male',
          paymentPerDuty: 500,
          preferredCentre: nspCentre.id,
          centreId: nspCentre.id,
          experience: 5,
          availabilityStatus: true,
          emergencyContact: '+91-98765-43211',
        },
      }),
      prisma.invigilator.create({
        data: {
          firstName: 'Priya',
          lastName: 'Singh',
          email: 'priya@example.com',
          phone: '+91-98765-43212',
          address: 'Gurgaon',
          gender: 'Female',
          paymentPerDuty: 600,
          preferredCentre: punjabiBaghCentre.id,
          centreId: punjabiBaghCentre.id,
          experience: 3,
          availabilityStatus: true,
          emergencyContact: '+91-98765-43213',
        },
      }),
      prisma.invigilator.create({
        data: {
          firstName: 'Amit',
          lastName: 'Patel',
          email: 'amit@example.com',
          phone: '+91-98765-43214',
          address: 'Delhi',
          gender: 'Male',
          paymentPerDuty: 550,
          preferredCentre: nspCentre.id,
          centreId: nspCentre.id,
          experience: 7,
          availabilityStatus: true,
          emergencyContact: '+91-98765-43215',
        },
      }),
      prisma.invigilator.create({
        data: {
          firstName: 'Neha',
          lastName: 'Sharma',
          email: 'neha@example.com',
          phone: '+91-98765-43216',
          address: 'Noida',
          gender: 'Female',
          paymentPerDuty: 500,
          preferredCentre: punjabiBaghCentre.id,
          centreId: punjabiBaghCentre.id,
          experience: 2,
          availabilityStatus: true,
          emergencyContact: '+91-98765-43217',
        },
      }),
    ]);

    // Create exams
    const exams = await Promise.all([
      prisma.exam.create({
        data: {
          title: 'JEE Mains - Session 1',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          shiftStart: '09:00 AM',
          shiftEnd: '12:00 PM',
          invigilatorsRequired: 2,
          centreId: nspCentre.id,
          status: 'scheduled',
        },
      }),
      prisma.exam.create({
        data: {
          title: 'NEET - Session 1',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          shiftStart: '02:00 PM',
          shiftEnd: '05:00 PM',
          invigilatorsRequired: 3,
          centreId: punjabiBaghCentre.id,
          status: 'scheduled',
        },
      }),
    ]);

    // Create duties
    const duties = await Promise.all([
      prisma.duty.create({
        data: {
          examId: exams[0].id,
          invigilatorsId: invigilators[0].id,
          centreId: nspCentre.id,
          status: 'assigned',
        },
      }),
      prisma.duty.create({
        data: {
          examId: exams[0].id,
          invigilatorsId: invigilators[2].id,
          centreId: nspCentre.id,
          status: 'assigned',
        },
      }),
      prisma.duty.create({
        data: {
          examId: exams[1].id,
          invigilatorsId: invigilators[1].id,
          centreId: punjabiBaghCentre.id,
          status: 'assigned',
        },
      }),
    ]);

    // Create attendance records
    await Promise.all([
      prisma.attendance.create({
        data: {
          dutyId: duties[0].id,
          invigilatorsId: invigilators[0].id,
          status: 'present',
        },
      }),
      prisma.attendance.create({
        data: {
          dutyId: duties[1].id,
          invigilatorsId: invigilators[2].id,
          status: 'present',
        },
      }),
    ]);

    // Create payment records
    await Promise.all([
      prisma.payment.create({
        data: {
          dutyId: duties[0].id,
          invigilatorsId: invigilators[0].id,
          amount: 500,
          pendingAmount: 0,
          paidAmount: 500,
          status: 'completed',
          paidDate: new Date(),
        },
      }),
      prisma.payment.create({
        data: {
          dutyId: duties[1].id,
          invigilatorsId: invigilators[2].id,
          amount: 550,
          pendingAmount: 550,
          paidAmount: 0,
          status: 'pending',
        },
      }),
      prisma.payment.create({
        data: {
          dutyId: duties[2].id,
          invigilatorsId: invigilators[1].id,
          amount: 600,
          pendingAmount: 600,
          paidAmount: 0,
          status: 'pending',
        },
      }),
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
