import { CheckCircle2, Users, Utensils } from 'lucide-react';
import type { CelebrationPackage } from '../../types';
import { formatINR } from '../../utils/formatters';
import { SafeImage } from './SafeImage';

interface CelebrationPackageCardProps {
  pkg: CelebrationPackage;
  onSelect: (pkg: CelebrationPackage) => void;
  actionLabel?: string;
}

export function CelebrationPackageCard({
  pkg,
  onSelect,
  actionLabel = 'Book Celebration Package',
}: CelebrationPackageCardProps) {
  return (
    <article className="bg-white border border-[#EAD8C9] rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:border-[#C84A1B] hover:shadow-md">
      <div className="aspect-[16/10] w-full overflow-hidden bg-[#FFF5EA]">
        <SafeImage
          src={pkg.decorationPhotos[0] || ''}
          alt={`${pkg.name} decoration setup`}
          className="w-full h-full object-cover"
          fallbackTitle={pkg.name}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#C84A1B] tracking-wide">
              {pkg.category} · {pkg.dietaryType}
            </p>
            <h3 className="font-display text-xl font-semibold text-[#321D17] mt-0.5 leading-snug">
              {pkg.name}
            </h3>
            <p className="text-xs text-[#6E4B41] mt-0.5">{pkg.restaurantName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-base font-semibold text-[#C84A1B] tabular-nums">
              {formatINR(pkg.pricePerPlate)}
            </p>
            <p className="text-[11px] text-[#6E4B41]">per plate</p>
          </div>
        </div>

        <p className="text-xs text-[#6E4B41] leading-relaxed line-clamp-2">
          {pkg.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#321D17] tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#C84A1B]" aria-hidden="true" />
            {pkg.minPlates}–{pkg.maxPlates} plates
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#C84A1B]" aria-hidden="true" />
            {pkg.plateItems.length} curated courses
          </span>
        </div>

        <div className="px-3 py-2 rounded bg-[#E7EFD9] border border-[#C8D8AC] flex items-center gap-2 text-xs font-semibold text-[#321D17]">
          <CheckCircle2 className="w-4 h-4 text-[#A83B19] shrink-0" aria-hidden="true" />
          <span>Decoration Included – No Additional Charges (₹0)</span>
        </div>

        <div className="pt-2 mt-auto">
          <button
            type="button"
            onClick={() => onSelect(pkg)}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
