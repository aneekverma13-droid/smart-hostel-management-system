import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building, BedDouble, Users, FileText, Wrench,
  UserCog, BarChart3, CheckCircle2, XCircle, Clock, DoorOpen, Bed,
  AlertCircle, IndianRupee, Filter,
} from 'lucide-react';
import { useApp } from '@/store';
import DashboardShell from '@/components/DashboardShell';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import Hostel3D from '@/components/Hostel3D';
import { roomStatus, HOSTELS } from '@/data';
import type { Room, Complaint, ComplaintStatus, Priority } from '@/types';

type Page = 'dashboard' | 'structure' | 'rooms' | 'allocation' | 'requests' | 'complaints' | 'staff' | 'reports';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'structure', label: 'Hostel Structure', icon: Building },
  { id: 'rooms', label: 'Room Management', icon: DoorOpen },
  { id: 'allocation', label: 'Student Allocation', icon: Users },
  { id: 'requests', label: 'Allocation Requests', icon: FileText },
  { id: 'complaints', label: 'Complaints', icon: Wrench },
  { id: 'staff', label: 'Maintenance Staff', icon: UserCog },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

interface Props {
  onLogout: () => void;
  onHome: () => void;
}

export default function WardenDashboard({ onLogout, onHome }: Props) {
  const app = useApp();
  const [page, setPage] = useState<Page>('dashboard');
  const [toast, setToast] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; requestId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [complaintModal, setComplaintModal] = useState<Complaint | null>(null);
  const [assignStaffId, setAssignStaffId] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({ priority: '', status: '', hostel: '', room: '' });

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const totalRooms = app.rooms.length;
  const totalBeds = app.rooms.reduce((a, r) => a + r.capacity, 0);
  const occupiedBeds = app.rooms.reduce((a, r) => a + r.beds.filter((b) => b.occupied).length, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const pendingRequests = app.requests.filter((r) => r.status === 'pending').length;
  const activeComplaints = app.complaints.filter((c) => c.status !== 'resolved').length;

  const doApprove = async () => {
    if (!actionModal) return;
    try { await app.approveRequest(actionModal.requestId); }
    catch (e) { notify((e as Error).message); setActionModal(null); return; }
    notify('Allocation request approved and bed assigned');
    setActionModal(null);
  };
  const doReject = async () => {
    if (!actionModal) return;
    try { await app.rejectRequest(actionModal.requestId, rejectReason || 'Not eligible'); }
    catch (e) { notify((e as Error).message); setActionModal(null); return; }
    notify('Allocation request rejected');
    setActionModal(null);
    setRejectReason('');
  };
  const doAssign = async () => {
    if (!complaintModal || !assignStaffId) return;
    try { await app.assignComplaint(complaintModal.id, assignStaffId); }
    catch (e) { notify((e as Error).message); setComplaintModal(null); return; }
    notify('Maintenance staff assigned');
    setComplaintModal(null);
    setAssignStaffId('');
  };

  const filteredComplaints = app.complaints.filter((c) =>
    (!filters.priority || c.priority === filters.priority) &&
    (!filters.status || c.status === filters.status) &&
    (!filters.hostel || c.hostel === filters.hostel) &&
    (!filters.room || c.roomNumber === filters.room)
  );

  return (
    <DashboardShell
      items={navItems}
      active={page}
      onSelect={(id) => setPage(id as Page)}
      title={titles[page]}
      subtitle={subs[page]}
      accentIcon={Building}
      onHome={onHome}
      user={{ name: app.user?.name ?? 'Warden', role: 'warden' }}
      onLogout={onLogout}
    >
      {page === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Rooms" value={totalRooms} icon={DoorOpen} color="mint" />
            <StatCard label="Total Beds" value={totalBeds} icon={Bed} color="teal" />
            <StatCard label="Occupied Beds" value={occupiedBeds} icon={BedDouble} color="peach" />
            <StatCard label="Available Beds" value={availableBeds} icon={Bed} color="sky" />
            <StatCard label="Pending Requests" value={pendingRequests} icon={Clock} color="peach" />
            <StatCard label="Active Complaints" value={activeComplaints} icon={AlertCircle} color="peach" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-gray-800">Pending Allocation Requests</h3>
              {app.requests.filter((r) => r.status === 'pending').length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">No pending requests.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {app.requests.filter((r) => r.status === 'pending').map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-cream-50 p-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{r.studentName}</p>
                        <p className="text-[11px] text-gray-400">Room {r.roomNumber} · Bed {r.bedNumber} · {r.hostelName}</p>
                      </div>
                      <button onClick={() => setPage('requests')} className="rounded-lg bg-mint-500 px-3 py-1.5 text-xs font-semibold text-white">Review</button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-gray-800">Hostel Occupancy</h3>
              <div className="mt-3 space-y-3">
                {HOSTELS.map((h) => {
                  const hRooms = app.rooms.filter((r) => r.hostelId === h.id);
                  const hBeds = hRooms.reduce((a, r) => a + r.capacity, 0);
                  const hOcc = hRooms.reduce((a, r) => a + r.beds.filter((b) => b.occupied).length, 0);
                  const pct = hBeds ? Math.round((hOcc / hBeds) * 100) : 0;
                  return (
                    <div key={h.id}>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-gray-700">{h.name}</span>
                        <span className="text-gray-400">{hOcc}/{hBeds} · {pct}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-200">
                        <div className="h-full rounded-full bg-gradient-to-r from-mint-400 to-teal-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {page === 'structure' && <StructurePage />}
      {page === 'rooms' && <RoomsPage />}
      {page === 'allocation' && <AllocationPage />}
      {page === 'requests' && (
        <RequestsPage
          requests={app.requests}
          onApprove={(id) => setActionModal({ type: 'approve', requestId: id })}
          onReject={(id) => setActionModal({ type: 'reject', requestId: id })}
        />
      )}
      {page === 'complaints' && (
        <WardenComplaintsPage
          complaints={filteredComplaints}
          filters={filters}
          setFilters={setFilters}
          onOpen={(c) => { setComplaintModal(c); setAssignStaffId(c.assignedStaffId ?? ''); }}
        />
      )}
      {page === 'staff' && <StaffPage />}
      {page === 'reports' && <ReportsPage />}

      {/* Approve modal */}
      <Modal open={actionModal?.type === 'approve'} onClose={() => setActionModal(null)} title="Approve Allocation" size="sm">
        {actionModal && (() => {
          const r = app.requests.find((x) => x.id === actionModal.requestId);
          if (!r) return null;
          return (
            <div>
              <div className="rounded-xl bg-cream-50 p-4">
                <p className="font-display font-bold text-gray-800">{r.studentName}</p>
                <p className="text-xs text-gray-500">Room {r.roomNumber} · Bed {r.bedNumber} · {r.hostelName} · Floor {r.floor}</p>
              </div>
              <p className="mt-3 text-sm text-gray-600">Approving will assign this bed to the student and mark the request as approved.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setActionModal(null)} className="flex-1 rounded-xl bg-cream-100 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
                <button onClick={doApprove} className="flex-1 rounded-xl bg-mint-500 py-2.5 text-sm font-semibold text-white">Approve</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Reject modal */}
      <Modal open={actionModal?.type === 'reject'} onClose={() => setActionModal(null)} title="Reject Allocation" size="sm">
        {actionModal && (() => {
          const r = app.requests.find((x) => x.id === actionModal.requestId);
          if (!r) return null;
          return (
            <div>
              <div className="rounded-xl bg-cream-50 p-4">
                <p className="font-display font-bold text-gray-800">{r.studentName}</p>
                <p className="text-xs text-gray-500">Room {r.roomNumber} · Bed {r.bedNumber}</p>
              </div>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">Reason for rejection</span>
                <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className={inputCls} placeholder="e.g. Room fully occupied" />
              </label>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setActionModal(null)} className="flex-1 rounded-xl bg-cream-100 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
                <button onClick={doReject} className="flex-1 rounded-xl bg-peach-500 py-2.5 text-sm font-semibold text-white">Reject</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Complaint assign modal */}
      <Modal open={!!complaintModal} onClose={() => setComplaintModal(null)} title={`Complaint ${complaintModal?.complaintId}`} size="md">
        {complaintModal && (
          <div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <InfoTile label="Category" value={complaintModal.category} />
              <InfoTile label="Priority" value={complaintModal.priority} />
              <InfoTile label="Hostel" value={complaintModal.hostel} />
              <InfoTile label="Room" value={complaintModal.roomNumber} />
              <InfoTile label="Student" value={complaintModal.studentName} />
              <InfoTile label="Status" value={complaintModal.status} />
            </div>
            <div className="mt-3 rounded-xl bg-cream-50 p-3 text-sm text-gray-600">{complaintModal.description}</div>
            {complaintModal.completionRemarks && (
              <div className="mt-3 rounded-xl bg-mint-50 p-3 text-sm text-mint-700">{complaintModal.completionRemarks}</div>
            )}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500">Status Timeline</p>
              <div className="mt-2 space-y-2">
                {complaintModal.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-mint-500" />
                    <div>
                      <p className="text-xs font-semibold capitalize text-gray-700">{t.status.replace('-', ' ')}</p>
                      <p className="text-[10px] text-gray-400">{new Date(t.at).toLocaleString('en-IN')}</p>
                      {t.note && <p className="text-[11px] text-gray-500">{t.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {complaintModal.status !== 'resolved' && (
              <div className="mt-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">Assign Maintenance Staff</span>
                  <select value={assignStaffId} onChange={(e) => setAssignStaffId(e.target.value)} className={inputCls}>
                    <option value="">Select staff…</option>
                    {app.staff.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.specialty}</option>)}
                  </select>
                </label>
                <button onClick={doAssign} disabled={!assignStaffId} className="mt-3 w-full rounded-xl bg-mint-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {complaintModal.assignedStaffId ? 'Reassign Staff' : 'Assign Staff'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-mint-500 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </motion.div>
      )}
    </DashboardShell>
  );
}

const titles: Record<Page, string> = {
  dashboard: 'Warden Dashboard', structure: 'Hostel Structure', rooms: 'Room Management',
  allocation: 'Student Allocation', requests: 'Allocation Requests', complaints: 'Complaint Management',
  staff: 'Maintenance Staff', reports: 'Reports',
};
const subs: Record<Page, string> = {
  dashboard: 'Hostel overview and quick actions', structure: '3D hostel building with floor-wise structure',
  rooms: 'Floor-wise room capacities and occupancy', allocation: 'All student allocations at a glance',
  requests: 'Review and approve room requests', complaints: 'View, filter and assign complaints to staff',
  staff: 'Maintenance team members', reports: 'Hostel analytics and insights',
};

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-50 p-3">
      <p className="text-[11px] font-medium text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-700">{value}</p>
    </div>
  );
}
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: 'bg-sky-100 text-sky-700', assigned: 'bg-peach-100 text-peach-500',
    'in-progress': 'bg-teal-100 text-teal-700', resolved: 'bg-mint-100 text-mint-700',
    pending: 'bg-peach-100 text-peach-500', approved: 'bg-mint-100 text-mint-700', rejected: 'bg-red-100 text-red-600',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${map[status] ?? 'bg-cream-100 text-gray-500'}`}>{status}</span>;
}

function StructurePage() {
  const app = useApp();
  const [floor, setFloor] = useState(1);
  return (
    <div className="space-y-4">
      <Hostel3D rooms={app.rooms} selectedFloor={floor} onSelectFloor={setFloor} height="440px" />
      <div className="grid gap-4 md:grid-cols-3">
        {HOSTELS.map((h) => {
          const hRooms = app.rooms.filter((r) => r.hostelId === h.id);
          return (
            <div key={h.id} className="glass-card rounded-2xl p-5">
              <p className="font-display font-bold text-gray-800">{h.name}</p>
              <p className="text-xs text-gray-400">{h.gender} · {h.floors} floors · {hRooms.length} rooms</p>
              <p className="mt-2 text-xs text-gray-500">Warden: {h.warden}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoomsPage() {
  const app = useApp();
  const [floor, setFloor] = useState(1);
  const floorRooms = app.rooms.filter((r) => r.floor === floor);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((f) => (
          <button key={f} onClick={() => setFloor(f)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${floor === f ? 'bg-mint-500 text-white' : 'bg-cream-100 text-mint-700'}`}>
            Floor {f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-xs text-gray-400">
              <th className="py-2 pr-4">Room</th><th className="py-2 pr-4">Hostel</th><th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Capacity</th><th className="py-2 pr-4">Occupied</th><th className="py-2 pr-4">Available</th>
              <th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Allocated Students</th>
            </tr>
          </thead>
          <tbody>
            {floorRooms.map((r) => {
              const occ = r.beds.filter((b) => b.occupied).length;
              const status = roomStatus(r);
              const occupants = r.beds.filter((b) => b.occupied).map((b) => app.students.find((s) => s.id === b.occupantId)).filter(Boolean);
              return (
                <tr key={r.id} className="border-b border-cream-100">
                  <td className="py-3 pr-4 font-bold text-gray-800">{r.number}</td>
                  <td className="py-3 pr-4 text-gray-600">{r.hostelName}</td>
                  <td className="py-3 pr-4 text-gray-600">{r.type}</td>
                  <td className="py-3 pr-4 text-gray-600">{r.capacity}</td>
                  <td className="py-3 pr-4 text-gray-600">{occ}</td>
                  <td className="py-3 pr-4 text-gray-600">{r.capacity - occ}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status === 'available' ? 'bg-mint-100 text-mint-700' : status === 'partial' ? 'bg-peach-100 text-peach-500' : 'bg-peach-100 text-peach-500'}`}>
                      {status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-500">
                    {occupants.length ? occupants.map((o) => o?.name).join(', ') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllocationPage() {
  const app = useApp();
  const allocated = app.students.filter((s) => s.allocationStatus === 'approved' && s.roomNumber);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allocated.map((s) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <img src={s.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-800">{s.name}</p>
              <p className="text-xs text-gray-400">{s.srn}</p>
            </div>
            <span className="ml-auto rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-mint-700">Allocated</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <InfoTile label="Branch" value={s.branch} />
            <InfoTile label="Year" value={`Year ${s.year}`} />
            <InfoTile label="Hostel" value={HOSTELS.find((h) => h.id === s.hostelId)?.name ?? '—'} />
            <InfoTile label="Room / Bed" value={`${s.roomNumber} / Bed ${s.bedNumber}`} />
          </div>
        </motion.div>
      ))}
      {allocated.length === 0 && <div className="glass-card col-span-full rounded-2xl p-10 text-center text-gray-400">No students allocated yet.</div>}
    </div>
  );
}

function RequestsPage({ requests, onApprove, onReject }: { requests: import('@/types').AllocationRequest[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  if (requests.length === 0) {
    return <div className="glass-card rounded-2xl p-10 text-center"><FileText size={40} className="mx-auto text-mint-200" /><p className="mt-3 font-display font-bold text-gray-700">No Requests</p></div>;
  }
  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-gray-800">{r.studentName}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-xs text-gray-500">Room {r.roomNumber} · Bed {r.bedNumber} · {r.hostelName} · Floor {r.floor}</p>
              <p className="mt-1 text-[11px] text-gray-400">Requested: {new Date(r.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              {r.reason && <p className="mt-1 text-xs text-peach-500">Rejection reason: {r.reason}</p>}
            </div>
            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => onApprove(r.id)} className="flex items-center gap-1.5 rounded-xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white">
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button onClick={() => onReject(r.id)} className="flex items-center gap-1.5 rounded-xl bg-peach-100 px-4 py-2 text-sm font-semibold text-peach-500">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
            {r.status === 'approved' && <div className="flex items-center gap-1.5 text-xs font-semibold text-mint-600"><CheckCircle2 size={16} /> Approved</div>}
            {r.status === 'rejected' && <div className="flex items-center gap-1.5 text-xs font-semibold text-peach-500"><XCircle size={16} /> Rejected</div>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function WardenComplaintsPage({ complaints, filters, setFilters, onOpen }: { complaints: Complaint[]; filters: Record<string, string>; setFilters: (f: Record<string, string>) => void; onOpen: (c: Complaint) => void }) {
  const set = (k: string, v: string) => setFilters({ ...filters, [k]: v });
  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-wrap items-end gap-3 rounded-2xl p-4">
        <Filter size={16} className="text-mint-600" />
        <Select label="Priority" value={filters.priority} onChange={(v) => set('priority', v)} options={[{ v: '', l: 'All' }, { v: 'High', l: 'High' }, { v: 'Medium', l: 'Medium' }, { v: 'Low', l: 'Low' }]} />
        <Select label="Status" value={filters.status} onChange={(v) => set('status', v)} options={[{ v: '', l: 'All' }, { v: 'submitted', l: 'Submitted' }, { v: 'assigned', l: 'Assigned' }, { v: 'in-progress', l: 'In Progress' }, { v: 'resolved', l: 'Resolved' }]} />
        <Select label="Hostel" value={filters.hostel} onChange={(v) => set('hostel', v)} options={[{ v: '', l: 'All' }, ...HOSTELS.map((h) => ({ v: h.name, l: h.name }))]} />
        <input className={inputCls + ' w-28'} placeholder="Room" value={filters.room} onChange={(e) => set('room', e.target.value)} />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {complaints.length === 0 ? (
          <div className="glass-card col-span-full rounded-2xl p-10 text-center text-gray-400">No complaints match these filters.</div>
        ) : complaints.map((c) => (
          <button key={c.id} onClick={() => onOpen(c)} className="glass-card rounded-2xl p-5 text-left transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-gray-800">{c.complaintId}</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-1 text-xs text-gray-500">{c.category} · Room {c.roomNumber} · {c.hostel}</p>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{c.description}</p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
              <span>Priority: <span className={`font-semibold ${c.priority === 'High' ? 'text-peach-500' : c.priority === 'Medium' ? 'text-sky-600' : 'text-gray-500'}`}>{c.priority}</span></span>
              <span>Student: {c.studentName}</span>
              <span>{c.assignedStaffName ? `Staff: ${c.assignedStaffName}` : 'Unassigned'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StaffPage() {
  const app = useApp();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {app.staff.map((s) => {
        const assigned = app.complaints.filter((c) => c.assignedStaffId === s.id && c.status !== 'resolved').length;
        const completed = app.complaints.filter((c) => c.assignedStaffId === s.id && c.status === 'resolved').length;
        return (
          <div key={s.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <img src={s.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-400">{s.srn}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
              <InfoTile label="Specialty" value={s.specialty} />
              <InfoTile label="Email" value={s.email} />
            </div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-lg bg-peach-100 px-2.5 py-1 text-[11px] font-semibold text-peach-500">{assigned} active</span>
              <span className="rounded-lg bg-mint-100 px-2.5 py-1 text-[11px] font-semibold text-mint-700">{completed} done</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsPage() {
  const app = useApp();
  const totalBeds = app.rooms.reduce((a, r) => a + r.capacity, 0);
  const occBeds = app.rooms.reduce((a, r) => a + r.beds.filter((b) => b.occupied).length, 0);
  const occPct = Math.round((occBeds / totalBeds) * 100);
  const byCategory: Record<string, number> = {};
  app.complaints.forEach((c) => { byCategory[c.category] = (byCategory[c.category] ?? 0) + 1; });
  const byStatus: Record<string, number> = {};
  app.complaints.forEach((c) => { byStatus[c.status] = (byStatus[c.status] ?? 0) + 1; });
  const totalRevenue = app.students.filter((s) => s.paymentStatus === 'paid').length * 55000;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-gray-800">Occupancy Rate</h3>
        <p className="mt-3 font-display text-4xl font-bold text-mint-600">{occPct}%</p>
        <p className="text-sm text-gray-500">{occBeds} of {totalBeds} beds occupied</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream-200">
          <div className="h-full rounded-full bg-gradient-to-r from-mint-400 to-teal-500" style={{ width: `${occPct}%` }} />
        </div>
      </div>
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-gray-800">Fee Collection</h3>
        <p className="mt-3 font-display text-4xl font-bold text-teal-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
        <p className="text-sm text-gray-500">{app.students.filter((s) => s.paymentStatus === 'paid').length} students paid</p>
      </div>
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-gray-800">Complaints by Category</h3>
        <div className="mt-3 space-y-2">
          {Object.entries(byCategory).map(([cat, n]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{cat}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-cream-200">
                  <div className="h-full rounded-full bg-peach-400" style={{ width: `${(n / app.complaints.length) * 100}%` }} />
                </div>
                <span className="font-semibold text-gray-700">{n}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-gray-800">Complaints by Status</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.entries(byStatus).map(([st, n]) => (
            <div key={st} className="rounded-xl bg-cream-50 p-3">
              <p className="font-display text-2xl font-bold text-gray-800">{n}</p>
              <p className="text-[11px] capitalize text-gray-400">{st.replace('-', ' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-mint-400 focus:bg-white focus:ring-2 focus:ring-mint-200';

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-gray-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
