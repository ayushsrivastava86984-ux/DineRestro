import { Heart, MapPin, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Restaurant } from '../../types';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    role,
    openRestaurantModal,
    requireCustomerAuth,
    favoriteIds,
    toggleFavorite,
    celebrationPackages,
  } = useApp();
  const isFav = favoriteIds.includes(restaurant.id);
  const approvedCelebCount = celebrationPackages.filter(
    (c) => c.restaurantId === restaurant.id && c.approvalStatus === 'Approved'
  ).length;

  const isPremium = restaurant.tier === 'Premium';

  const handleBookTableClick = () => {
    if (role !== 'customer') {
      requireCustomerAuth({
        kind: 'restaurant_modal',
        restaurantId: restaurant.id,
        tab: 'book',
        returnPath: `${location.pathname}${location.search}`,
      });
      navigate('/customer/login');
      return;
    }
    openRestaurantModal(restaurant, 'book');
  };

  return (
    <article className="group bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:border-[#6E1E2E]/60 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F1ED]">
        <SafeImage
          src={restaurant.image}
          alt={`${restaurant.name} in ${restaurant.area}, ${restaurant.city}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          fallbackTitle={restaurant.name}
        />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide border ${
              isPremium
                ? 'bg-[#1C1917] text-[#E5D3B3] border-[#44403C]'
                : 'bg-[#FAF9F6]/95 text-[#1C1917] border-[#E5E0D8]'
            }`}
          >
            {restaurant.tier}
          </span>
          {restaurant.isDemo && (
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide border bg-[#FAF9F6]/95 text-[#6E1E2E] border-[#6E1E2E]/35">
              Demo Listing
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(restaurant.id)}
          aria-label={
            isFav
              ? `Remove ${restaurant.name} from favorites`
              : `Save ${restaurant.name} to favorites`
          }
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-[#57534E] hover:text-[#6E1E2E] hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#6E1E2E] text-[#6E1E2E]' : ''}`} />
        </button>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 text-xs text-[#57534E]">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#6E1E2E] shrink-0" aria-hidden="true" />
            <span className="truncate">
              {restaurant.area}, {restaurant.city}
            </span>
          </span>
          {!restaurant.isDemo && restaurant.reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#1C1917] tabular-nums shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#B8863B] text-[#B8863B]" aria-hidden="true" />
              <span>{restaurant.rating.toFixed(1)}</span>
              <span className="font-normal text-[#57534E]">({restaurant.reviewCount})</span>
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-semibold text-[#1C1917] leading-snug mt-1.5">
          {restaurant.name}
        </h3>

        <p className="text-xs text-[#57534E] mt-1 line-clamp-1">
          {restaurant.category ? `${restaurant.category} · ` : ''}
          {restaurant.cuisines.join(' · ')}
        </p>

        <div className="flex items-center gap-2 text-xs text-[#57534E] mt-1.5 tabular-nums">
          <span className="font-semibold text-[#1C1917]">{restaurant.priceRange}</span>
          {approvedCelebCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#6E1E2E] font-medium">
                {approvedCelebCount} Celebration Pkg
              </span>
            </>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-[#E5E0D8] text-xs font-medium text-[#6E1E2E] line-clamp-1">
          {restaurant.offerText}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => openRestaurantModal(restaurant, 'overview')}
            className="flex-1 px-2.5 py-2 text-xs font-semibold text-[#1C1917] bg-white border border-[#D6CFC5] rounded-lg hover:bg-[#F3F1ED] hover:border-[#6E1E2E]/40 transition-colors whitespace-nowrap"
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => openRestaurantModal(restaurant, 'menu')}
            className="flex-1 px-2.5 py-2 text-xs font-semibold text-[#6E1E2E] bg-[#FAF9F6] border border-[#6E1E2E]/40 rounded-lg hover:bg-[#6E1E2E]/10 transition-colors whitespace-nowrap"
          >
            Menu
          </button>
          <button
            type="button"
            onClick={handleBookTableClick}
            className="flex-1 px-2.5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors whitespace-nowrap"
          >
            Book Table
          </button>
        </div>
      </div>
    </article>
  );
}

