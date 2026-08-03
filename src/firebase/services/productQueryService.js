import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast
} from 'firebase/firestore';
import { db } from '../config';
import {
  generateCacheKey,
  getCachedData,
  setCachedData,
  invalidateCache,
  invalidateCachePattern,
  memoizeWithCache
} from '../../utils/cacheUtils';

const PRODUCTS_COLLECTION = 'products';

// Cache duration for product queries (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Generate a cache key for product queries
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options
 * @returns {string} - Cache key
 */
const generateProductCacheKey = (filters = {}, options = {}) => {
  const cacheData = {
    ...filters,
    ...options,
    type: 'products'
  };
  return generateCacheKey(cacheData);
};

/**
 * Execute a Firestore query with caching
 * @param {Object} queryConfig - Query configuration
 * @returns {Promise<Array>} - Query results
 */
const executeQueryWithCache = async (queryConfig) => {
  const { filters = {}, options = {}, q } = queryConfig;
  const cacheKey = generateProductCacheKey(filters, options);
  
  // Check cache first
  const cached = getCachedData(cacheKey, CACHE_DURATION);
  if (cached) {
    return cached;
  }
  
  try {
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Cache the results
    setCachedData(cacheKey, products, CACHE_DURATION);
    
    return products;
  } catch (error) {
    console.error('Error executing product query:', error);
    throw error;
  }
};

/**
 * Get products with advanced filtering
 * @param {Object} filters - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Filtered products
 */
export const getProductsByFilters = async (filters = {}, options = {}) => {
  const {
    category,
    subcategory,
    minPrice,
    maxPrice,
    inStockOnly,
    featured
  } = filters;
  
  const {
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit: limitCount = null,
    startAfter: startAfterDoc,
    includeStock = true
  } = options;
  
  // Build query constraints
  const constraints = [];
  
  // Add filter constraints
  if (category) {
    constraints.push(where('category', '==', category));
  }
  
  if (subcategory) {
    constraints.push(where('subcategory', '==', subcategory));
  }
  
  if (minPrice !== undefined) {
    constraints.push(where('price', '>=', minPrice));
  }
  
  if (maxPrice !== undefined) {
    constraints.push(where('price', '<=', maxPrice));
  }
  
  if (featured !== undefined) {
    constraints.push(where('featured', '==', featured));
  }
  
  // Add sorting
  constraints.push(orderBy(sortBy, sortOrder));
  
  // Add pagination
  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc));
  }
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  // Build query
  let productsRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(productsRef, ...constraints);
  
  // Execute query with caching
  let products = await executeQueryWithCache({
    filters,
    options,
    q
  });
  
  // Apply client-side filters if needed
  if (inStockOnly) {
    products = products.filter(product => (product.stock || 0) > 0);
  }
  
  // Add stock information if requested
  if (includeStock) {
    products = products.map(product => ({
      ...product,
      stock: product.stock || 0,
      inStock: (product.stock || 0) > 0
    }));
  }
  
  return products;
};

/**
 * Get products by category with caching
 * @param {string} category - Category name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Products in category
 */
export const getProductsByCategory = async (category, options = {}) => {
  return getProductsByFilters({ category }, options);
};

/**
 * Get products by subcategory with caching
 * @param {string} subcategory - Subcategory name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Products in subcategory
 */
export const getProductsBySubcategory = async (subcategory, options = {}) => {
  return getProductsByFilters({ subcategory }, options);
};

/**
 * Get products by category or subcategory (optimized)
 * @param {string} categoryOrSubcategory - Category or subcategory name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Products matching category or subcategory
 */
export const getProductsByCategoryOrSubcategory = async (categoryOrSubcategory, options = {}) => {
  // Use a single query with array-contains for better performance
  // This requires the category and subcategory to be in an array field
  // If not available, fall back to parallel queries with caching
  
  try {
    // Try parallel queries with caching first
    const [categoryProducts, subcategoryProducts] = await Promise.all([
      getProductsByCategory(categoryOrSubcategory, options),
      getProductsBySubcategory(categoryOrSubcategory, options)
    ]);
    
    // Combine and deduplicate results
    const allProducts = [...categoryProducts, ...subcategoryProducts];
    const uniqueProducts = allProducts.filter((product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
    );
    
    // Cache the combined result
    const cacheKey = generateProductCacheKey(
      { categoryOrSubcategory },
      { ...options, combined: true }
    );
    setCachedData(cacheKey, uniqueProducts, CACHE_DURATION);
    
    return uniqueProducts;
  } catch (error) {
    console.error('Error fetching products by category or subcategory:', error);
    throw error;
  }
};

/**
 * Get featured products with caching
 * @param {number} limitCount - Maximum number of products
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Featured products
 */
export const getFeaturedProducts = async (limitCount = 8, options = {}) => {
  return getProductsByFilters(
    { featured: true },
    { ...options, limit: limitCount, sortBy: 'createdAt', sortOrder: 'desc' }
  );
};

/**
 * Get product by ID with caching
 * @param {string} productId - Product ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Product data
 */
export const getProductById = async (productId, options = {}) => {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  const cacheKey = generateProductCacheKey(
    { productId },
    options
  );
  
  // Check cache first
  const cached = getCachedData(cacheKey, CACHE_DURATION);
  if (cached) {
    return cached;
  }
  
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, String(productId));
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }
    
    const product = { id: productDoc.id, ...productDoc.data() };
    
    // Add stock information if requested
    if (options.includeStock) {
      product.stock = product.stock || 0;
      product.inStock = product.stock > 0;
    }
    
    // Cache the result
    setCachedData(cacheKey, product, CACHE_DURATION);
    
    return product;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

/**
 * Get products with stock information (optimized)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Products with stock info
 */
export const getProductsWithStock = async (options = {}) => {
  return getProductsByFilters({}, { ...options, includeStock: true });
};

/**
 * Paginated product query
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Paginated results
 */
export const getProductsPaginated = async (
  filters = {},
  pagination = {},
  options = {}
) => {
  const {
    pageSize = 20,
    currentPage = 1,
    direction = 'forward' // 'forward' or 'backward'
  } = pagination;
  
  const queryOptions = {
    ...options,
    limit: pageSize + 1 // Get one extra to determine if there are more pages
  };
  
  // Add pagination based on direction
  if (direction === 'backward' && currentPage > 1) {
    // For backward pagination, we'd need to implement cursor-based pagination
    // This is a simplified version
    queryOptions.sortOrder = 'asc';
  }
  
  const products = await getProductsByFilters(filters, queryOptions);
  
  // Determine if there are more pages
  const hasMore = products.length > pageSize;
  const paginatedProducts = hasMore ? products.slice(0, -1) : products;
  
  return {
    products: paginatedProducts,
    hasMore,
    currentPage,
    pageSize
  };
};

/**
 * Search products with caching
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Search results
 */
export const searchProducts = async (searchTerm, filters = {}, options = {}) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  const cacheKey = generateProductCacheKey(
    { searchTerm, ...filters },
    { ...options, search: true }
  );
  
  // Check cache first
  const cached = getCachedData(cacheKey, CACHE_DURATION);
  if (cached) {
    return cached;
  }
  
  try {
    // For now, implement client-side search with filters
    // In a production app, consider using Firebase extensions like Algolia
    const allProducts = await getProductsByFilters(filters, { ...options, limit: 100 });
    
    const searchResults = allProducts.filter(product => {
      const searchString = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
    
    // Cache search results
    setCachedData(cacheKey, searchResults, CACHE_DURATION);
    
    return searchResults;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Invalidate product cache based on changes
 * @param {string} type - Type of invalidation ('product', 'category', 'all')
 * @param {string} value - Value for invalidation (product ID, category name)
 */
export const invalidateProductCache = (type, value) => {
  switch (type) {
    case 'product':
      // Invalidate specific product cache
      invalidateCachePattern(`*productId:${value}*`);
      break;
      
    case 'category':
      // Invalidate category-related caches
      invalidateCachePattern(`*category:${value}*`);
      invalidateCachePattern(`*subcategory:${value}*`);
      invalidateCachePattern(`*categoryOrSubcategory:${value}*`);
      break;
      
    case 'stock':
      // Invalidate all caches that include stock information
      invalidateCachePattern(`*includeStock:true*`);
      break;
      
    case 'all':
      // Invalidate all product caches
      invalidateCachePattern('products*');
      break;
      
    default:
      console.warn('Unknown cache invalidation type:', type);
  }
};

// Memoized versions of frequently used functions
export const memoizedGetProductsByFilters = memoizeWithCache(
  getProductsByFilters,
  (filters, options) => generateProductCacheKey(filters, options),
  CACHE_DURATION
);

export const memoizedGetProductById = memoizeWithCache(
  getProductById,
  (productId, options) => generateProductCacheKey({ productId }, options),
  CACHE_DURATION
);