import { Heart, Star } from 'lucide-react';
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

  return (
    <article className="group bg-white border border-[#E8DDD1] rounded-lg overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF6E9]">
        <SafeImage
          src={restaurant.image}
          alt={`${restaurant.name} in ${restaurant.area}, Varanasi`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          fallbackTitle={restaurant.name}
        />
        <button
          type="button"
          onClick={() => toggleFavorite(restaurant.id)}
          aria-label={isFav ? `Remove ${restaurant.name} from favorites` : `Save ${restaurant.name} to favorites`}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-[#702C3A] hover:bg-white transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#702C3A]' : ''}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-[#292321] leading-snug">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-[#292321] tabular-nums pt-1">
            <Star className="w-3.5 h-3.5 fill-[#702C3A] text-[#702C3A]" aria-hidden="true" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-xs text-[#6B5F5C] mt-1">
          {restaurant.cuisines.join(' · ')}
        </p>

        <div className="flex items-center gap-2 text-xs text-[#6B5F5C] mt-1.5 tabular-nums">
          <span>{restaurant.area}, {restaurant.city}</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-[#292321]">{restaurant.priceRange}</span>
        </div>

        <p className="text-[11px] text-[#6B5F5C] mt-2 line-clamp-1">
          {restaurant.amenities.slice(0, 3).join(' · ')}
          {approvedCelebCount > 0 ? ` · ${approvedCelebCount} Celebration Pkg` : ''}
        </p>

        <div className="mt-3 pt-3 border-t border-[#E8DDD1] text-xs font-medium text-[#702C3A]">
          {restaurant.offerText}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => openRestaurantModal(restaurant, 'overview')}
            className="flex-1 px-2.5 py-2 text-xs font-semibold text-[#292321] border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9] transition-colors whitespace-nowrap"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => openRestaurantModal(restaurant, 'book')}
            className="flex-1 px-2.5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors whitespace-nowrap"
          >
            Book Table
          </button>
        </div>
      </div>
    </article>
  );
}
