import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Users, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POPULAR_CUISINES } from '../../data/mockData';
import { getTodayISO } from '../../utils/formatters';

interface RestaurantSearchPanelProps {
  initialArea?: string;
  initialQuery?: string;
  initialCuisine?: string;
  initialDate?: string;
  initialGuests?: string;
  onSearch?: (filters: {
    area: string;
    query: string;
    cuisine: string;
    date: string;
    guests: string;
  }) => void;
  compact?: boolean;
  heroMode?: boolean;
}

export function RestaurantSearchPanel({
  initialArea = 'All',
  initialQuery = '',
  initialCuisine = 'All',
  initialDate = getTodayISO(),
  initialGuests = '2',
  onSearch,
  compact = false,
  heroMode = false,
}: RestaurantSearchPanelProps) {
  const navigate = useNavigate();
  const { activeCities, selectedCity, setSelectedCity, cities } = useApp();
  const [cityChoice, setCityChoice] = useState(selectedCity);
  const [area, setArea] = useState(initialArea);
  const [query, setQuery] = useState(initialQuery);
  const [cuisine, setCuisine] = useState(initialCuisine);
  const [date, setDate] = useState(initialDate);
  const [guests, setGuests] = useState(initialGuests);

  const currentCityConfig =
    cities.find((c) => c.name.toLowerCase() === cityChoice.toLowerCase()) ||
    cities[0];
  const neighbourhoods = currentCityConfig?.neighbourhoods || [];

  const handleCityChange = (nextCity: string) => {
    setCityChoice(nextCity);
    setSelectedCity(nextCity);
    setArea('All');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCity(cityChoice);
    if (onSearch) {
      onSearch({ area, query, cuisine, date, guests });
      return;
    }
    const params = new URLSearchParams();
    params.set('city', cityChoice);
    if (area && area !== 'All') params.set('area', area);
    if (query.trim()) params.set('q', query.trim());
    if (cuisine && cuisine !== 'All') params.set('cuisine', cuisine);
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests);
    navigate(`/explore?${params.toString()}`);
  };

  if (heroMode) {
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5E0D8] rounded-lg p-4 sm:p-5 shadow-lg space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
              City
            </label>
            <select
              value={cityChoice}
              onChange={(e) => handleCityChange(e.target.value)}
              aria-label="Select city"
              className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] font-medium focus:outline-none focus:border-[#6E1E2E]"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.name} disabled={!c.isActive}>
                  {c.name}, {c.state}
                  {!c.isActive ? ' (Coming Soon)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
              {cityChoice} Neighbourhood
            </label>
            <div className="relative">
              <MapPin
                className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                aria-label={`Select ${cityChoice} neighbourhood`}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E]"
              >
                <option value="All">{cityChoice} (All Neighbourhoods)</option>
                {neighbourhoods.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}, {cityChoice}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
              Select Date
            </label>
            <div className="relative">
              <Calendar
                className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="date"
                value={date}
                min={getTodayISO()}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Select Date"
                className="w-full pl-9 pr-2 py-2.5 text-sm border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E]"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
              Number of Guests
            </label>
            <div className="relative">
              <Users
                className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                aria-label="Number of Guests"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E] tabular-nums"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((g) => (
                  <option key={g} value={String(g)}>
                    {g} {g === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors whitespace-nowrap"
            >
              Search {cityChoice}
            </button>
          </div>
        </div>

        {/* Popular Neighbourhood Search Suggestions */}
        <div className="pt-2 border-t border-[#E5E0D8] flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-[#57534E] mr-1">
            Explore {cityChoice}:
          </span>
          {neighbourhoods.map((hood) => (
            <button
              key={hood}
              type="button"
              onClick={() =>
                navigate(
                  `/explore?city=${encodeURIComponent(cityChoice)}&area=${encodeURIComponent(hood)}`
                )
              }
              className="px-2.5 py-1 rounded bg-[#FAF9F6] border border-[#E5E0D8] text-[11px] font-medium text-[#1C1917] hover:border-[#6E1E2E] hover:text-[#6E1E2E] transition-colors"
            >
              {hood}
            </button>
          ))}
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white border border-[#E5E0D8] rounded-lg ${
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
            {cityChoice} Neighbourhood
          </label>
          <div className="relative">
            <MapPin
              className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              aria-label={`Select ${cityChoice} neighbourhood`}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="All">{cityChoice} (All Neighbourhoods)</option>
              {neighbourhoods.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}, {cityChoice}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
            Restaurant or Keyword
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search Gomti Nagar, Hazratganj, Awadhi, rooftop...`}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E]"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
            Cuisine
          </label>
          <div className="relative">
            <UtensilsCrossed
              className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              aria-label="Select cuisine"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E]"
            >
              <option value="All">All Cuisines</option>
              {POPULAR_CUISINES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar
              className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="date"
              value={date}
              min={getTodayISO()}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Booking date"
              className="w-full pl-9 pr-2 py-2 text-sm border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E]"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
            Guests
          </label>
          <div className="relative">
            <Users
              className="w-4 h-4 text-[#6E1E2E] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              aria-label="Number of guests"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#6E1E2E] tabular-nums"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((g) => (
                <option key={g} value={String(g)}>
                  {g} {g === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#57534E]">
          Curated dining across {neighbourhoods.join(', ')}
        </p>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors whitespace-nowrap shrink-0"
        >
          Search Restaurants
        </button>
      </div>
    </form>
  );
}
