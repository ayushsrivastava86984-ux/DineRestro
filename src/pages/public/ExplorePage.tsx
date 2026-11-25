import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ALL_AMENITIES,
  CELEBRATION_CATEGORIES,
  POPULAR_CUISINES,
  RESTAURANT_CATEGORIES,
} from '../../data/mockData';
import type { AmenityType } from '../../types';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { DemoBanner } from '../../components/common/DemoBanner';
import { EmptyStateCard } from '../../components/common/EmptyStateCard';

export function ExplorePage() {
  const navigate = useNavigate();
  const {
    restaurants,
    celebrationPackages,
    preOrderPackages,
    cities,
    activeCities,
    selectedCity,
    setSelectedCity,
    activeCityConfig,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const actionIntent = searchParams.get('action') || '';
  const cityParam = searchParams.get('city');
  const areaParam = searchParams.get('area');

  useEffect(() => {
    if (cityParam && activeCities.some((c) => c.name.toLowerCase() === cityParam.toLowerCase())) {
      setSelectedCity(
        activeCities.find((c) => c.name.toLowerCase() === cityParam.toLowerCase())!.name
      );
    }
  }, [activeCities, cityParam, setSelectedCity]);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState(areaParam || 'All');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRangeFilter, setPriceRangeFilter] = useState<'all' | 'under1200' | '1200to1800' | 'above1800'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '4.5' | '4.7'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'preorder' | 'celebration'>(
    actionIntent === 'preorder' ? 'preorder' : 'all'
  );
  const [celebrationFilter, setCelebrationFilter] = useState<string>('All');
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityType[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'priceLow' | 'priceHigh'>('popularity');

  useEffect(() => {
    if (areaParam) {
      setSelectedArea(areaParam);
    }
  }, [areaParam]);

  const approvedCityRestaurants = useMemo(
    () =>
      restaurants.filter(
        (r) =>
          r.approvalStatus === 'Approved' &&
          r.isActive !== false &&
          r.city.toLowerCase() === selectedCity.toLowerCase()
      ),
    [restaurants, selectedCity]
  );

  const toggleAmenity = (amenity: AmenityType) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleCitySelect = (nextCity: string) => {
    setSelectedCity(nextCity);
    setSelectedArea('All');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('city', nextCity);
    nextParams.delete('area');
    setSearchParams(nextParams);
  };

  const filteredRestaurants = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = approvedCityRestaurants.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.cuisines.some((c) => c.toLowerCase().includes(q));
      const matchesArea =
        selectedArea === 'All' ||
        r.area.toLowerCase() === selectedArea.toLowerCase();
      const matchesCuisine =
        selectedCuisine === 'All' ||
        r.cuisines.includes(selectedCuisine as (typeof r.cuisines)[number]);
      const matchesCategory =
        selectedCategory === 'All' || r.category === selectedCategory;
      const matchesPrice =
        priceRangeFilter === 'all' ||
        (priceRangeFilter === 'under1200' && r.priceForTwo <= 1200) ||
        (priceRangeFilter === '1200to1800' && r.priceForTwo > 1200 && r.priceForTwo <= 1800) ||
        (priceRangeFilter === 'above1800' && r.priceForTwo > 1800);
      const matchesRating =
        ratingFilter === 'all' ||
        (!r.isDemo &&
          r.reviewCount > 0 &&
          ((ratingFilter === '4.5' && r.rating >= 4.5) ||
            (ratingFilter === '4.7' && r.rating >= 4.7)));
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
        matchesCategory &&
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
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviewCount - a.reviewCount;
    });
  }, [
    approvedCityRestaurants,
    celebrationPackages,
    preOrderPackages,
    query,
    selectedArea,
    selectedCuisine,
    selectedCategory,
    priceRangeFilter,
    ratingFilter,
    availabilityFilter,
    selectedAmenities,
    celebrationFilter,
    sortBy,
  ]);

  const handleReset = () => {
    setQuery('');
    setSelectedArea('All');
    setSelectedCuisine('All');
    setSelectedCategory('All');
    setPriceRangeFilter('all');
    setRatingFilter('all');
    setAvailabilityFilter('all');
    setCelebrationFilter('All');
    setSelectedAmenities([]);
    setSortBy('popularity');
    setSearchParams({ city: selectedCity });
  };

  return (
    <div className="bg-[#FAF9F6] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase mb-1">
              {selectedCity}, {activeCityConfig.state} · Dining Discovery
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              {actionIntent === 'preorder'
                ? `Pre-Order Food in ${selectedCity}`
                : actionIntent === 'book'
                  ? `Reserve a Table in ${selectedCity}`
                  : `Explore ${selectedCity} Restaurants & Celebration Venues`}
            </h1>
          </div>
          <p className="text-sm text-[#57534E] tabular-nums">
            Showing {filteredRestaurants.length} of {approvedCityRestaurants.length} verified venues in {selectedCity}
          </p>
        </div>

        <DemoBanner message={`Discover verified restaurants in ${selectedCity} across ${activeCityConfig.neighbourhoods.join(', ')}. Inspect photo galleries, menu photos, amenities, pre-order plates, and ₹0-decor celebrations inside any restaurant profile.`} />

        {/* Advanced Filter Bar */}
        <div className="bg-white border border-[#E5E0D8] rounded-lg p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${selectedCity} venue, cuisine or neighbourhood...`}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
              />
            </div>

            <select
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              aria-label="Filter by city"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg font-medium text-[#1C1917] focus:outline-none focus:border-[#6E1E2E]"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.name} disabled={!c.isActive}>
                  {c.name}, {c.state}
                  {!c.isActive ? ' (Coming Soon)' : ''}
                </option>
              ))}
            </select>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label={`Filter by ${selectedCity} neighbourhood`}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="All">All {selectedCity} Neighbourhoods</option>
              {activeCityConfig.neighbourhoods.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select
              value={priceRangeFilter}
              onChange={(e) => setPriceRangeFilter(e.target.value as typeof priceRangeFilter)}
              aria-label="Filter by price range"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="all">All Price Ranges</option>
              <option value="under1200">Under ₹1,200 for two</option>
              <option value="1200to1800">₹1,200 – ₹1,800 for two</option>
              <option value="above1800">Above ₹1,800 for two</option>
            </select>
          </div>

          {/* Neighbourhood Quick Filter Chips */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[#57534E]">
              {selectedCity} Neighbourhoods
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedArea('All')}
                className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                  selectedArea === 'All'
                    ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                    : 'bg-[#FAF9F6] text-[#1C1917] border-[#E5E0D8] hover:border-[#6E1E2E] hover:bg-[#F3F1ED]'
                }`}
              >
                All Neighbourhoods
              </button>
              {activeCityConfig.neighbourhoods.map((hood) => (
                <button
                  key={hood}
                  type="button"
                  onClick={() => setSelectedArea(hood)}
                  className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                    selectedArea.toLowerCase() === hood.toLowerCase()
                      ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                      : 'bg-[#FAF9F6] text-[#1C1917] border-[#E5E0D8] hover:border-[#6E1E2E] hover:bg-[#F3F1ED]'
                  }`}
                >
                  {hood}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by restaurant category"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="All">All Restaurant Categories</option>
              {RESTAURANT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as typeof ratingFilter)}
              aria-label="Filter by minimum rating"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="all">All Ratings</option>
              <option value="4.5">4.5★ &amp; Above</option>
              <option value="4.7">4.7★ &amp; Above</option>
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as typeof availabilityFilter)}
              aria-label="Filter by service availability"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="all">All Service Availability</option>
              <option value="preorder">Pre-Order Plates Ready</option>
              <option value="celebration">Celebration Packages Available</option>
            </select>

            <select
              value={celebrationFilter}
              onChange={(e) => setCelebrationFilter(e.target.value)}
              aria-label="Filter by celebration type"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="All">All Celebration Types</option>
              {CELEBRATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} Packages
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <SlidersHorizontal className="w-4 h-4 text-[#6E1E2E] absolute left-3 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Sort restaurants"
                  className="w-full pl-9 pr-2 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
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
                className="px-3 py-2 bg-white border border-[#D6CFC5] rounded-lg text-[#1C1917] hover:bg-[#F3F1ED]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cuisine Filter Buttons */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[#57534E]">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCuisine('All')}
                className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                  selectedCuisine === 'All'
                    ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                    : 'bg-[#FAF9F6] text-[#1C1917] border-[#E5E0D8] hover:border-[#6E1E2E] hover:bg-[#F3F1ED]'
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
                      ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                      : 'bg-[#FAF9F6] text-[#1C1917] border-[#E5E0D8] hover:border-[#6E1E2E] hover:bg-[#F3F1ED]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Filter Buttons */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[#57534E]">
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
                        ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                        : 'bg-white text-[#1C1917] border-[#E5E0D8] hover:border-[#6E1E2E] hover:bg-[#F3F1ED]'
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
          approvedCityRestaurants.length === 0 ? (
            <EmptyStateCard
              title={`Now Launching in ${selectedCity}${selectedArea !== 'All' ? ` · ${selectedArea}` : ''}`}
              description={`Verified ${selectedCity} restaurants across ${activeCityConfig.neighbourhoods.join(', ')} will appear here automatically once onboarded and approved. No placeholder listings or unverified addresses are fabricated.`}
              actionLabel="Partner With Us — Register Restaurant"
              onAction={() => navigate('/restaurant/signup')}
            />
          ) : (
            <EmptyStateCard
              title="No matching restaurants found"
              description={`Try relaxing your neighbourhood, rating, amenity, or availability filters to discover verified ${selectedCity} dining venues.`}
              actionLabel={`View All ${selectedCity} Restaurants`}
              onAction={handleReset}
            />
          )
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
