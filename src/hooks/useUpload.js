import { useState } from 'react';
import uploadService from '../services/uploadService';

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) return null;
    try {
      setUploading(true);
      const response = await uploadService.uploadImage(file);
      return response.data.url;
    } catch (err) {
      console.error('Upload image error:', err);
      setError('Gagal mengunggah gambar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
}
