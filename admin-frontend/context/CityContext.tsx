import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface City {
  id: string;
  name: string;
}

interface CityContextType {
  cities: City[];
  currentCityId: string;
  setCurrentCityId: (id: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within CityProvider');
  return context;
};

const INITIAL_CITIES: City[] = [
  { id: '1', name: 'Bangalore' },
  { id: '2', name: 'Hyderabad' }
];

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cities] = useState(INITIAL_CITIES);
  const [currentCityId, setCurrentCityId] = useState<string>('');

  return (
    <CityContext.Provider value={{ cities, currentCityId, setCurrentCityId }}>
      {children}
    </CityContext.Provider>
  );
};