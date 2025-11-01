// src/components/SearchBar.jsx
import { Search, X } from 'lucide-react';
/* eslint-disable react/prop-types */
export default function SearchBar({ searchQuery, setSearchQuery, placeholder = "Cari resep disini..." }) {
  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="mb-8">
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600 text-center">
            Mencari: <span className="font-semibold text-gray-800">&quot;{searchQuery}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
}
