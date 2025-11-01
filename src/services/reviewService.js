// src/services/reviewService.js
import { apiClient } from '../config/api';

class ReviewService {
  // Get all reviews for a recipe
  async getReviews(recipeId) {
    try {
      console.log('📥 Fetching reviews for recipe:', recipeId);
      // Ambil dari localStorage
      const reviews = JSON.parse(localStorage.getItem(`recipe_reviews_${recipeId}`) || '[]');
      console.log('✅ Reviews fetched:', reviews);
      return { data: reviews };
    } catch (err) {
      console.error('❌ Error fetching reviews:', err);
      throw err;
    }
  }

  // Create a new review
  async createReview(recipeId, data) {
    try {
      console.log('📤 Creating review for recipe:', recipeId);
      
      // Format data
      const reviewData = {
        id: Date.now().toString(),
        recipe_id: recipeId,
        user_identifier: data.user_identifier,
        rating: Number(data.rating),
        comment: data.comment || '',
        created_at: new Date().toISOString()
      };

      // save ke localStorage
      const reviews = JSON.parse(localStorage.getItem(`recipe_reviews_${recipeId}`) || '[]');
      reviews.push(reviewData);
      localStorage.setItem(`recipe_reviews_${recipeId}`, JSON.stringify(reviews));
      
      // Update reviews count dan rating di resep
      const recipe = JSON.parse(localStorage.getItem(`recipe_${recipeId}`) || '{}');
      if (recipe) {
        recipe.review_count = (recipe.review_count || 0) + 1;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        recipe.average_rating = totalRating / reviews.length;
        localStorage.setItem(`recipe_${recipeId}`, JSON.stringify(recipe));
      }

      console.log('✅ Review created successfully:', reviewData);
      return { data: reviewData };
    } catch (err) {
      console.error('❌ Error creating review:', err);
      throw err;
    }
  }

  // Update a review
  async updateReview(reviewId, reviewData) {
    try {
      console.log('📝 Updating review:', reviewId);
      const response = await apiClient.put(`/api/v1/reviews/${reviewId}`, reviewData);
      console.log('✅ Review updated:', response);
      return response;
    } catch (err) {
      console.error('❌ Error updating review:', err);
      throw err;
    }
  }

  // Delete a review
  async deleteReview(reviewId) {
    try {
      console.log('🗑️ Deleting review:', reviewId);
      const response = await apiClient.delete(`/api/v1/reviews/${reviewId}`);
      console.log('✅ Review deleted:', response);
      return response;
    } catch (err) {
      console.error('❌ Error deleting review:', err);
      throw err;
    }
  }
}

export default new ReviewService();