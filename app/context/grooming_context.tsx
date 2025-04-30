import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { Grooming, Inclusion } from '../interfaces/grooming';

interface GroomingContextType {
  groomings: Grooming[];
  loading: boolean;
  error: string | null;
  fetchGroomings: () => void;
  addToGroomingContext: (item: Grooming) => void;
  updateGroomingContext: (item: Grooming) => void;
}

const GroomingContext = createContext<GroomingContextType | undefined>(undefined);

export const GroomingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groomings, setGroomings] = useState<Grooming[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroomings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('groomings').select('*');
      if (error) throw error;

      const parsed = data?.map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
        inclusions: item.inclusions as Inclusion[],
      })) as Grooming[];

      setGroomings(parsed);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch groomings.');
    } finally {
      setLoading(false);
    }
  };

  const addToGroomingContext = (item: Grooming) => {
    setGroomings(prev => [...prev, item]);
  };

  const updateGroomingContext = (updatedItem: Grooming) => {
    setGroomings(prev =>
      prev.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  useEffect(() => {
    fetchGroomings();
  }, []);

  return (
    <GroomingContext.Provider value={{ groomings, loading, error, fetchGroomings, addToGroomingContext, updateGroomingContext }}>
      {children}
    </GroomingContext.Provider>
  );
};

export const useGrooming = (): GroomingContextType => {
  const context = useContext(GroomingContext);
  if (!context) throw new Error('useGrooming must be used within a GroomingProvider');
  return context;
};
