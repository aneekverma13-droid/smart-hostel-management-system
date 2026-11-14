import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type {
  User, Student, Room, AllocationRequest, Complaint, Payment,
  ComplaintStatus, ComplaintCategory, Priority, MaintenanceStaff,
} from './types';
import { api, getToken, setToken, ApiError } from './api';

type Result = { ok: boolean; error?: string };

interface AppState {
  user: User | null;
  currentStudent: Student | null;
  students: Student[];
  rooms: Room[];
  requests: AllocationRequest[];
  complaints: Complaint[];
  payments: Payment[];
  staff: MaintenanceStaff[];
  loading: boolean;
  refresh: () => Promise<void>;

  login: (srnOrEmail: string, password: string, role: string) => Promise<Result>;
  logout: () => void;
  register: (data: {
    name: string; srn: string; email: string; phone: string;
    branch: string; year: number; gender: 'Male' | 'Female';
    password: string; role: string;
  }) => Promise<Result>;

  requestAllocation: (studentId: string, room: Room, bedNumber: number) => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, reason: string) => Promise<void>;

  addComplaint: (data: {
    studentId: string; category: ComplaintCategory; hostel: string;
    floor: number; roomNumber: string; description: string; priority: Priority;
  }) => Promise<void>;
  assignComplaint: (complaintId: string, staffId: string) => Promise<void>;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, note?: string) => Promise<void>;
  completeComplaint: (complaintId: string, remarks: string) => Promise<void>;

  makePayment: (studentId: string, method: Payment['method']) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);
const POLL_MS = 15000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [requests, setRequests] = useState<AllocationRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<MaintenanceStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const clearPrivate = () => {
    setStudents([]); setRequests([]); setComplaints([]); setPayments([]); setStaff([]);
  };

  const refresh = useCallback(async () => {
    try {
      setRooms(await api<Room[]>('/rooms'));
      const u = userRef.current;
      if (!u) return;
      const calls: Promise<unknown>[] = [
        api<Student[]>('/students').then(setStudents),
        api<AllocationRequest[]>('/requests').then(setRequests),
        api<Complaint[]>('/complaints').then(setComplaints),
        api<Payment[]>('/payments').then(setPayments),
      ];
      if (u.role === 'warden') calls.push(api<MaintenanceStaff[]>('/staff').then(setStaff));
      await Promise.all(calls);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) { setToken(null); setUser(null); clearPrivate(); }
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          const { user: u } = await api<{ user: User }>('/auth/me');
          userRef.current = u;
          setUser(u);
        } catch { setToken(null); }
      }
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const currentStudent = user && user.role === 'student'
    ? students.find((s) => s.srn === user.srn) ?? null
    : null;

  const login: AppState['login'] = async (srnOrEmail, password, role) => {
    try {
      const { token, user: u } = await api<{ token: string; user: User }>('/auth/login', {
        method: 'POST', body: { login: srnOrEmail, password, role },
      });
      setToken(token);
      userRef.current = u;
      setUser(u);
      await refresh();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  };

  const logout = () => {
    setToken(null);
    userRef.current = null;
    setUser(null);
    clearPrivate();
    refresh();
  };

  const register: AppState['register'] = async (data) => {
    try {
      await api('/auth/register', { method: 'POST', body: data });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  };

  // Every mutation: call API, then reload. Errors propagate to the caller (shown as a toast).
  const mutate = async (fn: () => Promise<unknown>) => {
    try { await fn(); } finally { await refresh(); }
  };

  const value: AppState = {
    user, currentStudent, students, rooms, requests, complaints, payments, staff, loading, refresh,
    login, logout, register,
    requestAllocation: (_sid, room, bedNumber) =>
      mutate(() => api('/requests', { method: 'POST', body: { roomId: room.id, bedNumber } })),
    approveRequest: (id) => mutate(() => api(`/requests/${id}/approve`, { method: 'PATCH' })),
    rejectRequest: (id, reason) => mutate(() => api(`/requests/${id}/reject`, { method: 'PATCH', body: { reason } })),
    addComplaint: (d) => mutate(() => api('/complaints', {
      method: 'POST',
      body: { category: d.category, hostel: d.hostel, roomNumber: d.roomNumber, description: d.description, priority: d.priority },
    })),
    assignComplaint: (id, staffId) => mutate(() => api(`/complaints/${id}/assign`, { method: 'PATCH', body: { staffId } })),
    updateComplaintStatus: (id, status, note) =>
      mutate(() => api(`/complaints/${id}/status`, { method: 'PATCH', body: { status, note } })),
    completeComplaint: (id, remarks) =>
      mutate(() => api(`/complaints/${id}/complete`, { method: 'POST', body: { remarks } })),
    makePayment: (_sid, method) => mutate(() => api('/payments', { method: 'POST', body: { method } })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
