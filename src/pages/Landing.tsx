import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, LogIn, UserPlus, Wifi, UtensilsCrossed, WashingMachine, Dumbbell,
  Stethoscope, BookOpen, ShieldCheck, Gamepad2, ArrowRight, Star, Quote, Users, BedDouble, DoorOpen,
} from 'lucide-react';
import Hostel3D from '@/components/Hostel3D';
import { useApp } from '@/store';
import { roomStatus, TESTIMONIALS, FACILITIES, HOSTELS } from '@/data';

interface Props {
  onRegister: () => void;
  onLogin: () => void;
  onExplore: () => void;
}

const iconMap: Record<string, typeof Wifi> = {
  wifi: Wifi, utensils: UtensilsCrossed, 'washing-machine': WashingMachine,
  dumbbell: Dumbbell, stethoscope: Stethoscope, 'book-open': BookOpen,
  'shield-check': ShieldCheck, 'gamepad-2': Gamepad2,
};


export default function Landing({ onRegister, onLogin, onExplore }: Props) {
  const ROOMS = useApp().rooms;
  const roomTypeStats = ['Single', 'Double', 'Triple', 'Quad'].map((type) => ({
    type, count: ROOMS.filter((r) => r.type === type).length,
  }));
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const totalBeds = ROOMS.reduce((a, r) => a + r.capacity, 0);
  const occupiedBeds = ROOMS.reduce((a, r) => a + r.beds.filter((b) => b.occupied).length, 0);
  const availableRooms = ROOMS.filter((r) => roomStatus(r) !== 'occupied').length;

  const selectedRoom = ROOMS.find((r) => r.id === selectedRoomId);

  return (
    <div className="min-h-screen bg-mesh-light">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-br from-mint-400 to-teal-500 p-2 text-white shadow-lg">
              <Building2 size={22} />
            </div>
            <div>
              <p className="font-display text-base font-bold text-mint-700">Smart Hostel</p>
              <p className="text-[10px] text-gray-400">Allocation & Maintenance</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#explore" className="text-sm font-medium text-gray-600 hover:text-mint-700">Explore</a>
            <a href="#facilities" className="text-sm font-medium text-gray-600 hover:text-mint-700">Facilities</a>
            <a href="#rooms" className="text-sm font-medium text-gray-600 hover:text-mint-700">Room Types</a>
            <a href="#stats" className="text-sm font-medium text-gray-600 hover:text-mint-700">Capacity</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-mint-700">Reviews</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onLogin} className="rounded-xl px-3 py-2 text-sm font-semibold text-mint-700 hover:bg-mint-50">
              Login
            </button>
            <button onClick={onRegister} className="rounded-xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-mint-500/30 transition hover:bg-mint-600">
              Register
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero with 3D */}
      <section className="relative mx-auto max-w-7xl px-4 pt-10 lg:px-8 lg:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3 py-1 text-xs font-semibold text-mint-700">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint-500" />
              College Mini Project · 2026
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-gray-800 lg:text-5xl">
              Smart Hostel <span className="bg-gradient-to-r from-mint-500 to-teal-500 bg-clip-text text-transparent">Room Allocation</span> & Maintenance System
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-gray-500 lg:mx-0">
              Explore a live 3D hostel building, find your ideal room with smart preference matching,
              request allocation, pay fees, and raise maintenance complaints — all in one place.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                onClick={onExplore}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-mint-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-xl shadow-mint-500/30 transition hover:shadow-2xl"
              >
                Explore Hostel
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <button onClick={onRegister} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-mint-700 shadow-card transition hover:bg-mint-50">
                <UserPlus size={18} /> Register
              </button>
              <button onClick={onLogin} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-sky-700 shadow-card transition hover:bg-sky-50">
                <LogIn size={18} /> Login
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <MiniStat icon={DoorOpen} value={`${availableRooms}`} label="Available Rooms" />
              <MiniStat icon={BedDouble} value={`${totalBeds - occupiedBeds}`} label="Free Beds" />
              <MiniStat icon={Users} value={`${totalBeds}`} label="Total Capacity" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            id="explore"
            className="relative"
          >
            <Hostel3D
              rooms={ROOMS}
              selectedFloor={selectedFloor}
              onSelectFloor={setSelectedFloor}
              selectedRoomId={selectedRoomId}
              onSelectRoom={(r) => setSelectedRoomId(r.id)}
              height="460px"
            />
            {selectedRoom && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 z-10 w-64 -translate-x-1/2 rounded-2xl bg-white/90 p-4 shadow-2xl backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-mint-700">Room {selectedRoom.number}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                    roomStatus(selectedRoom) === 'available' ? 'bg-mint-500'
                    : roomStatus(selectedRoom) === 'partial' ? 'bg-peach-400' : 'bg-peach-500'
                  }`}>
                    {roomStatus(selectedRoom).toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedRoom.hostelName} · Floor {selectedRoom.floor} · {selectedRoom.capacity} beds · {selectedRoom.ac ? 'AC' : 'Non-AC'}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-700">₹{selectedRoom.fee.toLocaleString('en-IN')}/yr</p>
                <button onClick={onExplore} className="mt-2 w-full rounded-lg bg-mint-500 py-1.5 text-xs font-semibold text-white">
                  Explore more →
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeading eyebrow="Amenities" title="Hostel Facilities" desc="Everything a student needs, under one roof." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f, i) => {
            const Icon = iconMap[f.icon] ?? Wifi;
            return (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group glass-card rounded-2xl p-5 transition hover:-translate-y-1"
              >
                <div className="rounded-xl bg-gradient-to-br from-mint-100 to-teal-50 p-3 text-mint-700 w-fit">
                  <Icon size={22} />
                </div>
                <p className="mt-3 font-display font-bold text-gray-800">{f.name}</p>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Room Types */}
      <section id="rooms" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeading eyebrow="Accommodation" title="Room Types" desc="Choose the room that fits your budget and lifestyle." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roomTypeStats.map((rt, i) => {
            const sample = ROOMS.find((r) => r.type === rt.type);
            const fee = sample?.fee ?? 0;
            const meta = [
              { beds: 1, desc: 'Private room with study desk & wardrobe', icon: '🛏️' },
              { beds: 2, desc: 'Shared room, ideal for friends', icon: '🛌' },
              { beds: 3, desc: 'Triple sharing with balconies', icon: '👨‍🎓' },
              { beds: 4, desc: 'Economical quad sharing', icon: '👥' },
            ][rt.type === 'Single' ? 0 : rt.type === 'Double' ? 1 : rt.type === 'Triple' ? 2 : 3];
            return (
              <motion.div
                key={rt.type}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-bold text-gray-800">{rt.type}</p>
                  <span className="text-2xl">{meta.icon}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{meta.desc}</p>
                <p className="mt-3 font-display text-2xl font-extrabold text-mint-600">
                  ₹{fee.toLocaleString('en-IN')}
                  <span className="text-xs font-medium text-gray-400">/yr</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">{rt.count} rooms available</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Capacity stats */}
      <section id="stats" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeading eyebrow="By the numbers" title="Hostel Capacity" desc="A snapshot of our hostel occupancy and availability." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <BigStat value={ROOMS.length} label="Total Rooms" color="from-mint-400 to-mint-600" />
          <BigStat value={totalBeds} label="Total Beds" color="from-teal-400 to-teal-600" />
          <BigStat value={occupiedBeds} label="Occupied Beds" color="from-peach-400 to-peach-500" />
          <BigStat value={totalBeds - occupiedBeds} label="Available Beds" color="from-sky-400 to-sky-600" />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {HOSTELS.map((h) => {
            const hRooms = ROOMS.filter((r) => r.hostelId === h.id);
            const hBeds = hRooms.reduce((a, r) => a + r.capacity, 0);
            const hOcc = hRooms.reduce((a, r) => a + r.beds.filter((b) => b.occupied).length, 0);
            const pct = Math.round((hOcc / hBeds) * 100);
            return (
              <div key={h.id} className="glass-card rounded-2xl p-5">
                <p className="font-display font-bold text-gray-800">{h.name}</p>
                <p className="text-xs text-gray-400">{h.gender} · Warden: {h.warden}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-mint-400 to-teal-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-500">{hOcc}/{hBeds} beds occupied · {pct}%</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeading eyebrow="Student voices" title="What Students Say" desc="Real feedback from our hostel residents." />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6"
            >
              <Quote size={28} className="text-mint-300" />
              <p className="mt-2 text-sm leading-relaxed text-gray-600">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.branch} · Year {t.year}</p>
                </div>
                <div className="ml-auto flex gap-0.5 text-peach-400">
                  {[...Array(5)].map((_, k) => <Star key={k} size={12} fill="currentColor" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mint-500 to-teal-600 p-10 text-center text-white shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/10" />
          <h2 className="relative font-display text-2xl font-bold lg:text-3xl">Ready to find your room?</h2>
          <p className="relative mx-auto mt-2 max-w-md text-mint-50">
            Register now and explore the hostel in 3D, search rooms, and manage everything from one dashboard.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={onRegister} className="rounded-xl bg-white px-5 py-3 font-semibold text-mint-700 shadow-lg transition hover:bg-mint-50">
              Get Started
            </button>
            <button onClick={onLogin} className="rounded-xl bg-mint-600/40 px-5 py-3 font-semibold text-white ring-1 ring-white/40 transition hover:bg-mint-600/60">
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/60 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-gradient-to-br from-mint-400 to-teal-500 p-2 text-white">
                  <Building2 size={20} />
                </div>
                <p className="font-display font-bold text-mint-700">Smart Hostel System</p>
              </div>
              <p className="mt-3 max-w-xs text-sm text-gray-500">
                A college mini project demonstrating interactive 3D hostel management with room allocation,
                payments, and maintenance workflows.
              </p>
            </div>
            <div>
              <p className="font-display text-sm font-bold text-gray-700">Quick Links</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><button onClick={onExplore} className="hover:text-mint-700">Explore Hostel</button></li>
                <li><button onClick={onRegister} className="hover:text-mint-700">Register</button></li>
                <li><button onClick={onLogin} className="hover:text-mint-700">Login</button></li>
              </ul>
            </div>
            <div>
              <p className="font-display text-sm font-bold text-gray-700">Demo Accounts</p>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-500">
                <li>Student: arjun.sharma@pes.edu / student123</li>
                <li>Warden: warden@pes.edu / warden123</li>
                <li>Staff: ramesh.k@pes.edu / staff123</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/60 pt-6 text-center text-xs text-gray-400">
            © 2026 Smart Hostel Room Allocation & Maintenance System · College Mini Project · Built with React, Three.js & Framer Motion
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-mint-600">{eyebrow}</span>
      <h2 className="mt-1 font-display text-2xl font-bold text-gray-800 lg:text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">{desc}</p>
    </motion.div>
  );
}

function MiniStat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 text-center backdrop-blur">
      <Icon size={18} className="mx-auto text-mint-600" />
      <p className="mt-1 font-display text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}

function BigStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-xl`}
    >
      <p className="font-display text-4xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-white/80">{label}</p>
    </motion.div>
  );
}
