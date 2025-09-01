import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'landscape' | 'wide' | 'ultrawide';
  className?: string;
  caption?: string;
  credit?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onClick?: () => void;
  overlay?: {
    title?: string;
    subtitle?: string;
    position?: 'center' | 'bottom-left' | 'bottom-center' | 'top-center';
  };
}

const aspectRatios = {
  video: 'aspect-video', // 16:9
  square: 'aspect-square', // 1:1
  portrait: 'aspect-[3/4]', // 3:4
  landscape: 'aspect-[4/3]', // 4:3
  wide: 'aspect-[21/9]', // 21:9
  ultrawide: 'aspect-[32/9]', // 32:9 for hero images
};

const overlayPositions = {
  center: 'flex items-center justify-center text-center',
  'bottom-left': 'flex items-end justify-start p-8',
  'bottom-center': 'flex items-end justify-center text-center p-8',
  'top-center': 'flex items-start justify-center text-center p-8',
};

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = 'landscape',
  className,
  caption,
  credit,
  loading = 'lazy',
  onClick,
  overlay,
  ...props
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <figure className={cn('relative group', className)}>
      <div 
        className={cn(
          'relative overflow-hidden rounded-lg bg-muted',
          aspectRatios[aspectRatio],
          onClick && 'cursor-pointer hover:opacity-95 transition-opacity'
        )}
        onClick={onClick}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse" />
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        )}
        
        {/* Main image */}
        {!hasError && (
          <img
            src={src}
            alt={alt}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            {...props}
          />
        )}
        
        {/* Overlay content */}
        {overlay && !hasError && (
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent',
            overlayPositions[overlay.position || 'center']
          )}>
            <div className="text-cream">
              {overlay.title && (
                <h2 className="font-serif text-2xl lg:text-4xl font-bold mb-2">
                  {overlay.title}
                </h2>
              )}
              {overlay.subtitle && (
                <p className="text-lg lg:text-xl opacity-90">
                  {overlay.subtitle}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Hover overlay for clickable images */}
        {onClick && (
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-cream/90 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Caption */}
      {(caption || credit) && (
        <figcaption className="mt-3 text-sm text-muted-foreground">
          {caption && <p>{caption}</p>}
          {credit && <p className="text-xs mt-1 opacity-75">{credit}</p>}
        </figcaption>
      )}
    </figure>
  );
}

export default ResponsiveImage;