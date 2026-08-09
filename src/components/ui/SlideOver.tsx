import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SlideOver({ isOpen, onClose, title, subtitle, children }: SlideOverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex z-10">
        <div className="w-screen max-w-lg bg-[#08080c] border-l border-[#d4af37]/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col relative h-full overflow-hidden animate-slideInRight">
          {/* Subtle top gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-20" />

          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-[#0d0d15] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
              {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-mono">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
