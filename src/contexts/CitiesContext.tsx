import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { subscribeToCities, type City } from '@/features/city/city.service';

interface CitiesContextType {
  cities: City[];
  citiesLoading: boolean;
  citiesError: string | null;
}

const CitiesContext = createContext<CitiesContextType | undefined>(undefined);

export const useCitiesContext = () => {
  const context = useContext(CitiesContext);
  if (context === undefined) {
    throw new Error('useCitiesContext must be used within a CitiesProvider');
  }
  return context;
};

interface CitiesProviderProps {
  children: ReactNode;
}

export const CitiesProvider: React.FC<CitiesProviderProps> = ({ children }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  useEffect(() => {
    setCitiesLoading(true);
    setCitiesError(null);

    const unsubscribe = subscribeToCities(
      (cities) => {
        setCities(cities);
        setCitiesLoading(false);
      },
      (err) => {
        setCitiesError(err.message);
        setCitiesLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const value: CitiesContextType = {
    cities,
    citiesLoading,
    citiesError,
  };

  return <CitiesContext.Provider value={value}>{children}</CitiesContext.Provider>;
};
