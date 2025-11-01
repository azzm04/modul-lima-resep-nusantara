// src/components/common/LazyImage.jsx
/*eslint-disable react/prop-types */
import { useLazyLoad } from '../../hooks/useLazyLoad';

/**
 * LazyImage Component
 * Lazy loads images with placeholder and loading state
 */
export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3C/svg%3E',
  onLoad,
  onError 
}) {
  const { imageSrc, isLoading, isError, imageRef } = useLazyLoad(src, placeholder);

  return (
    <div ref={imageRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={onLoad}
        onError={onError}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {isError && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Gambar gagal dimuat</p>
          </div>
        </div>
      )}
    </div>
  );
}