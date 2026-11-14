import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, Building2, Eye, EyeOff, GraduationCap, ShieldCheck, Wrench } from 'lucide-react';
import { useApp } from '@/store';
import type { Role } from '@/types';

interface Props {
  onBack: () => void;
  onRegister: () => void;
}

const demoAccounts = [
  { role: 'student' as Role, label: 'Student', email: 'arjun.sharma@pes.edu', password: 'student123', icon: GraduationCap, color: 'mint' },
  { role: 'warden' as Role, label: 'Warden', email: 'warden@pes.edu', password: 'warden123', icon: ShieldCheck, color: 'teal' },
  { role: 'maintenance' as Role, label: 'Maintenance', email: 'ramesh.k@pes.edu', password: 'staff123', icon: Wrench, color: 'peach' },
];

export default function Login({ onBack, onRegister }: Props) {
  const { login } = useApp();
  const [srn, setSrn] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await login(srn, password, role);
    if (!res.ok) setError(res.error ?? 'Login failed');
  };

  const fillDemo = (d: typeof demoAccounts[number]) => {
    setSrn(d.email);
    setPassword(d.password);
    setRole(d.role);
    setError('');
  };

  const colorMap: Record<string, string> = {
    mint: 'from-mint-400 to-mint-600',
    teal: 'from-teal-400 to-teal-600',
    peach: 'from-peach-400 to-peach-500',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh-light p-4">
      <div className="w-full max-w-5xl">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-mint-700">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="grid gap-0 overflow-hidden rounded-3xl glass-strong lg:grid-cols-2">
          {/* Left visual */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-mint-500 to-teal-600 p-8 text-white lg:flex">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-white/20 p-2 backdrop-blur">
                  <Building2 size={24} />
                </div>
                <p className="font-display text-lg font-bold">Smart Hostel System</p>
              </div>
              <h2 className="mt-12 font-display text-3xl font-bold leading-tight">
                Welcome back to your hostel dashboard
              </h2>
              <p className="mt-3 text-mint-50">
                Explore the 3D hostel, manage room allocations, track complaints, and keep everything running smoothly.
              </p>
            </div>
            <div className="space-y-3">
              {demoAccounts.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.role}
                    onClick={() => fillDemo(d)}
                    className="flex w-full items-center gap-3 rounded-xl bg-white/15 p-3 text-left backdrop-blur transition hover:bg-white/25"
                  >
                    <div className={`rounded-lg bg-gradient-to-br ${colorMap[d.color]} p-2`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{d.label} Demo</p>
                      <p className="text-[11px] text-white/70">{d.email}</p>
                    </div>
                    <span className="text-[10px] text-white/60">Click to fill</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right form */}
          <div className="p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-gradient-to-br from-mint-400 to-teal-500 p-2 text-white">
                <Building2 size={22} />
              </div>
              <p className="font-display font-bold text-mint-700">Smart Hostel System</p>
            </div>

            <h1 className="font-display text-2xl font-bold text-gray-800">Login</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to access your dashboard</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {demoAccounts.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.role}
                    onClick={() => setRole(d.role)}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-semibold transition ${
                      role === d.role ? 'bg-mint-500 text-white shadow-lg' : 'bg-cream-100 text-mint-700 hover:bg-mint-50'
                    }`}
                  >
                    <Icon size={18} />
                    {d.label}
                  </button>
                );
              })}
            </div>

            {forgot ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-700">
                  <p className="font-semibold">Password Reset</p>
                  <p className="mt-1 text-xs">This is a demo prototype. Use the demo accounts shown on the left panel. For the student demo: <span className="font-mono">arjun.sharma@pes.edu / student123</span></p>
                </div>
                <button onClick={() => setForgot(false)} className="mt-3 text-sm font-semibold text-mint-700 hover:underline">
                  ← Back to login
                </button>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">Student ID or Email</span>
                  <input
                    value={srn}
                    onChange={(e) => setSrn(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. arjun.sharma@pes.edu"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">Password</span>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls}
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => setForgot(true)} className="font-semibold text-sky-600 hover:underline">
                    Forgot password?
                  </button>
                </div>

                {error && <div className="rounded-xl bg-peach-100 px-4 py-3 text-sm font-medium text-peach-500">{error}</div>}

                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-mint-500 to-teal-500 py-3.5 font-semibold text-white shadow-lg shadow-mint-500/30 transition hover:shadow-xl">
                  <LogIn size={18} /> Login as {role === 'maintenance' ? 'Staff' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              </form>
            )}

            {/* Mobile demo fill */}
            <div className="mt-5 space-y-2 lg:hidden">
              <p className="text-xs font-semibold text-gray-500">Demo accounts:</p>
              {demoAccounts.map((d) => (
                <button key={d.role} onClick={() => fillDemo(d)} className="block w-full rounded-lg bg-cream-100 px-3 py-2 text-left text-xs text-gray-600">
                  <span className="font-semibold capitalize text-mint-700">{d.label}:</span> {d.email} / {d.password}
                </button>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              New here?{' '}
              <button onClick={onRegister} className="font-semibold text-mint-700 hover:underline">Create an account</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-mint-400 focus:bg-white focus:ring-2 focus:ring-mint-200';
