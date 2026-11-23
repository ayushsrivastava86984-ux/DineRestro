import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  PartyPopper,
  Tag,
  Heart,
  UserCircle,
  LifeBuoy,
  MapPin,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { RestaurantModal } from '../../components/common/RestaurantModal';
import { POPULAR_CUISINES } from '../../data/mockData';
import type { CuisineType } from '../../types';
import { formatDisplayDate } from '../../utils/formatters';

const CUSTOMER_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'Explore Restaurants', to: '/customer/explore', icon: Compass },
  { label: 'My Bookings', to: '/customer/bookings', icon: CalendarCheck },
  { label: 'Events', to: '/customer/events', icon: PartyPopper },
  { label: 'Offers', to: '/customer/offers', icon: Tag },
  { label: 'Favorites', to: '/customer/favorites', icon: Heart },
  { label: 'My Profile', to: '/customer/profile', icon: UserCircle },
  { label: 'Help & Support', to: '/customer/support', icon: LifeBuoy },
];

export function CustomerDashboard() {
  const location = useLocation();
  const {
    customerUser,
    updateCustomerProfile,
    restaurants,
    reservations,
    updateReservationStatus,
    offers,
    eventInquiries,
    favoriteIds,
    tickets,
    submitSupportTicket,
    openRestaurantModal,
    addToast,
  } = useApp();

  const [bookingFilter, setBookingFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [searchExplore, setSearchExplore] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState(customerUser.fullName);
  const [mobile, setMobile] = useState(customerUser.mobile);
  const [city, setCity] = useState(customerUser.city);
  const [preferredCuisine, setPreferredCuisine] = useState<CuisineType>(customerUser.preferredCuisine);

  // Support ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');
  const myBookings = reservations.filter((r) => r.customerId === customerUser.id || r.customerName === customerUser.fullName);
  const upcomingBookings = myBookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed');
  const recentBookings = myBookings.filter((b) => b.status === 'Completed' || b.status === 'Cancelled');
  const favoriteRestaurants = approvedRestaurants.filter((r) => favoriteIds.includes(r.id));
  const activeOffers = offers.filter((o) => o.active);

  const path = location.pathname;
  const activeSection =
    path.includes('/customer/explore')
      ? 'explore'
      : path.includes('/customer/bookings')
        ? 'bookings'
        : path.includes('/customer/events')
          ? 'events'
          : path.includes('/customer/offers')
            ? 'offers'
            : path.includes('/customer/favorites')
              ? 'favorites'
              : path.includes('/customer/profile')
                ? 'profile'
                : path.includes('/customer/support')
                  ? 'support'
                  : 'overview';

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    addToast({ type: 'success', title: `Promo Code ${code} Copied` });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      fullName: fullName.trim() || customerUser.fullName,
      mobile: mobile.trim() || customerUser.mobile,
      city: city.trim() || 'Varanasi',
      preferredCuisine,
    });
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    submitSupportTicket({
      userName: customerUser.fullName,
      userRole: 'Customer',
      subject: ticketSubject.trim(),
      message: ticketMessage.trim(),
      priority: 'Medium',
    });
    setTicketSubject('');
    setTicketMessage('');
  };

  const filteredMyBookings = myBookings.filter((b) => {
    if (bookingFilter === 'Upcoming') return b.status === 'Pending' || b.status === 'Confirmed';
    if (bookingFilter === 'Completed') return b.status === 'Completed';
    if (bookingFilter === 'Cancelled') return b.status === 'Cancelled' || b.status === 'Rejected';
    return true;
  });

  return (
    <DashboardLayout
      portalRole="customer"
      portalLabel="Customer Portal"
      userTitle={customerUser.fullName}
      userSubtitle={`${customerUser.city} · ${customerUser.email}`}
      navItems={CUSTOMER_NAV}
    >
      <div className="space-y-6">
        <DemoBanner message="You are viewing the simulated Customer Dashboard (DEMO MODE). Booking previews and profile edits are stored in local session state only." />

        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                  Welcome back, {customerUser.fullName.split(' ')[0]}
                </h1>
                <p className="text-sm text-[#6B5F5C] mt-1">
                  Your curated Varanasi dining schedule, saved venues, and dining privileges.
                </p>
              </div>
              <Link
                to="/customer/explore"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors whitespace-nowrap self-start"
              >
                Book a New Table (Demo)
              </Link>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Upcoming Previews</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {upcomingBookings.length}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Recent / Completed</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {recentBookings.length}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Favorite Venues</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {favoriteRestaurants.length}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Available Offers</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#702C3A] mt-1">
                  {activeOffers.length}
                </p>
              </div>
            </div>

            {/* Upcoming & Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#292321]">Upcoming Bookings</h2>
                  <Link to="/customer/bookings" className="text-xs font-semibold text-[#702C3A] hover:underline">
                    View all
                  </Link>
                </div>
                {upcomingBookings.length === 0 ? (
                  <p className="text-sm text-[#6B5F5C]">No upcoming booking previews yet.</p>
                ) : (
                  <div className="divide-y divide-[#E8DDD1]">
                    {upcomingBookings.map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#292321]">{b.restaurantName}</p>
                          <p className="text-xs text-[#6B5F5C] tabular-nums">
                            {formatDisplayDate(b.date)} · {b.time} · {b.guests} Guests
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#292321]">Recent Bookings</h2>
                  <Link to="/customer/bookings" className="text-xs font-semibold text-[#702C3A] hover:underline">
                    History
                  </Link>
                </div>
                {recentBookings.length === 0 ? (
                  <p className="text-sm text-[#6B5F5C]">No past bookings in this demo session.</p>
                ) : (
                  <div className="divide-y divide-[#E8DDD1]">
                    {recentBookings.map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#292321]">{b.restaurantName}</p>
                          <p className="text-xs text-[#6B5F5C] tabular-nums">
                            {formatDisplayDate(b.date)} · {b.guests} Guests · {b.occasion || 'Dining'}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Restaurants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#292321]">
                  Recommended in Varanasi
                </h2>
                <Link to="/customer/explore" className="text-xs font-semibold text-[#702C3A] hover:underline">
                  Explore all
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {approvedRestaurants.slice(0, 3).map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>

            {/* Exclusive Offers & Favorites */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                <h2 className="text-lg font-semibold text-[#292321]">Exclusive Offers</h2>
                <div className="divide-y divide-[#E8DDD1]">
                  {activeOffers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#292321]">{offer.title}</p>
                        <p className="text-xs text-[#6B5F5C]">{offer.restaurantName} · {offer.discountLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(offer.code)}
                        className="px-2.5 py-1 text-xs font-mono font-semibold border border-[#E8DDD1] rounded bg-[#FFF6E9]"
                      >
                        {offer.code}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                <h2 className="text-lg font-semibold text-[#292321]">Favorite Restaurants</h2>
                {favoriteRestaurants.length === 0 ? (
                  <p className="text-sm text-[#6B5F5C]">Save restaurants with the heart icon to access them quickly.</p>
                ) : (
                  <div className="divide-y divide-[#E8DDD1]">
                    {favoriteRestaurants.map((r) => (
                      <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#292321]">{r.name}</p>
                          <p className="text-xs text-[#6B5F5C]">{r.area} · {r.primaryCuisine}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openRestaurantModal(r, true)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                        >
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'explore' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Explore Varanasi Restaurants
              </h1>
              <input
                type="text"
                value={searchExplore}
                onChange={(e) => setSearchExplore(e.target.value)}
                placeholder="Filter by name, area, or cuisine..."
                className="px-3.5 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg w-full sm:w-72 focus:outline-none focus:border-[#702C3A]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {approvedRestaurants
                .filter(
                  (r) =>
                    !searchExplore.trim() ||
                    r.name.toLowerCase().includes(searchExplore.toLowerCase()) ||
                    r.area.toLowerCase().includes(searchExplore.toLowerCase()) ||
                    r.cuisines.some((c) => c.toLowerCase().includes(searchExplore.toLowerCase()))
                )
                .map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
            </div>
          </div>
        )}

        {activeSection === 'bookings' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  My Bookings (Demo Previews)
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Track or cancel simulated table reservation previews.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-[#E8DDD1] p-1 rounded-lg">
                {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setBookingFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                      bookingFilter === tab
                        ? 'bg-[#702C3A] text-white'
                        : 'text-[#292321] hover:bg-[#FFF6E9]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Restaurant</th>
                    <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                    <th className="py-3 px-4 font-semibold text-right">Guests</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {filteredMyBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-[#6B5F5C]">
                        No bookings match this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMyBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#FFF6E9]/40">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#702C3A]">
                          {b.id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-[#292321]">{b.restaurantName}</p>
                          <p className="text-xs text-[#6B5F5C]">{b.restaurantArea}</p>
                        </td>
                        <td className="py-3 px-4 tabular-nums text-xs text-[#292321]">
                          {formatDisplayDate(b.date)} · {b.time}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">{b.guests}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {(b.status === 'Pending' || b.status === 'Confirmed') && (
                            <button
                              type="button"
                              onClick={() => updateReservationStatus(b.id, 'Cancelled')}
                              className="px-3 py-1 text-xs font-semibold text-[#702C3A] border border-[#F4A6B8] rounded hover:bg-[#FDECEF]"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'events' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  My Event Inquiries
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Track birthday, anniversary, and celebration dining requests.
                </p>
              </div>
              <Link
                to="/events"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                New Event Inquiry
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventInquiries.map((ev) => (
                <div key={ev.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-[#702C3A]">{ev.id}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#292321]">{ev.eventType}</h3>
                  <p className="text-xs text-[#6B5F5C]">
                    {ev.restaurantName} · {formatDisplayDate(ev.preferredDate)} · {ev.guests} Guests · {ev.budgetRange}
                  </p>
                  <p className="text-xs text-[#292321] pt-1">{ev.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'offers' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Exclusive Member Offers
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOffers.map((offer) => (
                <div key={offer.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6B5F5C]">
                    <span className="font-semibold text-[#702C3A]">{offer.discountLabel}</span>
                    <span className="tabular-nums">Valid till {formatDisplayDate(offer.validUntil)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#292321]">{offer.title}</h3>
                  <p className="text-xs text-[#6B5F5C]">{offer.restaurantName} · {offer.terms}</p>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.code)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold bg-[#FFF6E9] border border-[#E8DDD1] rounded"
                  >
                    <span>{offer.code}</span>
                    {copiedCode === offer.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'favorites' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Favorite Restaurants
            </h1>
            {favoriteRestaurants.length === 0 ? (
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-8 text-center space-y-3">
                <p className="text-sm text-[#6B5F5C]">You have not saved any favorite venues yet.</p>
                <Link
                  to="/customer/explore"
                  className="inline-block px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                >
                  Discover Restaurants
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteRestaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-2xl bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                My Profile (Demo)
              </h1>
              <p className="text-xs text-[#6B5F5C] mt-1">
                Update your simulated diner preferences stored in local browser state.
              </p>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Email (Read-only Demo)
                  </label>
                  <input
                    type="email"
                    value={customerUser.email}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg bg-[#FFF6E9]/50 text-[#6B5F5C]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Preferred Cuisine
                  </label>
                  <select
                    value={preferredCuisine}
                    onChange={(e) => setPreferredCuisine(e.target.value as CuisineType)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                  >
                    {POPULAR_CUISINES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
              >
                Save Demo Profile
              </button>
            </form>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-4">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Help &amp; Support
              </h1>
              <p className="text-xs text-[#6B5F5C]">
                Need assistance with a dining reservation preview? Log a support note in demo mode.
              </p>
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Booking change or venue question"
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe how our concierge team can help..."
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg"
                >
                  Submit Support Note (Demo)
                </button>
              </form>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#292321]">Recent Support Notes</h2>
              <div className="divide-y divide-[#E8DDD1]">
                {tickets
                  .filter((t) => t.userRole === 'Customer')
                  .map((t) => (
                    <div key={t.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-[#702C3A]">{t.id}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#292321]">{t.subject}</p>
                      <p className="text-xs text-[#6B5F5C]">{t.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <RestaurantModal />
    </DashboardLayout>
  );
}
