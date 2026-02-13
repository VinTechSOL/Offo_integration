
import React from 'react';
import MobileLoginForm from './MobileLoginForm.tsx';
import { constants } from '../../constants.ts';

interface AuthScreenProps {
  onLogin: (success: boolean, branchId?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex w-full font-sans">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className={`hidden lg:flex lg:w-1/2 relative bg-${constants.colors.BG_DARK} overflow-hidden`}>
         {/* Decorative Background */}
         <div className="absolute inset-0 bg-gradient-to-br from-offoOrange to-offoOrange-dark opacity-90 z-10"></div>
         <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-50"></div>

         <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full">
            <h1 className="text-6xl font-extrabold mb-6 tracking-tight">OFFO</h1>
            <h2 className="text-3xl font-bold mb-4">Vendor Admin Panel</h2>
            <p className="text-lg opacity-90 max-w-md leading-relaxed">
              Manage your restaurant orders, staff, branches, and analytics all in one place. Streamline your operations efficiently with OFFO.
            </p>
         </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-12 lg:p-16`}>
        <div className="w-full max-w-md space-y-8">
           {/* Mobile Header */}
           <div className="lg:hidden text-center mb-10">
              <h1 className="text-5xl font-extrabold text-offoOrange tracking-tight">OFFO</h1>
              <p className="text-gray-500 mt-2 font-medium">Vendor Admin Panel</p>
           </div>
           
           <MobileLoginForm onLogin={onLogin} />
           
           <div className="mt-10 pt-6 border-t border-gray-100 text-center">
             <p className="text-sm text-gray-400">
               © 2025 OFFO. All rights reserved.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
