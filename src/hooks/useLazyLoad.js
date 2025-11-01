// src/hooks/useLazyLoad.js
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for lazy loading images
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image URL
 * @returns {object} - { imageSrc, isLoading, isError }
 */
export function useLazyLoad(src, placeholder = '') {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    let observer;
    let didCancel = false;

    if (imageRef.current && src) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setIsLoading(true);
                setIsError(false);
                
                const img = new Image();
                img.src = src;
                
                img.onload = () => {
                  if (!didCancel) {
                    setImageSrc(src);
                    setIsLoading(false);
                  }
                };
                
                img.onerror = () => {
                  if (!didCancel) {
                    setIsError(true);
                    setIsLoading(false);
                  }
                };
                
                if (observer && observer.unobserve) {
                  observer.unobserve(imageRef.current);
                }
              }
            });
          },
          {
            threshold: 0.01,
            rootMargin: '200px'
          }
        );
        observer.observe(imageRef.current);
      } else {
        // Fallback for browsers without IntersectionObserver
        setImageSrc(src);
        setIsLoading(false);
      }
    }

    return () => {
      didCancel = true;
      if (observer && observer.unobserve && imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src, placeholder]);

  return { imageSrc, isLoading, isError, imageRef };
}