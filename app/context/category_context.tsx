import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import Category from '../interfaces/categories';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => void;
  addToCategoryContext: (item: Category) => void;
  updateCategoryContext: (item: Category) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;

      const parsed = data?.map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
      })) as Category[];

      setCategories(parsed);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  const addToCategoryContext = (item: Category) => {
    setCategories(prev => [...prev, item]);
  };

  const updateCategoryContext = (updatedItem: Category) => {
    setCategories(prev =>
      prev.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, error, fetchCategories, addToCategoryContext, updateCategoryContext }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategory must be used within a CategoryProvider');
  return context;
};
