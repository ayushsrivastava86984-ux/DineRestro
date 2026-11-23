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

export function ExplorePage() {
  const { restaurants, celebrationPackages } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || 'All Varanasi');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [priceRangeFilter, setPriceRangeFilter] = useState<'all' | 'under1200' | '1200to1800' | 'above1800'>('all');
  const [celebrationFilter, setCelebrationFilter] = useState<string>('All');
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityType[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'priceLow' | 'priceHigh'>('rating');

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
        matchesAmenities &&
        matchesCelebration
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'priceLow') return a.priceForTwo - b.priceForTwo;
      if (sortBy === 'priceHigh') return b.priceForTwo - a.priceForTwo;
      return b.rating - a.rating;
    });
  }, [
    approvedRestaurants,
    celebrationPackages,
    query,
    selectedArea,
    selectedCuisine,
    priceRangeFilter,
    selectedAmenities,
    celebrationFilter,
    sortBy,
  ]);

  const handleReset = () => {
    setQuery('');
    setSelectedArea('All Varanasi');
    setSelectedCuisine('All');
    setPriceRangeFilter('all');
    setCelebrationFilter('All');
    setSelectedAmenities([]);
    setSortBy('rating');
    setSearchParams({});
  };

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
              Varanasi Dining Discovery
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
              Explore Restaurants, Menus &amp; Celebration Venues
            </h1>
          </div>
          <p className="text-sm text-[#6B5F5C] tabular-nums">
            Showing {filteredRestaurants.length} of {approvedRestaurants.length} approved venues
          </p>
        </div>

        <DemoBanner message="Inspect restaurant photo galleries, uploaded menu pages, amenities, food pre-order plates, and free-decoration celebration packages by clicking any restaurant." />

        {/* Advanced Filter Bar */}
        <div className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurant or area..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
              />
            </div>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label="Filter by locality"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
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
              className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
            >
              <option value="all">All Price Ranges</option>
              <option value="under1200">Under ₹1,200 for two</option>
              <option value="1200to1800">₹1,200 – ₹1,800 for two</option>
              <option value="above1800">Above ₹1,800 for two</option>
            </select>

            <select
              value={celebrationFilter}
              onChange={(e) => setCelebrationFilter(e.target.value)}
              aria-label="Filter by celebration type"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
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
                <SlidersHorizontal className="w-4 h-4 text-[#6B5F5C] absolute left-3 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Sort restaurants"
                  className="w-full pl-9 pr-2 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                >
                  <option value="rating">Top Rated</option>
                  <option value="priceLow">Price: Low-High</option>
                  <option value="priceHigh">Price: High-Low</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleReset}
                title="Reset all filters"
                aria-label="Reset all filters"
                className="px-3 py-2 bg-white border border-[#E8DDD1] rounded-lg text-[#292321] hover:border-[#702C3A]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cuisine Filter Buttons */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[#6B5F5C]">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCuisine('All')}
                className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                  selectedCuisine === 'All'
                    ? 'bg-[#702C3A] text-white border-[#702C3A]'
                    : 'bg-white text-[#292321] border-[#E8DDD1] hover:border-[#702C3A]'
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
                      ? 'bg-[#702C3A] text-white border-[#702C3A]'
                      : 'bg-white text-[#292321] border-[#E8DDD1] hover:border-[#702C3A]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Filter Buttons */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[#6B5F5C]">
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
                        ? 'bg-[#702C3A] text-white border-[#702C3A]'
                        : 'bg-white text-[#292321] border-[#E8DDD1] hover:border-[#702C3A]'
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
          <div className="border border-[#E8DDD1] rounded-lg p-12 text-center bg-[#FFF6E9]/40">
            <h2 className="text-xl font-semibold text-[#292321]">
              No matching restaurants found
            </h2>
            <p className="text-sm text-[#6B5F5C] mt-1.5">
              Try relaxing your amenity, price range, or celebration filters.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 px-5 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
            >
              View All Varanasi Restaurants
            </button>
          </div>
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
