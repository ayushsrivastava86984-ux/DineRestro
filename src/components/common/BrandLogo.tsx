import { UtensilsCrossed } from 'lucide-react';

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
  showTagline = false,
  className = '',
}: BrandLogoProps) {
  const isDark = surface === 'dark';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}>
      <span
        className={`inline-flex items-center justify-center rounded-md border shrink-0 ${
          variant === 'full' ? 'w-11 h-11' : 'w-9 h-9'
        } ${
          isDark
            ? 'bg-[#542719] border-[#D99555]/50 text-[#F6B27B]'
            : 'bg-[#C84A1B] border-[#A83B19] text-white'
        }`}
        aria-hidden="true"
      >
        <UtensilsCrossed className={variant === 'full' ? 'w-5 h-5' : 'w-4 h-4'} />
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-semibold tracking-tight ${
            variant === 'full' ? 'text-2xl sm:text-[26px]' : 'text-xl sm:text-2xl'
          } ${isDark ? 'text-[#FFF5EA]' : 'text-[#321D17]'}`}
        >
          Dine<span className={isDark ? 'text-[#F6B27B]' : 'text-[#C84A1B]'}>Restro</span>
        </span>
        {(showTagline || variant === 'full') && (
          <span
            className={`text-[10px] tracking-[0.14em] uppercase mt-1 ${
              isDark ? 'text-[#FCEBDD]/80' : 'text-[#6E4B41]'
            }`}
          >
            Discover · Reserve · Celebrate
          </span>
        )}
      </span>
    </span>
  );
}
