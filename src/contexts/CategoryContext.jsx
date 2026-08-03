import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllCategories, getCategoriesWithSubcategories } from '../firebase/services/categoryService';
import { useFirebaseCache } from '../hooks/useFirebaseCache';

const CategoryContext = createContext();

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const { getCachedData, setCachedData, invalidateCache } = useFirebaseCache();
  const [categories, setCategories] = useState([]);
  const [categoriesWithSubcategories, setCategoriesWithSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWithSubcategories, setLoadingWithSubcategories] = useState(false);
  const [error, setError] = useState(null);

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for categories (change less frequently)

  // Fetch all categories (flat structure)
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'categories-flat';

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log('CategoryContext cache hit for flat categories');
        setCategories(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log('CategoryContext fetching flat categories from Firebase...');
      const categoriesData = await getAllCategories();

      setCategories(categoriesData);
      setCachedData(cacheKey, categoriesData);
      setLoading(false);

      return categoriesData;
    } catch (err) {
      console.error('CategoryContext error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setLoading(false);
      return [];
    }
  }, [getCachedData, setCachedData]);

  // Fetch categories with subcategories (nested structure)
  const fetchCategoriesWithSubcategories = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'categories-with-subcategories';

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log('CategoryContext cache hit for nested categories');
        setCategoriesWithSubcategories(cachedData);
        return cachedData;
      }
    }

    setLoadingWithSubcategories(true);
    setError(null);

    try {
      console.log('CategoryContext fetching nested categories from Firebase...');
      const categoriesData = await getCategoriesWithSubcategories();

      setCategoriesWithSubcategories(categoriesData);
      setCachedData(cacheKey, categoriesData);
      setLoadingWithSubcategories(false);

      return categoriesData;
    } catch (err) {
      console.error('CategoryContext error fetching categories with subcategories:', err);
      setError(err.message || 'Failed to fetch categories with subcategories');
      setLoadingWithSubcategories(false);
      return [];
    }
  }, [getCachedData, setCachedData]);

  // Get category name by ID (works with both flat and nested structures)
  const getCategoryName = useCallback((categoryId, useNested = false) => {
    if (!categoryId) return 'No Category';
    if (categoryId === 'new-arrivals') return 'New Arrivals';

    const sourceData = useNested ? categoriesWithSubcategories : categories;
    if (useNested) {
      // Search in nested structure
      for (const category of sourceData) {
        if (category.id === categoryId) {
          return category.name;
        }
        if (category.subcategories) {
          const subcat = category.subcategories.find(sub => sub.id === categoryId);
          if (subcat) return subcat.name;
        }
      }
    } else {
      // Search in flat structure
      const category = sourceData.find(cat => cat.id === categoryId);
      return category ? category.name : 'Unknown Category';
    }

    return 'Unknown Category';
  }, [categories, categoriesWithSubcategories]);

  // Get subcategories by parent ID
  const getSubcategoriesByParentId = useCallback((parentId) => {
    const parentCategory = categoriesWithSubcategories.find(cat => cat.id === parentId);
    return parentCategory ? parentCategory.subcategories || [] : [];
  }, [categoriesWithSubcategories]);

  // Get all main categories (no parent)
  const getMainCategories = useCallback((useNested = false) => {
    const sourceData = useNested ? categoriesWithSubcategories : categories;

    if (useNested) {
      return sourceData.filter(cat => !cat.parentId);
    } else {
      return sourceData.filter(cat => !cat.parentId);
    }
  }, [categories, categoriesWithSubcategories]);

  // Get all subcategories (has parent)
  const getAllSubcategories = useCallback(() => {
    const allSubcats = [];
    categoriesWithSubcategories.forEach(category => {
      if (category.subcategories) {
        allSubcats.push(...category.subcategories);
      }
    });
    return allSubcats;
  }, [categoriesWithSubcategories]);

  // Refresh functions
  const refreshCategories = useCallback(async () => {
    invalidateCache('categories-flat');
    return fetchCategories(true);
  }, [invalidateCache, fetchCategories]);

  const refreshCategoriesWithSubcategories = useCallback(async () => {
    invalidateCache('categories-with-subcategories');
    return fetchCategoriesWithSubcategories(true);
  }, [invalidateCache, fetchCategoriesWithSubcategories]);

  // Refresh all category data
  const refreshAllCategories = useCallback(async () => {
    await Promise.all([
      refreshCategories(),
      refreshCategoriesWithSubcategories()
    ]);
  }, [refreshCategories, refreshCategoriesWithSubcategories]);

  // Initial fetch of categories
  useEffect(() => {
    fetchCategories();
    fetchCategoriesWithSubcategories();
  }, [fetchCategories, fetchCategoriesWithSubcategories]);

  const value = {
    // Data
    categories,
    categoriesWithSubcategories,

    // Loading states
    loading,
    loadingWithSubcategories,
    error,

    // Fetch functions
    fetchCategories,
    fetchCategoriesWithSubcategories,

    // Refresh functions
    refreshCategories,
    refreshCategoriesWithSubcategories,
    refreshAllCategories,

    // Utility functions
    getCategoryName,
    getSubcategoriesByParentId,
    getMainCategories,
    getAllSubcategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;