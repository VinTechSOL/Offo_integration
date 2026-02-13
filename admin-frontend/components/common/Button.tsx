import React from 'react';
import { constants } from '../../constants.ts';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-75 flex items-center justify-center';
  let variantStyles = '';
  let sizeStyles = '';

  switch (variant) {
    case 'primary': variantStyles = `bg-offoOrange text-white hover:bg-offoOrange-dark focus:ring-offoOrange`; break;
    case 'secondary': variantStyles = `bg-offoDark text-white hover:bg-offoDark-light focus:ring-offoDark`; break;
    case 'outline': variantStyles = `border border-offoOrange text-offoOrange hover:bg-offoOrange hover:text-white focus:ring-offoOrange`; break;
    case 'ghost': variantStyles = `text-${constants.colors.TEXT_DARK} hover:bg-gray-200 focus:ring-gray-300`; break;
    case 'danger': variantStyles = 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'; break;
  }

  switch (size) {
    case 'sm': sizeStyles = 'px-3 py-1.5 text-sm'; break;
    case 'md': sizeStyles = 'px-4 py-2 text-base'; break;
    case 'lg': sizeStyles = 'px-5 py-2.5 text-lg'; break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`} {...props}>
      {icon && <span className={children ? 'mr-2' : ''}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;