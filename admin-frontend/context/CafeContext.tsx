import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Cafe {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
}

interface CafeContextType {
  cafes: Cafe[];
  setCafes: React.Dispatch<React.SetStateAction<Cafe[]>>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) throw new Error('useCafe must be used within CafeProvider');
  return context;
};

const INITIAL_CAFES: Cafe[] = [
  {
    id: '1',
    name: 'Healthy Bites',
    phone: '+91 9876543210',
    email: 'healthy@offo.com',
    isActive: true
  }
];

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>(INITIAL_CAFES);

  return (
    <CafeContext.Provider value={{ cafes, setCafes }}>
      {children}
    </CafeContext.Provider>
  );
};