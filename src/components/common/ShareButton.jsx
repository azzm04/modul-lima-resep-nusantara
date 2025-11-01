// src/components/common/ShareButton.jsx
/*eslint-disable react/prop-types */
import { Share2 } from 'lucide-react';

export default function ShareButton({ recipeId, recipeName }) {
  const handleShare = async () => {
    const shareData = {
      title: recipeName,
      text: `Lihat resep ${recipeName} di Resep Nusantara!`,
      url: `${window.location.origin}?recipe=${recipeId}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link berhasil disalin!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden md:inline">Bagikan</span>
    </button>
  );
}