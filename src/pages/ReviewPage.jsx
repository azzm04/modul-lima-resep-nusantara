import { useReviews } from '../hooks/useReviews';
import { formatDate } from '../utils/helpers';
import { Star } from 'lucide-react';
/*eslint-disable react/prop-types */

export default function ReviewPage({ recipeId }) {
  const { reviews, loading, error } = useReviews(recipeId);

  if (loading) return <p className="text-center mt-10">Memuat ulasan...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ulasan Resep</h1>
      {reviews.length === 0 ? (
        <p className="text-slate-600">Belum ada ulasan untuk resep ini.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-xl bg-white/70 shadow">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{review.user_identifier}</p>
                <p className="text-sm text-slate-500">{formatDate(review.created_at)}</p>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating ? 'text-amber-500 fill-current' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
