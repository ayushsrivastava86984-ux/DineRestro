import { Heart, MapPin, Star } from 'lucide-react';
import type { Restaurant } from '../../types';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { openRestaurantModal, favoriteIds, toggleFavorite, celebrationPackages } = useApp();
  const isFav = favoriteIds.includes(restaurant.id);
  const approvedCelebCount = celebrationPackages.filter(
    (c) => c.restaurantId === restaurant.id && c.approvalStatus === 'Approved'
  ).length;

  const isPremium = restaurant.tier === 'Premium';

  return (
    <article className="group bg-white border border-[#EAD8C9] rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:border-[#C84A1B] hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF5EA]">
        <SafeImage
          src={restaurant.image}
          alt={`${restaurant.name} in ${restaurant.area}, Varanasi`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          fallbackTitle={restaurant.name}
        />

        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide border ${
            isPremium
              ? 'bg-[#3A180F] text-[#F6B27B] border-[#D99555]/60'
              : 'bg-[#FFF5EA]/95 text-[#321D17] border-[#EAD8C9]'
          }`}
        >
          {restaurant.tier}
        </span>

        <button
          type="button"
          onClick={() => toggleFavorite(restaurant.id)}
          aria-label={
            isFav
              ? `Remove ${restaurant.name} from favorites`
              : `Save ${restaurant.name} to favorites`
          }
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-[#C84A1B] hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#C84A1B]' : ''}`} />
        </button>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 text-xs text-[#6E4B41]">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#C84A1B] shrink-0" aria-hidden="true" />
            <span className="truncate">
              {restaurant.area}, {restaurant.city}
            </span>
          </span>
          {restaurant.reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#321D17] tabular-nums shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#D99555] text-[#D99555]" aria-hidden="true" />
              <span>{restaurant.rating.toFixed(1)}</span>
              <span className="font-normal text-[#6E4B41]">({restaurant.reviewCount})</span>
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-semibold text-[#321D17] leading-snug mt-1.5">
          {restaurant.name}
        </h3>

        <p className="text-xs text-[#6E4B41] mt-1 line-clamp-1">
          {restaurant.cuisines.join(' · ')}
        </p>

        <div className="flex items-center gap-2 text-xs text-[#6E4B41] mt-1.5 tabular-nums">
          <span className="font-semibold text-[#321D17]">{restaurant.priceRange}</span>
          {approvedCelebCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#A83B19] font-medium">
                {approvedCelebCount} Celebration Pkg
              </span>
            </>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-[#EAD8C9] text-xs font-medium text-[#C84A1B] line-clamp-1">
          {restaurant.offerText}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => openRestaurantModal(restaurant, 'overview')}
            className="flex-1 px-2.5 py-2 text-xs font-semibold text-[#321D17] border border-[#EAD8C9] rounded-lg hover:bg-[#FCEBDD] hover:border-[#C84A1B] transition-colors whitespace-nowrap"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => openRestaurantModal(restaurant, 'book')}
            className="flex-1 px-2.5 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap"
          >
            Book Table
          </button>
        </div>
      </div>
    </article>
  );
}
