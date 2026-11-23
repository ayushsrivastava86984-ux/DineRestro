interface BrandLogoProps {
  variant?: 'compact' | 'full';
  surface?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
}

export const BRAND_LOGO_SRC =
  '/assets/aistudio/Elegant_DineRestro_Restaurant_Logo_9fe0b2ce.png';

export function BrandLogo({
  variant = 'compact',
  surface = 'light',
  className = '',
}: BrandLogoProps) {
  const isDark = surface === 'dark';

  if (isDark) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] shadow-xs select-none shrink-0 ${
          variant === 'full' ? 'px-4 py-2' : 'px-3 py-1.5'
        } ${className}`}
      >
        <img
          src={BRAND_LOGO_SRC}
          alt="DineRestro — Discover. Reserve. Celebrate."
          className={`${
            variant === 'full' ? 'h-20 sm:h-24' : 'h-11 sm:h-12'
          } w-auto object-contain mix-blend-multiply`}
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <img
        src={BRAND_LOGO_SRC}
        alt="DineRestro — Discover. Reserve. Celebrate."
        className={`${
          variant === 'full' ? 'h-24 sm:h-28' : 'h-12 sm:h-14'
        } w-auto object-contain mix-blend-multiply`}
      />
    </span>
  );
}
