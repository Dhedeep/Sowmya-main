import { useState, useEffect, useCallback } from 'react';
import {
  getProductsWithStock,
  getAllProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByCategoryOrSubcategory,
  getFeaturedProducts
} from '../firebase/services/productService';
import {
  getProductsByFilters,
  searchProducts as searchProductsOptimized,
  invalidateProductCache
} from '../firebase/services/productQueryService';
import { useFirebaseCache } from './useFirebaseCache';
import {
  getCachedData,
  setCachedData,
  invalidateCache as invalidateCacheUtil,
  generateCacheKey as generateCacheKeyUtil
} from '../utils/cacheUtils';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProductCache = (options = {}) => {
  const {
    includeStock = true,
    pageSize = null,
    category = null,
    subcategory = null,
    forceRefresh = false,
    filters = {},
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
  const { getCachedData: getFirebaseCachedData, setCachedData: setFirebaseCachedData, invalidateCache: invalidateFirebaseCache } = useFirebaseCache();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCacheKey = useCallback(() => {
    const cacheData = {
      type: 'products',
      includeStock,
      pageSize,
      category,
      subcategory,
      ...filters,
      sortBy,
      sortOrder
    };
    return generateCacheKeyUtil(cacheData);
  }, [includeStock, pageSize, category, subcategory, filters, sortBy, sortOrder]);

  const fetchProducts = useCallback(async () => {
    const cacheKey = generateCacheKey();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Product cache hit for ${cacheKey}`);
        setProducts(cachedData);
        setLoading(false);
        return cachedData;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching products from Firebase for ${cacheKey}...`);
      
      let productsData;
      
      // Use optimized query service for complex filters
      if (Object.keys(filters).length > 0 || category || subcategory) {
        const queryFilters = {
          ...filters,
          ...(category && { category }),
          ...(subcategory && { subcategory })
        };
        
        const queryOptions = {
          includeStock,
          limit: pageSize,
          sortBy,
          sortOrder
        };
        
        productsData = await getProductsByFilters(queryFilters, queryOptions);
      } else if (includeStock) {
        productsData = await getProductsWithStock();
      } else {
        productsData = await getAllProducts();
      }
      
      setProducts(productsData);
      setCachedData(cacheKey, productsData);
      setLoading(false);
      
      return productsData;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      setLoading(false);
      return [];
    }
  }, [generateCacheKey, getCachedData, setCachedData, includeStock, pageSize, category, subcategory, filters, sortBy, sortOrder, forceRefresh]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refresh function
  const refresh = useCallback(async (options = {}) => {
    const {
      refreshAll = false,
      category: refreshCategory = null,
      subcategory: refreshSubcategory = null,
      invalidateStock = false
    } = options;
    
    if (refreshAll) {
      // Invalidate all product-related caches
      invalidateCacheUtil('products*');
      invalidateFirebaseCache('products');
      invalidateFirebaseCache('products-withStock');
    } else if (refreshCategory) {
      // Invalidate specific category cache
      invalidateProductCache('category', refreshCategory);
      invalidateCacheUtil(`*category:${refreshCategory}*`);
    } else if (refreshSubcategory) {
      // Invalidate specific subcategory cache
      invalidateProductCache('category', refreshSubcategory);
      invalidateCacheUtil(`*subcategory:${refreshSubcategory}*`);
    } else if (invalidateStock) {
      // Invalidate stock-related caches
      invalidateProductCache('stock');
      invalidateCacheUtil('*includeStock:true*');
    }
    
    return fetchProducts();
  }, [fetchProducts, invalidateFirebaseCache]);

  // Get single product by ID (from cached products)
  const getProductById = useCallback((productId) => {
    return products.find(product => product.id === productId) || null;
  }, [products]);

  // Invalidate cache for specific product changes
  const invalidateProductCacheLocal = useCallback((options = {}) => {
    const {
      productId = null,
      category: invalidateCategory = null,
      subcategory: invalidateSubcategory = null,
      stock = false
    } = options;
    
    if (productId) {
      invalidateProductCache('product', productId);
    }
    
    if (invalidateCategory) {
      invalidateProductCache('category', invalidateCategory);
    }
    
    if (invalidateSubcategory) {
      invalidateProductCache('category', invalidateSubcategory);
    }
    
    if (stock) {
      invalidateProductCache('stock');
    }
    
    // Also invalidate current cache key
    const cacheKey = generateCacheKey();
    invalidateCacheUtil(cacheKey);
  }, [generateCacheKey]);

  // Advanced search function
  const searchProducts = useCallback(async (searchTerm, searchOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchCacheKey = generateCacheKey({
        search: searchTerm,
        ...searchOptions
      });
      
      // Check cache first
      const cachedResults = getCachedData(searchCacheKey);
      if (cachedResults) {
        console.log(`Search cache hit for ${searchTerm}`);
        setProducts(cachedResults);
        setLoading(false);
        return cachedResults;
      }
      
      // Perform search
      const results = await searchProductsOptimized(searchTerm, filters, {
        includeStock,
        limit: pageSize,
        ...searchOptions
      });
      
      setProducts(results);
      setCachedData(searchCacheKey, results);
      setLoading(false);
      
      return results;
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err.message || 'Failed to search products');
      setLoading(false);
      return [];
    }
  }, [generateCacheKey, getCachedData, setCachedData, includeStock, pageSize, filters]);

  // Get featured products
  const fetchFeaturedProducts = useCallback(async (limitCount = 8) => {
    setLoading(true);
    setError(null);
    
    try {
      const featuredCacheKey = generateCacheKey({ featured: true, limit: limitCount });
      
      // Check cache first
      const cachedFeatured = getCachedData(featuredCacheKey);
      if (cachedFeatured) {
        console.log(`Featured products cache hit for limit ${limitCount}`);
        setProducts(cachedFeatured);
        setLoading(false);
        return cachedFeatured;
      }
      
      // Fetch featured products
      const featuredProducts = await getFeaturedProducts(limitCount);
      
      setProducts(featuredProducts);
      setCachedData(featuredCacheKey, featuredProducts);
      setLoading(false);
      
      return featuredProducts;
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError(err.message || 'Failed to fetch featured products');
      setLoading(false);
      return [];
    }
  }, [generateCacheKey, getCachedData, setCachedData]);

  return {
    products,
    loading,
    error,
    refresh,
    getProductById,
    invalidateProductCache: invalidateProductCacheLocal,
    fetchProducts,
    searchProducts,
    fetchFeaturedProducts
  };
};