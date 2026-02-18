import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';


interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);
  

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-offo-orange">OFFO</h1>
        <p className="text-lg text-text-primary">Order Food From Office</p>
        <p className="text-text-secondary mt-1">Vendor Portal</p>
      </div>
      <div className="w-full max-w-md">
        {
          <LoginForm
            onLoginSuccess={onLoginSuccess}
          />
        }
      </div>
    </div>
  );
};
