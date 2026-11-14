import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building, Search, BedDouble, FileText, CreditCard,
  Wrench, User, LogOut, DoorOpen, Bed, AlertCircle, CheckCircle2, Clock,
  Wifi, Snowflake, Users, Star, ArrowRight, X, IndianRupee,
} from 'lucide-react';
import { useApp } from '@/store';
import DashboardShell from '@/components/DashboardShell';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import Hostel3D from '@/components/Hostel3D';
import { roomStatus, HOSTELS } from '@/data';
import type { Room, ComplaintCategory, Priority, PaymentMethod } from '@/types';

type Page = 'dashboard' | 'explore' | 'search' | 'myroom' | 'requests' | 'payment' | 'complaints' | 'profile';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explore', label: 'Explore Hostel', icon: Building },
  { id: 'search', label: 'Search Rooms', icon: Search },
  { id: 'myroom', label: 'My Room', icon: BedDouble },
  { id: 'requests', label: 'Allocation Requests', icon: FileText },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'complaints', label: 'Complaints', icon: Wrench },
  { id: 'profile', label: 'Profile', icon: User },
];

interface Props {
  onLogout: () => void;
  onHome: () => void;
}

export default function StudentDashboard({ onLogout, onHome }: Props) {
  const app = useApp();
  const [page, setPage] = useState<Page>('dashboard');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  if (!app.currentStudent) return null;
  const s = app.currentStudent;

  const notify = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const myRequests = app.requests.filter((r) => r.studentId === s.id);
  const myComplaints = app.complaints.filter((c) => c.studentId === s.id);
  const myPayment = app.payments.find((p) => p.studentId === s.id);

  const availableRooms = app.rooms.filter((r) => roomStatus(r) !== 'occupied').length;
  const availableBeds = app.rooms.reduce((a, r) => a + r.beds.filter((b) => !b.occupied).length, 0);
  const pendingComplaints = myComplaints.filter((c) => c.status !== 'resolved').length;

  return (
    <DashboardShell
      items={navItems}
      active={page}
      onSelect={(id) => setPage(id as Page)}
      title={pageTitles[page]}
      subtitle={pageSubs[page]}
      accentIcon={Building}
      onHome={onHome}
      user={{ name: s.name, role: 'student' }}
      onLogout={onLogout}
    >
      {page === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Available Rooms" value={availableRooms} icon={DoorOpen} color="mint" />
            <StatCard label="Available Beds" value={availableBeds} icon={Bed} color="teal" />
            <StatCard
              label="My Allocation"
              value={s.allocationStatus === 'approved' ? 'Approved' : s.allocationStatus === 'pending' ? 'Pending' : 'None'}
              icon={FileText}
              color={s.allocationStatus === 'approved' ? 'mint' : s.allocationStatus === 'pending' ? 'peach' : 'sky'}
            />
            <StatCard label="Pending Complaints" value={pendingComplaints} icon={AlertCircle} color="peach" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 lg:col-span-2">
              <h3 className="font-display font-bold text-gray-800">Welcome, {s.name.split(' ')[0]}!</h3>
              <p className="mt-1 text-sm text-gray-500">Here's your hostel summary at a glance.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoTile label="Room Number" value={s.roomNumber ?? 'Not allocated'} />
                <InfoTile label="Bed Number" value={s.bedNumber ? `Bed ${s.bedNumber}` : '—'} />
                <InfoTile label="Payment Status" value={s.paymentStatus === 'paid' ? 'Paid' : 'Pending'} />
                <InfoTile label="Branch / Year" value={`${s.branch} · Year ${s.year}`} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setPage('explore')} className="rounded-xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white">Explore Hostel</button>
                <button onClick={() => setPage('search')} className="rounded-xl bg-cream-100 px-4 py-2 text-sm font-semibold text-mint-700">Search Rooms</button>
                {s.allocationStatus === 'none' && <button onClick={() => setPage('search')} className="rounded-xl bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">Request Allocation</button>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-gray-800">Recent Complaints</h3>
              {myComplaints.length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">No complaints yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {myComplaints.slice(0, 3).map((c) => (
                    <div key={c.id} className="rounded-xl bg-cream-50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-mint-700">{c.complaintId}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-1 text-xs text-gray-600">{c.category} · Room {c.roomNumber}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setPage('complaints')} className="mt-3 w-full rounded-xl bg-cream-100 py-2 text-xs font-semibold text-mint-700">View all</button>
            </motion.div>
          </div>
        </div>
      )}

      {page === 'explore' && <ExplorePage studentId={s.id} onNotify={notify} goToSearch={() => setPage('search')} />}
      {page === 'search' && <SearchPage studentId={s.id} onNotify={notify} />}
      {page === 'myroom' && <MyRoomPage student={s} />}
      {page === 'requests' && <RequestsPage requests={myRequests} />}
      {page === 'payment' && <PaymentPage student={s} payment={myPayment} onNotify={notify} />}
      {page === 'complaints' && <ComplaintsPage studentId={s.id} studentName={s.name} complaints={myComplaints} onNotify={notify} />}
      {page === 'profile' && <ProfilePage student={s} />}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 shadow-2xl ${toast.ok ? 'bg-mint-500 text-white' : 'bg-peach-500 text-white'}`}
        >
          <span className="text-sm font-semibold">{toast.msg}</span>
        </motion.div>
      )}
    </DashboardShell>
  );
}

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  explore: 'Explore Hostel in 3D',
  search: 'Search Rooms',
  myroom: 'My Room',
  requests: 'Allocation Requests',
  payment: 'Payment',
  complaints: 'Complaints',
  profile: 'My Profile',
};
const pageSubs: Record<Page, string> = {
  dashboard: 'Your hostel overview at a glance',
  explore: 'Rotate, zoom, and click rooms to explore',
  search: 'Find your ideal room with smart preference matching',
  myroom: 'Your allocated room details and roommates',
  requests: 'Track your room allocation requests',
  payment: 'Pay your hostel fees and view receipts',
  complaints: 'Raise and track maintenance complaints',
  profile: 'Your personal and academic information',
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
    submitted: 'bg-sky-100 text-sky-700',
    assigned: 'bg-peach-100 text-peach-500',
    'in-progress': 'bg-teal-100 text-teal-700',
    resolved: 'bg-mint-100 text-mint-700',
    pending: 'bg-peach-100 text-peach-500',
    approved: 'bg-mint-100 text-mint-700',
    rejected: 'bg-red-100 text-red-600',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${map[status] ?? 'bg-cream-100 text-gray-500'}`}>{status}</span>;
}

// ===== Explore Page =====
function ExplorePage({ studentId, onNotify, goToSearch }: { studentId: string; onNotify: (m: string, ok?: boolean) => void; goToSearch: () => void }) {
  const app = useApp();
  const [floor, setFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [allocBed, setAllocBed] = useState<number | null>(null);

  const floorRooms = app.rooms.filter((r) => r.floor === floor);
  const myRequests = app.requests.filter((r) => r.studentId === studentId);

  const requestAlloc = async () => {
    if (!selectedRoom || allocBed === null) return;
    try {
      await app.requestAllocation(studentId, selectedRoom, allocBed);
    } catch (e) { onNotify((e as Error).message, false); setSelectedRoom(null); setAllocBed(null); return; }
    onNotify(`Allocation request submitted for Room ${selectedRoom.number}, Bed ${allocBed}`);
    setSelectedRoom(null);
    setAllocBed(null);
  };

  return (
    <div className="space-y-4">
      <Hostel3D
        rooms={app.rooms}
        selectedFloor={floor}
        onSelectFloor={setFloor}
        selectedRoomId={selectedRoom?.id}
        onSelectRoom={(r) => { setSelectedRoom(r); setAllocBed(null); }}
        height="440px"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-gray-800">Floor {floor} Rooms</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {floorRooms.map((r) => {
              const status = roomStatus(r);
              const occ = r.beds.filter((b) => b.occupied).length;
              return (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRoom(r); setAllocBed(null); }}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    selectedRoom?.id === r.id ? 'border-mint-400 bg-mint-50' : 'border-cream-200 bg-white hover:border-mint-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-gray-800">Room {r.number}</p>
                    <span className={`h-2.5 w-2.5 rounded-full ${status === 'available' ? 'bg-mint-500' : status === 'partial' ? 'bg-peach-400' : 'bg-peach-500'}`} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{r.hostelName} · {r.capacity} beds · {r.ac ? 'AC' : 'Non-AC'}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Bed size={12} /> {occ}/{r.capacity} occupied</span>
                    <span className="flex items-center gap-1"><IndianRupee size={12} /> {r.fee.toLocaleString('en-IN')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          {selectedRoom ? (
            <>
              <h3 className="font-display font-bold text-gray-800">Room {selectedRoom.number}</h3>
              <p className="text-xs text-gray-500">{selectedRoom.hostelName} · Floor {selectedRoom.floor}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <InfoTile label="Type" value={selectedRoom.type} />
                <InfoTile label="Capacity" value={`${selectedRoom.capacity} beds`} />
                <InfoTile label="AC" value={selectedRoom.ac ? 'Yes' : 'No'} />
                <InfoTile label="Fee" value={`₹${selectedRoom.fee.toLocaleString('en-IN')}`} />
              </div>

              <p className="mt-4 text-xs font-semibold text-gray-600">Bed Availability</p>
              <div className="mt-2 space-y-2">
                {selectedRoom.beds.map((b) => {
                  const alreadyReq = myRequests.some((r) => r.roomId === selectedRoom.id && r.bedNumber === b.number && r.status !== 'rejected');
                  return (
                    <div key={b.id} className={`flex items-center justify-between rounded-xl border p-2.5 ${
                      b.occupied ? 'border-cream-200 bg-cream-50' : 'border-mint-200 bg-mint-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Bed size={16} className={b.occupied ? 'text-peach-500' : 'text-mint-600'} />
                        <div>
                          <p className="text-xs font-semibold text-gray-700">Bed {b.number}</p>
                          <p className="text-[10px] text-gray-400">{b.occupied ? 'Occupied' : 'Available'}</p>
                        </div>
                      </div>
                      {!b.occupied && (
                        <button
                          onClick={() => setAllocBed(b.number)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                            allocBed === b.number ? 'bg-mint-500 text-white' : 'bg-white text-mint-700 hover:bg-mint-100'
                          }`}
                        >
                          {allocBed === b.number ? 'Selected' : 'Select'}
                        </button>
                      )}
                      {alreadyReq && <span className="text-[10px] font-semibold text-peach-500">Requested</span>}
                    </div>
                  );
                })}
              </div>

              {allocBed !== null && (
                <button
                  onClick={requestAlloc}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-mint-500 to-teal-500 py-2.5 text-sm font-semibold text-white"
                >
                  Request Allocation · Bed {allocBed}
                </button>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <Building size={40} className="text-mint-200" />
              <p className="mt-3 text-sm text-gray-400">Click a room on the 3D building or the list to see details</p>
              <button onClick={goToSearch} className="mt-3 rounded-xl bg-cream-100 px-4 py-2 text-xs font-semibold text-mint-700">
                Or go to Room Search →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Search Page =====
function SearchPage({ studentId, onNotify }: { studentId: string; onNotify: (m: string, ok?: boolean) => void }) {
  const app = useApp();
  const [filters, setFilters] = useState({
    hostel: '', floor: '', type: '', capacity: 0, bedsNeeded: 1,
    branch: '', year: 0, minBudget: 0, maxBudget: 100000, ac: 'any',
    roommate: 'any',
  });
  const [searched, setSearched] = useState(false);
  const [allocModal, setAllocModal] = useState<{ room: Room; bed: number } | null>(null);

  const set = (k: keyof typeof filters, v: string | number) => setFilters((p) => ({ ...p, [k]: v }));

  const results = useMemo(() => {
    let list = app.rooms.slice();
    if (filters.hostel) list = list.filter((r) => r.hostelName === filters.hostel);
    if (filters.floor) list = list.filter((r) => r.floor === Number(filters.floor));
    if (filters.type) list = list.filter((r) => r.type === filters.type);
    if (filters.capacity) list = list.filter((r) => r.capacity === Number(filters.capacity));
    if (filters.bedsNeeded) {
      list = list.filter((r) => r.beds.filter((b) => !b.occupied).length >= Number(filters.bedsNeeded));
    }
    if (filters.branch) list = list.filter((r) => !r.branchPref || r.branchPref === filters.branch);
    if (filters.year) list = list.filter((r) => !r.yearPref || r.yearPref === Number(filters.year));
    list = list.filter((r) => r.fee >= Number(filters.minBudget) && r.fee <= Number(filters.maxBudget));
    if (filters.ac !== 'any') list = list.filter((r) => (filters.ac === 'ac' ? r.ac : !r.ac));

    // Rank
    return list.map((r) => {
      let score = 50;
      const reasons: string[] = [];
      const avail = r.beds.filter((b) => !b.occupied).length;
      if (avail === r.capacity) { score += 20; reasons.push('Fully available'); }
      if (r.ac && filters.ac === 'ac') { score += 10; reasons.push('AC as preferred'); }
      if (r.branchPref === filters.branch) { score += 10; reasons.push('Branch preference match'); }
      if (r.yearPref === Number(filters.year)) { score += 8; reasons.push('Year preference match'); }
      if (r.fee < (Number(filters.maxBudget) + Number(filters.minBudget)) / 2) { score += 6; reasons.push('Within budget sweet spot'); }
      if (avail >= Number(filters.bedsNeeded)) { score += 5; reasons.push(`${avail} beds available`); }
      return { room: r, score: Math.min(score, 100), reasons };
    }).sort((a, b) => b.score - a.score);
  }, [app.rooms, filters]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const doRequest = async () => {
    if (!allocModal) return;
    try {
      await app.requestAllocation(studentId, allocModal.room, allocModal.bed);
    } catch (e) { onNotify((e as Error).message, false); setAllocModal(null); return; }
    onNotify(`Allocation request submitted for Room ${allocModal.room.number}, Bed ${allocModal.bed}`);
    setAllocModal(null);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-gray-800">Search Filters</h3>
        <p className="text-xs text-gray-500">Mandatory criteria must be satisfied for a room to be shown as suitable.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="Preferred Hostel" value={filters.hostel} onChange={(v) => set('hostel', v)} options={[{ v: '', l: 'Any' }, ...HOSTELS.map((h) => ({ v: h.name, l: h.name }))]} />
          <SelectField label="Floor Preference" value={filters.floor} onChange={(v) => set('floor', v)} options={[{ v: '', l: 'Any' }, { v: '1', l: 'Floor 1' }, { v: '2', l: 'Floor 2' }, { v: '3', l: 'Floor 3' }, { v: '4', l: 'Floor 4' }]} />
          <SelectField label="Room Type" value={filters.type} onChange={(v) => set('type', v)} options={[{ v: '', l: 'Any' }, { v: 'Single', l: 'Single' }, { v: 'Double', l: 'Double' }, { v: 'Triple', l: 'Triple' }, { v: 'Quad', l: 'Quad' }]} />
          <SelectField label="Room Capacity" value={String(filters.capacity)} onChange={(v) => set('capacity', v)} options={[{ v: '0', l: 'Any' }, { v: '1', l: '1 bed' }, { v: '2', l: '2 beds' }, { v: '3', l: '3 beds' }, { v: '4', l: '4 beds' }]} />
          <SelectField label="Beds Required" value={String(filters.bedsNeeded)} onChange={(v) => set('bedsNeeded', v)} options={[{ v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }]} />
          <SelectField label="Preferred Branch" value={filters.branch} onChange={(v) => set('branch', v)} options={[{ v: '', l: 'Any' }, ...['CSE', 'ECE', 'ME', 'EEE', 'Civil', 'IT'].map((b) => ({ v: b, l: b }))]} />
          <SelectField label="Academic Year" value={String(filters.year)} onChange={(v) => set('year', v)} options={[{ v: '0', l: 'Any' }, { v: '1', l: 'Year 1' }, { v: '2', l: 'Year 2' }, { v: '3', l: 'Year 3' }, { v: '4', l: 'Year 4' }]} />
          <SelectField label="AC / Non-AC" value={filters.ac} onChange={(v) => set('ac', v)} options={[{ v: 'any', l: 'Any' }, { v: 'ac', l: 'AC' }, { v: 'nonac', l: 'Non-AC' }]} />
          <SelectField label="Roommate Preference" value={filters.roommate} onChange={(v) => set('roommate', v)} options={[{ v: 'any', l: 'Any' }, { v: 'same', l: 'Same branch' }, { v: 'quiet', l: 'Quiet study' }]} />
          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
            <NumField label="Min Budget" value={filters.minBudget} onChange={(v) => set('minBudget', v)} />
            <NumField label="Max Budget" value={filters.maxBudget} onChange={(v) => set('maxBudget', v)} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="rounded-xl bg-mint-500 px-5 py-2.5 text-sm font-semibold text-white">Search Rooms</button>
          <button type="button" onClick={() => { setFilters({ hostel: '', floor: '', type: '', capacity: 0, bedsNeeded: 1, branch: '', year: 0, minBudget: 0, maxBudget: 100000, ac: 'any', roommate: 'any' }); setSearched(false); }} className="rounded-xl bg-cream-100 px-5 py-2.5 text-sm font-semibold text-mint-700">Reset</button>
        </div>
      </form>

      {searched && (
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-600">{results.length} suitable room{results.length !== 1 ? 's' : ''} found</p>
          {results.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <AlertCircle size={40} className="mx-auto text-peach-400" />
              <p className="mt-3 font-display text-lg font-bold text-gray-700">No suitable rooms available</p>
              <p className="mt-1 text-sm text-gray-500">Try relaxing some filters like budget range or floor preference.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map(({ room, score, reasons }, i) => {
                const occ = room.beds.filter((b) => b.occupied).length;
                const avail = room.capacity - occ;
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display text-lg font-bold text-gray-800">Room {room.number}</p>
                          <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-mint-700">#{i + 1} Match</span>
                        </div>
                        <p className="text-xs text-gray-500">{room.hostelName} · Floor {room.floor} · {room.type} · {room.ac ? 'AC' : 'Non-AC'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-mint-600">{score}</p>
                        <p className="text-[10px] text-gray-400">match score</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                      <MiniMetric label="Capacity" value={`${room.capacity}`} />
                      <MiniMetric label="Available" value={`${avail}`} color="text-mint-600" />
                      <MiniMetric label="Occupied" value={`${occ}`} color="text-peach-500" />
                      <MiniMetric label="Fee" value={`₹${(room.fee / 1000).toFixed(0)}k`} />
                    </div>

                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-gray-500">Why this rank:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {reasons.map((r, k) => <span key={k} className="rounded-full bg-mint-50 px-2 py-0.5 text-[10px] font-medium text-mint-700">{r}</span>)}
                      </div>
                    </div>

                    {/* Roommates */}
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-gray-500">Current Roommates ({occ}):</p>
                      {occ === 0 ? (
                        <p className="mt-1 text-[11px] text-gray-400">No roommates yet — you'd be the first!</p>
                      ) : (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {room.beds.filter((b) => b.occupied).map((b, k) => {
                            const mate = app.students.find((st) => st.id === b.occupantId);
                            return mate ? (
                              <div key={k} className="flex items-center gap-1.5 rounded-lg bg-cream-50 px-2 py-1">
                                <img src={mate.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                                <div className="text-[10px]">
                                  <p className="font-semibold text-gray-700">{mate.name}</p>
                                  <p className="text-gray-400">{mate.branch} · Yr {mate.year}</p>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {avail > 0 ? (
                        <button
                          onClick={() => {
                            const firstFree = room.beds.find((b) => !b.occupied);
                            if (firstFree) setAllocModal({ room, bed: firstFree.number });
                          }}
                          className="flex-1 rounded-xl bg-gradient-to-r from-mint-500 to-teal-500 py-2.5 text-sm font-semibold text-white"
                        >
                          Request Allocation
                        </button>
                      ) : (
                        <span className="flex-1 rounded-xl bg-cream-100 py-2.5 text-center text-sm font-semibold text-gray-400">Fully Occupied</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal open={!!allocModal} onClose={() => setAllocModal(null)} title="Confirm Allocation Request" size="sm">
        {allocModal && (
          <div>
            <div className="rounded-xl bg-cream-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-gray-800">Room {allocModal.room.number}</p>
                <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-mint-700">Bed {allocModal.bed}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{allocModal.room.hostelName} · Floor {allocModal.room.floor} · {allocModal.room.type}</p>
              <p className="mt-2 font-display text-lg font-bold text-mint-600">₹{allocModal.room.fee.toLocaleString('en-IN')}<span className="text-xs text-gray-400">/year</span></p>
            </div>
            <div className="mt-4 rounded-xl bg-sky-50 p-3 text-xs text-sky-700">
              <p className="font-semibold">Request Status: Pending</p>
              <p className="mt-1">Your request will be reviewed by the warden. You'll see the status update in your Allocation Requests page.</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setAllocModal(null)} className="flex-1 rounded-xl bg-cream-100 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={doRequest} className="flex-1 rounded-xl bg-mint-500 py-2.5 text-sm font-semibold text-white">Submit Request</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ===== My Room Page =====
function MyRoomPage({ student }: { student: import('@/types').Student }) {
  const app = useApp();
  if (student.allocationStatus !== 'approved' || !student.roomNumber) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <BedDouble size={48} className="mx-auto text-mint-200" />
        <p className="mt-3 font-display text-lg font-bold text-gray-700">No Room Allocated Yet</p>
        <p className="mt-1 text-sm text-gray-500">Search for rooms and submit an allocation request to get started.</p>
      </div>
    );
  }
  const room = app.rooms.find((r) => r.number === student.roomNumber && r.hostelId === student.hostelId);
  const roommates = room?.beds.filter((b) => b.occupied && b.occupantId !== student.id).map((b) => app.students.find((s) => s.id === b.occupantId)).filter(Boolean) ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass-card rounded-2xl p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-gray-800">Room {student.roomNumber}</h3>
            <p className="text-sm text-gray-500">{room?.hostelName} · Floor {room?.floor} · {room?.type}</p>
          </div>
          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-mint-700">Allocated</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoTile label="Bed Number" value={`Bed ${student.bedNumber}`} />
          <InfoTile label="Capacity" value={`${room?.capacity} beds`} />
          <InfoTile label="AC" value={room?.ac ? 'Yes' : 'No'} />
          <InfoTile label="Fee" value={`₹${room?.fee.toLocaleString('en-In')}`} />
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500">Beds in your room:</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {room?.beds.map((b) => {
              const mate = b.occupantId && b.occupantId !== student.id ? app.students.find((s) => s.id === b.occupantId) : null;
              const isMe = b.occupantId === student.id;
              return (
                <div key={b.id} className={`flex items-center gap-3 rounded-xl border p-3 ${isMe ? 'border-mint-300 bg-mint-50' : b.occupied ? 'border-cream-200 bg-cream-50' : 'border-mint-200 bg-white'}`}>
                  <Bed size={18} className={b.occupied ? 'text-peach-500' : 'text-mint-600'} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700">Bed {b.number} {isMe && '(You)'}</p>
                    <p className="text-[10px] text-gray-400">{b.occupied ? (isMe ? 'Your bed' : mate?.name ?? 'Occupied') : 'Empty'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-bold text-gray-800">Your Roommates</h3>
        {roommates.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">You're the only one in this room so far!</p>
        ) : (
          <div className="mt-3 space-y-3">
            {roommates.map((m) => m && (
              <div key={m.id} className="flex items-center gap-3 rounded-xl bg-cream-50 p-3">
                <img src={m.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{m.name}</p>
                  <p className="text-[11px] text-gray-400">{m.branch} · Year {m.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Requests Page =====
function RequestsPage({ requests }: { requests: import('@/types').AllocationRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <FileText size={48} className="mx-auto text-mint-200" />
        <p className="mt-3 font-display text-lg font-bold text-gray-700">No Allocation Requests</p>
        <p className="mt-1 text-sm text-gray-500">Your allocation requests will appear here.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-gray-800">Room {r.roomNumber}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-xs text-gray-500">{r.hostelName} · Floor {r.floor} · Bed {r.bedNumber}</p>
              <p className="mt-1 text-[11px] text-gray-400">Requested on {new Date(r.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              {r.reason && <p className="mt-1 text-xs text-peach-500">Reason: {r.reason}</p>}
            </div>
            {r.status === 'approved' && (
              <div className="rounded-xl bg-mint-50 p-3 text-xs text-mint-700">
                <CheckCircle2 size={16} className="mb-1" />
                Approved! Visit the Payment page to pay your fees.
              </div>
            )}
            {r.status === 'pending' && (
              <div className="rounded-xl bg-peach-100 p-3 text-xs text-peach-500">
                <Clock size={16} className="mb-1" />
                Awaiting warden approval
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ===== Payment Page =====
function PaymentPage({ student, payment, onNotify }: { student: import('@/types').Student; payment?: import('@/types').Payment; onNotify: (m: string, ok?: boolean) => void }) {
  const app = useApp();
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [modal, setModal] = useState(false);

  if (student.allocationStatus !== 'approved') {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <CreditCard size={48} className="mx-auto text-mint-200" />
        <p className="mt-3 font-display text-lg font-bold text-gray-700">No Approved Allocation</p>
        <p className="mt-1 text-sm text-gray-500">Payment is available after your room allocation is approved by the warden.</p>
      </div>
    );
  }

  const room = app.rooms.find((r) => r.number === student.roomNumber);
  const fee = room?.fee ?? 55000;
  const isPaid = student.paymentStatus === 'paid' || payment?.status === 'paid';

  const pay = () => {
    setPaying(true);
    setTimeout(async () => {
      try {
        await app.makePayment(student.id, method);
        setDone(true);
      } catch { /* real state is reloaded from the server */ }
      setPaying(false);
    }, 1400);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass-card rounded-2xl p-6 lg:col-span-2">
        <h3 className="font-display font-bold text-gray-800">Room Fee Details</h3>
        <div className="mt-4 space-y-2">
          <FeeRow label="Room Number" value={student.roomNumber ?? '—'} />
          <FeeRow label="Hostel" value={room?.hostelName ?? '—'} />
          <FeeRow label="Room Type" value={room?.type ?? '—'} />
          <FeeRow label="AC / Non-AC" value={room?.ac ? 'AC' : 'Non-AC'} />
          <div className="my-3 border-t border-cream-200" />
          <FeeRow label="Base Fee" value={`₹${(fee - (room?.ac ? 12000 : 0)).toLocaleString('en-IN')}`} />
          {room?.ac && <FeeRow label="AC Charges" value={`₹12,000`} />}
          <div className="flex items-center justify-between pt-2">
            <p className="font-display text-lg font-bold text-gray-800">Total</p>
            <p className="font-display text-2xl font-bold text-mint-600">₹{fee.toLocaleString('en-IN')}</p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-xs text-gray-500">Payment Status:</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isPaid ? 'bg-mint-100 text-mint-700' : 'bg-peach-100 text-peach-500'}`}>
              {isPaid ? 'PAID' : 'PENDING'}
            </span>
          </div>
        </div>

        {!isPaid && (
          <>
            <p className="mt-5 text-xs font-semibold text-gray-600">Select Payment Method</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['UPI', 'Debit Card', 'Credit Card'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-xl border-2 px-3 py-3 text-xs font-semibold transition ${
                    method === m ? 'border-mint-400 bg-mint-50 text-mint-700' : 'border-cream-200 bg-white text-gray-500 hover:border-mint-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModal(true)}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-mint-500 to-teal-500 py-3 font-semibold text-white shadow-lg"
            >
              Pay ₹{fee.toLocaleString('en-IN')}
            </button>
          </>
        )}

        {isPaid && payment && (
          <div className="mt-5 rounded-xl border-2 border-mint-200 bg-mint-50 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-mint-600" size={20} />
              <p className="font-display font-bold text-mint-700">Payment Successful</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <FeeRow label="Receipt No" value={payment.receiptNo ?? '—'} />
              <FeeRow label="Date" value={payment.date ?? '—'} />
              <FeeRow label="Method" value={payment.method ?? '—'} />
              <FeeRow label="Amount" value={`₹${payment.amount.toLocaleString('en-IN')}`} />
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-bold text-gray-800">Sample Receipt</h3>
        {isPaid && payment ? (
          <div className="mt-3 rounded-xl border border-dashed border-mint-300 bg-white p-4">
            <div className="text-center">
              <p className="font-display text-sm font-bold text-mint-700">Smart Hostel System</p>
              <p className="text-[10px] text-gray-400">Fee Payment Receipt</p>
            </div>
            <div className="my-3 border-t border-dashed border-cream-200" />
            <ReceiptRow label="Receipt" value={payment.receiptNo ?? ''} />
            <ReceiptRow label="Student" value={student.name} />
            <ReceiptRow label="SRN" value={student.srn} />
            <ReceiptRow label="Room" value={payment.roomNumber} />
            <ReceiptRow label="Hostel" value={payment.hostelName} />
            <ReceiptRow label="Method" value={payment.method ?? ''} />
            <ReceiptRow label="Date" value={payment.date ?? ''} />
            <div className="my-3 border-t border-dashed border-cream-200" />
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-600">Amount Paid</span>
              <span className="font-display text-lg font-bold text-mint-600">₹{payment.amount.toLocaleString('en-IN')}</span>
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-400">This is a computer-generated receipt for demo purposes.</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-400">Your receipt will appear here after payment.</p>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Demo Payment" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">You are about to pay <span className="font-bold text-mint-700">₹{fee.toLocaleString('en-IN')}</span> via {method}.</p>
          <div className="rounded-xl bg-cream-50 p-3 text-xs text-gray-500">
            This is a mock payment. No real transaction will occur. No payment gateway is connected.
          </div>
          {method === 'UPI' && <input className={inputCls} placeholder="yourname@upi" defaultValue="arjun.sharma@okhdfc" />}
          {method === 'Debit Card' && (
            <div className="space-y-2">
              <input className={inputCls} placeholder="Card number" defaultValue="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="MM/YY" defaultValue="12/28" />
                <input className={inputCls} placeholder="CVV" defaultValue="123" />
              </div>
            </div>
          )}
          {method === 'Credit Card' && (
            <div className="space-y-2">
              <input className={inputCls} placeholder="Card number" defaultValue="5555 5555 5555 4444" />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="MM/YY" defaultValue="11/27" />
                <input className={inputCls} placeholder="CVV" defaultValue="456" />
              </div>
            </div>
          )}
          <button onClick={pay} disabled={paying} className="w-full rounded-xl bg-mint-500 py-3 font-semibold text-white disabled:opacity-60">
            {paying ? 'Processing…' : `Pay ₹${fee.toLocaleString('en-IN')}`}
          </button>
          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-mint-50 p-3 text-center text-sm font-semibold text-mint-700">
              Payment Successful! Receipt generated.
            </motion.div>
          )}
        </div>
      </Modal>
    </div>
  );
}

// ===== Complaints Page =====
function ComplaintsPage({ studentId, studentName, complaints, onNotify }: { studentId: string; studentName: string; complaints: import('@/types').Complaint[]; onNotify: (m: string, ok?: boolean) => void }) {
  const app = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'Electrical' as ComplaintCategory, hostel: HOSTELS[0].name, floor: 1,
    roomNumber: '', description: '', priority: 'Medium' as Priority,
  });
  const [selected, setSelected] = useState<import('@/types').Complaint | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.roomNumber) { onNotify('Please fill in room number and description', false); return; }
    try {
      await app.addComplaint({ studentId, ...form });
    } catch (err) { onNotify((err as Error).message, false); return; }
    onNotify('Complaint submitted successfully');
    setShowForm(false);
    setForm({ category: 'Electrical', hostel: HOSTELS[0].name, floor: 1, roomNumber: '', description: '', priority: 'Medium' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white">
          {showForm ? 'Cancel' : '+ New Complaint'}
        </button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={submit} className="glass-card space-y-3 rounded-2xl p-5">
          <h3 className="font-display font-bold text-gray-800">Raise Maintenance Complaint</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v as ComplaintCategory })} options={['Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Internet', 'Other'].map((c) => ({ v: c, l: c }))} />
            <SelectField label="Hostel" value={form.hostel} onChange={(v) => setForm({ ...form, hostel: v })} options={HOSTELS.map((h) => ({ v: h.name, l: h.name }))} />
            <SelectField label="Floor" value={String(form.floor)} onChange={(v) => setForm({ ...form, floor: Number(v) })} options={[1, 2, 3, 4].map((f) => ({ v: String(f), l: `Floor ${f}` }))} />
            <input className={inputCls + ' sm:col-span-1'} placeholder="Room Number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
            <SelectField label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v as Priority })} options={[{ v: 'Low', l: 'Low' }, { v: 'Medium', l: 'Medium' }, { v: 'High', l: 'High' }]} />
          </div>
          <textarea className={inputCls} rows={3} placeholder="Describe the problem…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="rounded-xl bg-mint-500 px-5 py-2.5 text-sm font-semibold text-white">Submit Complaint</button>
        </motion.form>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {complaints.length === 0 && !showForm && (
          <div className="glass-card rounded-2xl p-10 text-center lg:col-span-2">
            <Wrench size={40} className="mx-auto text-mint-200" />
            <p className="mt-3 font-display font-bold text-gray-700">No Complaints</p>
            <p className="text-sm text-gray-500">Click "New Complaint" to raise a maintenance issue.</p>
          </div>
        )}
        {complaints.map((c) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelected(c)}
            className="glass-card rounded-2xl p-5 text-left transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-gray-800">{c.complaintId}</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-1 text-xs text-gray-500">{c.category} · Room {c.roomNumber} · {c.hostel}</p>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{c.description}</p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
              <span>Priority: <span className={`font-semibold ${c.priority === 'High' ? 'text-peach-500' : c.priority === 'Medium' ? 'text-sky-600' : 'text-gray-500'}`}>{c.priority}</span></span>
              <span>·</span>
              <span>{c.assignedStaffName ? `Staff: ${c.assignedStaffName}` : 'Not assigned'}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Complaint ${selected?.complaintId}`} size="md">
        {selected && (
          <div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <InfoTile label="Category" value={selected.category} />
              <InfoTile label="Priority" value={selected.priority} />
              <InfoTile label="Hostel" value={selected.hostel} />
              <InfoTile label="Room" value={selected.roomNumber} />
              <InfoTile label="Assigned Staff" value={selected.assignedStaffName ?? 'Not assigned'} />
              <InfoTile label="Status" value={selected.status} />
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500">Problem Description</p>
              <p className="mt-1 rounded-xl bg-cream-50 p-3 text-sm text-gray-600">{selected.description}</p>
            </div>
            {selected.completionRemarks && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500">Completion Remarks</p>
                <p className="mt-1 rounded-xl bg-mint-50 p-3 text-sm text-mint-700">{selected.completionRemarks}</p>
              </div>
            )}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500">Status Timeline</p>
              <div className="mt-2 space-y-2">
                {selected.timeline.map((t, i) => (
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
          </div>
        )}
      </Modal>
    </div>
  );
}

// ===== Profile Page =====
function ProfilePage({ student }: { student: import('@/types').Student }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass-card rounded-2xl p-6 text-center">
        <img src={student.avatar} alt="" className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg" />
        <p className="mt-3 font-display text-lg font-bold text-gray-800">{student.name}</p>
        <p className="text-sm text-gray-500">{student.srn}</p>
        <span className="mt-2 inline-block rounded-full bg-mint-100 px-3 py-1 text-xs font-semibold text-mint-700">Student</span>
      </div>
      <div className="glass-card rounded-2xl p-6 lg:col-span-2">
        <h3 className="font-display font-bold text-gray-800">Personal Information</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoTile label="Email" value={student.email} />
          <InfoTile label="Phone" value={student.phone} />
          <InfoTile label="Branch" value={student.branch} />
          <InfoTile label="Academic Year" value={`Year ${student.year}`} />
          <InfoTile label="Gender" value={student.gender} />
          <InfoTile label="Room" value={student.roomNumber ?? 'Not allocated'} />
          <InfoTile label="Bed" value={student.bedNumber ? `Bed ${student.bedNumber}` : '—'} />
          <InfoTile label="Payment" value={student.paymentStatus === 'paid' ? 'Paid' : 'Pending'} />
        </div>
      </div>
    </div>
  );
}

// ===== Shared small components =====
const inputCls = 'w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-mint-400 focus:bg-white focus:ring-2 focus:ring-mint-200';

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-gray-600">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputCls} />
    </label>
  );
}

function MiniMetric({ label, value, color = 'text-gray-700' }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-cream-50 p-2">
      <p className={`font-display text-sm font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400">{label}</p>
    </div>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5 text-[11px]">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
}
