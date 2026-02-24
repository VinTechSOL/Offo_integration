import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Campus {
  id: string;
  name: string;
  cityId: string;
}

interface CampusContextType {
  campuses: Campus[];
  currentCampusId: string;
  setCurrentCampusId: (id: string) => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) throw new Error('useCampus must be used within CampusProvider');
  return context;
};

const INITIAL_CAMPUSES: Campus[] = [
  { id: '1', name: 'Amazon Tech Park', cityId: '1' },
  { id: '2', name: 'Global Tech Park', cityId: '1' },
  { id: '3', name: 'Hitech City', cityId: '2' }
];

export const CampusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campuses] = useState(INITIAL_CAMPUSES);
  const [currentCampusId, setCurrentCampusId] = useState<string>('');

  return (
    <CampusContext.Provider value={{ campuses, currentCampusId, setCurrentCampusId }}>
      {children}
    </CampusContext.Provider>
  );
};