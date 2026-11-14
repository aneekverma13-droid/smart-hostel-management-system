import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
  title: string;
  subtitle?: string;
  accentIcon: LucideIcon;
  onHome: () => void;
  user: { name: string; role: string };
  onLogout: () => void;
  children: ReactNode;
}

const roleLabel: Record<string, string> = {
  student: 'Student',
  warden: 'Warden',
  maintenance: 'Maintenance Staff',
};

export default function DashboardShell({
  items, active, onSelect, title, subtitle, accentIcon: Accent, onHome, user, onLogout, children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-mesh-light">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl lg:flex">
        <button onClick={onHome} className="flex items-center gap-3 px-6 py-5 text-left">
          <div className="rounded-xl bg-gradient-to-br from-mint-400 to-teal-500 p-2 text-white shadow-lg">
            <Accent size={22} />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-mint-700">Smart Hostel</p>
            <p className="text-[10px] text-gray-400">{roleLabel[user.role]} Portal</p>
          </div>
        </button>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'text-mint-700' : 'text-gray-500 hover:bg-cream-100 hover:text-mint-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-mint-100 to-teal-50"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/60 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-cream-100 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-500 text-sm font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-700">{user.name}</p>
              <p className="truncate text-[11px] text-gray-400">{roleLabel[user.role]}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-peach-100 px-3 py-2 text-sm font-semibold text-peach-500 transition hover:bg-peach-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-white/60 bg-white/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button onClick={onHome} className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-mint-400 to-teal-500 p-1.5 text-white">
            <Accent size={16} />
          </div>
          <span className="font-display text-sm font-bold text-mint-700">Smart Hostel</span>
        </button>
        <button onClick={onLogout} className="rounded-lg bg-peach-100 px-3 py-1.5 text-xs font-semibold text-peach-500">
          Logout
        </button>
      </div>

      {/* Mobile nav scroll */}
      <div className="fixed inset-x-0 top-14 z-20 flex gap-2 overflow-x-auto bg-white/80 px-3 py-2 backdrop-blur-xl lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                active === item.id ? 'bg-mint-500 text-white' : 'bg-cream-100 text-mint-700'
              }`}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main */}
      <main className="flex-1 px-4 pb-8 pt-16 lg:ml-64 lg:px-8 lg:pt-8">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-6 mt-2">
            <h1 className="font-display text-2xl font-bold text-gray-800 lg:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
