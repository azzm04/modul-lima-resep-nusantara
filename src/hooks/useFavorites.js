// src/hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import favoriteService from '../services/favoriteService';
import userService from '../services/userService';

/**
 * Get user identifier from localStorage or generate new one
 */
export const getUserIdentifier = () => {
  return userService.getUserIdentifier();
};

/**
 * Get favorites from localStorage
 */
const getLocalFavorites = (userIdentifier) => {
  try {
    const key = `favorites_${userIdentifier}`;
    const stored = localStorage.getItem(key);
    console.log('📦 LocalStorage favorites key:', key);
    console.log('📦 LocalStorage favorites data:', stored);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Error reading local favorites:', error);
    return [];
  }
};

/**
 * Save favorites to localStorage
 */
const saveLocalFavorites = (userIdentifier, favorites) => {
  try {
    const key = `favorites_${userIdentifier}`;
    localStorage.setItem(key, JSON.stringify(favorites));
    console.log('💾 Saved favorites to localStorage:', favorites);
  } catch (error) {
    console.error('❌ Error saving local favorites:', error);
  }
};

/**
 * Custom hook for fetching favorites
 * Uses localStorage as primary source, with API as fallback/sync
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userIdentifier = getUserIdentifier();

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching favorites for user:', userIdentifier);

      // 1. Try to get from localStorage first (faster)
      const localFavorites = getLocalFavorites(userIdentifier);
      console.log('📦 Local favorites:', localFavorites);

      if (localFavorites && localFavorites.length > 0) {
        setFavorites(localFavorites);
        setLoading(false);
        console.log('✅ Using local favorites:', localFavorites.length);
        return;
      }

      // 2. If localStorage is empty, try API
      console.log('🌐 Fetching from API...');
      const response = await favoriteService.getFavorites(userIdentifier);
      console.log('🌐 API response:', response);

      if (response && response.success && response.data) {
        const apiFavorites = Array.isArray(response.data) ? response.data : [];
        setFavorites(apiFavorites);
        
        // Save to localStorage for next time
        if (apiFavorites.length > 0) {
          saveLocalFavorites(userIdentifier, apiFavorites);
        }
        
        console.log('✅ Using API favorites:', apiFavorites.length);
      } else {
        setFavorites([]);
        console.log('ℹ️ No favorites found');
      }
    } catch (err) {
      console.error('❌ Error in useFavorites:', err);
      
      // On error, still try to use local favorites
      const localFavorites = getLocalFavorites(userIdentifier);
      if (localFavorites && localFavorites.length > 0) {
        setFavorites(localFavorites);
        setError(null); // Don't show error if we have local data
        console.log('⚠️ API failed, using local favorites:', localFavorites.length);
      } else {
        setError(err.message || 'Gagal memuat favorit');
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userIdentifier]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
  };
}

/**
 * Custom hook for toggling favorites
 */
export function useToggleFavorite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userIdentifier = getUserIdentifier();

  const toggleFavorite = async (recipeId, recipeData = null) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Toggling favorite:', recipeId);

      // 1. Update localStorage immediately (optimistic update)
      const localFavorites = getLocalFavorites(userIdentifier);
      const existingIndex = localFavorites.findIndex(
        fav => (fav.id === recipeId || fav.recipe_id === recipeId)
      );

      let newFavorites;
      let isAdding = false;

      if (existingIndex >= 0) {
        // Remove from favorites
        newFavorites = localFavorites.filter((_, i) => i !== existingIndex);
        console.log('➖ Removing from favorites');
      } else {
        // Add to favorites
        isAdding = true;
        const favoriteItem = recipeData || { id: recipeId, recipe_id: recipeId };
        newFavorites = [...localFavorites, favoriteItem];
        console.log('➕ Adding to favorites');
      }

      // Save to localStorage
      saveLocalFavorites(userIdentifier, newFavorites);

      // 2. Try to sync with API (but don't fail if it doesn't work)
      try {
        const response = await favoriteService.toggleFavorite({
          recipe_id: recipeId,
          user_identifier: userIdentifier,
        });
        console.log('✅ API sync successful:', response);
      } catch (apiError) {
        console.warn('⚠️ API sync failed, but local update succeeded:', apiError);
        // Don't throw error - localStorage update is already done
      }

      return { 
        success: true, 
        data: { isAdding, favorites: newFavorites }
      };
    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
      setError(err.message || 'Gagal mengubah favorit');
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleFavorite,
    loading,
    error,
  };
}

/**
 * Custom hook to check if a recipe is favorited
 */
export function useIsFavorited(recipeId) {
  const { favorites, loading: fetchLoading, refetch } = useFavorites();
  const { toggleFavorite: toggle, loading: toggleLoading } = useToggleFavorite();

  // Check if recipe is in favorites (check both id and recipe_id)
  const isFavorited = Array.isArray(favorites) && favorites.some(
    fav => fav.id === recipeId || fav.recipe_id === recipeId
  );

  const toggleFavorite = async (recipeData = null) => {
    const result = await toggle(recipeId, recipeData);
    if (result && result.success) {
      // Refresh favorites list
      await refetch();
    }
    return result;
  };

  return {
    isFavorited,
    loading: fetchLoading || toggleLoading,
    toggleFavorite,
  };
}