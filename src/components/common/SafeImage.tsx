import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#FAF9F6] text-[#6E1E2E] p-4 text-center border border-[#E5E0D8] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 mb-2 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium text-[#1C1917] line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
