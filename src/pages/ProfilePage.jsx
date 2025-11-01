// src/pages/ProfilePage.jsx
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

import {
  Heart,
  Clock,
  User,
  Camera,
  Star,
  Edit2,
  Save,
  X,
  Loader,
} from "lucide-react";
import { getUserIdentifier } from "../hooks/useFavorites";
import userService from "../services/userService";

export default function ProfilePage({ onRecipeClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: "Pengguna",
    bio: "",
    avatar: null,
    userId: "",
  });
  const [tempProfile, setTempProfile] = useState(profile);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState("favorites");
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===== LOAD DATA ON MOUNT =====
  useEffect(() => {
    loadProfile();
    loadFavorites();
    loadUserReviews();
  }, []);

  // ===== LISTEN TO FAVORITES CHANGES =====
  useEffect(() => {
    const handleFavoritesChange = () => {
      console.log("🔄 Favorites changed event received, reloading...");
      loadFavorites();
    };

    window.addEventListener("favoritesChanged", handleFavoritesChange);

    return () => {
      window.removeEventListener("favoritesChanged", handleFavoritesChange);
    };
  }, []);

  // ===== LOAD PROFILE =====
  const loadProfile = () => {
    const userProfile = userService.getUserProfile();
    const userId = getUserIdentifier();
    const profileWithId = { ...userProfile, userId };
    setProfile(profileWithId);
    setTempProfile(profileWithId);
    console.log("✅ Profile loaded:", profileWithId);
  };

  // ===== LOAD FAVORITES FROM LOCALSTORAGE =====
  const loadFavorites = () => {
    try {
      setLoading(true);
      const userIdentifier = getUserIdentifier();
      const key = `favorites_${userIdentifier}`;
      const stored = localStorage.getItem(key);

      console.log("📦 Loading favorites from key:", key);
      console.log("📦 Raw localStorage data:", stored);

      if (stored) {
        const favorites = JSON.parse(stored);
        console.log("✅ Parsed favorites:", favorites);
        console.log("✅ Favorites count:", favorites.length);
        setFavoriteRecipes(favorites);
      } else {
        console.log("ℹ️ No favorites found in localStorage");
        setFavoriteRecipes([]);
      }
    } catch (error) {
      console.error("❌ Error loading favorites:", error);
      setFavoriteRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== Ambil nama resep dari localStorage favorites =====
  const getRecipeNameById = (recipeId) => {
    try {
      const userIdentifier = getUserIdentifier();
      const favoritesKey = `favorites_${userIdentifier}`;
      const stored = localStorage.getItem(favoritesKey);

      if (stored) {
        const favorites = JSON.parse(stored);
        const recipe = favorites.find((r) => r.id === recipeId);
        return recipe ? recipe.name : "Resep Tidak Dikenal";
      }
      return "Resep Tidak Dikenal";
    } catch (error) {
      console.error("❌ Error getting recipe name:", error);
      return "Resep Tidak Dikenal";
    }
  };

  // ===== LOAD USER REVIEWS FROM LOCALSTORAGE =====
const loadUserReviews = () => {
  try {
    setLoading(true);
    const userProfile = userService.getUserProfile();
    const userId = getUserIdentifier();
    const username = userProfile.username || userId;
    
    console.log('🔄 Loading reviews for user:', username);
    console.log('🔄 User ID:', userId);

    // Debug: List all localStorage keys
    console.log('📦 All localStorage keys:');
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      allKeys.push(key);
      console.log(`  - ${key}`);
    }

    const allReviewsFromStorage = [];
    
    // 1. Cek user_reviews_* (dari ProfilePage save)
    const userReviewsKey = `user_reviews_${userProfile.userId}`;
    console.log(`📦 Checking key: ${userReviewsKey}`);
    const userReviewsData = localStorage.getItem(userReviewsKey);
    if (userReviewsData) {
      try {
        const reviews = JSON.parse(userReviewsData);
        console.log(`✅ Found ${reviews.length} reviews in ${userReviewsKey}`);
        reviews.forEach(review => {
          allReviewsFromStorage.push({
            ...review,
            recipeName: review.recipeName || getRecipeNameById(review.recipeId),
            timestamp: review.timestamp || review.date || review.created_at || new Date().toISOString()
          });
        });
      } catch (e) {
        console.error(`❌ Error parsing ${userReviewsKey}:`, e);
      }
    }

    // 2. Cek semua recipe_reviews_* untuk review dari user ini
    const recipeReviewsKeys = allKeys.filter(k => k.startsWith('recipe_reviews_'));
    console.log(`📦 Found ${recipeReviewsKeys.length} recipe_reviews_* keys`);
    
    recipeReviewsKeys.forEach(key => {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        try {
          const reviews = JSON.parse(storedData);
          const recipeId = key.replace('recipe_reviews_', '');
          
          // Filter reviews dari user ini
          const userReviewsFromRecipe = reviews.filter(review => 
            review.user_identifier === username || 
            review.user_identifier === userId
          );
          
          if (userReviewsFromRecipe.length > 0) {
            console.log(`✅ Found ${userReviewsFromRecipe.length} user reviews in ${key}`);
            userReviewsFromRecipe.forEach(review => {
              allReviewsFromStorage.push({
                ...review,
                recipeId: review.recipe_id || recipeId,
                recipeName: getRecipeNameById(review.recipe_id || recipeId),
                timestamp: review.created_at || review.timestamp || review.date || new Date().toISOString()
              });
            });
          }
        } catch (e) {
          console.error(`❌ Error parsing ${key}:`, e);
        }
      }
    });

    // Hapus duplikat berdasarkan id atau kombinasi recipeId + rating + comment
    const uniqueReviews = [];
    const seen = new Set();
    
    allReviewsFromStorage.forEach(review => {
      const key = review.id || `${review.recipeId}_${review.rating}_${review.comment}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueReviews.push(review);
      }
    });

    // Sort reviews by timestamp, newest first
    uniqueReviews.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });

    console.log('✅ Total unique reviews found:', uniqueReviews.length);
    console.log('✅ Final processed reviews:', uniqueReviews);
    setUserReviews(uniqueReviews);
  } catch (error) {
    console.error('❌ Error loading reviews:', error);
    setUserReviews([]);
  } finally {
    setLoading(false);
  }
};

  // ===== HANDLE AVATAR CHANGE =====
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ===== HANDLE SAVE PROFILE =====
  const handleSave = () => {
    if (!tempProfile.username.trim()) {
      alert("Username tidak boleh kosong");
      return;
    }

    const result = userService.saveUserProfile(tempProfile);
    if (result.success) {
      setProfile(tempProfile);
      setIsEditing(false);
      alert("Profile berhasil diperbarui!");
      loadUserReviews(); // Reload reviews with updated username
    } else {
      alert("Gagal menyimpan profile");
    }
  };

  // ===== HANDLE CANCEL EDIT =====
  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  // ===== FORMAT DATE =====
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("❌ Error formatting date:", error);
      return dateString;
    }
  };

  // ===== GET DIFFICULTY COLOR =====
  const getDifficultyColor = (difficulty) => {
    const colors = {
      mudah: "bg-green-100 text-green-800",
      sedang: "bg-yellow-100 text-yellow-800",
      sulit: "bg-red-100 text-red-800",
    };
    return colors[difficulty?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ===== PROFILE HEADER ===== */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/40 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                {tempProfile.avatar ? (
                  <img
                    src={tempProfile.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left w-full">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={tempProfile.username}
                      onChange={(e) =>
                        setTempProfile((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan username"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bio (Opsional)
                    </label>
                    <textarea
                      value={tempProfile.bio}
                      onChange={(e) =>
                        setTempProfile((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {tempProfile.bio.length}/200 karakter
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="text-slate-600 mb-4 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-6 justify-center md:justify-start text-sm">
                    <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div>
                        <span className="font-bold text-lg">
                          {favoriteRecipes.length}
                        </span>
                        <span className="text-slate-500 ml-1">Favorit</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                      <Star className="w-5 h-5 text-amber-500" />
                      <div>
                        <span className="font-bold text-lg">
                          {userReviews.length}
                        </span>
                        <span className="text-slate-500 ml-1">Ulasan</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Edit Button */}
            <div className="w-full md:w-auto">
              {isEditing ? (
                <div className="flex gap-2 justify-center md:justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-2 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profil
                </button>
              )}
            </div>
          </div>

          {/* User ID Info */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              User ID:{" "}
              <code className="bg-slate-100 px-2 py-1 rounded">
                {profile.userId}
              </code>
            </p>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === "favorites"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white/60 text-slate-700 hover:bg-white/80"
            }`}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Resep Favorit ({favoriteRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === "reviews"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white/60 text-slate-700 hover:bg-white/80"
            }`}
          >
            <Star className="w-5 h-5 inline mr-2" />
            Ulasan Saya ({userReviews.length})
          </button>
        </div>

        {/* ===== TAB CONTENT ===== */}
        {activeTab === "favorites" ? (
          /* FAVORITES TAB */
          <div>
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Memuat favorit...</p>
              </div>
            ) : favoriteRecipes.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {favoriteRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() =>
                      onRecipeClick && onRecipeClick(recipe.id, recipe.category)
                    }
                    className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/40 cursor-pointer hover:scale-105 hover:shadow-xl transition-all"
                  >
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">
                        {recipe.name}
                      </h3>
                      {recipe.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {recipe.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.prep_time || 0} min</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                              recipe.difficulty
                            )}`}
                          >
                            {recipe.difficulty}
                          </span>
                        </div>
                        {recipe.average_rating && (
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="text-sm font-semibold">
                              {recipe.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/60 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Belum Ada Resep Favorit
                </h3>
                <p className="text-slate-600 mb-4">
                  Mulai tambahkan resep ke favorit untuk melihatnya di sini
                </p>
              </div>
            )}
          </div>
        ) : (
          /* REVIEWS TAB */
          <div>
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Memuat ulasan...</p>
              </div>
            ) : userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review, index) => (
                  <div
                    key={index}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-800 mb-1">
                          {review.recipeName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= review.rating
                                    ? "text-amber-500 fill-current"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 whitespace-nowrap ml-4">
                        {formatDate(review.timestamp || review.date)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/60 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Belum Ada Ulasan
                </h3>
                <p className="text-slate-600 mb-4">
                  Berikan ulasan pada resep untuk melihatnya di sini
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}