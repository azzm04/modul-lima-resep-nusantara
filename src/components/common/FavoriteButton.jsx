// src/components/common/FavoriteButton.jsx
/*eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function FavoriteButton({ 
  recipeId, 
  recipeData = null, // ✅ Terima data resep lengkap
  onToggle, 
  showCount = false, 
  initialCount = 0, 
  size = 'md' 
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // ✅ Get user identifier
  const getUserIdentifier = () => {
    let userId = localStorage.getItem('user_identifier');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_identifier', userId);
    }
    return userId;
  };

  // ✅ Get favorites from localStorage
  const getLocalFavorites = () => {
    try {
      const userIdentifier = getUserIdentifier();
      const key = `favorites_${userIdentifier}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  };

  // ✅ Save favorites to localStorage
  const saveLocalFavorites = (favorites) => {
    try {
      const userIdentifier = getUserIdentifier();
      const key = `favorites_${userIdentifier}`;
      localStorage.setItem(key, JSON.stringify(favorites));
      console.log('💾 Favorites saved:', favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Check if favorited on mount
  useEffect(() => {
    const favorites = getLocalFavorites();
    const isFav = favorites.some(fav => 
      fav.id === recipeId || fav.recipe_id === recipeId
    );
    setIsFavorited(isFav);
  }, [recipeId]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const favorites = getLocalFavorites();
    const existingIndex = favorites.findIndex(fav => 
      fav.id === recipeId || fav.recipe_id === recipeId
    );

    let newFavoritedState;
    let newFavorites;

    if (existingIndex > -1) {
      // Remove from favorites
      newFavorites = favorites.filter((_, i) => i !== existingIndex);
      newFavoritedState = false;
      setFavoriteCount(prev => Math.max(0, prev - 1));
      console.log('➖ Removed from favorites:', recipeId);
    } else {
      // Add to favorites with full recipe data
      const favoriteItem = recipeData ? {
        id: recipeId,
        recipe_id: recipeId,
        name: recipeData.name,
        image_url: recipeData.image_url,
        category: recipeData.category,
        difficulty: recipeData.difficulty,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        average_rating: recipeData.average_rating,
        description: recipeData.description,
        created_at: new Date().toISOString()
      } : {
        id: recipeId,
        recipe_id: recipeId,
        created_at: new Date().toISOString()
      };

      newFavorites = [...favorites, favoriteItem];
      newFavoritedState = true;
      setFavoriteCount(prev => prev + 1);
      console.log('➕ Added to favorites:', favoriteItem);
    }

    // Save to localStorage
    saveLocalFavorites(newFavorites);
    setIsFavorited(newFavoritedState);

    // ✅ Dispatch event untuk notify ProfilePage
    window.dispatchEvent(new CustomEvent('favoritesChanged', { 
      detail: { favorites: newFavorites } 
    }));

    // Call parent callback
    if (onToggle) {
      onToggle(recipeId, newFavoritedState);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizes[size]} rounded-full flex items-center justify-center gap-1.5
        transition-all duration-200
        ${isFavorited
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-red-500'
        }
        backdrop-blur-sm shadow-md hover:shadow-lg
        ${isAnimating ? 'scale-125' : 'scale-100'}
        group
      `}
      title={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
    >
      <Heart
        className={`
          ${iconSizes[size]}
          transition-all duration-200
          ${isFavorited ? 'fill-current' : ''}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      />
      {showCount && favoriteCount > 0 && (
        <span className="text-xs font-semibold">
          {favoriteCount > 999 ? '999+' : favoriteCount}
        </span>
      )}
    </button>
  );
}