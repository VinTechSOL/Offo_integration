import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className={`flex justify-center items-center ${className || ''}`}>
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
    </div>
  );
};

export default LoadingSpinner;