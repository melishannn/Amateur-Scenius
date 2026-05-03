import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export function InfoModal({ isOpen, onClose, title, content }: InfoModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-text/40 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-bg border border-border rounded-[32px] shadow-2xl p-6 md:p-8 z-[201] text-text"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-bold serif italic uppercase tracking-wider">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed serif italic opacity-90 overflow-y-auto max-h-[60vh] pr-2 no-scrollbar">
              {content}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={onClose}
                className="w-full bg-text text-bg py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-[0.98] transition-all shadow-lg"
              >
                {t('Anladım, Teşekkürler')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
