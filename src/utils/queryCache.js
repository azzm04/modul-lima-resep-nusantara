// src/utils/queryCache.js

/**
 * Simple in-memory cache for API queries
 * Prevents duplicate network requests for the same data
 */
class QueryCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Generate cache key from URL and params
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}?${sortedParams}`;
  }

  /**
   * Get cached data
   */
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired (default 5 minutes)
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache data
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Check if request is pending
   */
  getPending(key) {
    return this.pendingRequests.get(key);
  }

  /**
   * Set pending request
   */
  setPending(key, promise) {
    this.pendingRequests.set(key, promise);
  }

  /**
   * Remove pending request
   */
  removePending(key) {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear specific cache by key pattern
   */
  clearByPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const queryCache = new QueryCache();

/**
 * Fetch with cache support
 * Prevents duplicate requests and caches responses
 */
export async function fetchWithCache(url, options = {}, cacheOptions = {}) {
  const {
    params = {},
    ttl = 5 * 60 * 1000, // 5 minutes default
    forceRefresh = false
  } = cacheOptions;

  // Generate cache key
  const cacheKey = queryCache.generateKey(url, params);

  // Return cached data if available and not force refreshing
  if (!forceRefresh) {
    const cachedData = queryCache.get(cacheKey);
    if (cachedData) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return cachedData;
    }

    // Check if request is already pending
    const pendingRequest = queryCache.getPending(cacheKey);
    if (pendingRequest) {
      console.log(`[Cache PENDING] ${cacheKey}`);
      return pendingRequest;
    }
  }

  // Build URL with params
  const urlWithParams = new URL(url);
  Object.keys(params).forEach(key => {
    urlWithParams.searchParams.append(key, params[key]);
  });

  // Make the request
  console.log(`[Cache MISS] ${cacheKey}`);
  const requestPromise = fetch(urlWithParams.toString(), options)
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Cache the response
      queryCache.set(cacheKey, data, ttl);
      queryCache.removePending(cacheKey);
      
      return data;
    })
    .catch(error => {
      queryCache.removePending(cacheKey);
      throw error;
    });

  // Store pending request
  queryCache.setPending(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Hook for using cached queries
 */
export function useCachedQuery(url, options = {}, cacheOptions = {}) {
  // You can integrate this with React Query or SWR for better state management
  // This is a basic implementation
  return fetchWithCache(url, options, cacheOptions);
}