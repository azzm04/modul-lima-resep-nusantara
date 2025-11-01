import { apiClient } from '../config/api';

class RecipeService {
  async getRecipes(params = {}) {
    try {
      const response = await apiClient.get('/api/v1/recipes', { params });
      return response;
    } catch (err) {
      console.error('Error fetching recipes:', err);
      throw err;
    }
  }

  async getRecipeById(id) {
    try {
      const response = await apiClient.get(`/api/v1/recipes/${id}`);
      return response;
    } catch (err) {
      console.error('Error fetching recipe:', err);
      throw err;
    }
  }

  async createRecipe(data) {
    try {
      const response = await apiClient.post('/api/v1/recipes', data);
      return response;
    } catch (err) {
      console.error('Error creating recipe:', err);
      throw err;
    }
  }

  async updateRecipe(id, data) {
    try {
      const response = await apiClient.put(`/api/v1/recipes/${id}`, data);
      return response;
    } catch (err) {
      console.error('Error updating recipe:', err);
      throw err;
    }
  }

  async patchRecipe(id, partialData) {
    try {
      const response = await apiClient.patch(`/api/v1/recipes/${id}`, partialData);
      return response;
    } catch (err) {
      console.error('Error updating recipe:', err);
      throw err;
    }
  }

  async deleteRecipe(id) {
    try {
      const response = await apiClient.delete(`/api/v1/recipes/${id}`);
      return response;
    } catch (err) {
      console.error('Error deleting recipe:', err);
      throw err;
    }
  }
}



export default new RecipeService();

