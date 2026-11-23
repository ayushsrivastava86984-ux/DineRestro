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
  Receipt,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { RestaurantModal } from '../../components/common/RestaurantModal';
import { POPULAR_CUISINES } from '../../data/mockData';
import type { CuisineType } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const CUSTOMER_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'Explore Restaurants', to: '/customer/explore', icon: Compass },
  { label: 'My Bookings & Orders', to: '/customer/bookings', icon: CalendarCheck },
  { label: 'Celebrations & Quotes', to: '/customer/events', icon: PartyPopper },
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
    preOrders,
    markPreOrderAdvancePaid,
    celebrationBookings,
    acceptCelebrationQuotation,
    markCelebrationAdvancePaid,
    payments,
    offers,
    favoriteIds,
    tickets,
    submitSupportTicket,
    openRestaurantModal,
    openDemoPayment,
    addToast,
  } = useApp();

  const [bookingsTab, setBookingsTab] = useState<'tables' | 'preorders' | 'payments'>('tables');
  const [searchExplore, setSearchExplore] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [fullName, setFullName] = useState(customerUser.fullName);
  const [mobile, setMobile] = useState(customerUser.mobile);
  const [city, setCity] = useState(customerUser.city);
  const [preferredCuisine, setPreferredCuisine] = useState<CuisineType>(customerUser.preferredCuisine);

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');
  const myBookings = reservations.filter(
    (r) => r.customerId === customerUser.id || r.customerName === customerUser.fullName
  );
  const myPreOrders = preOrders.filter(
    (p) => p.customerId === customerUser.id || p.customerName === customerUser.fullName
  );
  const myCelebrations = celebrationBookings.filter(
    (c) => c.customerId === customerUser.id || c.customerName === customerUser.fullName
  );
  const myPayments = payments.filter(
    (pay) => pay.customerName === customerUser.fullName
  );

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

  return (
    <DashboardLayout
      portalRole="customer"
      portalLabel="Customer Portal"
      userTitle={customerUser.fullName}
      userSubtitle={`${customerUser.city} · ${customerUser.email}`}
      navItems={CUSTOMER_NAV}
    >
      <div className="space-y-6">
        <DemoBanner message="Customer Dashboard (DEMO MODE). Table bookings, plate pre-orders, celebration quotations, and DEMO ONLY payments are stored in local state." />

        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                  Welcome back, {customerUser.fullName.split(' ')[0]}
                </h1>
                <p className="text-sm text-[#6B5F5C] mt-1">
                  Track table reservations, food pre-orders, celebration quotations, and Varanasi dining offers.
                </p>
              </div>
              <Link
                to="/customer/explore"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors whitespace-nowrap self-start"
              >
                Discover &amp; Reserve (Demo)
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Table Reservations</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {myBookings.length}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Food Pre-Orders</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {myPreOrders.length}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Celebration Bookings</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#702C3A] mt-1">
                  {myCelebrations.length}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Favorite Venues</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {favoriteRestaurants.length}
                </p>
              </div>
            </div>

            {/* Celebration Quotation Action Alert if any */}
            {myCelebrations.some((c) => c.status === 'Quotation Sent' || c.status === 'Advance Pending') && (
              <div className="bg-[#FFF6E9] border border-[#702C3A]/35 rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-[#702C3A]">
                    Action Required: Celebration Quotation Ready
                  </h2>
                  <Link to="/customer/events" className="text-xs font-semibold text-[#702C3A] underline">
                    Manage Celebrations
                  </Link>
                </div>
                {myCelebrations
                  .filter((c) => c.status === 'Quotation Sent' || c.status === 'Advance Pending')
                  .map((cel) => (
                    <div
                      key={cel.id}
                      className="bg-white border border-[#E8DDD1] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-[#292321]">
                          {cel.packageName} · {cel.restaurantName}
                        </p>
                        <p className="text-[#6B5F5C] tabular-nums">
                          {cel.platesCount} Plates · Quoted Total: {formatINR(cel.quotedTotalAmount)} · Decoration: FREE (₹0) · {cel.advancePercent}% Advance: {formatINR(cel.advanceAmount)}
                        </p>
                      </div>
                      {cel.status === 'Quotation Sent' ? (
                        <button
                          type="button"
                          onClick={() => acceptCelebrationQuotation(cel.id)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg shrink-0"
                        >
                          Accept Quotation
                        </button>
                      ) : (
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
                                { label: 'Package', value: cel.packageName },
                                { label: 'Plates', value: `${cel.platesCount} × ${formatINR(cel.pricePerPlate)}` },
                                { label: 'Decoration Charge', value: 'FREE (₹0)' },
                                { label: 'Approved Total', value: formatINR(cel.quotedTotalAmount) },
                                { label: 'Remaining at Restaurant', value: formatINR(cel.remainingAmount) },
                              ],
                              onComplete: (txnId) => markCelebrationAdvancePaid(cel.id, txnId),
                            })
                          }
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg shrink-0"
                        >
                          Pay {formatINR(cel.advanceAmount)} Demo Advance
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}

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
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  My Bookings, Pre-Orders &amp; Payment Summaries
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Platform booking fees, food pre-orders, and celebration payments are always tracked separately.
                </p>
              </div>
              <div className="flex gap-1.5 bg-white border border-[#E8DDD1] p-1 rounded-lg">
                {[
                  { id: 'tables' as const, label: `Table Bookings (${myBookings.length})` },
                  { id: 'preorders' as const, label: `Food Pre-Orders (${myPreOrders.length})` },
                  { id: 'payments' as const, label: `Demo Receipts (${myPayments.length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBookingsTab(t.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded ${
                      bookingsTab === t.id
                        ? 'bg-[#702C3A] text-white'
                        : 'text-[#292321] hover:bg-[#FFF6E9]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {bookingsTab === 'tables' && (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-[#702C3A]">{b.id}</span>
                        <span className="text-[#6B5F5C]">· {b.orderMode}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#292321]">{b.restaurantName}</h3>
                      <p className="text-xs text-[#6B5F5C] tabular-nums">
                        {formatDisplayDate(b.date)} · {b.time} · {b.guests} Guests
                      </p>
                      {b.orderMode === 'Offer Table Booking' && b.platformFeeTotal !== undefined ? (
                        <p className="text-xs text-[#702C3A] font-medium tabular-nums">
                          Offer: {b.selectedOfferTitle} · Platform Fee: {b.guests} × ₹{b.feePerGuest} = {formatINR(b.platformFeeTotal)} (Food bill paid at restaurant)
                        </p>
                      ) : (
                        <p className="text-xs text-[#6B5F5C]">
                          Order at Restaurant — ₹0 food advance required
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <StatusBadge status={b.status} />
                      {(b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Accepted') && (
                        <button
                          type="button"
                          onClick={() => updateReservationStatus(b.id, 'Cancelled')}
                          className="px-3 py-1.5 text-xs font-semibold text-[#702C3A] border border-[#F4A6B8] rounded hover:bg-[#FDECEF]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {bookingsTab === 'preorders' && (
              <div className="space-y-4">
                {myPreOrders.map((po) => (
                  <div key={po.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#702C3A]">
                          {po.id} · {formatDisplayDate(po.date)} at {po.time}
                        </p>
                        <h3 className="text-lg font-semibold text-[#292321]">
                          {po.packageName} — {po.restaurantName}
                        </h3>
                        <p className="text-xs text-[#6B5F5C]">{po.foodPreference}</p>
                      </div>
                      <StatusBadge status={po.status} />
                    </div>

                    {/* Separate Payment Breakdown B */}
                    <div className="bg-[#FFF6E9]/55 border border-[#E8DDD1] rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <p className="text-[#6B5F5C]">Selected Plates</p>
                        <p className="font-semibold tabular-nums">{po.plateCount} Plates</p>
                      </div>
                      <div>
                        <p className="text-[#6B5F5C]">Price / Plate</p>
                        <p className="font-mono font-semibold tabular-nums">{formatINR(po.pricePerPlate)}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5F5C]">Total Food Amount</p>
                        <p className="font-mono font-semibold tabular-nums">{formatINR(po.totalFoodAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5F5C]">Advance ({po.advancePercent}%)</p>
                        <p className="font-mono font-semibold text-[#702C3A] tabular-nums">
                          {formatINR(po.advanceAmount)} ({po.advancePaid ? 'DEMO PAID' : 'Pending'})
                        </p>
                      </div>
                      <div>
                        <p className="text-[#6B5F5C]">Remaining at Venue</p>
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
                                { label: 'Total Food Bill', value: formatINR(po.totalFoodAmount) },
                                { label: 'Remaining at Restaurant', value: formatINR(po.remainingAmount) },
                              ],
                              onComplete: (txnId) => markPreOrderAdvancePaid(po.id, txnId),
                            })
                          }
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                        >
                          Pay {formatINR(po.advanceAmount)} Demo Advance
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {bookingsTab === 'payments' && (
              <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                      <th className="py-3 px-4 font-semibold">Demo Txn ID</th>
                      <th className="py-3 px-4 font-semibold">Ref</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Restaurant</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDD1]">
                    {myPayments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#702C3A]">
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
                        <td className="py-3 px-4"><StatusBadge status={pay.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'events' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  Celebration Bookings &amp; Quotations
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Decoration is always FREE (₹0). Review custom quotations and complete your 50% demo advance.
                </p>
              </div>
              <Link
                to="/events"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Explore Celebration Packages
              </Link>
            </div>

            <div className="space-y-4">
              {myCelebrations.map((cel) => (
                <div key={cel.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono font-semibold text-[#702C3A]">
                        {cel.id} · {cel.celebrationType} · {formatDisplayDate(cel.eventDate)} at {cel.eventTime}
                      </p>
                      <h3 className="text-xl font-semibold text-[#292321]">
                        {cel.packageName} — {cel.restaurantName}
                      </h3>
                      <p className="text-xs text-[#6B5F5C] mt-0.5">{cel.decorationArrangement}</p>
                    </div>
                    <StatusBadge status={cel.status} />
                  </div>

                  {/* Separated Celebration Payment Summary C */}
                  <div className="bg-[#FFF6E9]/55 border border-[#E8DDD1] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-[#6B5F5C]">Plates × Price</p>
                      <p className="font-mono font-semibold tabular-nums">
                        {cel.platesCount} × {formatINR(cel.pricePerPlate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B5F5C]">Decoration Charge</p>
                      <p className="font-semibold text-[#292321]">FREE (₹0)</p>
                    </div>
                    <div>
                      <p className="text-[#6B5F5C]">Quoted Total Amount</p>
                      <p className="font-mono font-semibold tabular-nums">{formatINR(cel.quotedTotalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B5F5C]">Approved Advance ({cel.advancePercent}%)</p>
                      <p className="font-mono font-semibold text-[#702C3A] tabular-nums">
                        {formatINR(cel.advanceAmount)} · Rem: {formatINR(cel.remainingAmount)}
                      </p>
                    </div>
                  </div>

                  {cel.quotationNotes && (
                    <p className="text-xs text-[#6B5F5C]">
                      <strong>Restaurant Quotation Note:</strong> {cel.quotationNotes}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-end gap-2">
                    {cel.status === 'Quotation Sent' && (
                      <button
                        type="button"
                        onClick={() => acceptCelebrationQuotation(cel.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
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
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
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

        {activeSection === 'offers' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Exclusive Member Offers
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOffers.map((offer) => (
                <div key={offer.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6B5F5C]">
                    <span className="font-semibold text-[#702C3A]">
                      {offer.discountLabel} · {offer.offerTier} Offer
                    </span>
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
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              My Profile (Demo)
            </h1>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email (Read-only Demo)</label>
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
                  <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Preferred Cuisine</label>
                  <select
                    value={preferredCuisine}
                    onChange={(e) => setPreferredCuisine(e.target.value as CuisineType)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                  >
                    {POPULAR_CUISINES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
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
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Booking change or celebration question"
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Details</label>
                  <textarea
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
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
