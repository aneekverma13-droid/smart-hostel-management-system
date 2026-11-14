import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, Wrench, History, User,
  CheckCircle2, Clock, Play, PauseCircle, AlertCircle, Building,
} from 'lucide-react';
import { useApp } from '@/store';
import DashboardShell from '@/components/DashboardShell';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import type { Complaint, ComplaintStatus } from '@/types';

type Page = 'dashboard' | 'tasks' | 'details' | 'history' | 'profile';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Assigned Tasks', icon: ClipboardList },
  { id: 'details', label: 'Complaint Details', icon: Wrench },
  { id: 'history', label: 'Work History', icon: History },
  { id: 'profile', label: 'Profile', icon: User },
];

interface Props {
  onLogout: () => void;
  onHome: () => void;
}

export default function MaintenanceDashboard({ onLogout, onHome }: Props) {
  const app = useApp();
  const [page, setPage] = useState<Page>('dashboard');
  const [toast, setToast] = useState<string | null>(null);
  const [active, setActive] = useState<Complaint | null>(null);
  const [remarks, setRemarks] = useState('');
  const [completeModal, setCompleteModal] = useState<Complaint | null>(null);

  const staffId = app.user?.staffRefId ?? app.staff[0].id;
  const myTasks = app.complaints.filter((c) => c.assignedStaffId === staffId && c.status !== 'resolved');
  const myHistory = app.complaints.filter((c) => c.assignedStaffId === staffId && c.status === 'resolved');

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const updateStatus = async (c: Complaint, status: ComplaintStatus) => {
    try { await app.updateComplaintStatus(c.id, status, status === 'in-progress' ? 'Work started' : undefined); }
    catch (e) { notify((e as Error).message); setActive(null); return; }
    notify(`Task marked as ${status.replace('-', ' ')}`);
    setActive(null);
  };
  const complete = async () => {
    if (!completeModal) return;
    try { await app.completeComplaint(completeModal.id, remarks || 'Task completed successfully'); }
    catch (e) { notify((e as Error).message); setCompleteModal(null); return; }
    notify('Task completed — complaint resolved');
    setCompleteModal(null);
    setRemarks('');
  };

  const pending = myTasks.filter((t) => t.status === 'assigned').length;
  const inProgress = myTasks.filter((t) => t.status === 'in-progress').length;
  const completed = myHistory.length;

  return (
    <DashboardShell
      items={navItems}
      active={page}
      onSelect={(id) => setPage(id as Page)}
      title={titles[page]}
      subtitle={subs[page]}
      accentIcon={Wrench}
      onHome={onHome}
      user={{ name: app.user?.name ?? 'Staff', role: 'maintenance' }}
      onLogout={onLogout}
    >
      {page === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Assigned" value={myTasks.length + completed} icon={ClipboardList} color="mint" />
            <StatCard label="Pending" value={pending} icon={Clock} color="peach" />
            <StatCard label="In Progress" value={inProgress} icon={Play} color="teal" />
            <StatCard label="Completed" value={completed} icon={CheckCircle2} color="mint" />
          </div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
            <h3 className="font-display font-bold text-gray-800">Active Tasks</h3>
            {myTasks.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No active tasks. Great job!</p>
            ) : (
              <div className="mt-3 space-y-2">
                {myTasks.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl bg-cream-50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{t.complaintId} · {t.category}</p>
                      <p className="text-[11px] text-gray-400">Room {t.roomNumber} · {t.hostel}</p>
                    </div>
                    <button onClick={() => { setActive(t); setPage('details'); }} className="rounded-lg bg-mint-500 px-3 py-1.5 text-xs font-semibold text-white">Open</button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {page === 'tasks' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {myTasks.length === 0 ? (
            <div className="glass-card col-span-full rounded-2xl p-10 text-center">
              <ClipboardList size={40} className="mx-auto text-mint-200" />
              <p className="mt-3 font-display font-bold text-gray-700">No Active Tasks</p>
              <p className="text-sm text-gray-500">All your assigned tasks are completed.</p>
            </div>
          ) : myTasks.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-gray-800">{t.complaintId}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{t.category} · Room {t.roomNumber} · {t.hostel} · Floor {t.floor}</p>
              <p className="mt-2 text-sm text-gray-600">{t.description}</p>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
                <span>Priority: <span className={`font-semibold ${t.priority === 'High' ? 'text-peach-500' : t.priority === 'Medium' ? 'text-sky-600' : 'text-gray-500'}`}>{t.priority}</span></span>
                <span>Student: {t.studentName}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.status === 'assigned' && (
                  <button onClick={() => updateStatus(t, 'in-progress')} className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-3 py-2 text-xs font-semibold text-white">
                    <Play size={14} /> Start Work
                  </button>
                )}
                {t.status === 'in-progress' && (
                  <button onClick={() => setCompleteModal(t)} className="flex items-center gap-1.5 rounded-xl bg-mint-500 px-3 py-2 text-xs font-semibold text-white">
                    <CheckCircle2 size={14} /> Mark Completed
                  </button>
                )}
                <button onClick={() => { setActive(t); setPage('details'); }} className="rounded-xl bg-cream-100 px-3 py-2 text-xs font-semibold text-mint-700">View Details</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {page === 'details' && (
        active ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-card rounded-2xl p-5 lg:col-span-2">
              <h3 className="font-display text-lg font-bold text-gray-800">{active.complaintId} · {active.category}</h3>
              <p className="text-xs text-gray-500">{active.hostel} · Floor {active.floor} · Room {active.roomNumber}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <InfoTile label="Priority" value={active.priority} />
                <InfoTile label="Status" value={active.status} />
                <InfoTile label="Student" value={active.studentName} />
                <InfoTile label="SRN" value={active.studentSrn} />
                <InfoTile label="Submitted" value={new Date(active.submittedAt).toLocaleDateString('en-IN')} />
                <InfoTile label="Assigned" value={active.assignedStaffName ?? '—'} />
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500">Problem Description</p>
                <p className="mt-1 rounded-xl bg-cream-50 p-3 text-sm text-gray-600">{active.description}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.status === 'assigned' && <button onClick={() => updateStatus(active, 'in-progress')} className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white"><Play size={16} /> Start Work</button>}
                {active.status === 'in-progress' && <button onClick={() => setCompleteModal(active)} className="flex items-center gap-1.5 rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white"><CheckCircle2 size={16} /> Mark Completed</button>}
                <button onClick={() => setPage('tasks')} className="rounded-xl bg-cream-100 px-4 py-2.5 text-sm font-semibold text-mint-700">Back to Tasks</button>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-gray-800">Status Timeline</h3>
              <div className="mt-3 space-y-3">
                {active.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ${t.status === 'resolved' ? 'bg-mint-500' : t.status === 'in-progress' ? 'bg-teal-500' : 'bg-peach-400'}`} />
                    <div>
                      <p className="text-xs font-semibold capitalize text-gray-700">{t.status.replace('-', ' ')}</p>
                      <p className="text-[10px] text-gray-400">{new Date(t.at).toLocaleString('en-IN')}</p>
                      {t.note && <p className="text-[11px] text-gray-500">{t.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Wrench size={40} className="mx-auto text-mint-200" />
            <p className="mt-3 font-display font-bold text-gray-700">Select a task</p>
            <button onClick={() => setPage('tasks')} className="mt-3 rounded-xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white">Go to Tasks</button>
          </div>
        )
      )}

      {page === 'history' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {myHistory.length === 0 ? (
            <div className="glass-card col-span-full rounded-2xl p-10 text-center">
              <History size={40} className="mx-auto text-mint-200" />
              <p className="mt-3 font-display font-bold text-gray-700">No Completed Work Yet</p>
              <p className="text-sm text-gray-500">Your completed tasks will appear here.</p>
            </div>
          ) : myHistory.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-gray-800">{t.complaintId}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{t.category} · Room {t.roomNumber} · {t.hostel}</p>
              <p className="mt-2 text-sm text-gray-600">{t.description}</p>
              {t.completionRemarks && <div className="mt-2 rounded-xl bg-mint-50 p-3 text-xs text-mint-700">{t.completionRemarks}</div>}
              <p className="mt-2 text-[11px] text-gray-400">Resolved: {new Date(t.timeline[t.timeline.length - 1]?.at ?? t.submittedAt).toLocaleDateString('en-IN')}</p>
            </motion.div>
          ))}
        </div>
      )}

      {page === 'profile' && (() => {
        const s = app.staff.find((st) => st.id === staffId) ?? app.staff[0];
        return (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-card rounded-2xl p-6 text-center">
              <img src={s.avatar} alt="" className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg" />
              <p className="mt-3 font-display text-lg font-bold text-gray-800">{s.name}</p>
              <p className="text-sm text-gray-500">{s.srn}</p>
              <span className="mt-2 inline-block rounded-full bg-peach-100 px-3 py-1 text-xs font-semibold text-peach-500">Maintenance Staff</span>
            </div>
            <div className="glass-card rounded-2xl p-6 lg:col-span-2">
              <h3 className="font-display font-bold text-gray-800">Staff Information</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoTile label="Email" value={s.email} />
                <InfoTile label="Specialty" value={s.specialty} />
                <InfoTile label="Active Tasks" value={`${pending + inProgress}`} />
                <InfoTile label="Completed" value={`${completed}`} />
              </div>
            </div>
          </div>
        );
      })()}

      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Task" size="sm">
        {completeModal && (
          <div>
            <p className="text-sm text-gray-600">Mark complaint <span className="font-bold text-gray-800">{completeModal.complaintId}</span> as resolved?</p>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-600">Completion Remarks</span>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className={inputCls} placeholder="Describe what was done…" />
            </label>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setCompleteModal(null)} className="flex-1 rounded-xl bg-cream-100 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={complete} className="flex-1 rounded-xl bg-mint-500 py-2.5 text-sm font-semibold text-white">Mark Resolved</button>
            </div>
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
  dashboard: 'Maintenance Dashboard', tasks: 'Assigned Tasks', details: 'Complaint Details', history: 'Work History', profile: 'My Profile',
};
const subs: Record<Page, string> = {
  dashboard: 'Your task summary at a glance', tasks: 'All maintenance tasks assigned to you',
  details: 'Full complaint details and actions', history: 'Your completed work history', profile: 'Your staff profile',
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
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${map[status] ?? 'bg-cream-100 text-gray-500'}`}>{status.replace('-', ' ')}</span>;
}
const inputCls = 'w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-mint-400 focus:bg-white focus:ring-2 focus:ring-mint-200';
