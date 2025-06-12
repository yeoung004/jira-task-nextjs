import React, { useEffect } from 'react';

type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
};

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn"
      style={{ 
        minWidth: '280px',
        animation: 'fadeIn 0.3s ease-out, fadeOut 0.3s ease-in forwards',
        animationDelay: '0s, 2.7s'
      }}
    >
      <svg 
        width="20" 
        height="20" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        className="flex-shrink-0"
      >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  );
};
