import axios from 'axios';
import { BASE_URL } from '../config/api';



class UploadService {
  async uploadImage(file) {
    try {
      
      if (!file) {
        throw new Error('No file provided');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: .jpg, .jpeg, .png, .webp');
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
      }

      const formData = new FormData();
      formData.append('image', file);


      const response = await axios.post(`${BASE_URL}/api/v1/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  }
}

export default new UploadService();
