import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Users, UtensilsCrossed } from 'lucide-react';
import { POPULAR_CUISINES, VARANASI_AREAS } from '../../data/mockData';
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
  initialArea = 'All Varanasi',
  initialQuery = '',
  initialCuisine = 'All',
  initialDate = getTodayISO(),
  initialGuests = '2',
  onSearch,
  compact = false,
  heroMode = false,
}: RestaurantSearchPanelProps) {
  const navigate = useNavigate();
  const [area, setArea] = useState(initialArea);
  const [query, setQuery] = useState(initialQuery);
  const [cuisine, setCuisine] = useState(initialCuisine);
  const [date, setDate] = useState(initialDate);
  const [guests, setGuests] = useState(initialGuests);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ area, query, cuisine, date, guests });
      return;
    }
    const params = new URLSearchParams();
    if (area && area !== 'All Varanasi') params.set('area', area);
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
        className="bg-white border border-[#EAD8C9] rounded-lg p-4 sm:p-5 shadow-lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin
                className="w-4 h-4 text-[#C84A1B] absolute left-3 top-2.5 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                aria-label="Select Varanasi location"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B]"
              >
                {VARANASI_AREAS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'All Varanasi' ? 'Varanasi (All Localities)' : `${loc}, Varanasi`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
              Select Date
            </label>
            <div className="relative">
              <Calendar
                className="w-4 h-4 text-[#C84A1B] absolute left-3 top-2.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="date"
                value={date}
                min={getTodayISO()}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Select Date"
                className="w-full pl-9 pr-2 py-2.5 text-sm border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B]"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
              Number of Guests
            </label>
            <div className="relative">
              <Users
                className="w-4 h-4 text-[#C84A1B] absolute left-3 top-2.5 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                aria-label="Number of Guests"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B] tabular-nums"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((g) => (
                  <option key={g} value={String(g)}>
                    {g} {g === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-3">
            <button
              type="submit"
              className="w-full px-5 py-2.5 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap"
            >
              Search Restaurants
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white border border-[#EAD8C9] rounded-lg ${
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
            Varanasi Locality
          </label>
          <div className="relative">
            <MapPin
              className="w-4 h-4 text-[#C84A1B] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              aria-label="Select Varanasi area"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B]"
            >
              {VARANASI_AREAS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All Varanasi' ? 'Varanasi (All Areas)' : `${loc}, Varanasi`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
            Restaurant or Keyword
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#6E4B41] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kashi Ganga Terrace, rooftop, thali..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B]"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
            Cuisine
          </label>
          <div className="relative">
            <UtensilsCrossed
              className="w-4 h-4 text-[#6E4B41] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              aria-label="Select cuisine"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B]"
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
          <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar
              className="w-4 h-4 text-[#6E4B41] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="date"
              value={date}
              min={getTodayISO()}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Booking date"
              className="w-full pl-9 pr-2 py-2 text-sm border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B]"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#6E4B41] mb-1">
            Guests
          </label>
          <div className="relative">
            <Users
              className="w-4 h-4 text-[#6E4B41] absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              aria-label="Number of guests"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg text-[#321D17] focus:outline-none focus:border-[#C84A1B] tabular-nums"
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

      <div className="mt-3 pt-3 border-t border-[#EAD8C9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#6E4B41]">
          Curated dining across Assi Ghat, Nadesar, Sigra, Lanka, Rathyatra &amp; Cantonment
        </p>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap shrink-0"
        >
          Search Restaurants
        </button>
      </div>
    </form>
  );
}
