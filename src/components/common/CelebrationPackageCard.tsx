import { useState } from 'react';
import { CheckCircle2, MapPin, Users, Utensils } from 'lucide-react';
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
  actionLabel = 'Book Now',
}: CelebrationPackageCardProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photos = pkg.decorationPhotos.length > 0 ? pkg.decorationPhotos : [''];
  const activePhoto = photos[activePhotoIdx] || photos[0];

  return (
    <article className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:border-[#6E1E2E] hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF9F6]">
        <SafeImage
          src={activePhoto}
          alt={`${pkg.name} decoration setup`}
          className="w-full h-full object-cover"
          fallbackTitle={pkg.name}
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#1C1917]/85 text-[#FAF9F6]">
            {pkg.category}
          </span>
          <span className="px-2 py-1 rounded text-[11px] font-semibold bg-white/95 text-[#1C1917] border border-[#E5E0D8]">
            {pkg.dietaryType}
          </span>
        </div>
        {pkg.available && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded text-[11px] font-semibold bg-[#ECF4EE]/95 text-[#1E462A] border border-[#BBD6C3]">
            Available · Instant Booking
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="px-4 pt-3 flex items-center gap-2">
          {photos.slice(0, 4).map((url, idx) => (
            <button
              key={`${pkg.id}-thumb-${idx}`}
              type="button"
              onClick={() => setActivePhotoIdx(idx)}
              className={`h-11 w-14 rounded overflow-hidden border transition-all ${
                activePhotoIdx === idx
                  ? 'border-[#6E1E2E] ring-1 ring-[#6E1E2E]'
                  : 'border-[#E5E0D8] opacity-75 hover:opacity-100'
              }`}
              aria-label={`Preview setup photo ${idx + 1}`}
            >
              <SafeImage src={url} alt={`${pkg.name} view ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-[#1C1917] leading-snug">
              {pkg.name}
            </h3>
            <p className="text-xs text-[#57534E] mt-1 inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#6E1E2E]" aria-hidden="true" />
              <span>
                {pkg.restaurantName}
                {pkg.restaurantArea ? ` · ${pkg.restaurantArea}` : ''}
              </span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-base font-semibold text-[#6E1E2E] tabular-nums">
              {formatINR(pkg.pricePerPlate)}
            </p>
            <p className="text-[11px] text-[#57534E]">per plate</p>
          </div>
        </div>

        <p className="text-xs text-[#57534E] leading-relaxed">
          {pkg.decorationDetails}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#1C1917] tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#6E1E2E]" aria-hidden="true" />
            {pkg.minPlates}–{pkg.maxPlates} guests
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#6E1E2E]" aria-hidden="true" />
            {pkg.plateItems.length} courses / plate
          </span>
        </div>

        {pkg.plateItems.length > 0 && (
          <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded p-2.5 text-[11px] text-[#57534E] space-y-0.5">
            <p className="font-semibold text-[#1C1917]">Food Included Per Plate:</p>
            {pkg.plateItems.slice(0, 3).map((item) => (
              <p key={item.id} className="truncate">
                <span className="font-medium text-[#6E1E2E]">{item.course}:</span> {item.itemName}
              </p>
            ))}
            {pkg.plateItems.length > 3 && (
              <p className="text-[10px] text-[#57534E]">
                +{pkg.plateItems.length - 3} more courses included per plate
              </p>
            )}
          </div>
        )}

        <div className="px-3 py-2 rounded bg-[#ECF4EE] border border-[#BBD6C3] flex items-center justify-between gap-2 text-xs font-semibold text-[#1E462A]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Decoration Included – No Additional Charges</span>
          </span>
          <span className="font-mono shrink-0">₹0</span>
        </div>

        <div className="pt-2 mt-auto">
          <button
            type="button"
            onClick={() => onSelect(pkg)}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors whitespace-nowrap"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
