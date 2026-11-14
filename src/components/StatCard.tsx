import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'mint' | 'teal' | 'sky' | 'peach';
  trend?: string;
  trendUp?: boolean;
}

const colorMap = {
  mint: 'from-mint-100 to-mint-50 text-mint-700',
  teal: 'from-teal-100 to-teal-50 text-teal-700',
  sky: 'from-sky-100 to-sky-50 text-sky-700',
  peach: 'from-peach-100 to-peach-50 text-peach-500',
};

export default function StatCard({ label, value, icon: Icon, color = 'mint', trend, trendUp }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-gradient-to-br ${colorMap[color]} p-3`}>
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-mint-600' : 'text-peach-500'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-gray-800">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
    </motion.div>
  );
}
