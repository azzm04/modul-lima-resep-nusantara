// src/components/RecipeCard.jsx
import { Clock, ChefHat, Heart } from 'lucide-react';
import PropTypes from 'prop-types';

export default function RecipeCard({ 
  recipe, 
  onClick, 
  isFavorite = false, 
  onToggleFavorite 
}) {
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Mencegah trigger onClick card
    if (onToggleFavorite) onToggleFavorite(recipe);
  };

  return (
    <div
      onClick={() => onClick(recipe)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Image Container dengan Favorite Button */}
      <div className="relative h-48 overflow-hidden">
        { (recipe.image || recipe.image_url) ? (
          <img
            src={recipe.image || recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ChefHat className="w-20 h-20 text-gray-300" />
          </div>
        )}
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isFavorite
              ? 'bg-red-500 text-white shadow-lg scale-110'
              : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
          aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-current' : ''}
          />
        </button>
        
        {/* Badge Type */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            recipe.type === 'makanan'
              ? 'bg-blue-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {recipe.type === 'makanan' ? 'Makanan' : 'Minuman'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {recipe.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.waktu_persiapan}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat size={16} />
            <span>{recipe.porsi}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

RecipeCard.propTypes = {
  recipe: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};