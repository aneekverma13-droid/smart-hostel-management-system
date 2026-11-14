import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Props {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const config: Record<ToastType, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: 'text-mint-600', bg: 'from-mint-50 to-white' },
  error: { icon: XCircle, color: 'text-peach-500', bg: 'from-peach-50 to-white' },
  info: { icon: Info, color: 'text-sky-600', bg: 'from-sky-50 to-white' },
};

export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const { icon: Icon, color, bg } = config[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 30, x: '-50%' }}
      className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 rounded-2xl bg-gradient-to-r ${bg} px-5 py-3 shadow-2xl`}
    >
      <Icon size={20} className={color} />
      <span className="text-sm font-semibold text-gray-700">{message}</span>
    </motion.div>
  );
}

export function ToastContainer({ toast }: { toast: { message: string; type: ToastType } | null }) {
  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} onClose={() => {}} />;
}

export type { ToastType };
export type ToastState = { message: string; type: ToastType } | null;
export type ToastFn = (message: string, type?: ToastType) => void;
