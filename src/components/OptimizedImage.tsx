// src/components/OptimizedImage.tsx
import React, { useState, useRef, useEffect, FC, memo } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: "blur" | "empty";
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with:
 * - Lazy loading via Intersection Observer
 * - Blur placeholder while loading
 * - Error state handling
 * - Native lazy loading fallback
 */
export const OptimizedImage: FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  className = "",
  style = {},
  placeholder = "blur",
  priority = false,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    width: width ?? "100%",
    height: height ?? "auto",
    ...style,
  };

  const placeholderStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "#1e293b",
    transition: "opacity 0.3s ease-out",
    opacity: isLoaded ? 0 : 1,
    pointerEvents: "none",
  };

  const blurStyle: React.CSSProperties = {
    ...placeholderStyle,
    filter: "blur(20px)",
    transform: "scale(1.1)",
    backgroundImage: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transition: "opacity 0.3s ease-out",
    opacity: isLoaded ? 1 : 0,
  };

  const errorStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#1e293b",
    color: "#64748b",
    fontSize: "14px",
    textAlign: "center",
    padding: "20px",
  };

  if (hasError) {
    return (
      <div ref={imgRef} className={className} style={containerStyle}>
        <div style={errorStyle}>
          <span>Unable to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={className} style={containerStyle}>
      {/* Placeholder */}
      {placeholder === "blur" && <div style={blurStyle} />}
      {placeholder === "empty" && <div style={placeholderStyle} />}

      {/* Actual image - only render when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
