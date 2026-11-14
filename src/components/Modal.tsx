import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  if (!open) return null;
  const w = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-mint-700/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative z-10 w-full ${w} max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-mint-700">{title}</h3>
            <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-cream-100 hover:text-mint-700">
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
