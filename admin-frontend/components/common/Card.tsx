import React from 'react';
import { constants } from '../../constants.ts';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-${constants.colors.BG_CARD_LIGHT} p-4 rounded-xl shadow-md ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export default Card;