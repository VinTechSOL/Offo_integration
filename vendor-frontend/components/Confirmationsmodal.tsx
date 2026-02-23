import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'orange' | 'red' | 'blue' | 'yellow' | 'green';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'orange',
}) => {

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const colorClasses = {
    orange: 'bg-offo-orange hover:bg-offo-orange-dark',
    red: 'bg-offo-red hover:bg-red-700',
    blue: 'bg-blue-500 hover:bg-blue-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    green: 'bg-offo-green hover:bg-green-700',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-dark-navy text-white w-[90%] max-w-xs p-5 rounded-xl shadow-2xl relative animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close dialog"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-5">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`${colorClasses[confirmColor]} text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};