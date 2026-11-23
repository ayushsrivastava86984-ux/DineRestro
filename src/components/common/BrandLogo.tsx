interface BrandLogoProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BRAND_LOGO_SRC =
  '/assets/aistudio/Elegant_DineRestro_Restaurant_Logo_9fe0b2ce.png';

export function BrandLogo({ variant = 'compact', className = '' }: BrandLogoProps) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt="DineRestro — Discover. Reserve. Celebrate."
      className={`w-auto object-contain select-none mix-blend-multiply ${
        variant === 'full' ? 'h-20 sm:h-24' : 'h-12 sm:h-14'
      } ${className}`}
    />
  );
}
