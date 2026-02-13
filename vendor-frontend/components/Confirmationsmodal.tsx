import React from 'react';
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
  if (!isOpen) return null;

  const colorClasses = {
    orange: 'bg-offo-orange hover:bg-offo-orange-dark',
    red: 'bg-offo-red hover:bg-red-700',
    blue: 'bg-blue-500 hover:bg-blue-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    green: 'bg-offo-green hover:bg-green-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-dark-navy text-white p-6 rounded-lg shadow-2xl w-full max-w-sm relative transform transition-all duration-300 animate-popIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Close dialog">
          <XIcon className="w-6 h-6" />
        </button>
        
        <h2 id="modal-title" className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`${colorClasses[confirmColor]} text-white font-bold py-2 px-4 rounded-md transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
