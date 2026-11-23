import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ALL_AMENITIES,
  CELEBRATION_CATEGORIES,
  POPULAR_CUISINES,
  VARANASI_AREAS,
} from '../../data/mockData';
import type { AmenityType } from '../../types';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { DemoBanner } from '../../components/common/DemoBanner';
import { EmptyStateCard } from '../../components/common/EmptyStateCard';

export function ExplorePage() {
  const { restaurants, celebrationPackages, preOrderPackages } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const actionIntent = searchParams.get('action') || '';

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || 'All Varanasi');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [priceRangeFilter, setPriceRangeFilter] = useState<'all' | 'under1200' | '1200to1800' | 'above1800'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '4.5' | '4.7'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'preorder' | 'celebration'>(
    actionIntent === 'preorder' ? 'preorder' : 'all'
  );
  const [celebrationFilter, setCelebrationFilter] = useState<string>('All');
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityType[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'priceLow' | 'priceHigh'>('popularity');

  const approvedRestaurants = useMemo(
    () => restaurants.filter((r) => r.approvalStatus === 'Approved'),
    [restaurants]
  );

  const toggleAmenity = (amenity: AmenityType) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredRestaurants = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = approvedRestaurants.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.cuisines.some((c) => c.toLowerCase().includes(q));
      const matchesArea =
        selectedArea === 'All Varanasi' ||
        r.area.toLowerCase() === selectedArea.toLowerCase();
      const matchesCuisine =
        selectedCuisine === 'All' ||
        r.cuisines.includes(selectedCuisine as (typeof r.cuisines)[number]);
      const matchesPrice =
        priceRangeFilter === 'all' ||
        (priceRangeFilter === 'under1200' && r.priceForTwo <= 1200) ||
        (priceRangeFilter === '1200to1800' && r.priceForTwo > 1200 && r.priceForTwo <= 1800) ||
        (priceRangeFilter === 'above1800' && r.priceForTwo > 1800);
      const matchesRating =
        ratingFilter === 'all' ||
        (ratingFilter === '4.5' && r.rating >= 4.5) ||
        (ratingFilter === '4.7' && r.rating >= 4.7);
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'preorder' &&
          preOrderPackages.some((p) => p.restaurantId === r.id && p.available)) ||
        (availabilityFilter === 'celebration' &&
          celebrationPackages.some(
            (cp) => cp.restaurantId === r.id && cp.approvalStatus === 'Approved'
          ));
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((am) => r.amenities.includes(am));
      const matchesCelebration =
        celebrationFilter === 'All' ||
        celebrationPackages.some(
          (cp) =>
            cp.restaurantId === r.id &&
            cp.approvalStatus === 'Approved' &&
            cp.category === celebrationFilter
        );
      return (
        matchesQuery &&
        matchesArea &&
        matchesCuisine &&
        matchesPrice &&
        matchesRating &&
        matchesAvailability &&
        matchesAmenities &&
        matchesCelebration
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'priceLow') return a.priceForTwo - b.priceForTwo;
      if (sortBy === 'priceHigh') return b.priceForTwo - a.priceForTwo;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }, [
    approvedRestaurants,
    celebrationPackages,
    preOrderPackages,
    query,
    selectedArea,
    selectedCuisine,
    priceRangeFilter,
    ratingFilter,
    availabilityFilter,
    selectedAmenities,
    celebrationFilter,
    sortBy,
  ]);

  const handleReset = () => {
    setQuery('');
    setSelectedArea('All Varanasi');
    setSelectedCuisine('All');
    setPriceRangeFilter('all');
    setRatingFilter('all');
    setAvailabilityFilter('all');
    setCelebrationFilter('All');
    setSelectedAmenities([]);
    setSortBy('popularity');
    setSearchParams({});
  };

  return (
    <div className="bg-[#FFF5EA] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#C84A1B] tracking-widest uppercase mb-1">
              Varanasi Dining Discovery
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#321D17]">
              {actionIntent === 'preorder'
                ? 'Select a Restaurant to Pre-Order Food'
                : actionIntent === 'book'
                  ? 'Book a Verified Varanasi Table'
                  : 'Explore Restaurants, Menus & Celebration Venues'}
            </h1>
          </div>
          <p className="text-sm text-[#6E4B41] tabular-nums">
            Showing {filteredRestaurants.length} of {approvedRestaurants.length} approved venues
          </p>
        </div>

        <DemoBanner message="Inspect photo galleries, uploaded menu photographs, 14 amenities, food pre-order plates, and ₹0-decor celebration packages inside any restaurant modal." />

        {/* Advanced Filter Bar */}
        <div className="bg-white border border-[#EAD8C9] rounded-lg p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6E4B41] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurant, cuisine or area..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
              />
            </div>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label="Filter by locality"
              className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
            >
              {VARANASI_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area === 'All Varanasi' ? 'All Varanasi Localities' : area}
                </option>
              ))}
            </select>

            <select
              value={priceRangeFilter}
              onChange={(e) => setPriceRangeFilter(e.target.value as typeof priceRangeFilter)}
              aria-label="Filter by price range"
              className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
            >
              <option value="all">All Price Ranges</option>
              <option value="under1200">Under ₹1,200 for two</option>
              <option value="1200to1800">₹1,200 – ₹1,800 for two</option>
              <option value="above1800">Above ₹1,800 for two</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as typeof ratingFilter)}
              aria-label="Filter by minimum rating"
              className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
            >
              <option value="all">All Ratings</option>
              <option value="4.5">4.5★ &amp; Above</option>
              <option value="4.7">4.7★ &amp; Above</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as typeof availabilityFilter)}
              aria-label="Filter by service availability"
              className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
            >
              <option value="all">All Service Availability</option>
              <option value="preorder">Pre-Order Plates Ready</option>
              <option value="celebration">Celebration Packages Available</option>
            </select>

            <select
              value={celebrationFilter}
              onChange={(e) => setCelebrationFilter(e.target.value)}
              aria-label="Filter by celebration type"
              className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
            >
              <option value="All">All Celebration Types</option>
              {CELEBRATION_CATEGORIES.filter((c) => c !== 'Custom Celebration').map((cat) => (
                <option key={cat} value={cat}>
                  {cat} Packages
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <SlidersHorizontal className="w-4 h-4 text-[#6E4B41] absolute left-3 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Sort restaurants"
                  className="w-full pl-9 pr-2 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
                >
                  <option value="popularity">Sort: Popularity</option>
                  <option value="rating">Sort: Highest Rating</option>
                  <option value="priceLow">Sort: Price Low–High</option>
                  <option value="priceHigh">Sort: Price High–Low</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleReset}
                title="Reset all filters"
                aria-label="Reset all filters"
                className="px-3 py-2 bg-[#FCEBDD] border border-[#EAD8C9] rounded-lg text-[#321D17] hover:border-[#C84A1B]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cuisine Filter Buttons */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[#6E4B41]">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCuisine('All')}
                className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                  selectedCuisine === 'All'
                    ? 'bg-[#C84A1B] text-white border-[#C84A1B]'
                    : 'bg-[#FFF5EA] text-[#321D17] border-[#EAD8C9] hover:border-[#C84A1B]'
                }`}
              >
                All Cuisines
              </button>
              {POPULAR_CUISINES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedCuisine(c.name)}
                  className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                    selectedCuisine === c.name
                      ? 'bg-[#C84A1B] text-white border-[#C84A1B]'
                      : 'bg-[#FFF5EA] text-[#321D17] border-[#EAD8C9] hover:border-[#C84A1B]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Filter Buttons */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[#6E4B41]">
              Amenities (Select one or more)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_AMENITIES.map((amenity) => {
                const active = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                      active
                        ? 'bg-[#C84A1B] text-white border-[#C84A1B]'
                        : 'bg-white text-[#321D17] border-[#EAD8C9] hover:border-[#C84A1B]'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredRestaurants.length === 0 ? (
          <EmptyStateCard
            title="No matching restaurants found"
            description="Try relaxing your locality, rating, amenity, or availability filters to discover more Varanasi dining venues."
            actionLabel="View All Varanasi Restaurants"
            onAction={handleReset}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
