
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Branch } from '../types.ts';

interface BranchContextType {
  branches: Branch[];
  currentBranchId: string;
  currentBranch: Branch | undefined;
  setCurrentBranchId: (id: string) => void;
  setBranches: (branches: Branch[]) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

// Mock Initial Branches
const INITIAL_BRANCHES: Branch[] = [
  { id: '1', name: 'Main Campus Cafe', address: 'Amazon Building A, Tech Park', status: 'Active', manager: 'Vinod More', contact: '+91 9698596501', latitude: '12.9716', longitude: '77.5946' },
  { id: '2', name: 'East Wing Coffee Shop', address: 'Amazon Building B, Tech Park', status: 'Active', manager: 'Jan Smith', contact: '+91 9876543210', latitude: '12.9345', longitude: '77.6291' },
  { id: '3', name: 'Downtown Hub', address: 'City Center, MG Road', status: 'Active', manager: 'Sarah Lee', contact: '+91 9123456789', latitude: '12.9719', longitude: '77.5937' },
  { id: '4', name: 'Westside Food Court', address: 'Global Tech Park, Block D', status: 'Active', manager: 'Rajesh Kumar', contact: '+91 9988776655', latitude: '12.9279', longitude: '77.6271' },
  { id: '5', name: 'Airport Transit Cafe', address: 'Terminal 1, Departure Gate', status: 'Disabled', manager: 'Emily Blunt', contact: '+91 9000011111', latitude: '13.1986', longitude: '77.7066' }
];

interface BranchProviderProps {
  children: ReactNode;
  initialBranchId?: string;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children, initialBranchId }) => {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  // Initialize with the passed ID from login, or default to the first branch
  const [currentBranchId, setCurrentBranchId] = useState<string>(initialBranchId || INITIAL_BRANCHES[0].id);

  const currentBranch = branches.find(b => b.id === currentBranchId);

  return (
    <BranchContext.Provider value={{ branches, currentBranchId, currentBranch, setCurrentBranchId, setBranches }}>
      {children}
    </BranchContext.Provider>
  );
};
