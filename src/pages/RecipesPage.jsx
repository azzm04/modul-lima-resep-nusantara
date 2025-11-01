// src/pages/RecipesPage.jsx
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import AdvancedFilter from '../components/common/AdvancedFilter';
import RecipeCard from '../components/RecipeCard';
import { Loader } from 'lucide-react';

export default function RecipesPage({ initialCategory = 'makanan', onRecipeClick }) {
  const [category, setCategory] = useState(initialCategory || 'makanan'); // 'makanan' | 'minuman' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    sortBy: 'created_at',
    order: 'desc',
    prepTimeMax: '',
  });
  const [page, setPage] = useState(1);

  const params = {
    // If category === 'all' -> don't pass category to fetch all
    ...(category && category !== 'all' ? { category } : {}),
    search: searchQuery || undefined,
    difficulty: filters.difficulty || undefined,
    page,
    limit: 12,
    sort_by: filters.sortBy,
    order: filters.order,
  };

  const { recipes, loading, error, pagination, refetch } = useRecipes(params);

  useEffect(() => {
    // Reset page when category/search/filter changes
    setPage(1);
  }, [category, searchQuery, filters.difficulty, filters.sortBy, filters.order]);

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const filteredRecipes = filters.prepTimeMax
    ? recipes.filter(r => Number(r.prep_time || r.waktu_persiapan || 0) <= parseInt(filters.prepTimeMax))
    : recipes;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header with simple tabs */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              {category === 'minuman' ? 'Resep Minuman' : category === 'all' ? 'Semua Resep' : 'Resep Makanan'}
            </h1>
            <p className="text-slate-600 max-w-2xl">
              {category === 'minuman'
                ? 'Temukan berbagai resep minuman segar dan nikmat'
                : category === 'all'
                ? 'Temukan berbagai resep makanan dan minuman nusantara'
                : 'Temukan berbagai resep makanan nusantara yang lezat'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCategory('makanan')}
              className={`px-4 py-2 rounded-xl font-medium ${category === 'makanan' ? 'bg-blue-600 text-white' : 'bg-white/60'}`}
            >
              Makanan
            </button>
            <button
              onClick={() => setCategory('minuman')}
              className={`px-4 py-2 rounded-xl font-medium ${category === 'minuman' ? 'bg-green-600 text-white' : 'bg-white/60'}`}
            >
              Minuman
            </button>
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-xl font-medium ${category === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/60'}`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Filter component */}
        <AdvancedFilter
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          initialFilters={{ ...filters, search: searchQuery }}
        />

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="mt-4 text-gray-600">Memuat resep...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold mb-2">Terjadi Kesalahan</p>
              <p className="text-red-500">{error}</p>
              <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Coba Lagi</button>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Tidak ada resep ditemukan</p>
                <p className="text-gray-500 mt-2">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((r) => (
                  <RecipeCard
                    key={r.id || r.recipe_id}
                    recipe={{ ...r, type: r.category || category }}
                    onClick={(recipe) => onRecipeClick && onRecipeClick(recipe.id || recipe.recipe_id, recipe.category || category)}
                    // pass onToggleFavorite if you want favorite behaviour
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-blue-50 disabled:opacity-50"
                >
                  ← Sebelumnya
                </button>

                <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-xl border border-white/40">
                  <span className="text-slate-700 font-semibold">Halaman {pagination.page} dari {pagination.total_pages}</span>
                  <span className="text-slate-500 text-sm">({pagination.total} resep)</span>
                </div>

                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.total_pages}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-blue-50 disabled:opacity-50"
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}