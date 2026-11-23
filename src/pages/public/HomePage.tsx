import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Search,
  Users,
  UtensilsCrossed,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  BarChart3,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  IMAGES,
  POPULAR_CUISINES,
  SPECIAL_EVENTS,
  VARANASI_AREAS,
} from '../../data/mockData';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { SafeImage } from '../../components/common/SafeImage';
import { getTodayISO, formatDisplayDate } from '../../utils/formatters';

export function HomePage() {
  const { restaurants, offers, openRestaurantModal, addToast } = useApp();
  const navigate = useNavigate();

  const [area, setArea] = useState('All Varanasi');
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [date, setDate] = useState(getTodayISO());
  const [guests, setGuests] = useState('2');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const featuredRestaurants = restaurants
    .filter((r) => r.approvalStatus === 'Approved' && r.featured)
    .slice(0, 6);

  const activeOffers = offers.filter((o) => o.active).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (area && area !== 'All Varanasi') params.set('area', area);
    if (query.trim()) params.set('q', query.trim());
    if (cuisine && cuisine !== 'All') params.set('cuisine', cuisine);
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests);
    navigate(`/explore?${params.toString()}`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    addToast({
      type: 'success',
      title: `Offer Code ${code} Copied`,
      description: 'Apply this code during table reservation previews.',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[560px] lg:min-h-[620px] flex items-center bg-[#292321] overflow-hidden">
        <SafeImage
          src={IMAGES.heroVaranasi}
          alt="Rooftop candlelit dining overlooking Varanasi riverfront ghats at dusk"
          className="absolute inset-0 w-full h-full object-cover"
          fallbackTitle="Varanasi Rooftop Dining"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/45"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 w-full">
          <div className="max-w-2xl text-white space-y-4">
            <p className="text-xs sm:text-sm font-medium text-[#FFF6E9] tracking-wide">
              Launching in Varanasi, Uttar Pradesh
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-[1.1] tracking-tight text-white">
              Discover. Reserve. Celebrate.
            </h1>
            <p className="text-base sm:text-lg text-[#FFF6E9]/90 leading-relaxed max-w-xl">
              Find your perfect restaurant, reserve your table and make every occasion memorable with DineRestro.
            </p>
          </div>

          {/* Search Interface */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 bg-white border border-[#E8DDD1] rounded-lg p-4 sm:p-5 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold text-[#6B5F5C] mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#702C3A] absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    aria-label="Select Varanasi area"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg text-[#292321] focus:outline-none focus:border-[#702C3A]"
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
                <label className="block text-[11px] font-semibold text-[#6B5F5C] mb-1">
                  Restaurant Name
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Kashi Ganga Terrace, Darbar Haveli..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DDD1] rounded-lg text-[#292321] focus:outline-none focus:border-[#702C3A]"
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold text-[#6B5F5C] mb-1">
                  Cuisine
                </label>
                <div className="relative">
                  <UtensilsCrossed className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    aria-label="Select cuisine"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg text-[#292321] focus:outline-none focus:border-[#702C3A]"
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
                <label className="block text-[11px] font-semibold text-[#6B5F5C] mb-1">
                  Booking Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    min={getTodayISO()}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Booking date"
                    className="w-full pl-9 pr-2 py-2 text-sm border border-[#E8DDD1] rounded-lg text-[#292321] focus:outline-none focus:border-[#702C3A]"
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold text-[#6B5F5C] mb-1">
                  Guests
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    aria-label="Number of guests"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg text-[#292321] focus:outline-none focus:border-[#702C3A]"
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

            <div className="mt-3 pt-3 border-t border-[#E8DDD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-[#6B5F5C]">
                Showing curated dining venues across Assi Ghat, Nadesar, Sigra, Lanka &amp; Cantonment
              </p>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors whitespace-nowrap shrink-0"
              >
                Search Restaurants
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
                Curated in Varanasi
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                Featured Restaurants
              </h2>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#702C3A] hover:text-[#58202C] whitespace-nowrap"
            >
              <span>Explore All Restaurants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cuisines */}
      <section className="py-16 bg-[#FFF6E9] border-y border-[#E8DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
                Explore by Flavor
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                Popular Cuisines
              </h2>
            </div>
            <p className="text-sm text-[#6B5F5C]">
              Select a cuisine to filter Varanasi restaurants instantly
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_CUISINES.map((item) => (
              <Link
                key={item.name}
                to={`/explore?cuisine=${encodeURIComponent(item.name)}`}
                className="group bg-white border border-[#E8DDD1] rounded-lg overflow-hidden hover:border-[#702C3A] transition-colors"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <SafeImage
                    src={item.image}
                    alt={`${item.name} dining in Varanasi`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    fallbackTitle={item.name}
                  />
                </div>
                <div className="p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#292321] group-hover:text-[#702C3A]">
                      {item.name}
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-[#6B5F5C]">
                      {item.spotsCount} spots
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5F5C] mt-1 line-clamp-1">
                    {item.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
                Exclusive Dining Privileges
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                Curated Offers &amp; Promotions
              </h2>
            </div>
            <Link
              to="/offers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#702C3A] hover:text-[#58202C] whitespace-nowrap"
            >
              <span>View All Offers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeOffers.map((offer) => {
              const matchedRest = restaurants.find((r) => r.id === offer.restaurantId);
              return (
                <div
                  key={offer.id}
                  className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#6B5F5C] mb-1.5">
                      <span className="font-semibold text-[#702C3A]">
                        {offer.category} · {offer.discountLabel}
                      </span>
                      <span className="tabular-nums">
                        Valid until {formatDisplayDate(offer.validUntil)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#292321]">
                      {offer.title}
                    </h3>
                    <p className="text-sm font-medium text-[#702C3A] mt-0.5">
                      {offer.restaurantName} · {offer.area}
                    </p>
                    <p className="text-xs text-[#6B5F5C] mt-2 leading-relaxed">
                      {offer.terms}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8DDD1] flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#E8DDD1] bg-white text-xs font-mono font-semibold text-[#292321] hover:border-[#702C3A] transition-colors"
                    >
                      <span>{offer.code}</span>
                      {copiedCode === offer.code ? (
                        <Check className="w-3.5 h-3.5 text-[#702C3A]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#6B5F5C]" />
                      )}
                    </button>
                    {matchedRest && (
                      <button
                        type="button"
                        onClick={() => openRestaurantModal(matchedRest, true)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
                      >
                        Book With Offer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Events */}
      <section className="py-16 bg-[#FFF6E9] border-y border-[#E8DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
                Host Memorable Moments
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                Special Events &amp; Private Celebrations
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#702C3A] hover:text-[#58202C] whitespace-nowrap"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SPECIAL_EVENTS.map((evt, idx) => (
              <div
                key={evt.id}
                className={`bg-white border border-[#E8DDD1] rounded-lg overflow-hidden flex flex-col ${
                  idx === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <SafeImage
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                    fallbackTitle={evt.title}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-[#6B5F5C] tabular-nums">
                    {evt.idealGroupSize} · {evt.startingBudget}
                  </p>
                  <h3 className="text-xl font-semibold text-[#292321] mt-1">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#6B5F5C] mt-1.5 leading-relaxed flex-1">
                    {evt.description}
                  </p>
                  <div className="pt-4">
                    <Link
                      to={`/events?occasion=${encodeURIComponent(evt.title)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#702C3A] hover:text-[#58202C]"
                    >
                      <span>Explore Events</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
              Seamless Reservations
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
              How DineRestro Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01.',
                title: 'Discover a restaurant',
                desc: 'Browse curated Varanasi rooftops, heritage courtyards, and neighborhood cafés by cuisine and locality.',
              },
              {
                num: '02.',
                title: 'Choose date and time',
                desc: 'Pick your preferred dining window, party size, and special celebration notes in seconds.',
              },
              {
                num: '03.',
                title: 'Reserve your table',
                desc: 'Submit your booking preview with instant offer visibility and transparent venue highlights.',
              },
              {
                num: '04.',
                title: 'Enjoy your experience',
                desc: 'Arrive to a prepared table and focus on great food, warm hospitality, and celebration.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="border border-[#E8DDD1] rounded-lg p-5 bg-[#FFF6E9]/45"
              >
                <span className="font-display text-3xl font-semibold text-[#702C3A]">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold text-[#292321] mt-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6B5F5C] mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Partnership Section */}
      <section className="py-16 bg-[#702C3A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-semibold text-[#F4A6B8] tracking-wide">
                For Hospitality Owners in Varanasi
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                Grow Your Restaurant With DineRestro.
              </h2>
              <p className="text-sm sm:text-base text-[#FFF6E9]/90 leading-relaxed max-w-2xl">
                Showcase your dining room to high-intent local diners and travelers, manage table turns effortlessly, and host high-value birthday, anniversary, and corporate gatherings.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/restaurant/signup"
                  className="px-6 py-3 text-sm font-semibold bg-white text-[#702C3A] rounded-lg hover:bg-[#FFF6E9] transition-colors"
                >
                  Register Your Restaurant
                </Link>
                <Link
                  to="/restaurant/login"
                  className="px-5 py-3 text-sm font-semibold border border-white/40 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Partner Portal Login (Demo)
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3.5">
              <div className="bg-white/10 border border-white/15 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#F4A6B8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Streamlined Reservation Desk
                  </h3>
                  <p className="text-xs text-[#FFF6E9]/80 mt-0.5 leading-relaxed">
                    Accept or review table requests, assign floor zones, and reduce peak-hour waitlists.
                  </p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-lg p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#F4A6B8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Celebration &amp; Event Inquiries
                  </h3>
                  <p className="text-xs text-[#FFF6E9]/80 mt-0.5 leading-relaxed">
                    Capture pre-planned birthday, anniversary, and corporate group bookings directly.
                  </p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-lg p-4 flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-[#F4A6B8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Menu, Offers &amp; Floor Control
                  </h3>
                  <p className="text-xs text-[#FFF6E9]/80 mt-0.5 leading-relaxed">
                    Publish weekday dining privileges, update digital dish availability, and track trends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
