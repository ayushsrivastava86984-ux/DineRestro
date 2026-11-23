import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POPULAR_CUISINES, VARANASI_AREAS } from '../../data/mockData';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { DemoBanner } from '../../components/common/DemoBanner';

export function ExplorePage() {
  const { restaurants } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || 'All Varanasi');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [sortBy, setSortBy] = useState<'rating' | 'priceLow' | 'priceHigh'>('rating');

  const approvedRestaurants = useMemo(
    () => restaurants.filter((r) => r.approvalStatus === 'Approved'),
    [restaurants]
  );

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
      return matchesQuery && matchesArea && matchesCuisine;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'priceLow') return a.priceForTwo - b.priceForTwo;
      if (sortBy === 'priceHigh') return b.priceForTwo - a.priceForTwo;
      return b.rating - a.rating;
    });
  }, [approvedRestaurants, query, selectedArea, selectedCuisine, sortBy]);

  const handleReset = () => {
    setQuery('');
    setSelectedArea('All Varanasi');
    setSelectedCuisine('All');
    setSortBy('rating');
    setSearchParams({});
  };

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
              Varanasi Dining Directory
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
              Explore Restaurants
            </h1>
          </div>
          <p className="text-sm text-[#6B5F5C] tabular-nums">
            Showing {filteredRestaurants.length} of {approvedRestaurants.length} sample venues
          </p>
        </div>

        <DemoBanner message="Restaurant availability, pricing, and offers are simulated sample data for Phase 1 frontend evaluation." />

        {/* Filter Bar */}
        <div className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by restaurant or dish..."
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

            <div className="relative flex items-center">
              <SlidersHorizontal className="w-4 h-4 text-[#6B5F5C] absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                aria-label="Sort restaurants"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
              >
                <option value="rating">Highest Rated</option>
                <option value="priceLow">Price for Two: Low to High</option>
                <option value="priceHigh">Price for Two: High to Low</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-[#E8DDD1] rounded-lg text-[#292321] hover:bg-[#FFF6E9] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCuisine('All')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
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
                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
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

        {/* Results */}
        {filteredRestaurants.length === 0 ? (
          <div className="border border-[#E8DDD1] rounded-lg p-12 text-center bg-[#FFF6E9]/40">
            <h2 className="text-xl font-semibold text-[#292321]">
              No matching restaurants found
            </h2>
            <p className="text-sm text-[#6B5F5C] mt-1.5">
              Try clearing your cuisine filter or searching another locality in Varanasi.
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
