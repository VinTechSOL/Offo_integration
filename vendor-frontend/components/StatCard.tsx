import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  titleClassName?: string; // New prop for title custom classes
  valueClassName?: string; // New prop for value custom classes
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, titleClassName, valueClassName }) => {
  return (
    <div className="text-center w-1/2 sm:flex-1 px-2 py-2 sm:py-0">
      <p className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${titleClassName || 'text-gray-300'}`}>{title}</p>
      <p className={`text-2xl sm:text-3xl font-bold mt-1 ${valueClassName || 'text-white'}`}>{value}</p>
    </div>
  );
};