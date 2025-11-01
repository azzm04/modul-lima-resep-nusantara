// src/hooks/useReviews.js
import { useState, useEffect, useCallback } from 'react';
import reviewService from '../services/reviewService';

// Hook untuk mengambil reviews
export const useReviews = (recipeId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!recipeId) return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching reviews for recipe:', recipeId);
      
      const response = await reviewService.getReviews(recipeId);
      console.log('📥 Reviews response:', response);
      
      // Handle different response formats
      const reviewsData = response.data?.data || response.data || [];
      
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      console.log('✅ Reviews loaded:', reviewsData);
    } catch (err) {
      console.error('❌ Error loading reviews:', err);
      setError(err.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews
  };
};

// Hook untuk membuat review
export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReview = async (recipeId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Creating review:', { recipeId, reviewData });

      const response = await reviewService.createReview(recipeId, reviewData);
      console.log('✅ Review created:', response);

      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      console.error('❌ Error creating review:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create review';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createReview,
    loading,
    error
  };
};

// Hook untuk update review
export const useUpdateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateReview = async (reviewId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Updating review:', { reviewId, reviewData });

      const response = await reviewService.updateReview(reviewId, reviewData);
      console.log('✅ Review updated:', response);

      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (err) {
      console.error('❌ Error updating review:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update review';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateReview,
    loading,
    error
  };
};

// Hook untuk delete review
export const useDeleteReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteReview = async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting review:', reviewId);

      await reviewService.deleteReview(reviewId);
      console.log('✅ Review deleted');

      return {
        success: true
      };
    } catch (err) {
      console.error('❌ Error deleting review:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete review';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteReview,
    loading,
    error
  };
};