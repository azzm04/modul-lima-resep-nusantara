export default function ShareButton({
  recipeId,
  recipeName,
  category,
  variant = "primary",
}) {
  const handleShare = async () => {
    // Buat URL dengan parameter recipe ID dan category
    const shareUrl = `${window.location.origin}?recipe=${recipeId}&category=${category}`;

    const shareData = {
      title: `Resep ${recipeName}`,
      text: `Cek resep "${recipeName}" di Resep Nusantara! 🍽️`,
      url: shareUrl,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        // Gunakan Web Share API jika tersedia
        await navigator.share(shareData);
        console.log("✅ Resep berhasil dibagikan");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert("✅ Link resep berhasil disalin ke clipboard!\n\n" + shareUrl);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing:", err);
        // Fallback terakhir jika clipboard juga gagal
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert("Link berhasil disalin!");
        } catch (clipErr) {
          alert("Gagal membagikan link. URL: " + shareUrl);
        }
      }
    }
  };

  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-slate-700",
    ghost: "bg-white/80 hover:bg-white text-slate-700 border border-slate-300",
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${variants[variant]}`}
      title="Bagikan Resep"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden md:inline">Bagikan</span>
    </button>
  );
}
