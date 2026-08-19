"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}

export function SlideOver({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
}: SlideOverProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${widthClasses} bg-[#0c0c14] border-l border-white/10 shadow-2xl flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0e0e18]">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              {subtitle && (
                <p className="text-xs text-white/50 font-mono mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
