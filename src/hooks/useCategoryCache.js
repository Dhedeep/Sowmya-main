import { useState, useEffect, useCallback } from 'react';
import { getAllCategories, getCategoriesWithSubcategories } from '../firebase/services/categoryService';
import { useFirebaseCache } from './useFirebaseCache';

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for categories (change less frequently)

export const useCategoryCache = (options = {}) => {
  const { 
    withSubcategories = false,
    forceRefresh = false 
  } = options;
  
  const { getCachedData, setCachedData, invalidateCache } = useFirebaseCache();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCacheKey = useCallback(() => {
    return withSubcategories ? 'categories-with-subcategories' : 'categories-flat';
  }, [withSubcategories]);

  const fetchCategories = useCallback(async () => {
    const cacheKey = generateCacheKey();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Category cache hit for ${cacheKey}`);
        setCategories(cachedData);
        setLoading(false);
        return cachedData;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching categories from Firebase for ${cacheKey}...`);
      
      let categoriesData;
      if (withSubcategories) {
        categoriesData = await getCategoriesWithSubcategories();
      } else {
        categoriesData = await getAllCategories();
      }
      
      setCategories(categoriesData);
      setCachedData(cacheKey, categoriesData);
      setLoading(false);
      
      return categoriesData;
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setLoading(false);
      return [];
    }
  }, [generateCacheKey, getCachedData, setCachedData, withSubcategories, forceRefresh]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Refresh function
  const refresh = useCallback(async () => {
    const cacheKey = generateCacheKey();
    invalidateCache(cacheKey);
    return fetchCategories();
  }, [generateCacheKey, invalidateCache, fetchCategories]);

  // Get category name by ID
  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return 'No Category';
    
    if (withSubcategories) {
      // Search in nested structure
      for (const category of categories) {
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
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Unknown Category';
    }
    
    return 'Unknown Category';
  }, [categories, withSubcategories]);

  // Get subcategories by parent ID
  const getSubcategoriesByParentId = useCallback((parentId) => {
    if (!withSubcategories) return [];
    
    const parentCategory = categories.find(cat => cat.id === parentId);
    return parentCategory ? parentCategory.subcategories || [] : [];
  }, [categories, withSubcategories]);

  // Get all main categories (no parent)
  const getMainCategories = useCallback(() => {
    if (withSubcategories) {
      return categories.filter(cat => !cat.parentId);
    } else {
      return categories.filter(cat => !cat.parentId);
    }
  }, [categories]);

  // Get all subcategories (has parent)
  const getAllSubcategories = useCallback(() => {
    if (!withSubcategories) return [];
    
    const allSubcats = [];
    categories.forEach(category => {
      if (category.subcategories) {
        allSubcats.push(...category.subcategories);
      }
    });
    return allSubcats;
  }, [categories]);

  return {
    categories,
    loading,
    error,
    refresh,
    fetchCategories,
    getCategoryName,
    getSubcategoriesByParentId,
    getMainCategories,
    getAllSubcategories
  };
};