import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, onClose, title, subtitle, children, size = 'md' }) {
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative bg-white rounded-3xl shadow-float w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-7 pb-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-7">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
