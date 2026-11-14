export type Role = 'student' | 'warden' | 'maintenance';

export type RoomType = 'Single' | 'Double' | 'Triple' | 'Quad';
export type RoomStatus = 'available' | 'partial' | 'occupied';
export type AllocationStatus = 'pending' | 'approved' | 'rejected';
export type ComplaintStatus = 'submitted' | 'assigned' | 'in-progress' | 'resolved';
export type ComplaintCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Furniture'
  | 'Cleaning'
  | 'Internet'
  | 'Other';
export type Priority = 'Low' | 'Medium' | 'High';
export type PaymentMethod = 'UPI' | 'Debit Card' | 'Credit Card';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Bed {
  id: string;
  number: number;
  occupied: boolean;
  occupantId?: string;
}

export interface Room {
  id: string;
  number: string;
  hostelId: string;
  hostelName: string;
  floor: number;
  type: RoomType;
  capacity: number;
  ac: boolean;
  fee: number;
  beds: Bed[];
  branchPref?: string;
  yearPref?: number;
}

export interface Student {
  id: string;
  srn: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: number;
  gender: 'Male' | 'Female';
  avatar: string;
  hostelId?: string;
  roomNumber?: string;
  bedNumber?: number;
  allocationStatus: AllocationStatus | 'none';
  paymentStatus: PaymentStatus;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  srn: string;
  studentRefId?: string;
  staffRefId?: string;
}

export interface AllocationRequest {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomNumber: string;
  hostelName: string;
  floor: number;
  bedNumber: number;
  status: AllocationStatus;
  requestedAt: string;
  resolvedAt?: string;
  reason?: string;
}

export interface Complaint {
  id: string;
  complaintId: string;
  studentId: string;
  studentName: string;
  studentSrn: string;
  category: ComplaintCategory;
  hostel: string;
  floor: number;
  roomNumber: string;
  description: string;
  priority: Priority;
  status: ComplaintStatus;
  submittedAt: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  timeline: { status: ComplaintStatus; at: string; note?: string }[];
  completionRemarks?: string;
}

export interface MaintenanceTask {
  id: string;
  complaintId: string;
  staffId: string;
  staffName: string;
  status: ComplaintStatus;
  assignedAt: string;
  remarks?: string;
}

export interface MaintenanceStaff {
  id: string;
  name: string;
  email: string;
  srn: string;
  specialty: string;
  avatar: string;
}

export interface Payment {
  id: string;
  studentId: string;
  roomNumber: string;
  hostelName: string;
  amount: number;
  method?: PaymentMethod;
  status: PaymentStatus;
  date?: string;
  receiptNo?: string;
}

export interface Hostel {
  id: string;
  name: string;
  blocks: number;
  floors: number;
  roomsPerFloor: number;
  gender: 'Male' | 'Female' | 'Co-ed';
  warden: string;
}
