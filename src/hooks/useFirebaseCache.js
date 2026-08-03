import { useState, useCallback, useRef } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useFirebaseCache = () => {
  const [cache, setCache] = useState({});
  const cacheTimeouts = useRef({});
  
  const getCachedData = useCallback((key) => {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${key}`);
      return cached.data;
    }
    console.log(`Cache miss for ${key}`);
    return null;
  }, [cache]);
  
  const setCachedData = useCallback((key, data) => {
    console.log(`Caching data for ${key}`);
    
    // Clear any existing timeout for this key
    if (cacheTimeouts.current[key]) {
      clearTimeout(cacheTimeouts.current[key]);
    }
    
    // Set new cache entry
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
    
    // Set timeout to invalidate cache after CACHE_DURATION
    cacheTimeouts.current[key] = setTimeout(() => {
      console.log(`Cache expired for ${key}`);
      invalidateCache(key);
    }, CACHE_DURATION);
  }, []);
  
  const invalidateCache = useCallback((key) => {
    console.log(`Invalidating cache for ${key}`);
    
    // Clear timeout if exists
    if (cacheTimeouts.current[key]) {
      clearTimeout(cacheTimeouts.current[key]);
      delete cacheTimeouts.current[key];
    }
    
    // Remove from cache
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
  }, []);
  
  const invalidateAllCache = useCallback(() => {
    console.log('Invalidating all cache');
    
    // Clear all timeouts
    Object.values(cacheTimeouts.current).forEach(timeout => clearTimeout(timeout));
    cacheTimeouts.current = {};
    
    // Clear cache
    setCache({});
  }, []);
  
  // Cleanup timeouts on unmount
  const clearAllTimeouts = useCallback(() => {
    Object.values(cacheTimeouts.current).forEach(timeout => clearTimeout(timeout));
    cacheTimeouts.current = {};
  }, []);
  
  return { 
    getCachedData, 
    setCachedData, 
    invalidateCache, 
    invalidateAllCache,
    clearAllTimeouts
  };
};