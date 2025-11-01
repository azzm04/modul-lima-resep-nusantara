import { useFavorites } from '../hooks/useFavorites';
import RecipeCard from '../components/recipe/RecipeCard';

export default function FavoritePage() {
  const { favorites, loading, error } = useFavorites();

  if (loading) return <p className="text-center mt-10">Memuat data favorit...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resep Favorit Saya</h1>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <RecipeCard key={item.id} recipe={item.recipe} />
          ))}
        </div>
      ) : (
        <p className="text-slate-600 text-center mt-10">
          Belum ada resep favorit. Tambahkan dari halaman resep!
        </p>
      )}
    </div>
  );
}
