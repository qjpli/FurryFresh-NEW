import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import Subcategories from '../interfaces/subcategories';

interface SubcategoryContextType {
  subcategories: Subcategories[];
  loading: boolean;
  error: string | null;
  fetchSubcategories: () => void;
  addToSubcategoryContext: (item: Subcategories) => void;
  updateSubcategoryContext: (item: Subcategories) => void;
}

const SubcategoryContext = createContext<SubcategoryContextType | undefined>(undefined);

export const SubcategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subcategories, setSubcategories] = useState<Subcategories[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubcategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('subcategories').select('*');
      if (error) throw error;

      const parsed = data?.map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
      })) as Subcategories[];

      setSubcategories(parsed);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch subcategories.');
    } finally {
      setLoading(false);
    }
  };

  const addToSubcategoryContext = (item: Subcategories) => {
    setSubcategories(prev => [...prev, item]);
  };

  const updateSubcategoryContext = (updatedItem: Subcategories) => {
    setSubcategories(prev =>
      prev.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  return (
    <SubcategoryContext.Provider value={{ subcategories, loading, error, fetchSubcategories, addToSubcategoryContext, updateSubcategoryContext }}>
      {children}
    </SubcategoryContext.Provider>
  );
};

export const useSubcategory = (): SubcategoryContextType => {
  const context = useContext(SubcategoryContext);
  if (!context) throw new Error('useSubcategory must be used within a SubcategoryProvider');
  return context;
};
