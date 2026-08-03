// Advanced caching utilities for Firebase optimization

// Default cache duration: 5 minutes
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

// Cache storage
const cache = new Map();
const cacheTimeouts = new Map();

/**
 * Generate a cache key from filters object
 * @param {Object} filters - The filters object
 * @returns {string} - Generated cache key
 */
export const generateCacheKey = (filters) => {
  const sortedKeys = Object.keys(filters).sort();
  const keyParts = sortedKeys.map(key => `${key}:${filters[key]}`);
  return keyParts.join('|');
};

/**
 * Get cached data if valid
 * @param {string} key - Cache key
 * @param {number} customDuration - Custom cache duration in ms
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCachedData = (key, customDuration = DEFAULT_CACHE_DURATION) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < customDuration) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }
  console.log(`Cache miss for ${key}`);
  return null;
};

/**
 * Set data in cache with expiration
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} customDuration - Custom cache duration in ms
 */
export const setCachedData = (key, data, customDuration = DEFAULT_CACHE_DURATION) => {
  console.log(`Caching data for ${key}`);
  
  // Clear any existing timeout for this key
  if (cacheTimeouts.has(key)) {
    clearTimeout(cacheTimeouts.get(key));
  }
  
  // Set new cache entry
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Set timeout to invalidate cache after duration
  const timeoutId = setTimeout(() => {
    console.log(`Cache expired for ${key}`);
    invalidateCache(key);
  }, customDuration);
  
  cacheTimeouts.set(key, timeoutId);
};

/**
 * Invalidate cache for specific key
 * @param {string} key - Cache key to invalidate
 */
export const invalidateCache = (key) => {
  console.log(`Invalidating cache for ${key}`);
  
  // Clear timeout if exists
  if (cacheTimeouts.has(key)) {
    clearTimeout(cacheTimeouts.get(key));
    cacheTimeouts.delete(key);
  }
  
  // Remove from cache
  cache.delete(key);
};

/**
 * Invalidate cache entries matching a pattern
 * @param {string} pattern - Pattern to match (supports wildcards)
 */
export const invalidateCachePattern = (pattern) => {
  console.log(`Invalidating cache pattern: ${pattern}`);
  
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  const keysToDelete = [];
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => invalidateCache(key));
};

/**
 * Clear all cache
 */
export const invalidateAllCache = () => {
  console.log('Invalidating all cache');
  
  // Clear all timeouts
  for (const timeoutId of cacheTimeouts.values()) {
    clearTimeout(timeoutId);
  }
  cacheTimeouts.clear();
  
  // Clear cache
  cache.clear();
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp < DEFAULT_CACHE_DURATION) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }
  
  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    activeTimeouts: cacheTimeouts.size
  };
};

/**
 * Preload cache with data
 * @param {string} key - Cache key
 * @param {Function} dataFunction - Function that returns data to cache
 * @param {number} customDuration - Custom cache duration
 */
export const preloadCache = async (key, dataFunction, customDuration = DEFAULT_CACHE_DURATION) => {
  if (!getCachedData(key, customDuration)) {
    try {
      const data = await dataFunction();
      setCachedData(key, data, customDuration);
      return data;
    } catch (error) {
      console.error(`Error preloading cache for ${key}:`, error);
      return null;
    }
  }
  return getCachedData(key, customDuration);
};

/**
 * Memoize a function with cache
 * @param {Function} fn - Function to memoize
 * @param {Function} keyGenerator - Function to generate cache key from arguments
 * @param {number} duration - Cache duration
 * @returns {Function} - Memoized function
 */
export const memoizeWithCache = (fn, keyGenerator, duration = DEFAULT_CACHE_DURATION) => {
  return async (...args) => {
    const key = keyGenerator(...args);
    
    // Check cache first
    const cached = getCachedData(key, duration);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function and cache result
    try {
      const result = await fn(...args);
      setCachedData(key, result, duration);
      return result;
    } catch (error) {
      console.error(`Error in memoized function for key ${key}:`, error);
      throw error;
    }
  };
};

/**
 * Batch cache operations
 */
export const batchCacheOperations = {
  /**
   * Set multiple cache entries at once
   * @param {Array} entries - Array of {key, data, duration} objects
   */
  setMultiple: (entries) => {
    entries.forEach(({ key, data, duration }) => {
      setCachedData(key, data, duration);
    });
  },
  
  /**
   * Invalidate multiple cache entries at once
   * @param {Array} keys - Array of cache keys to invalidate
   */
  invalidateMultiple: (keys) => {
    keys.forEach(key => invalidateCache(key));
  },
  
  /**
   * Get multiple cache entries at once
   * @param {Array} keys - Array of cache keys
   * @returns {Object} - Object with key-value pairs
   */
  getMultiple: (keys) => {
    const result = {};
    keys.forEach(key => {
      const value = getCachedData(key);
      if (value !== null) {
        result[key] = value;
      }
    });
    return result;
  }
};

// Cleanup function to call when app unmounts
export const cleanup = () => {
  invalidateAllCache();
};