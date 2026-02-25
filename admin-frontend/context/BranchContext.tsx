import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo
} from 'react';
import { Branch } from '../types';

export interface Staff {
  id: string;
  branchId: string;
  role: 'VENDOR';
  firstName: string;
  lastName: string;
  username: string;
  password: string; // mock only
  isActive: boolean;
  createdAt: string;
  lastReset?: string;
}

interface BranchContextType {
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  currentBranch?: Branch;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
};

export const BranchProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {

  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string>('');

  const currentBranch = useMemo(
    () => branches.find(b => b.id === currentBranchId),
    [branches, currentBranchId]
  );

  return (
    <BranchContext.Provider
      value={{
        branches,
        setBranches,
        currentBranchId,
        setCurrentBranchId,
        currentBranch,
        staffList,
        setStaffList,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};