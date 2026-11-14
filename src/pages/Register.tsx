import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, UserPlus, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/store';
import type { Role } from '@/types';

interface Props {
  onBack: () => void;
  onLogin: () => void;
}

const BRANCHES = ['CSE', 'ECE', 'ME', 'EEE', 'Civil', 'IT'];

export default function Register({ onBack, onLogin }: Props) {
  const { register } = useApp();
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({
    name: '', srn: '', email: '', phone: '', branch: 'CSE', year: 1,
    gender: 'Male' as 'Male' | 'Female', password: '', confirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof typeof form, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.srn || !form.email || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (role !== 'student') {
      setError('Warden and Maintenance staff accounts are pre-provisioned. Please use the demo accounts on the login page, or register as a student.');
      return;
    }
    const res = await register({ ...form, role });
    if (!res.ok) { setError(res.error ?? 'Registration failed.'); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh-light p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong w-full max-w-md rounded-3xl p-8 text-center"
        >
          <div className="mx-auto w-fit rounded-2xl bg-mint-100 p-4">
            <CheckCircle2 size={48} className="text-mint-600" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-gray-800">Registration Successful!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Welcome, {form.name}! Your student account has been created. You can now log in with your Student ID and password.
          </p>
          <div className="mt-4 rounded-xl bg-cream-100 p-3 text-left text-xs text-gray-600">
            <p><span className="font-semibold">Student ID:</span> {form.srn}</p>
            <p><span className="font-semibold">Email:</span> {form.email}</p>
            <p><span className="font-semibold">Role:</span> Student</p>
          </div>
          <button
            onClick={onLogin}
            className="mt-6 w-full rounded-xl bg-mint-500 py-3 font-semibold text-white shadow-lg transition hover:bg-mint-600"
          >
            Proceed to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-light">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-mint-700">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6 lg:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-mint-400 to-teal-500 p-2.5 text-white shadow-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-800">Create Account</h1>
              <p className="text-sm text-gray-500">Register to access the Smart Hostel System</p>
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-6 grid grid-cols-3 gap-2">
            {(['student', 'warden', 'maintenance'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${
                  role === r ? 'bg-mint-500 text-white shadow-lg' : 'bg-cream-100 text-mint-700 hover:bg-mint-50'
                }`}
              >
                {r === 'maintenance' ? 'Maintenance' : r}
              </button>
            ))}
          </div>

          {role !== 'student' && (
            <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
              <p className="font-semibold">Demo accounts for {role === 'warden' ? 'Warden' : 'Maintenance Staff'}</p>
              <p className="mt-1 text-xs text-sky-600">
                {role === 'warden'
                  ? 'Email: warden@pes.edu · Password: warden123'
                  : 'Email: ramesh.k@pes.edu · Password: staff123'}
              </p>
              <p className="mt-2 text-xs text-sky-600">Switch to Student registration to create a new student account, or use the login page with the demo credentials above.</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Field label="Full Name *">
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="e.g. Arjun Sharma" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Student ID / SRN *">
                <input value={form.srn} onChange={(e) => set('srn', e.target.value.toUpperCase())} className={inputCls} placeholder="PES220XXX" />
              </Field>
              <Field label="Phone Number *">
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} placeholder="+91 9XXXXXXXXX" />
              </Field>
            </div>
            <Field label="Email *">
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="name@pes.edu" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Department / Branch">
                <select value={form.branch} onChange={(e) => set('branch', e.target.value)} className={inputCls}>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Academic Year">
                <select value={form.year} onChange={(e) => set('year', Number(e.target.value))} className={inputCls}>
                  {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select value={form.gender} onChange={(e) => set('gender', e.target.value as 'Male' | 'Female')} className={inputCls}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password *">
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} className={inputCls} placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password *">
                <input type={showPw ? 'text' : 'password'} value={form.confirm} onChange={(e) => set('confirm', e.target.value)} className={inputCls} placeholder="Re-enter password" />
              </Field>
            </div>

            {error && <div className="rounded-xl bg-peach-100 px-4 py-3 text-sm font-medium text-peach-500">{error}</div>}

            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-mint-500 to-teal-500 py-3.5 font-semibold text-white shadow-lg shadow-mint-500/30 transition hover:shadow-xl">
              Register as Student
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={onLogin} className="font-semibold text-mint-700 hover:underline">Login here</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-mint-400 focus:bg-white focus:ring-2 focus:ring-mint-200';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</span>
      {children}
    </label>
  );
}
