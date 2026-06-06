export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Centre {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invigilator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  paymentPerDuty: number;
  preferredCentre?: string | null;
  experience?: number | null;
  availabilityStatus: boolean;
  notes?: string | null;
  emergencyContact?: string | null;
  profilePhoto?: string | null;
  centreId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exam {
  id: string;
  title: string;
  date: Date;
  shiftStart: string;
  shiftEnd: string;
  invigilatorsRequired: number;
  status: string;
  notes?: string | null;
  centreId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Duty {
  id: string;
  status: string;
  notes?: string | null;
  examId: string;
  invigilatorsId: string;
  centreId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  status: string;
  timestamp: Date;
  notes?: string | null;
  dutyId: string;
  invigilatorsId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAmount: number;
  pendingAmount: number;
  dueDate?: Date | null;
  paidDate?: Date | null;
  notes?: string | null;
  dutyId: string;
  invigilatorsId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
