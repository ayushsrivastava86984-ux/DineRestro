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
  Sparkles,
  Star,
  Tag,
  UserCircle,
  Utensils,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { RestaurantModal } from '../../components/common/RestaurantModal';
import { EmptyStateCard } from '../../components/common/EmptyStateCard';
import { POPULAR_CUISINES } from '../../data/mockData';
import type { CuisineType } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const CUSTOMER_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'My Reservations', to: '/customer/reservations', icon: CalendarCheck },
  { label: 'Food Pre-Orders', to: '/customer/preorders', icon: Utensils },
  { label: 'Celebration Bookings', to: '/customer/celebrations', icon: PartyPopper },
  { label: 'Custom Requests', to: '/customer/custom-requests', icon: Sparkles },
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
    customerUser,
    updateCustomerProfile,
    restaurants,
    reservations,
    updateReservationStatus,
    preOrders,
    markPreOrderAdvancePaid,
    celebrationBookings,
    acceptCelebrationQuotation,
    markCelebrationAdvancePaid,
    customRequests,
    acceptCustomRequestQuotation,
    markCustomRequestAdvancePaid,
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

  const [searchExplore, setSearchExplore] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [fullName, setFullName] = useState(customerUser.fullName);
  const [mobile, setMobile] = useState(customerUser.mobile);
  const [city, setCity] = useState(customerUser.city);
  const [preferredCuisine, setPreferredCuisine] = useState<CuisineType>(customerUser.preferredCuisine);

  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');
  const [reviewRestId, setReviewRestId] = useState(approvedRestaurants[0]?.id || '');
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
  const myCustomRequests = customRequests.filter(
    (cr) => cr.customerId === customerUser.id || cr.customerName === customerUser.fullName
  );
  const myPayments = payments.filter((pay) => pay.customerName === customerUser.fullName);
  const myNotifications = notifications.filter((n) => n.role === 'customer');
  const myReviews = reviews.filter((rv) => rv.customerName === customerUser.fullName || rv.visible);

  const favoriteRestaurants = approvedRestaurants.filter((r) => favoriteIds.includes(r.id));
  const activeOffers = offers.filter((o) => o.active);

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
            : path.includes('/customer/custom-requests')
              ? 'custom-requests'
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
      city: city.trim() || 'Varanasi',
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
        <DemoBanner message="Customer Dashboard (DEMO MODE). Table bookings, restaurant-specific pre-orders, custom celebration quotations, and DEMO ONLY receipts are stored locally." />

        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#321D17]">
                  Welcome back, {customerUser.fullName.split(' ')[0]}
                </h1>
                <p className="text-sm text-[#6E4B41] mt-1">
                  Manage table bookings, food pre-orders, celebration quotations, and Varanasi dining favorites.
                </p>
              </div>
              <Link
                to="/customer/explore"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap self-start"
              >
                Discover &amp; Reserve (Demo)
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#EAD8C9] rounded-lg p-4">
                <p className="text-xs text-[#6E4B41]">Table Reservations</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#321D17] mt-1">
                  {myBookings.length}
                </p>
              </div>
              <div className="bg-white border border-[#EAD8C9] rounded-lg p-4">
                <p className="text-xs text-[#6E4B41]">Food Pre-Orders</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#321D17] mt-1">
                  {myPreOrders.length}
                </p>
              </div>
              <div className="bg-white border border-[#EAD8C9] rounded-lg p-4">
                <p className="text-xs text-[#6E4B41]">Celebration &amp; Custom Quotes</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#C84A1B] mt-1">
                  {myCelebrations.length + myCustomRequests.length}
                </p>
              </div>
              <div className="bg-white border border-[#EAD8C9] rounded-lg p-4">
                <p className="text-xs text-[#6E4B41]">Favorite Venues</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#321D17] mt-1">
                  {favoriteRestaurants.length}
                </p>
              </div>
            </div>

            {/* Action Alerts for Celebration & Custom Request Quotations */}
            {(myCelebrations.some((c) => c.status === 'Quotation Sent' || c.status === 'Advance Pending') ||
              myCustomRequests.some((cr) => cr.status === 'Quotation Sent' || cr.status === 'Quotation Accepted')) && (
              <div className="bg-[#FFF5EA] border border-[#C84A1B]/35 rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-[#C84A1B]">
                    Action Required: Celebration Quotations Ready
                  </h2>
                  <Link
                    to="/customer/custom-requests"
                    className="text-xs font-semibold text-[#C84A1B] underline"
                  >
                    Open Custom Requests
                  </Link>
                </div>

                {myCustomRequests
                  .filter((cr) => cr.status === 'Quotation Sent' || cr.status === 'Quotation Accepted')
                  .map((req) => (
                    <div
                      key={req.id}
                      className="bg-white border border-[#EAD8C9] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-[#321D17]">
                          {req.id} · {req.occasionType} at {req.restaurantName}
                        </p>
                        <p className="text-[#6E4B41] tabular-nums">
                          {req.guestsCount} Guests · Quoted Total: {formatINR(req.quotedAmount || 0)} · Decoration: FREE (₹0) · {req.advancePercent}% Advance: {formatINR(req.advanceAmount || 0)}
                        </p>
                      </div>
                      {req.status === 'Quotation Sent' ? (
                        <button
                          type="button"
                          onClick={() => acceptCustomRequestQuotation(req.id)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg shrink-0"
                        >
                          Accept Custom Quotation
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openDemoPayment({
                              title: `Custom Celebration ${req.advancePercent}% Advance (DEMO ONLY)`,
                              referenceId: req.id,
                              paymentType: 'Custom Celebration Advance',
                              customerName: req.customerName,
                              restaurantName: req.restaurantName,
                              amount: req.advanceAmount || 0,
                              breakdownLines: [
                                { label: 'Occasion', value: req.occasionType },
                                { label: 'Guests', value: `${req.guestsCount} Guests` },
                                { label: 'Decoration Charge', value: 'FREE (₹0)' },
                                { label: 'Accepted Quote Total', value: formatINR(req.quotedAmount || 0) },
                                { label: 'Remaining at Restaurant', value: formatINR(req.remainingAmount || 0) },
                              ],
                              onComplete: (txnId) => markCustomRequestAdvancePaid(req.id, txnId),
                            })
                          }
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg shrink-0"
                        >
                          Pay {formatINR(req.advanceAmount || 0)} Demo Advance
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#321D17]">
                  Recommended in Varanasi
                </h2>
                <Link to="/customer/explore" className="text-xs font-semibold text-[#C84A1B] hover:underline">
                  Explore all
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {approvedRestaurants.slice(0, 3).map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'explore' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#321D17]">
                Explore Varanasi Restaurants
              </h1>
              <input
                type="text"
                value={searchExplore}
                onChange={(e) => setSearchExplore(e.target.value)}
                placeholder="Filter by name, area, or cuisine..."
                className="px-3.5 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg w-full sm:w-72 focus:outline-none focus:border-[#C84A1B]"
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

        {activeSection === 'reservations' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#321D17]">
                My Table Reservations
              </h1>
              <p className="text-sm text-[#6E4B41]">
                Per-guest platform booking fees (Basic / Premium) are kept separate from your restaurant food bill.
              </p>
            </div>
            {myBookings.length === 0 ? (
              <EmptyStateCard
                title="No table reservations yet"
                description="Browse Varanasi restaurants to book a Basic or Premium verified dining table."
              />
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-[#EAD8C9] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-[#C84A1B]">{b.id}</span>
                        <span className="text-[#6E4B41]">· {b.bookingTier} Table Booking</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#321D17]">
                        {b.restaurantName}
                      </h3>
                      <p className="text-xs text-[#6E4B41] tabular-nums">
                        {formatDisplayDate(b.date)} · {b.time} · {b.guests} Guests
                      </p>
                      <p className="text-xs text-[#C84A1B] font-medium tabular-nums">
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
                          className="px-3 py-1.5 text-xs font-semibold text-[#C84A1B] border border-[#F6B27B] rounded hover:bg-[#FDECE6]"
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
              <h1 className="font-display text-3xl font-semibold text-[#321D17]">
                Food Pre-Orders
              </h1>
              <p className="text-sm text-[#6E4B41]">
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
                {myPreOrders.map((po) => (
                  <div key={po.id} className="bg-white border border-[#EAD8C9] rounded-lg p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#C84A1B]">
                          {po.id} · {formatDisplayDate(po.date)} at {po.time}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-[#321D17]">
                          {po.packageName} — {po.restaurantName}
                        </h3>
                        <p className="text-xs text-[#6E4B41]">{po.foodPreference}</p>
                      </div>
                      <StatusBadge status={po.status} />
                    </div>

                    <div className="bg-[#FFF5EA]/55 border border-[#EAD8C9] rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <p className="text-[#6E4B41]">Plates</p>
                        <p className="font-semibold tabular-nums">{po.plateCount} Plates</p>
                      </div>
                      <div>
                        <p className="text-[#6E4B41]">Price / Plate</p>
                        <p className="font-mono font-semibold tabular-nums">{formatINR(po.pricePerPlate)}</p>
                      </div>
                      <div>
                        <p className="text-[#6E4B41]">Food Order Total</p>
                        <p className="font-mono font-semibold tabular-nums">{formatINR(po.totalFoodAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[#6E4B41]">Advance ({po.advancePercent}%)</p>
                        <p className="font-mono font-semibold text-[#C84A1B] tabular-nums">
                          {formatINR(po.advanceAmount)} ({po.advancePaid ? 'DEMO PAID' : 'Pending'})
                        </p>
                      </div>
                      <div>
                        <p className="text-[#6E4B41]">Remaining at Venue</p>
                        <p className="font-mono font-semibold tabular-nums">{formatINR(po.remainingAmount)}</p>
                      </div>
                    </div>

                    {!po.advancePaid && po.status !== 'Rejected' && (
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
                                { label: 'Plate Package', value: po.packageName },
                                { label: 'Plates', value: `${po.plateCount} × ${formatINR(po.pricePerPlate)}` },
                                { label: 'Food Order Total', value: formatINR(po.totalFoodAmount) },
                                { label: 'Remaining at Restaurant', value: formatINR(po.remainingAmount) },
                              ],
                              onComplete: (txnId) => markPreOrderAdvancePaid(po.id, txnId),
                            })
                          }
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
                        >
                          Pay {formatINR(po.advanceAmount)} Demo Advance
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'celebrations' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#321D17]">
                  Celebration Package Bookings
                </h1>
                <p className="text-sm text-[#6E4B41]">
                  Decoration is always FREE (₹0). Accept quotations and pay your demo advance securely.
                </p>
              </div>
              <Link
                to="/events"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
              >
                Explore Celebration Packages
              </Link>
            </div>

            <div className="space-y-4">
              {myCelebrations.map((cel) => (
                <div key={cel.id} className="bg-white border border-[#EAD8C9] rounded-lg p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono font-semibold text-[#C84A1B]">
                        {cel.id} · {cel.celebrationType} · {formatDisplayDate(cel.eventDate)} at {cel.eventTime}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-[#321D17]">
                        {cel.packageName} — {cel.restaurantName}
                      </h3>
                      <p className="text-xs text-[#6E4B41] mt-0.5">{cel.decorationArrangement}</p>
                    </div>
                    <StatusBadge status={cel.status} />
                  </div>

                  <div className="bg-[#FFF5EA]/55 border border-[#EAD8C9] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-[#6E4B41]">Plates × Price</p>
                      <p className="font-mono font-semibold tabular-nums">
                        {cel.platesCount} × {formatINR(cel.pricePerPlate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6E4B41]">Decoration Charge</p>
                      <p className="font-semibold text-[#321D17]">FREE (₹0)</p>
                    </div>
                    <div>
                      <p className="text-[#6E4B41]">Quoted Total Amount</p>
                      <p className="font-mono font-semibold tabular-nums">{formatINR(cel.quotedTotalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[#6E4B41]">Approved Advance ({cel.advancePercent}%)</p>
                      <p className="font-mono font-semibold text-[#C84A1B] tabular-nums">
                        {formatINR(cel.advanceAmount)} · Rem: {formatINR(cel.remainingAmount)}
                      </p>
                    </div>
                  </div>

                  {cel.quotationNotes && (
                    <p className="text-xs text-[#6E4B41]">
                      <strong>Restaurant Quotation Note:</strong> {cel.quotationNotes}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-end gap-2">
                    {cel.status === 'Quotation Sent' && (
                      <button
                        type="button"
                        onClick={() => acceptCelebrationQuotation(cel.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
                      >
                        Accept Quotation
                      </button>
                    )}
                    {cel.status === 'Advance Pending' && !cel.advancePaid && (
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
                              { label: 'Package Name', value: cel.packageName },
                              { label: 'Food Included', value: `${cel.plateItems.length} courses per plate` },
                              { label: 'Plates × Price', value: `${cel.platesCount} × ${formatINR(cel.pricePerPlate)}` },
                              { label: 'Decoration Charge', value: 'FREE (₹0)' },
                              { label: 'Approved Total', value: formatINR(cel.quotedTotalAmount) },
                              { label: 'Remaining Payable at Venue', value: formatINR(cel.remainingAmount) },
                            ],
                            onComplete: (txnId) => markCelebrationAdvancePaid(cel.id, txnId),
                          })
                        }
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
                      >
                        Pay {formatINR(cel.advanceAmount)} Demo Advance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'custom-requests' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#321D17]">
                  Custom Celebration Requests
                </h1>
                <p className="text-sm text-[#6E4B41]">
                  Track bespoke theme requests. Decoration is always ₹0; advance payment unlocks only after you review and accept a restaurant&apos;s quotation.
                </p>
              </div>
              <Link
                to="/events#custom-celebration-form"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
              >
                New Custom Request
              </Link>
            </div>

            {myCustomRequests.length === 0 ? (
              <EmptyStateCard
                title="No custom celebration requests yet"
                description="Submit your custom occasion theme, colours, cake note, and estimated budget on the Celebrate page."
              />
            ) : (
              <div className="space-y-4">
                {myCustomRequests.map((req) => (
                  <div key={req.id} className="bg-white border border-[#EAD8C9] rounded-lg p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#C84A1B]">
                          {req.id} · {req.occasionType} · {formatDisplayDate(req.preferredDate)} at {req.preferredTime}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-[#321D17]">
                          {req.restaurantName} ({req.guestsCount} Guests)
                        </h3>
                        <p className="text-xs text-[#6E4B41] mt-0.5">
                          Theme: {req.decorationTheme} · Colours: {req.preferredColors}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FFF5EA]/55 border border-[#EAD8C9] rounded-lg p-3.5">
                      <div>
                        <p className="text-[#6E4B41]">Your Estimated Budget</p>
                        <p className="font-mono font-semibold tabular-nums">
                          {formatINR(req.estimatedBudget)} (Reference Only)
                        </p>
                      </div>
                      <div>
                        <p className="text-[#6E4B41]">Decoration Charge</p>
                        <p className="font-semibold text-[#321D17]">FREE (₹0 — Included)</p>
                      </div>
                      <div>
                        <p className="text-[#6E4B41]">Restaurant Final Quote</p>
                        <p className="font-mono font-semibold text-[#C84A1B] tabular-nums">
                          {req.quotedAmount ? formatINR(req.quotedAmount) : 'Awaiting Restaurant Review'}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-[#6E4B41] space-y-1">
                      <p><strong>Cake:</strong> {req.cakeRequirements}</p>
                      <p><strong>Food Preferences:</strong> {req.foodPreferences}</p>
                      {req.specialInstructions && (
                        <p><strong>Special Instructions:</strong> {req.specialInstructions}</p>
                      )}
                      {req.quotationNotes && (
                        <p className="text-[#321D17]">
                          <strong>Restaurant Quotation Note:</strong> {req.quotationNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAD8C9]">
                      <span className="text-xs text-[#6E4B41]">
                        {req.status === 'Request Received'
                          ? 'Advance payment is locked until the restaurant sends a quote and you accept it.'
                          : req.status === 'Quotation Sent'
                            ? 'Step 1: Review and accept this quotation to unlock simulated advance payment.'
                            : req.status === 'Quotation Accepted'
                              ? `Accepted Quote: ${req.advancePercent}% Advance = ${formatINR(req.advanceAmount || 0)}`
                              : `Demo Txn: ${req.transactionId || 'Logged'}`}
                      </span>

                      <div className="flex gap-2">
                        {req.status === 'Quotation Sent' && (
                          <button
                            type="button"
                            onClick={() => acceptCustomRequestQuotation(req.id)}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
                          >
                            Accept Quotation
                          </button>
                        )}
                        {req.status === 'Quotation Accepted' && !req.advancePaid && (
                          <button
                            type="button"
                            onClick={() =>
                              openDemoPayment({
                                title: `Custom Celebration ${req.advancePercent}% Advance (DEMO ONLY)`,
                                referenceId: req.id,
                                paymentType: 'Custom Celebration Advance',
                                customerName: req.customerName,
                                restaurantName: req.restaurantName,
                                amount: req.advanceAmount || 0,
                                breakdownLines: [
                                  { label: 'Occasion', value: req.occasionType },
                                  { label: 'Guests', value: `${req.guestsCount} Guests` },
                                  { label: 'Decoration Charge', value: 'FREE (₹0)' },
                                  { label: 'Accepted Quote Total', value: formatINR(req.quotedAmount || 0) },
                                  { label: 'Remaining at Venue', value: formatINR(req.remainingAmount || 0) },
                                ],
                                onComplete: (txnId) => markCustomRequestAdvancePaid(req.id, txnId),
                              })
                            }
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
                          >
                            Pay {formatINR(req.advanceAmount || 0)} Demo Advance
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'payments' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#321D17]">
                Payment History (DEMO ONLY)
              </h1>
              <p className="text-sm text-[#6E4B41]">
                Simulated receipts across Table Booking Fees, Food Pre-Orders, and Celebrations.
              </p>
            </div>
            <div className="bg-white border border-[#EAD8C9] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#EAD8C9] bg-[#FFF5EA] text-xs text-[#6E4B41]">
                    <th className="py-3 px-4 font-semibold">Demo Txn ID</th>
                    <th className="py-3 px-4 font-semibold">Ref</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Restaurant</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAD8C9]">
                  {myPayments.map((pay) => (
                    <tr key={pay.id}>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#C84A1B]">
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
            <div className="lg:col-span-5 bg-white border border-[#EAD8C9] rounded-lg p-6 space-y-4">
              <h1 className="font-display text-2xl font-semibold text-[#321D17]">
                Share a Dining Review
              </h1>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Restaurant</label>
                  <select
                    value={reviewRestId}
                    onChange={(e) => setReviewRestId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                  >
                    {approvedRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg tabular-nums"
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
                    className="w-full px-3 py-2 text-sm border border-[#EAD8C9] rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
                >
                  Submit Demo Review
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#EAD8C9] rounded-lg p-6 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-[#321D17]">
                Community &amp; My Reviews
              </h2>
              <div className="divide-y divide-[#EAD8C9]">
                {myReviews.map((rv) => (
                  <div key={rv.id} className="py-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#321D17]">
                        {rv.restaurantName} · <span className="text-[#6E4B41]">{rv.customerName}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#C84A1B]">
                        <Star className="w-3.5 h-3.5 fill-[#D99555] text-[#D99555]" />
                        {rv.rating}
                      </span>
                    </div>
                    <p className="text-[#6E4B41]">{rv.comment}</p>
                    <p className="text-[11px] text-[#6E4B41] tabular-nums">{formatDisplayDate(rv.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#321D17]">
                Notifications
              </h1>
              <button
                type="button"
                onClick={() => markAllNotificationsRead('customer')}
                className="px-3.5 py-2 text-xs font-semibold text-[#C84A1B] border border-[#EAD8C9] bg-white rounded-lg hover:bg-[#FFF5EA]"
              >
                Mark All Read
              </button>
            </div>
            <div className="bg-white border border-[#EAD8C9] rounded-lg divide-y divide-[#EAD8C9]">
              {myNotifications.map((n) => (
                <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#321D17]">{n.title}</p>
                    <p className="text-xs text-[#6E4B41]">{n.message}</p>
                  </div>
                  <span className="text-[11px] text-[#6E4B41] shrink-0">
                    {n.timeAgo} {!n.read ? '· New' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'offers' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#321D17]">
              Exclusive Member Offers
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOffers.map((offer) => (
                <div key={offer.id} className="bg-white border border-[#EAD8C9] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6E4B41]">
                    <span className="font-semibold text-[#C84A1B]">
                      {offer.discountLabel} · {offer.offerTier} Offer
                    </span>
                    <span className="tabular-nums">Valid till {formatDisplayDate(offer.validUntil)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#321D17]">{offer.title}</h3>
                  <p className="text-xs text-[#6E4B41]">
                    {offer.restaurantName} · {offer.terms}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.code)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold bg-[#FFF5EA] border border-[#EAD8C9] rounded"
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
            <h1 className="font-display text-3xl font-semibold text-[#321D17]">
              Favorite Restaurants
            </h1>
            {favoriteRestaurants.length === 0 ? (
              <EmptyStateCard
                title="No saved favorites yet"
                description="Tap the heart icon on any Varanasi restaurant to save it for quick booking."
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
          <div className="max-w-2xl bg-white border border-[#EAD8C9] rounded-lg p-6 space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#321D17]">
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
                    className="w-full px-3 py-2 text-sm border border-[#EAD8C9] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email (Read-only Demo)</label>
                  <input
                    type="email"
                    value={customerUser.email}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-[#EAD8C9] rounded-lg bg-[#FFF5EA]/50 text-[#6E4B41]"
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
                    className="w-full px-3 py-2 text-sm border border-[#EAD8C9] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#6E4B41] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#EAD8C9] rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Preferred Cuisine</label>
                  <select
                    value={preferredCuisine}
                    onChange={(e) => setPreferredCuisine(e.target.value as CuisineType)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                  >
                    {POPULAR_CUISINES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19]"
              >
                Save Demo Profile
              </button>
            </form>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#EAD8C9] rounded-lg p-6 space-y-4">
              <h1 className="font-display text-3xl font-semibold text-[#321D17]">
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
                    className="w-full px-3 py-2 text-sm border border-[#EAD8C9] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Details</label>
                  <textarea
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#EAD8C9] rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg"
                >
                  Submit Support Note (Demo)
                </button>
              </form>
            </div>
            <div className="bg-white border border-[#EAD8C9] rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#321D17]">Recent Support Notes</h2>
              <div className="divide-y divide-[#EAD8C9]">
                {tickets
                  .filter((t) => t.userRole === 'Customer')
                  .map((t) => (
                    <div key={t.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-[#C84A1B]">{t.id}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#321D17]">{t.subject}</p>
                      <p className="text-xs text-[#6E4B41]">{t.message}</p>
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
