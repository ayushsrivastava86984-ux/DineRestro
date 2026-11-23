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
  Lock,
  MapPin,
  MessageSquare,
  PartyPopper,
  Phone,
  Receipt,
  ShieldCheck,
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
import { SafeImage } from '../../components/common/SafeImage';
import { POPULAR_CUISINES } from '../../data/mockData';
import type { CuisineType } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const CUSTOMER_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'My Reservations', to: '/customer/reservations', icon: CalendarCheck },
  { label: 'Food Pre-Orders', to: '/customer/preorders', icon: Utensils },
  { label: 'Celebration Bookings', to: '/customer/celebrations', icon: PartyPopper },
  { label: 'Custom Requests & Quotes', to: '/customer/custom-requests', icon: Sparkles },
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
    markCelebrationAdvancePaid,
    cancelCelebrationBooking,
    customRequests,
    acceptCustomRequestQuotation,
    rejectCustomRequestQuotation,
    markCustomRequestAdvancePaid,
    cancelCustomRequest,
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

  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
                  Welcome back, {customerUser.fullName.split(' ')[0]}
                </h1>
                <p className="text-sm text-[#57534E] mt-1">
                  Manage table bookings, food pre-orders, celebration quotations, and Varanasi dining favorites.
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
                <p className="text-xs text-[#57534E]">Celebration &amp; Custom Quotes</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#6E1E2E] mt-1">
                  {myCelebrations.length + myCustomRequests.length}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Favorite Venues</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {favoriteRestaurants.length}
                </p>
              </div>
            </div>

            {/* Action Alerts for Custom Request Quotations */}
            {myCustomRequests.some(
              (cr) => cr.status === 'Quotation Sent' || cr.status === 'Quotation Accepted'
            ) && (
              <div className="bg-[#FAF9F6] border border-[#6E1E2E]/35 rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-[#6E1E2E]">
                    Action Required: Custom Celebration Quotations
                  </h2>
                  <Link
                    to="/customer/custom-requests"
                    className="text-xs font-semibold text-[#6E1E2E] underline"
                  >
                    Open Custom Requests &amp; Quotes
                  </Link>
                </div>

                {myCustomRequests
                  .filter((cr) => cr.status === 'Quotation Sent' || cr.status === 'Quotation Accepted')
                  .map((req) => (
                    <div
                      key={req.id}
                      className="bg-white border border-[#E5E0D8] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-[#1C1917]">
                          {req.id} · {req.occasionType} at {req.restaurantName}
                        </p>
                        <p className="text-[#57534E] tabular-nums">
                          {req.guestsCount} Guests · Quoted Total: {formatINR(req.quotedAmount || 0)} · Decoration: FREE (₹0) · {req.advancePercent}% Advance: {formatINR(req.advanceAmount || 0)}
                        </p>
                      </div>
                      {req.status === 'Quotation Sent' ? (
                        <button
                          type="button"
                          onClick={() => acceptCustomRequestQuotation(req.id)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg shrink-0"
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
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg shrink-0"
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
                <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                  Recommended in Varanasi
                </h2>
                <Link to="/customer/explore" className="text-xs font-semibold text-[#6E1E2E] hover:underline">
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Explore Varanasi Restaurants
              </h1>
              <input
                type="text"
                value={searchExplore}
                onChange={(e) => setSearchExplore(e.target.value)}
                placeholder="Filter by name, area, or cuisine..."
                className="px-3.5 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg w-full sm:w-72 focus:outline-none focus:border-[#6E1E2E]"
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
                description="Browse Varanasi restaurants to book a Basic or Premium verified dining table."
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
                {myPreOrders.map((po) => (
                  <div key={po.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                          {po.id} · {formatDisplayDate(po.date)} at {po.time}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                          {po.packageName} — {po.restaurantName}
                        </h3>
                        <p className="text-xs text-[#57534E]">{po.foodPreference}</p>
                      </div>
                      <StatusBadge status={po.status} />
                    </div>

                    <div className="bg-[#FAF9F6]/55 border border-[#E5E0D8] rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <p className="text-[#57534E]">Plates</p>
                        <p className="font-semibold tabular-nums">{po.plateCount} Plates</p>
                      </div>
                      <div>
                        <p className="text-[#57534E]">Price / Plate</p>
                        <p className="font-mono font-semibold tabular-nums">{formatINR(po.pricePerPlate)}</p>
                      </div>
                      <div>
                        <p className="text-[#57534E]">Food Order Total</p>
                        <p className="font-mono font-semibold tabular-nums">{formatINR(po.totalFoodAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[#57534E]">Advance ({po.advancePercent}%)</p>
                        <p className="font-mono font-semibold text-[#6E1E2E] tabular-nums">
                          {formatINR(po.advanceAmount)} ({po.advancePaid ? 'DEMO PAID' : 'Pending'})
                        </p>
                      </div>
                      <div>
                        <p className="text-[#57534E]">Remaining at Venue</p>
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
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
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
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Celebration Bookings (Ready-Made Packages)
                </h1>
                <p className="text-sm text-[#57534E]">
                  Direct package bookings with transparent plate pricing and Decoration Included – No Additional Charges (₹0). No quotation required.
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
                description="Browse approved celebration packages on the Celebrate page and confirm directly with no quotation wait."
              />
            ) : (
              <div className="space-y-4">
                {myCelebrations.map((cel) => (
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

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-xs text-[#57534E]">
                        {cel.transactionId
                          ? `Demo Txn ID: ${cel.transactionId} · Food Pref: ${cel.foodPreference}`
                          : `Booked ${formatDisplayDate(cel.createdAt)} · Food Pref: ${cel.foodPreference}`}
                      </span>
                      <div className="flex flex-wrap gap-2">
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
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'custom-requests' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Custom Requests &amp; Quotations
                </h1>
                <p className="text-sm text-[#57534E]">
                  Custom celebrations require a restaurant quotation. Advance payment remains locked until you review and accept the itemized quotation.
                </p>
              </div>
              <Link
                to="/events#custom-celebration-form"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                New Custom Request
              </Link>
            </div>

            {myCustomRequests.length === 0 ? (
              <EmptyStateCard
                title="No custom celebration requests yet"
                description="Submit your custom occasion theme, Veg/Non-Veg preference, decoration brief, and estimated budget on the Celebrate page."
              />
            ) : (
              <div className="space-y-5">
                {myCustomRequests.map((req) => {
                  const targetRest = restaurants.find((r) => r.id === req.restaurantId);
                  const quote = req.quotation;
                  return (
                    <div key={req.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 sm:p-6 space-y-4">
                      {/* Header Metadata */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                            {req.id} · Submitted {formatDisplayDate(req.createdAt)} · {req.occasionType}
                          </p>
                          <h3 className="font-display text-2xl font-semibold text-[#1C1917] mt-0.5">
                            {req.restaurantName} — {req.guestsCount} Guests
                          </h3>
                          <p className="text-xs text-[#57534E] mt-0.5">
                            Event Date: {formatDisplayDate(req.preferredDate)} at {req.preferredTime} · Preference: {req.vegNonVegPreference}
                          </p>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>

                      {/* Summary Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-3.5">
                        <div>
                          <p className="text-[#57534E]">Requested Budget</p>
                          <p className="font-mono font-semibold tabular-nums">
                            {formatINR(req.estimatedBudget)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Decoration Charge</p>
                          <p className="font-semibold text-[#1E462A]">₹0 (Included Free)</p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Quotation Amount</p>
                          <p className="font-mono font-semibold text-[#6E1E2E] tabular-nums">
                            {req.quotedAmount ? formatINR(req.quotedAmount) : 'Pending Quote'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#57534E]">Advance Status</p>
                          <p className="font-semibold text-[#1C1917]">
                            {req.advancePaid
                              ? `DEMO PAID (${formatINR(req.advanceAmount || 0)})`
                              : quote?.locked
                                ? `Unlocked (${formatINR(req.advanceAmount || 0)})`
                                : 'Locked Until Quote Accepted'}
                          </p>
                        </div>
                      </div>

                      {/* Brief Details + Reference Images */}
                      <div className="text-xs text-[#57534E] space-y-1.5">
                        <p>
                          <strong className="text-[#1C1917]">Theme &amp; Colours:</strong> {req.decorationTheme} ({req.preferredColors})
                        </p>
                        <p>
                          <strong className="text-[#1C1917]">Decoration Brief:</strong> {req.decorationRequirements}
                        </p>
                        <p>
                          <strong className="text-[#1C1917]">Cake &amp; Food:</strong> {req.cakeRequirements} · {req.foodPreferences} ({req.vegNonVegPreference})
                        </p>
                        {req.specialInstructions && (
                          <p>
                            <strong className="text-[#1C1917]">Special Instructions:</strong> {req.specialInstructions}
                          </p>
                        )}
                      </div>

                      {req.referenceImages.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-[#1C1917]">
                            Your Uploaded Reference Photos:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {req.referenceImages.map((img, i) => (
                              <div key={i} className="w-20 h-14 rounded overflow-hidden border border-[#E5E0D8]">
                                <SafeImage src={img} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Structured Quotation Card */}
                      {quote && (
                        <div className="border-2 border-[#6E1E2E]/25 bg-[#FAF9F6] rounded-lg p-4 sm:p-5 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E0D8]">
                            <div>
                              <p className="text-[11px] font-mono uppercase tracking-wider text-[#6E1E2E] font-semibold">
                                Quotation Card ({quote.id}) · {quote.restaurantName}
                              </p>
                              <h4 className="font-display text-xl font-semibold text-[#1C1917]">
                                Itemized Celebration Proposal
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              {quote.locked && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ECF4EE] border border-[#BBD6C3] text-[11px] font-semibold text-[#1E462A]">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Accepted &amp; Locked
                                </span>
                              )}
                              <span className="text-[11px] text-[#57534E] tabular-nums">
                                Valid Until: {formatDisplayDate(quote.validUntil)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-[#1C1917]">Food &amp; Culinary Scope</p>
                              <p className="text-[#57534E] leading-relaxed">{quote.foodPackageDetails}</p>
                              {quote.specialServicesNotes && (
                                <p className="text-[#1C1917]">
                                  <strong>Special Services:</strong> {quote.specialServicesNotes}
                                </p>
                              )}
                              {quote.additionalIncludedServices && (
                                <p className="text-[#1C1917]">
                                  <strong>Included Services:</strong> {quote.additionalIncludedServices}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <p className="font-semibold text-[#1C1917]">Decoration Scope</p>
                              <p className="text-[#57534E] leading-relaxed">{quote.decorationDetails}</p>
                              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ECF4EE] border border-[#BBD6C3] text-[11px] font-semibold text-[#1E462A]">
                                <span>Decoration Included – No Additional Charges (₹0)</span>
                              </div>
                            </div>
                          </div>

                          {/* Cost Breakdown Table */}
                          <div className="bg-white border border-[#E5E0D8] rounded-lg p-3.5 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-[#57534E]">
                                Plates ({quote.platesCount} × {formatINR(quote.pricePerPlate)})
                              </span>
                              <span className="font-mono tabular-nums font-medium">
                                {formatINR(quote.platesCount * quote.pricePerPlate)}
                              </span>
                            </div>
                            {quote.cakeCharge > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[#57534E]">Custom Cake Charge</span>
                                <span className="font-mono tabular-nums font-medium">
                                  {formatINR(quote.cakeCharge)}
                                </span>
                              </div>
                            )}
                            {quote.lineItems.map((li) => (
                              <div key={li.id} className="flex justify-between">
                                <span className="text-[#57534E]">
                                  {li.label} ({li.category})
                                </span>
                                <span className="font-mono tabular-nums font-medium">
                                  {formatINR(li.amount)}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between">
                              <span className="text-[#57534E]">Decoration Fee</span>
                              <span className="font-mono font-semibold text-[#1E462A]">
                                ₹0 (No Additional Charges)
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[#E5E0D8] font-semibold text-sm text-[#1C1917]">
                              <span>Total Quoted Amount</span>
                              <span className="font-mono tabular-nums">{formatINR(quote.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-[#6E1E2E]">
                              <span>Advance Payable ({quote.advancePercent}%)</span>
                              <span className="font-mono tabular-nums">{formatINR(quote.advanceAmount)}</span>
                            </div>
                            <div className="flex justify-between text-[#57534E]">
                              <span>Remaining Balance at Restaurant</span>
                              <span className="font-mono tabular-nums">{formatINR(quote.remainingAmount)}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#57534E] space-y-1">
                            <p>
                              <strong className="text-[#1C1917]">Terms &amp; Conditions:</strong> {quote.termsAndConditions}
                            </p>
                            {quote.additionalNotes && (
                              <p>
                                <strong className="text-[#1C1917]">Restaurant Notes:</strong> {quote.additionalNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Reject Quotation Inline Box */}
                      {rejectingReqId === req.id && (
                        <div className="bg-[#FDF2F4] border border-[#EAC4CC] rounded-lg p-4 space-y-3">
                          <label className="block text-xs font-semibold text-[#8B1E35]">
                            Optional Reason for Declining Quotation
                          </label>
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Exceeds budget or need revised plate menu..."
                            className="w-full px-3 py-2 text-xs bg-white border border-[#EAC4CC] rounded-lg"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                rejectCustomRequestQuotation(req.id, rejectReason);
                                setRejectingReqId(null);
                                setRejectReason('');
                              }}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B1E35] rounded-lg"
                            >
                              Confirm Decline Quotation
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingReqId(null)}
                              className="px-3 py-1.5 text-xs border border-[#E5E0D8] bg-white rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E0D8]">
                        <span className="text-xs text-[#57534E] inline-flex items-center gap-1.5">
                          {(req.status === 'Request Received' || req.status === 'Under Review') && (
                            <>
                              <Lock className="w-3.5 h-3.5 text-[#6E1E2E]" />
                              <span>
                                Advance payment is locked until the restaurant sends a quotation and you accept it.
                              </span>
                            </>
                          )}
                          {req.status === 'Quotation Sent' &&
                            'Review the quotation card above and Accept or Reject before payment.'}
                          {req.status === 'Quotation Accepted' &&
                            `Quotation accepted & locked. Pay ${req.advancePercent}% advance (${formatINR(req.advanceAmount || 0)}) to confirm.`}
                          {req.status === 'Quotation Rejected' &&
                            'You declined this quotation. Submit a revised request or contact the restaurant.'}
                          {req.advancePaid && `Demo Txn: ${req.transactionId || 'Logged'} · Confirmed`}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {req.status === 'Quotation Sent' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setRejectingReqId(req.id)}
                                className="px-3.5 py-2 text-xs font-semibold text-[#8B1E35] border border-[#EAC4CC] bg-[#FDF2F4] rounded-lg"
                              >
                                Reject Quotation
                              </button>
                              <button
                                type="button"
                                onClick={() => acceptCustomRequestQuotation(req.id)}
                                className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                              >
                                Accept Quotation
                              </button>
                            </>
                          )}

                          {(req.status === 'Quotation Accepted' || req.status === 'Advance Pending') &&
                            !req.advancePaid && (
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
                                      { label: 'Quotation ID', value: quote?.id || req.id },
                                      { label: 'Guests', value: `${req.guestsCount} Guests` },
                                      { label: 'Decoration Charge', value: 'FREE (₹0 — No Additional Charges)' },
                                      { label: 'Accepted Quote Total', value: formatINR(req.quotedAmount || 0) },
                                      { label: 'Remaining at Venue', value: formatINR(req.remainingAmount || 0) },
                                    ],
                                    onComplete: (txnId) => markCustomRequestAdvancePaid(req.id, txnId),
                                  })
                                }
                                className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                              >
                                Pay {formatINR(req.advanceAmount || 0)} Demo Advance
                              </button>
                            )}

                          {req.status === 'Quotation Rejected' && (
                            <>
                              <Link
                                to="/events#custom-celebration-form"
                                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                              >
                                Submit Revised Request
                              </Link>
                              {targetRest && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg text-[#1C1917]">
                                  <Phone className="w-3.5 h-3.5 text-[#6E1E2E]" />
                                  {targetRest.contactNumber}
                                </span>
                              )}
                            </>
                          )}

                          {(req.status === 'Request Received' ||
                            req.status === 'Under Review' ||
                            req.status === 'Quotation Sent') && (
                            <button
                              type="button"
                              onClick={() => cancelCustomRequest(req.id)}
                              className="px-3 py-2 text-xs font-medium text-[#57534E] border border-[#E5E0D8] bg-white rounded-lg hover:bg-[#FAF9F6]"
                            >
                              Cancel Request
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
                      <option key={r.id} value={r.id}>{r.name}</option>
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
              Exclusive Member Offers
            </h1>
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
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    />
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
      <RestaurantModal />
    </DashboardLayout>
  );
}
