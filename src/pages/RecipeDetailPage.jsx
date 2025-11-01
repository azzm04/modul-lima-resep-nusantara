/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useRecipe } from '../hooks/useRecipes';
import { useReviews, useCreateReview } from '../hooks/useReviews';
import { useIsFavorited, getUserIdentifier } from '../hooks/useFavorites';
import { formatDate, getDifficultyColor } from '../utils/helpers';
import { Heart, Clock, Users, ChefHat } from 'lucide-react';
import userService from '../services/userService';

export default function RecipeDetailPage({ recipeId, onBack }) {
  const { recipe, loading: recipeLoading, error: recipeError } = useRecipe(recipeId);
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(recipeId);
  const { createReview, loading: createLoading } = useCreateReview();
  const { isFavorited, loading: favLoading, toggleFavorite } = useIsFavorited(recipeId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm] = useState(true);

  const handleSubmitReview = async (e) => {
  e.preventDefault();

  if (comment.length > 500) {
    alert('Komentar maksimal 500 karakter');
    return;
  }

  try {
    const userProfile = userService.getUserProfile();
    const userId = getUserIdentifier();
    const username = userProfile.username || userId;

    const reviewData = {
      user_identifier: username,
      rating: rating,
      comment: comment.trim(),
    };

    console.log('📤 Sending review:', reviewData);
    const result = await createReview(recipeId, reviewData);
    console.log('📥 Review result:', result);

    if (result && result.success !== false) {
      // Simpan ke localStorage untuk riwayat ulasan pengguna
      try {
        const userReviewsKey = `user_reviews_${userProfile.userId}`;
        const existingReviews = JSON.parse(localStorage.getItem(userReviewsKey) || '[]');

        const newReview = {
          id: result.data?.id || Date.now().toString(),
          recipeId: recipeId,
          recipe_id: recipeId,
          recipeName: recipe?.name || 'Unknown Recipe',
          rating: rating,
          comment: comment.trim(),
          date: new Date().toLocaleDateString('id-ID'),
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          user_identifier: username,
        };

        existingReviews.push(newReview);
        localStorage.setItem(userReviewsKey, JSON.stringify(existingReviews));
        console.log(`💾 Review saved to ${userReviewsKey}`);
        console.log('💾 Saved review:', newReview);
      } catch (error) {
        console.error('❌ Error saving review to localStorage:', error);
      }

      alert('✅ Ulasan berhasil dikirim!');
      
      // Reset form dan refresh daftar review
      setComment('');
      setRating(5);
      setTimeout(refetchReviews, 500);
    } else {
      const errorMsg = result?.message || result?.error || 'Gagal mengirim ulasan';
      alert('❌ ' + errorMsg);
    }
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    alert('❌ Terjadi kesalahan: ' + (error.message || 'Silakan coba lagi'));
  }
};

  const handleToggleFavorite = async () => {
    await toggleFavorite();
  };

  if (recipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (recipeError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {recipeError}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Resep tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Kembali
          </button>
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className={`p-2 rounded-full transition-colors ${
              isFavorited
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Heart className={isFavorited ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Gambar Resep */}
        <div className="mb-8">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>

        {/* Detail Resep */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {recipe.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {recipe.category}
            </span>
            {recipe.is_featured && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{recipe.description}</p>

          {/* Info Resep */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Info icon={<Clock />} label="Persiapan" value={`${recipe.prep_time} menit`} />
            <Info icon={<ChefHat />} label="Memasak" value={`${recipe.cook_time} menit`} />
            <Info icon={<Users />} label="Porsi" value={`${recipe.servings} orang`} />
            <Info icon={<Heart />} label="Rating" value={`${recipe.average_rating?.toFixed(1) || 'N/A'} (${recipe.review_count || 0})`} />
          </div>
        </div>

        {/* Bahan-bahan */}
        <Section title="Bahan-bahan">
          <ul className="space-y-2">
            {recipe.ingredients?.map((ingredient, index) => (
              <li key={ingredient.id || index} className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span className="text-gray-700">
                  {ingredient.name} - {ingredient.quantity}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Langkah-langkah */}
        <Section title="Langkah-langkah">
          <ol className="space-y-4">
            {recipe.steps?.map((step) => (
              <li key={step.id} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {step.step_number}
                </span>
                <p className="text-gray-700 flex-1 pt-1">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Ulasan */}
        <Section title={`Ulasan (${reviews?.length || 0})`}>
          {showReviewForm && (
            <ReviewForm
              rating={rating}
              comment={comment}
              setRating={setRating}
              setComment={setComment}
              createLoading={createLoading}
              onSubmit={handleSubmitReview}
            />
          )}

          <ReviewsList reviews={reviews} loading={reviewsLoading} />
        </Section>
      </div>
    </div>
  );
}

// Komponen bantu kecil untuk membuat kode lebih bersih
function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-indigo-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ReviewForm({ rating, comment, setRating, setComment, createLoading, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">Tulis Ulasan</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition-all hover:scale-110 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">Rating saat ini: {rating} bintang</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Komentar (Opsional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="Bagikan pengalaman Anda dengan resep ini... (opsional)"
        />
        <p className="text-sm text-gray-500 mt-1">{comment.length}/500 karakter</p>
      </div>

      <button
        type="submit"
        disabled={createLoading}
        className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
      >
        {createLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Mengirim...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Kirim Ulasan
          </>
        )}
      </button>
    </form>
  );
}

function ReviewsList({ reviews, loading }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Memuat ulasan...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Belum ada ulasan</p>
        <p className="text-gray-500 text-sm mt-1">Jadilah yang pertama memberikan ulasan!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {review.user_identifier?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.user_identifier || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
