import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getProductsWithStock,
  getAllProducts,
  getProductsByCategoryOrSubcategory,
  getFeaturedProducts
} from '../firebase/services/productService';
import {
  getProductsByFilters,
  searchProducts as searchProductsOptimized,
  invalidateProductCache as invalidateProductCacheService
} from '../firebase/services/productQueryService';
import { useFirebaseCache } from '../hooks/useFirebaseCache';
import {
  getCachedData,
  setCachedData,
  invalidateCache as invalidateCacheUtil,
  generateCacheKey as generateCacheKeyUtil
} from '../utils/cacheUtils';

const ProductContext = createContext();

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const { getCachedData: getFirebaseCachedData, setCachedData: setFirebaseCachedData, invalidateCache: invalidateFirebaseCache } = useFirebaseCache();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const generateCacheKey = useCallback((options = {}) => {
    const { includeStock = true, category = null, subcategory = null, filters = {} } = options;
    const cacheData = {
      type: 'products',
      includeStock,
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...filters
    };
    return generateCacheKeyUtil(cacheData);
  }, []);

  const fetchProducts = useCallback(async (options = {}) => {
    const {
      includeStock = true,
      category = null,
      subcategory = null,
      filters = {},
      forceRefresh = false
    } = options;
    
    const cacheKey = generateCacheKey({ includeStock, category, subcategory, filters });
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log(`ProductContext cache hit for ${cacheKey}`);
        setProducts(cachedData);
        setLoading(false);
        return cachedData;
      }
    }
    
    // Check if we recently fetched (within last 30 seconds) to avoid rapid successive calls
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 30000 && products.length > 0) {
      console.log('ProductContext using recent data to avoid rapid refetch');
      return products;
    }
    
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    try {
      console.log(`ProductContext fetching products from Firebase for ${cacheKey}...`);
      
      let productsData;
      
      // Use optimized query service for complex filters
      if (Object.keys(filters).length > 0 || category || subcategory) {
        const queryFilters = {
          ...filters,
          ...(category && { category }),
          ...(subcategory && { subcategory })
        };
        
        const queryOptions = { includeStock };
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
      console.error('ProductContext error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      setLoading(false);
      return [];
    }
  }, [generateCacheKey, getCachedData, setCachedData, lastFetchTime, products.length]);

  const getProductsByOptions = useCallback((options = {}) => {
    const { includeStock = true, category = null, subcategory = null, limit = null, filters = {} } = options;
    let filteredProducts = [...products];
    
    // Apply additional filters if specified
    if (Object.keys(filters).length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'minPrice' && product.price) {
            return product.price >= value;
          }
          if (key === 'maxPrice' && product.price) {
            return product.price <= value;
          }
          if (key === 'inStockOnly') {
            return (product.stock || 0) > 0;
          }
          return product[key] === value;
        });
      });
    }
    
    // If category is specified and we don't have category-specific data, filter locally
    if (category && !generateCacheKey({ includeStock, category }).includes('category')) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === category ||
        product.subcategory === category
      );
    }
    
    // If subcategory is specified and we don't have subcategory-specific data, filter locally
    if (subcategory && !generateCacheKey({ includeStock, subcategory }).includes('subcategory')) {
      filteredProducts = filteredProducts.filter(product =>
        product.subcategory === subcategory
      );
    }
    
    // Apply limit if specified
    if (limit) {
      filteredProducts = filteredProducts.slice(0, limit);
    }
    
    return filteredProducts;
  }, [products, generateCacheKey]);

  const getProductById = useCallback((productId) => {
    return products.find(product => product.id === productId) || null;
  }, [products]);

  const refreshProducts = useCallback(async (options = {}) => {
    const {
      category = null,
      subcategory = null,
      all = false,
      invalidateStock = false
    } = options;
    
    if (all) {
      // Invalidate all product-related caches
      invalidateCacheUtil('products*');
      invalidateFirebaseCache('products');
      invalidateFirebaseCache('products-withStock');
    } else if (category) {
      // Invalidate specific category cache
      invalidateProductCacheService('category', category);
      invalidateCacheUtil(`*category:${category}*`);
    } else if (subcategory) {
      // Invalidate specific subcategory cache
      invalidateProductCacheService('category', subcategory);
      invalidateCacheUtil(`*subcategory:${subcategory}*`);
    } else if (invalidateStock) {
      // Invalidate stock-related caches
      invalidateProductCacheService('stock');
      invalidateCacheUtil('*includeStock:true*');
    }
    
    return fetchProducts({ ...options, forceRefresh: true });
  }, [fetchProducts, invalidateFirebaseCache, generateCacheKey]);

  const invalidateProductCache = useCallback((options = {}) => {
    const {
      productId = null,
      category = null,
      subcategory = null,
      stock = false
    } = options;
    
    if (productId) {
      invalidateProductCacheService('product', productId);
    }
    
    if (category) {
      invalidateProductCacheService('category', category);
      invalidateCacheUtil(`*category:${category}*`);
    }
    
    if (subcategory) {
      invalidateProductCacheService('category', subcategory);
      invalidateCacheUtil(`*subcategory:${subcategory}*`);
    }
    
    if (stock) {
      invalidateProductCacheService('stock');
      invalidateCacheUtil('*includeStock:true*');
    }
    
    // Also invalidate current cache key
    const cacheKey = generateCacheKey(options);
    invalidateCacheUtil(cacheKey);
  }, [generateCacheKey]);

  // Search products function
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
        console.log(`ProductContext search cache hit for ${searchTerm}`);
        setProducts(cachedResults);
        setLoading(false);
        return cachedResults;
      }
      
      // Perform search
      const results = await searchProductsOptimized(searchTerm, searchOptions.filters || {}, {
        includeStock: searchOptions.includeStock !== false,
        limit: searchOptions.limit
      });
      
      setProducts(results);
      setCachedData(searchCacheKey, results);
      setLoading(false);
      
      return results;
    } catch (err) {
      console.error('ProductContext error searching products:', err);
      setError(err.message || 'Failed to search products');
      setLoading(false);
      return [];
    }
  }, [generateCacheKey, getCachedData, setCachedData]);

  // Get featured products function
  const getFeaturedProducts = useCallback(async (limitCount = 8) => {
    setLoading(true);
    setError(null);
    
    try {
      const featuredCacheKey = generateCacheKey({ featured: true, limit: limitCount });
      
      // Check cache first
      const cachedFeatured = getCachedData(featuredCacheKey);
      if (cachedFeatured) {
        console.log(`ProductContext featured products cache hit for limit ${limitCount}`);
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
      console.error('ProductContext error fetching featured products:', err);
      setError(err.message || 'Failed to fetch featured products');
      setLoading(false);
      return [];
    }
  }, [generateCacheKey, getCachedData, setCachedData]);

  // Initial fetch of products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    getProductsByOptions,
    getProductById,
    refreshProducts,
    invalidateProductCache,
    searchProducts,
    getFeaturedProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;