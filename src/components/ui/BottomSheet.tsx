"use client";

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  snapPoints?: 'full' | 'half' | 'auto';
  showHandle?: boolean;
}

/**
 * BottomSheet overlay component.
 * Renders as a bottom-anchored slide-up sheet on mobile and a centered modal on desktop.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = 'auto',
  showHandle = true,
}: BottomSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const snapHeightClasses = {
    full: 'h-[90vh]',
    half: 'h-[50vh]',
    auto: 'h-auto',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 transition-opacity"
            aria-hidden="true"
          />

          {/* Modal / Sheet Container */}
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center lg:items-center pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'bottom-sheet-title' : undefined}
          >
            <motion.div
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`
                pointer-events-auto w-full bg-white flex flex-col
                rounded-t-2xl lg:rounded-2xl
                max-h-[90vh] lg:max-h-[85vh] lg:w-full lg:max-w-lg lg:shadow-card
                ${snapHeightClasses[snapPoints]}
              `}
              style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              {/* Drag Handle (Mobile Only) */}
              {showHandle && (
                <div 
                  className="flex justify-center pt-3 pb-2 lg:hidden w-full cursor-pointer" 
                  onClick={onClose}
                >
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>
              )}

              {/* Header */}
              {title && (
                <div className="px-4 py-3 border-b border-[#E8E8EE] flex items-center justify-between">
                  <h2 id="bottom-sheet-title" className="text-lg font-bold text-[#1A1D26]">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full lg:block hidden"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
