import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  Check,
  Compass,
  Copy,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  MessageSquare,
  PartyPopper,
  Receipt,
  Star,
  Tag,
  UserCircle,
  Utensils,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { RestaurantModal } from '../../components/common/RestaurantModal';
import { SafeImage } from '../../components/common/SafeImage';
import { EmptyStateCard } from '../../components/common/EmptyStateCard';
import { POPULAR_CUISINES } from '../../data/mockData';
import type { CelebrationBooking, CuisineType } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const CUSTOMER_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'My Reservations', to: '/customer/reservations', icon: CalendarCheck },
  { label: 'Food Pre-Orders', to: '/customer/preorders', icon: Utensils },
  { label: 'My Celebrations', to: '/customer/celebrations', icon: PartyPopper },
  { label: 'Payment History', to: '/customer/payments', icon: Receipt },
  { label: 'Reviews', to: '/customer/reviews', icon: MessageSquare },
  { label: 'Notifications', to: '/customer/notifications', icon: Bell },
  { label: 'Explore', to: '/customer/explore', icon: Compass },
  { label: 'Offers', to: '/customer/offers', icon: Tag },
  { label: 'Favorites', to: '/customer/favorites', icon: Heart },
  { label: 'Profile & Settings', to: '/customer/profile', icon: UserCircle },
  { label: 'Help & Support', to: '/customer/support', icon: LifeBuoy },
];

export function CustomerDashboard() {
  const location = useLocation();
  const {
    selectedCity,
    cities,
    customerUser,
    updateCustomerProfile,
    restaurants,
    reservations,
    updateReservationStatus,
    preOrders,
    markPreOrderAdvancePaid,
    celebrationBookings,
    markCelebrationAdvancePaid,
    cancelCelebrationBooking,
    payments,
    reviews,
    submitReview,
    notifications,
    markAllNotificationsRead,
    offers,
    favoriteIds,
    tickets,
    submitSupportTicket,
    openDemoPayment,
    addToast,
  } = useApp();

  const [selectedCelebration, setSelectedCelebration] = useState<CelebrationBooking | null>(null);

  const [searchExplore, setSearchExplore] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [fullName, setFullName] = useState(customerUser.fullName);
  const [mobile, setMobile] = useState(customerUser.mobile);
  const [city, setCity] = useState(customerUser.city);
  const [preferredCuisine, setPreferredCuisine] = useState<CuisineType>(customerUser.preferredCuisine);

  const activeCity = customerUser.city?.trim() || selectedCity;
  const approvedRestaurants = restaurants.filter(
    (r) => r.approvalStatus === 'Approved' && r.isActive !== false
  );
  const cityApprovedRestaurants = approvedRestaurants.filter(
    (r) => r.city.toLowerCase() === activeCity.toLowerCase()
  );
  const [reviewRestId, setReviewRestId] = useState(
    cityApprovedRestaurants[0]?.id || approvedRestaurants[0]?.id || ''
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const myBookings = reservations.filter(
    (r) => r.customerId === customerUser.id || r.customerName === customerUser.fullName
  );
  const myPreOrders = preOrders.filter(
    (p) => p.customerId === customerUser.id || p.customerName === customerUser.fullName
  );
  const myCelebrations = celebrationBookings.filter(
    (c) => c.customerId === customerUser.id || c.customerName === customerUser.fullName
  );
  const myPayments = payments.filter((pay) => pay.customerName === customerUser.fullName);
  const myNotifications = notifications.filter((n) => n.role === 'customer');
  const myReviews = reviews.filter((rv) => rv.customerName === customerUser.fullName || rv.visible);

  const favoriteRestaurants = cityApprovedRestaurants.filter((r) =>
    favoriteIds.includes(r.id)
  );
  const activeOffers = offers.filter((o) => {
    if (!o.active) return false;
    const rest = restaurants.find((r) => r.id === o.restaurantId);
    return rest
      ? rest.approvalStatus === 'Approved' &&
          rest.city.toLowerCase() === activeCity.toLowerCase()
      : false;
  });

  const path = location.pathname;
  const activeSection =
    path.includes('/customer/explore')
      ? 'explore'
      : path.includes('/customer/reservations') || path.includes('/customer/bookings')
        ? 'reservations'
        : path.includes('/customer/preorders')
          ? 'preorders'
          : path.includes('/customer/celebrations') || path.includes('/customer/events')
            ? 'celebrations'
            : path.includes('/customer/payments')
              ? 'payments'
              : path.includes('/customer/reviews')
                ? 'reviews'
                : path.includes('/customer/notifications')
                  ? 'notifications'
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
      city: city.trim() || selectedCity,
      preferredCuisine,
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rest = approvedRestaurants.find((r) => r.id === reviewRestId);
    if (!rest || !reviewComment.trim()) return;
    submitReview({
      restaurantId: rest.id,
      restaurantName: rest.name,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    setReviewComment('');
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

  return (
    <DashboardLayout
      portalRole="customer"
      portalLabel="Customer Portal"
      userTitle={customerUser.fullName}
      userSubtitle={`${customerUser.city} · ${customerUser.email}`}
      navItems={CUSTOMER_NAV}
    >
      <div className="space-y-6">
        <DemoBanner message="Customer Dashboard (DEMO MODE). Table bookings, restaurant-specific pre-orders, celebration reservations, and DEMO ONLY receipts are stored locally." />

        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
                  Welcome back, {customerUser.fullName.split(' ')[0]}
                </h1>
                <p className="text-sm text-[#57534E] mt-1">
                  Manage table bookings, food pre-orders, celebrations, and {activeCity} dining favorites.
                </p>
              </div>
              <Link
                to="/customer/explore"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors whitespace-nowrap self-start"
              >
                Discover &amp; Reserve (Demo)
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Table Reservations</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {myBookings.length}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Food Pre-Orders</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {myPreOrders.length}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">My Celebrations</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#6E1E2E] mt-1">
                  {myCelebrations.length}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Favorite Venues</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {favoriteRestaurants.length}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                  Recommended in {activeCity}
                </h2>
                <Link to="/customer/explore" className="text-xs font-semibold text-[#6E1E2E] hover:underline">
                  Explore all
                </Link>
              </div>
              {cityApprovedRestaurants.length === 0 ? (
                <EmptyStateCard
                  title={`Partner restaurants launching soon in ${activeCity}`}
                  description={`Verified restaurants across ${activeCity} are currently onboarding. Approved venues will appear here automatically.`}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {cityApprovedRestaurants.slice(0, 3).map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'explore' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Explore {activeCity} Restaurants
              </h1>
              <input
                type="text"
                value={searchExplore}
                onChange={(e) => setSearchExplore(e.target.value)}
                placeholder="Filter by name, neighbourhood, or cuisine..."
                className="px-3.5 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg w-full sm:w-72 focus:outline-none focus:border-[#6E1E2E]"
              />
            </div>
            {(() => {
              const matched = cityApprovedRestaurants.filter(
                (r) =>
                  !searchExplore.trim() ||
                  r.name.toLowerCase().includes(searchExplore.toLowerCase()) ||
                  r.area.toLowerCase().includes(searchExplore.toLowerCase()) ||
                  r.cuisines.some((c) => c.toLowerCase().includes(searchExplore.toLowerCase()))
              );
              return matched.length === 0 ? (
                <EmptyStateCard
                  title={
                    cityApprovedRestaurants.length === 0
                      ? `Launching ${activeCity} dining partners`
                      : 'No matching restaurants found'
                  }
                  description={
                    cityApprovedRestaurants.length === 0
                      ? `No approved restaurants are listed in ${activeCity} yet. Partner venues appear here once approved.`
                      : 'Try clearing your filter or searching another neighbourhood.'
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {matched.map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeSection === 'reservations' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                My Table Reservations
              </h1>
              <p className="text-sm text-[#57534E]">
                Per-guest platform booking fees (Basic / Premium) are kept separate from your restaurant food bill.
              </p>
            </div>
            {myBookings.length === 0 ? (
              <EmptyStateCard
                title="No table reservations yet"
                description={`Browse ${activeCity} restaurants to book a Basic or Premium verified dining table.`}
              />
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-[#6E1E2E]">{b.id}</span>
                        <span className="text-[#57534E]">· {b.bookingTier} Table Booking</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                        {b.restaurantName}
                      </h3>
                      <p className="text-xs text-[#57534E] tabular-nums">
                        {formatDisplayDate(b.date)} · {b.time} · {b.guests} Guests
                      </p>
                      <p className="text-xs text-[#6E1E2E] font-medium tabular-nums">
                        Platform Booking Fee: {b.guests} × {formatINR(b.feePerGuest)} ={' '}
                        {formatINR(b.platformFeeTotal)}
                        {b.selectedOfferTitle ? ` · Offer: ${b.selectedOfferTitle}` : ''} · Food bill settled at venue
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <StatusBadge status={b.status} />
                      {(b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Accepted') && (
                        <button
                          type="button"
                          onClick={() => updateReservationStatus(b.id, 'Cancelled')}
                          className="px-3 py-1.5 text-xs font-semibold text-[#6E1E2E] border border-[#E5E0D8] rounded hover:bg-[#F3F1ED]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'preorders' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Food Pre-Orders
              </h1>
              <p className="text-sm text-[#57534E]">
                Each restaurant sets its own advance percentage. Total food bill, advance paid, and venue balance are shown separately.
              </p>
            </div>
            {myPreOrders.length === 0 ? (
              <EmptyStateCard
                title="No food pre-orders yet"
                description="Inspect uploaded photo menus on any restaurant profile and pre-order prepared plate packages."
              />
            ) : (
              <div className="space-y-4">
                {myPreOrders.map((po) => {
                  const isMenuCart =
                    po.orderSource === 'menu_cart' && po.items && po.items.length > 0;
                  const payStatusText =
                    po.paymentStatus ||
                    (po.orderMode === 'Order at Restaurant'
                      ? 'Pay at Restaurant'
                      : po.advancePaid
                        ? 'Advance Paid'
                        : 'Pending');
                  return (
                    <div key={po.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                            {po.id} · {formatDisplayDate(po.date)} at {po.time}
                            {po.orderMode ? ` · ${po.orderMode}` : ''}
                          </p>
                          <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                            {po.packageName} — {po.restaurantName}
                          </h3>
                          <p className="text-xs text-[#57534E]">{po.foodPreference}</p>
                        </div>
                        <StatusBadge status={po.status} />
                      </div>

                      {isMenuCart && (
                        <div className="border border-[#E5E0D8] rounded-lg divide-y divide-[#E5E0D8] bg-[#FAF9F6]/40">
                          {po.items!.map((oi) => (
                            <div
                              key={oi.id}
                              className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded overflow-hidden border border-[#E5E0D8] shrink-0 bg-white">
                                  <SafeImage
                                    src={oi.imageUrl}
                                    alt={oi.itemName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#1C1917] truncate">
                                    {oi.itemName}
                                  </p>
                                  <p className="text-[11px] text-[#57534E] tabular-nums">
                                    {oi.dietaryType} · {oi.quantity} × {formatINR(oi.unitPrice)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono font-semibold text-[#1C1917] tabular-nums shrink-0">
                                {formatINR(oi.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {po.specialInstructions && (
                        <div className="px-3.5 py-2.5 rounded-lg bg-[#FAF9F6] border border-[#E5E0D8] text-xs">
                          <span className="font-semibold text-[#1C1917]">Special Instructions: </span>
                          <span className="text-[#57534E]">{po.specialInstructions}</span>
                        </div>
                      )}

                      <div className="bg-[#FAF9F6]/55 border border-[#E5E0D8] rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                        <div>
                          <p className="text-[#57534E]">{isMenuCart ? 'Items Qty' : 'Plates'}</p>
                          <p className="font-semibold tabular-nums">
                            {po.plateCount} {isMenuCart ? 'Items' : 'Plates'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">
                            {isMenuCart ? 'Additional Charges' : 'Price / Plate'}
                          </p>
                          <p className="font-mono font-semibold tabular-nums">
                            {isMenuCart ? '₹0' : formatINR(po.pricePerPlate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Food Order Total</p>
                          <p className="font-mono font-semibold tabular-nums">
                            {formatINR(po.totalFoodAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Advance ({po.advancePercent}%)</p>
                          <p className="font-mono font-semibold text-[#6E1E2E] tabular-nums">
                            {formatINR(po.advanceAmount)} ({payStatusText})
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Remaining at Venue</p>
                          <p className="font-mono font-semibold tabular-nums">
                            {formatINR(po.remainingAmount)}
                          </p>
                        </div>
                      </div>

                      {po.orderMode !== 'Order at Restaurant' &&
                        !po.advancePaid &&
                        po.advanceAmount > 0 &&
                        po.status !== 'Rejected' && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                openDemoPayment({
                                  title: `Food Pre-Order ${po.advancePercent}% Advance (DEMO ONLY)`,
                                  referenceId: po.id,
                                  paymentType: 'Food Pre-Order Advance',
                                  customerName: po.customerName,
                                  restaurantName: po.restaurantName,
                                  amount: po.advanceAmount,
                                  breakdownLines: [
                                    { label: 'Order', value: po.packageName },
                                    {
                                      label: isMenuCart ? 'Total Items' : 'Plates',
                                      value: `${po.plateCount}`,
                                    },
                                    { label: 'Food Order Total', value: formatINR(po.totalFoodAmount) },
                                    { label: 'Remaining at Restaurant', value: formatINR(po.remainingAmount) },
                                  ],
                                  onComplete: (txnId) => markPreOrderAdvancePaid(po.id, txnId),
                                })
                              }
                              className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                            >
                              Pay {formatINR(po.advanceAmount)} Demo Advance
                            </button>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSection === 'celebrations' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  My Celebrations
                </h1>
                <p className="text-sm text-[#57534E]">
                  Your ready-made celebration reservations with transparent plate pricing, ₹0 decoration fee, and special instructions shared with the venue.
                </p>
              </div>
              <Link
                to="/events#ready-made-packages"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Book Ready-Made Package
              </Link>
            </div>

            {myCelebrations.length === 0 ? (
              <EmptyStateCard
                title="No ready-made celebration bookings yet"
                description="Browse approved celebration packages on the Celebrate page and confirm directly with optional special instructions."
              />
            ) : (
              <div className="space-y-4">
                {myCelebrations.map((cel) => {
                  const noteText = cel.customerNote || cel.specialRequests;
                  return (
                    <div key={cel.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                            {cel.id} · {cel.celebrationType} · {formatDisplayDate(cel.eventDate)} at {cel.eventTime}
                          </p>
                          <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                            {cel.packageName} — {cel.restaurantName}
                          </h3>
                          <p className="text-xs text-[#57534E] mt-0.5">{cel.decorationArrangement}</p>
                        </div>
                        <StatusBadge status={cel.status} />
                      </div>

                      <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                        <div>
                          <p className="text-[#57534E]">Plates × Price</p>
                          <p className="font-mono font-semibold tabular-nums">
                            {cel.platesCount} × {formatINR(cel.pricePerPlate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Decoration Charge</p>
                          <p className="font-semibold text-[#1E462A]">FREE (₹0)</p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Total Package Price</p>
                          <p className="font-mono font-semibold tabular-nums">{formatINR(cel.totalPackageAmount)}</p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Advance ({cel.advancePercent}%)</p>
                          <p className="font-mono font-semibold text-[#6E1E2E] tabular-nums">
                            {formatINR(cel.advanceAmount)} ({cel.advancePaid ? 'DEMO PAID' : 'Pending'})
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Remaining at Venue</p>
                          <p className="font-mono font-semibold tabular-nums">{formatINR(cel.remainingAmount)}</p>
                        </div>
                      </div>

                      {noteText && (
                        <div className="bg-[#FAF9F6] border-l-4 border-[#B8863B] border-y border-r border-y-[#E5E0D8] border-r-[#E5E0D8] rounded-r-lg p-3.5 text-xs space-y-1">
                          <p className="font-semibold text-[#1C1917]">
                            Special Instructions (Your Note)
                          </p>
                          <p className="text-[#1C1917] leading-relaxed">{noteText}</p>
                          <p className="text-[11px] text-[#57534E]">
                            Shared with {cel.restaurantName}. The restaurant will confirm whether it can accommodate your request.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <span className="text-xs text-[#57534E]">
                          {cel.transactionId
                            ? `Demo Txn ID: ${cel.transactionId} · Food Pref: ${cel.foodPreference}`
                            : `Booked ${formatDisplayDate(cel.createdAt)} · Food Pref: ${cel.foodPreference}`}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCelebration(cel)}
                            className="px-3.5 py-2 text-xs font-semibold text-[#1C1917] border border-[#E5E0D8] bg-[#FAF9F6] rounded-lg hover:bg-[#F3F1ED]"
                          >
                            Reservation Details
                          </button>
                          {!cel.advancePaid &&
                            cel.status !== 'Cancelled' &&
                            cel.status !== 'Rejected' &&
                            cel.status !== 'Completed' && (
                              <button
                                type="button"
                                onClick={() =>
                                  openDemoPayment({
                                    title: `Celebration ${cel.advancePercent}% Advance (DEMO ONLY)`,
                                    referenceId: cel.id,
                                    paymentType: 'Celebration Advance',
                                    customerName: cel.customerName,
                                    restaurantName: cel.restaurantName,
                                    amount: cel.advanceAmount,
                                    breakdownLines: [
                                      { label: 'Ready-Made Package', value: cel.packageName },
                                      { label: 'Food Included', value: `${cel.plateItems.length} courses per plate` },
                                      { label: 'Plates × Price', value: `${cel.platesCount} × ${formatINR(cel.pricePerPlate)}` },
                                      { label: 'Decoration Charge', value: 'FREE (₹0 — Decoration Included)' },
                                      { label: 'Total Package Price', value: formatINR(cel.totalPackageAmount) },
                                      { label: 'Remaining Payable at Venue', value: formatINR(cel.remainingAmount) },
                                    ],
                                    onComplete: (txnId) => markCelebrationAdvancePaid(cel.id, txnId),
                                  })
                                }
                                className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                              >
                                Pay {formatINR(cel.advanceAmount)} Demo Advance &amp; Confirm
                              </button>
                            )}
                          {cel.status !== 'Cancelled' &&
                            cel.status !== 'Completed' &&
                            cel.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => cancelCelebrationBooking(cel.id)}
                                className="px-3.5 py-2 text-xs font-semibold text-[#8B1E35] border border-[#EAC4CC] bg-[#FDF2F4] rounded-lg hover:bg-[#F8DCE6]/50"
                              >
                                Cancel Booking
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {activeSection === 'payments' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Payment History (DEMO ONLY)
              </h1>
              <p className="text-sm text-[#57534E]">
                Simulated receipts across Table Booking Fees, Food Pre-Orders, and Celebrations.
              </p>
            </div>
            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Demo Txn ID</th>
                    <th className="py-3 px-4 font-semibold">Ref</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Restaurant</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {myPayments.map((pay) => (
                    <tr key={pay.id}>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#6E1E2E]">
                        <span className="inline-flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5" />
                          {pay.transactionId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{pay.referenceId}</td>
                      <td className="py-3 px-4 text-xs">{pay.paymentType}</td>
                      <td className="py-3 px-4 text-xs">{pay.restaurantName}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {formatINR(pay.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={pay.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4">
              <h1 className="font-display text-2xl font-semibold text-[#1C1917]">
                Share a Dining Review
              </h1>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Restaurant</label>
                  <select
                    value={reviewRestId}
                    onChange={(e) => setReviewRestId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                  >
                    {approvedRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.isDemo ? '(Demo Listing)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg tabular-nums"
                  >
                    {[5, 4.5, 4, 3.5, 3].map((val) => (
                      <option key={val} value={val}>{val} ★</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share hospitality, food quality, and decor thoughts..."
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                >
                  Submit Demo Review
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                Community &amp; My Reviews
              </h2>
              <div className="divide-y divide-[#E5E0D8]">
                {myReviews.map((rv) => (
                  <div key={rv.id} className="py-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#1C1917]">
                        {rv.restaurantName} · <span className="text-[#57534E]">{rv.customerName}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#6E1E2E]">
                        <Star className="w-3.5 h-3.5 fill-[#B8863B] text-[#B8863B]" />
                        {rv.rating}
                      </span>
                    </div>
                    <p className="text-[#57534E]">{rv.comment}</p>
                    <p className="text-[11px] text-[#57534E] tabular-nums">{formatDisplayDate(rv.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Notifications
              </h1>
              <button
                type="button"
                onClick={() => markAllNotificationsRead('customer')}
                className="px-3.5 py-2 text-xs font-semibold text-[#6E1E2E] border border-[#E5E0D8] bg-white rounded-lg hover:bg-[#FAF9F6]"
              >
                Mark All Read
              </button>
            </div>
            <div className="bg-white border border-[#E5E0D8] rounded-lg divide-y divide-[#E5E0D8]">
              {myNotifications.map((n) => (
                <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#1C1917]">{n.title}</p>
                    <p className="text-xs text-[#57534E]">{n.message}</p>
                  </div>
                  <span className="text-[11px] text-[#57534E] shrink-0">
                    {n.timeAgo} {!n.read ? '· New' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'offers' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Exclusive Member Offers in {activeCity}
            </h1>
            {activeOffers.length === 0 ? (
              <EmptyStateCard
                title={`No member offers published in ${activeCity} yet`}
                description={`As partner restaurants launch across ${activeCity}, curated dining offers will appear here.`}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOffers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#57534E]">
                      <span className="font-semibold text-[#6E1E2E]">
                        {offer.discountLabel} · {offer.offerTier} Offer
                      </span>
                      <span className="tabular-nums">Valid till {formatDisplayDate(offer.validUntil)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1C1917]">{offer.title}</h3>
                    <p className="text-xs text-[#57534E]">
                      {offer.restaurantName} · {offer.terms}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold bg-[#FAF9F6] border border-[#E5E0D8] rounded"
                    >
                      <span>{offer.code}</span>
                      {copiedCode === offer.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'favorites' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Favorite Restaurants
            </h1>
            {favoriteRestaurants.length === 0 ? (
              <EmptyStateCard
                title="No saved favorites yet"
                description={`Tap the heart icon on any ${activeCity} restaurant to save it for quick booking.`}
              />
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
          <div className="max-w-2xl bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Profile &amp; Settings (Demo)
            </h1>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email (Read-only Demo)</label>
                  <input
                    type="email"
                    value={customerUser.email}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg bg-[#FAF9F6]/50 text-[#57534E]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#57534E] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      list="customer-city-options"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    />
                    <datalist id="customer-city-options">
                      {cities.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Preferred Cuisine</label>
                  <select
                    value={preferredCuisine}
                    onChange={(e) => setPreferredCuisine(e.target.value as CuisineType)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                  >
                    {POPULAR_CUISINES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Save Demo Profile
              </button>
            </form>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4">
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Help &amp; Support
              </h1>
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Booking change or celebration question"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Details</label>
                  <textarea
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg"
                >
                  Submit Support Note (Demo)
                </button>
              </form>
            </div>
            <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#1C1917]">Recent Support Notes</h2>
              <div className="divide-y divide-[#E5E0D8]">
                {tickets
                  .filter((t) => t.userRole === 'Customer')
                  .map((t) => (
                    <div key={t.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-[#6E1E2E]">{t.id}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#1C1917]">{t.subject}</p>
                      <p className="text-xs text-[#57534E]">{t.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Celebration Reservation Details Modal */}
      {selectedCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/65 p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cust-cel-detail-title"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-lg max-w-xl w-full overflow-hidden my-auto max-h-[90vh] flex flex-col shadow-xl">
            <div className="px-5 py-4 bg-[#1C1917] text-[#FAF9F6] flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#E5D3B3]">
                  Celebration Reservation Details · {selectedCelebration.id}
                </p>
                <h3 id="cust-cel-detail-title" className="font-display text-xl font-semibold">
                  {selectedCelebration.packageName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCelebration(null)}
                className="p-1.5 rounded hover:bg-white/15"
                aria-label="Close reservation details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#1C1917]">
                  {selectedCelebration.restaurantName} ({selectedCelebration.restaurantArea})
                </span>
                <StatusBadge status={selectedCelebration.status} />
              </div>

              <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-3.5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Occasion</span>
                  <span className="font-semibold text-[#1C1917]">{selectedCelebration.celebrationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Event Date &amp; Time</span>
                  <span className="font-semibold text-[#1C1917]">
                    {formatDisplayDate(selectedCelebration.eventDate)} at {selectedCelebration.eventTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Plates Booked</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {selectedCelebration.platesCount} × {formatINR(selectedCelebration.pricePerPlate)} ={' '}
                    {formatINR(selectedCelebration.totalPackageAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#1E462A]">
                  <span>Decoration Included</span>
                  <span className="font-semibold">₹0 (No Additional Charges)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Advance ({selectedCelebration.advancePercent}%)</span>
                  <span className="font-mono font-semibold text-[#6E1E2E] tabular-nums">
                    {formatINR(selectedCelebration.advanceAmount)}{' '}
                    {selectedCelebration.advancePaid
                      ? `(DEMO PAID · ${selectedCelebration.transactionId})`
                      : '(Pending)'}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[#E5E0D8]">
                  <span className="text-[#57534E]">Remaining at Venue</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatINR(selectedCelebration.remainingAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Food Preference</span>
                  <span className="font-medium text-[#1C1917]">{selectedCelebration.foodPreference}</span>
                </div>
              </div>

              {selectedCelebration.plateItems.length > 0 && (
                <div className="border border-[#E5E0D8] rounded-lg p-3.5 space-y-1.5">
                  <p className="font-semibold text-[#1C1917]">Food Included Per Plate</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#57534E]">
                    {selectedCelebration.plateItems.map((pi) => (
                      <div key={pi.id}>
                        <strong className="text-[#6E1E2E]">{pi.course}:</strong> {pi.itemName} ({pi.quantity})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-3.5 space-y-1">
                <p className="font-semibold text-[#1C1917]">Special Instructions (Your Note)</p>
                {selectedCelebration.customerNote || selectedCelebration.specialRequests ? (
                  <>
                    <p className="text-[#1C1917] leading-relaxed">
                      {selectedCelebration.customerNote || selectedCelebration.specialRequests}
                    </p>
                    <p className="text-[11px] text-[#57534E] pt-1">
                      Your note has been shared with the restaurant. The restaurant will confirm whether it can accommodate your request.
                    </p>
                  </>
                ) : (
                  <p className="text-[#57534E]">No special note added with this celebration reservation.</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCelebration(null)}
                  className="px-4 py-2 text-xs font-semibold bg-[#6E1E2E] text-white rounded-lg hover:bg-[#541522]"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <RestaurantModal />
    </DashboardLayout>
  );
}
