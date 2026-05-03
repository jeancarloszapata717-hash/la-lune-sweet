import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((val: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolveRef) resolveRef(value);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                  options.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-brand-hotpink/10 text-brand-hotpink'
                }`}>
                  <ShieldAlert size={32} />
                </div>
                <h3 className="font-display font-black text-xl text-brand-dark uppercase mb-2">{options.title}</h3>
                <p className="font-sans text-sm text-slate-500 font-medium leading-relaxed mb-8">{options.message}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleClose(false)}
                    className="py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    {options.cancelText || 'Cancelar'}
                  </button>
                  <button 
                    onClick={() => handleClose(true)}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-white shadow-lg transition-all ${
                      options.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-brand-hotpink hover:bg-brand-dark shadow-brand-hotpink/20'
                    }`}
                  >
                    {options.confirmText || 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}
