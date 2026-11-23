import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ClipboardCheck,
  Images as ImagesIcon,
  CheckSquare,
  FileImage,
  PartyPopper,
  Sparkles,
  Tag,
  IndianRupee,
  CalendarCheck,
  Utensils,
  MessageSquareQuote,
  Receipt,
  MessageSquare,
  LifeBuoy,
  BarChart3,
  Settings,
  Search,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { SafeImage } from '../../components/common/SafeImage';
import {
  ALL_AMENITIES,
  DEMO_ANALYTICS_WEEKLY,
} from '../../data/mockData';
import type { AmenityType, DiningOffer, Restaurant } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Customer Accounts', to: '/admin/customers', icon: Users },
  { label: 'Restaurant Accounts', to: '/admin/restaurants', icon: Store },
  { label: 'Restaurant Approvals', to: '/admin/approvals', icon: ClipboardCheck },
  { label: 'Restaurant Photos', to: '/admin/photos', icon: ImagesIcon },
  { label: 'Amenities', to: '/admin/amenities', icon: CheckSquare },
  { label: 'Menu Galleries', to: '/admin/menus', icon: FileImage },
  { label: 'Celebration Packages', to: '/admin/celebration-packages', icon: PartyPopper },
  { label: 'Decoration Photos', to: '/admin/decorations', icon: Sparkles },
  { label: 'Offer Management', to: '/admin/offers', icon: Tag },
  { label: 'Booking Fee Settings', to: '/admin/fees', icon: IndianRupee },
  { label: 'Reservations', to: '/admin/reservations', icon: CalendarCheck },
  { label: 'Pre-orders', to: '/admin/preorders', icon: Utensils },
  { label: 'Event Quotations', to: '/admin/quotations', icon: MessageSquareQuote },
  { label: 'Payment Records', to: '/admin/payments', icon: Receipt },
  { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
  { label: 'Support Tickets', to: '/admin/support', icon: LifeBuoy },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function AdminDashboard() {
  const location = useLocation();
  const {
    customers,
    updateCustomerStatus,
    restaurants,
    updateRestaurantApproval,
    setRestaurantCover,
    deleteRestaurantPhoto,
    updateRestaurantAmenities,
    deleteMenuPhoto,
    celebrationPackages,
    updateCelebrationPackageApproval,
    reservations,
    preOrders,
    celebrationBookings,
    offers,
    addOffer,
    toggleOfferActive,
    platformSettings,
    updatePlatformSettings,
    payments,
    reviews,
    toggleReviewVisibility,
    tickets,
    updateTicketStatus,
    addToast,
  } = useApp();

  const [custQuery, setCustQuery] = useState('');
  const [custFilter, setCustFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [resStatusFilter, setResStatusFilter] = useState<string>('All');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('All');
  const [selectedRestId, setSelectedRestId] = useState<string>(
    restaurants[0]?.id || 'rest-kashi-terrace'
  );
  const [inspectRest, setInspectRest] = useState<Restaurant | null>(null);

  // Configurable platform fees state
  const [basicFee, setBasicFee] = useState(String(platformSettings.basicOfferFeePerGuest));
  const [premiumFee, setPremiumFee] = useState(String(platformSettings.premiumOfferFeePerGuest));
  const [preOrderAdvPct, setPreOrderAdvPct] = useState(
    String(platformSettings.defaultPreOrderAdvancePercent)
  );
  const [celAdvPct, setCelAdvPct] = useState(
    String(platformSettings.defaultCelebrationAdvancePercent)
  );

  // New Offer form state
  const [offerRestId, setOfferRestId] = useState(restaurants[0]?.id || 'rest-kashi-terrace');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerTier, setOfferTier] = useState<'Basic' | 'Premium'>('Basic');
  const [offerCategory, setOfferCategory] =
    useState<DiningOffer['category']>('Flat Discount');
  const [offerTerms, setOfferTerms] = useState('');

  const path = location.pathname;
  const activeSection =
    path.includes('/admin/customers')
      ? 'customers'
      : path.includes('/admin/restaurants')
        ? 'restaurants'
        : path.includes('/admin/approvals')
          ? 'approvals'
          : path.includes('/admin/photos')
            ? 'photos'
            : path.includes('/admin/amenities')
              ? 'amenities'
              : path.includes('/admin/menus')
                ? 'menus'
                : path.includes('/admin/celebration-packages')
                  ? 'celebration-packages'
                  : path.includes('/admin/decorations')
                    ? 'decorations'
                    : path.includes('/admin/offers')
                      ? 'offers'
                      : path.includes('/admin/fees')
                        ? 'fees'
                        : path.includes('/admin/reservations')
                          ? 'reservations'
                          : path.includes('/admin/preorders')
                            ? 'preorders'
                            : path.includes('/admin/quotations')
                              ? 'quotations'
                              : path.includes('/admin/payments')
                                ? 'payments'
                                : path.includes('/admin/reviews')
                                  ? 'reviews'
                                  : path.includes('/admin/support')
                                    ? 'support'
                                    : path.includes('/admin/analytics')
                                      ? 'analytics'
                                      : path.includes('/admin/settings')
                                        ? 'settings'
                                        : 'overview';

  const pendingRestApprovals = restaurants.filter(
    (r) => r.approvalStatus === 'Pending Approval'
  );
  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');
  const pendingPkgApprovals = celebrationPackages.filter(
    (p) => p.approvalStatus === 'Pending Approval'
  );

  const selectedRestaurant =
    restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const filteredCustomers = customers.filter((c) => {
    const matchesQ =
      !custQuery.trim() ||
      c.fullName.toLowerCase().includes(custQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(custQuery.toLowerCase());
    const matchesStatus = custFilter === 'All' || c.status === custFilter;
    return matchesQ && matchesStatus;
  });

  const filteredPayments = payments.filter(
    (p) => paymentTypeFilter === 'All' || p.paymentType === paymentTypeFilter
  );

  const totalPlatformFeesCollected = payments
    .filter((p) => p.paymentType === 'Platform Booking Fee')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPreOrderAdvances = payments
    .filter((p) => p.paymentType === 'Food Pre-Order Advance')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalCelebrationAdvances = payments
    .filter((p) => p.paymentType === 'Celebration Advance')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleToggleAmenity = (rest: Restaurant, amenity: AmenityType) => {
    const exists = rest.amenities.includes(amenity);
    const updated = exists
      ? rest.amenities.filter((a) => a !== amenity)
      : [...rest.amenities, amenity];
    updateRestaurantAmenities(updated, rest.id);
  };

  const handleSavePlatformFees = (e: React.FormEvent) => {
    e.preventDefault();
    const bFee = Math.max(0, Number(basicFee) || 19);
    const pFee = Math.max(0, Number(premiumFee) || 29);
    const poPct = Math.min(100, Math.max(10, Number(preOrderAdvPct) || 50));
    const celPct = Math.min(100, Math.max(10, Number(celAdvPct) || 50));

    updatePlatformSettings({
      basicOfferFeePerGuest: bFee,
      premiumOfferFeePerGuest: pFee,
      defaultPreOrderAdvancePercent: poPct,
      defaultCelebrationAdvancePercent: celPct,
    });
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRest = restaurants.find((r) => r.id === offerRestId);
    if (!targetRest || !offerTitle.trim() || !offerCode.trim() || !offerDiscount.trim()) {
      addToast({
        type: 'error',
        title: 'Incomplete Offer Details',
        description: 'Enter restaurant, title, code, and discount label.',
      });
      return;
    }
    addOffer({
      title: offerTitle.trim(),
      code: offerCode.trim().toUpperCase(),
      discountLabel: offerDiscount.trim(),
      offerTier,
      restaurantId: targetRest.id,
      restaurantName: targetRest.name,
      area: targetRest.area,
      validUntil: '2026-12-31',
      terms:
        offerTerms.trim() ||
        'Valid on DineRestro offer table bookings in Varanasi. Simulated Phase 1 offer.',
      active: true,
      category: offerCategory,
    });
    setOfferTitle('');
    setOfferCode('');
    setOfferDiscount('');
    setOfferTerms('');
  };

  return (
    <DashboardLayout
      portalRole="admin"
      portalLabel="Internal Admin Portal"
      userTitle="Varanasi Operations Desk"
      userSubtitle="DEMO DATA · Internal Preview"
      navItems={ADMIN_NAV}
    >
      <div className="space-y-6">
        <DemoBanner
          title="Internal Admin Demo Mode"
          message="All platform statistics, restaurant & celebration package approvals, photo/menu moderation, booking fee configurations, and payment logs are simulated DEMO DATA in local frontend state."
        />

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                DineRestro Operations Overview
              </h1>
              <p className="text-sm text-[#6B5F5C] mt-1">
                Varanasi launch city metrics, onboarding approvals, celebration package audits, and simulated payment totals (DEMO DATA).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Customers', val: customers.length },
                { label: 'Approved Restaurants', val: approvedRestaurants.length },
                { label: 'Pending Rest. Approvals', val: pendingRestApprovals.length },
                { label: 'Pending Pkg Approvals', val: pendingPkgApprovals.length },
                { label: 'Table Reservations', val: reservations.length },
                { label: 'Food Pre-Orders', val: preOrders.length },
                { label: 'Celebration Inquiries', val: celebrationBookings.length },
                {
                  label: 'Demo Transactions Total',
                  val: formatINR(
                    totalPlatformFeesCollected +
                      totalPreOrderAdvances +
                      totalCelebrationAdvances
                  ),
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                  <p className="text-xs text-[#6B5F5C]">{stat.label}</p>
                  <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Platform Demo Bookings (7 Days)"
                subtitle="Simulated daily reservation volume across Varanasi"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Sample Platform GMV Trend (DEMO DATA)"
                subtitle="Simulated dining value in ₹ thousands (not actual revenue)"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({
                  label: d.label,
                  value: Math.round(d.revenue / 1000),
                }))}
                formatValue={(v) => `₹${v}k`}
                barColor="#292321"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Restaurant Approvals */}
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
                <h2 className="text-lg font-semibold text-[#292321]">
                  Pending Restaurant Approvals ({pendingRestApprovals.length})
                </h2>
                {pendingRestApprovals.length === 0 ? (
                  <p className="text-sm text-[#6B5F5C]">All registered venues have been reviewed.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRestApprovals.map((r) => (
                      <div
                        key={r.id}
                        className="border border-[#E8DDD1] rounded-lg p-3.5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#292321]">{r.name}</p>
                          <p className="text-xs text-[#6B5F5C]">
                            {r.ownerName} · {r.area}, {r.city} · {r.primaryCuisine}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateRestaurantApproval(r.id, 'Approved')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRestaurantApproval(r.id, 'Rejected')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Celebration Packages */}
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
                <h2 className="text-lg font-semibold text-[#292321]">
                  Pending Celebration Package Approvals ({pendingPkgApprovals.length})
                </h2>
                {pendingPkgApprovals.length === 0 ? (
                  <p className="text-sm text-[#6B5F5C]">
                    All submitted celebration packages have been audited.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingPkgApprovals.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border border-[#E8DDD1] rounded-lg p-3.5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#292321]">{pkg.name}</p>
                          <p className="text-xs text-[#6B5F5C]">
                            {pkg.restaurantName} · {pkg.category} · {pkg.decorationPhotos.length} decor photo(s) · ₹0 decor
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCelebrationPackageApproval(pkg.id, 'Approved')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCelebrationPackageApproval(pkg.id, 'Rejected')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER ACCOUNTS */}
        {activeSection === 'customers' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Customer Accounts (Demo)
              </h1>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={custQuery}
                    onChange={(e) => setCustQuery(e.target.value)}
                    placeholder="Search customer..."
                    className="pl-9 pr-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <select
                  value={custFilter}
                  onChange={(e) => setCustFilter(e.target.value as typeof custFilter)}
                  className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Full Name</th>
                    <th className="py-3 px-4 font-semibold">Contact</th>
                    <th className="py-3 px-4 font-semibold">Preferred Cuisine</th>
                    <th className="py-3 px-4 font-semibold text-right">Bookings</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FFF6E9]/40">
                      <td className="py-3 px-4 font-semibold text-[#292321]">{c.fullName}</td>
                      <td className="py-3 px-4 text-xs text-[#6B5F5C]">
                        <div>{c.email}</div>
                        <div className="tabular-nums">{c.mobile}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">{c.preferredCuisine}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{c.totalBookings}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            updateCustomerStatus(
                              c.id,
                              c.status === 'Active' ? 'Suspended' : 'Active'
                            )
                          }
                          className="px-3 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                        >
                          {c.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RESTAURANT ACCOUNTS */}
        {activeSection === 'restaurants' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Registered Restaurant Accounts
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={r.logoUrl}
                        alt={r.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#E8DDD1]"
                        fallbackTitle={r.name}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-[#292321]">{r.name}</h3>
                        <p className="text-xs text-[#6B5F5C]">
                          {r.area}, {r.city} · Owner: {r.ownerName}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={r.approvalStatus} />
                  </div>
                  <p className="text-xs text-[#6B5F5C]">{r.address}</p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8DDD1] text-xs">
                    <div>
                      <span className="text-[#6B5F5C]">Gallery:</span>{' '}
                      <span className="font-semibold tabular-nums">{r.photos.length}</span>
                    </div>
                    <div>
                      <span className="text-[#6B5F5C]">Menu Pages:</span>{' '}
                      <span className="font-semibold tabular-nums">{r.menuPhotos.length}</span>
                    </div>
                    <div>
                      <span className="text-[#6B5F5C]">Amenities:</span>{' '}
                      <span className="font-semibold tabular-nums">{r.amenities.length}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setInspectRest(r)}
                      className="px-3 py-1.5 text-xs font-semibold border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                    >
                      Inspect Full Venue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESTAURANT APPROVALS */}
        {activeSection === 'approvals' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Restaurant Approvals Queue
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Approve or reject partner applications in local demo state. Approved restaurants appear on the public Explore page.
              </p>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Restaurant Name</th>
                    <th className="py-3 px-4 font-semibold">Owner Name</th>
                    <th className="py-3 px-4 font-semibold">City &amp; Area</th>
                    <th className="py-3 px-4 font-semibold">Cuisine</th>
                    <th className="py-3 px-4 font-semibold">Registration Date</th>
                    <th className="py-3 px-4 font-semibold">Approval Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {restaurants.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FFF6E9]/40">
                      <td className="py-3 px-4 font-semibold text-[#292321]">{r.name}</td>
                      <td className="py-3 px-4 text-xs text-[#6B5F5C]">{r.ownerName}</td>
                      <td className="py-3 px-4 text-xs">
                        {r.area}, {r.city}
                      </td>
                      <td className="py-3 px-4 text-xs">{r.primaryCuisine}</td>
                      <td className="py-3 px-4 text-xs tabular-nums">
                        {formatDisplayDate(r.registrationDate)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.approvalStatus} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectRest(r)}
                          className="px-2.5 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRestaurantApproval(r.id, 'Approved')}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded hover:opacity-85"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRestaurantApproval(r.id, 'Rejected')}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded hover:opacity-85"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RESTAURANT PHOTOS MODERATION */}
        {activeSection === 'photos' && selectedRestaurant && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  Restaurant Photos Audit
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Inspect logos, cover photos, and interior/exterior gallery images across partner venues.
                </p>
              </div>
              <select
                value={selectedRestaurant.id}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.photos.length} photos)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-[#6B5F5C]">Current Logo</p>
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={selectedRestaurant.logoUrl}
                    alt={selectedRestaurant.name}
                    className="w-16 h-16 rounded-lg object-cover border border-[#E8DDD1]"
                    fallbackTitle={selectedRestaurant.name}
                  />
                  <div className="text-xs text-[#6B5F5C]">
                    <p className="font-semibold text-[#292321]">{selectedRestaurant.name}</p>
                    <p>{selectedRestaurant.area}, Varanasi</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-[#6B5F5C]">Current Cover Photo</p>
                <div className="aspect-[16/7] rounded overflow-hidden border border-[#E8DDD1]">
                  <SafeImage
                    src={selectedRestaurant.image}
                    alt={selectedRestaurant.name}
                    className="w-full h-full object-cover"
                    fallbackTitle={selectedRestaurant.name}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedRestaurant.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white border border-[#E8DDD1] rounded-lg overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <SafeImage
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                      fallbackTitle={photo.category}
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#702C3A]">{photo.category}</span>
                      <span className="text-[#6B5F5C] truncate max-w-[160px]">{photo.caption}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRestaurantCover(photo.url, selectedRestaurant.id)}
                        className="flex-1 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                      >
                        Set Cover
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRestaurantPhoto(photo.id, selectedRestaurant.id)}
                        className="px-2.5 py-1 text-xs text-[#702C3A] bg-[#FDECEF] rounded inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AMENITIES MANAGEMENT */}
        {activeSection === 'amenities' && selectedRestaurant && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  Restaurant Amenities Control
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Verify and toggle all 14 standardized restaurant amenities shown on public profiles.
                </p>
              </div>
              <select
                value={selectedRestaurant.id}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.amenities.length}/14)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_AMENITIES.map((am) => {
                  const checked = selectedRestaurant.amenities.includes(am);
                  return (
                    <label
                      key={am}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#E7EFD9]/60 border-[#702C3A] text-[#292321]'
                          : 'bg-white border-[#E8DDD1] text-[#6B5F5C] hover:bg-[#FFF6E9]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAmenity(selectedRestaurant, am)}
                        className="accent-[#702C3A]"
                      />
                      <span className="text-sm font-medium">{am}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MENU PHOTO GALLERIES AUDIT */}
        {activeSection === 'menus' && selectedRestaurant && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  Menu Photo Galleries
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Regular restaurant menus are strictly photo-based pages. Review uploaded menu photographs per restaurant.
                </p>
              </div>
              <select
                value={selectedRestaurant.id}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.menuPhotos.length} pages)
                  </option>
                ))}
              </select>
            </div>

            {selectedRestaurant.menuPhotos.length === 0 ? (
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-8 text-center text-sm text-[#6B5F5C]">
                No menu photographs uploaded for this restaurant yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {selectedRestaurant.menuPhotos.map((mp) => (
                  <div
                    key={mp.id}
                    className="bg-white border border-[#E8DDD1] rounded-lg overflow-hidden"
                  >
                    <div className="aspect-[3/4] bg-[#FFF6E9] overflow-hidden">
                      <SafeImage
                        src={mp.url}
                        alt={mp.title}
                        className="w-full h-full object-cover"
                        fallbackTitle={mp.title}
                      />
                    </div>
                    <div className="p-3.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#702C3A]">
                          Page {mp.pageNumber}
                        </p>
                        <p className="text-sm font-medium text-[#292321]">{mp.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMenuPhoto(mp.id, selectedRestaurant.id)}
                        className="px-2.5 py-1 text-xs text-[#702C3A] bg-[#FDECEF] rounded inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CELEBRATION PACKAGES APPROVALS */}
        {activeSection === 'celebration-packages' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Celebration Packages Moderation
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Verify that every celebration package includes mandatory decoration photos and displays Decoration Included – No Additional Charges (₹0).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {celebrationPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-[#E8DDD1] rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="grid grid-cols-2 gap-1 bg-[#FFF6E9] p-1">
                    {pkg.decorationPhotos.slice(0, 2).map((url, i) => (
                      <div key={i} className="aspect-[16/10] overflow-hidden rounded-sm">
                        <SafeImage
                          src={url}
                          alt={`${pkg.name} decor ${i + 1}`}
                          className="w-full h-full object-cover"
                          fallbackTitle={pkg.category}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#702C3A]">
                          {pkg.restaurantName} · {pkg.category}
                        </p>
                        <h3 className="text-lg font-semibold text-[#292321]">{pkg.name}</h3>
                      </div>
                      <StatusBadge status={pkg.approvalStatus} />
                    </div>

                    <p className="text-xs text-[#6B5F5C]">{pkg.description}</p>

                    <div className="bg-[#E7EFD9]/60 border border-[#C8D8AC] rounded px-3 py-2 text-xs font-semibold text-[#292321] flex items-center justify-between">
                      <span>Decoration Included – No Additional Charges</span>
                      <span className="font-mono">₹0</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[#6B5F5C]">Per Plate:</span>{' '}
                        <span className="font-semibold tabular-nums">
                          {formatINR(pkg.pricePerPlate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B5F5C]">Plates:</span>{' '}
                        <span className="font-semibold tabular-nums">
                          {pkg.minPlates}–{pkg.maxPlates}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B5F5C]">Decor Photos:</span>{' '}
                        <span className="font-semibold tabular-nums">
                          {pkg.decorationPhotos.length}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8DDD1] flex justify-end gap-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => updateCelebrationPackageApproval(pkg.id, 'Approved')}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded"
                      >
                        Approve Package
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCelebrationPackageApproval(pkg.id, 'Rejected')}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded"
                      >
                        Reject Package
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DECORATION PHOTOS AUDIT */}
        {activeSection === 'decorations' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Celebration Decoration Photo Audit
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                All decoration photographs uploaded by partner restaurants across Varanasi. Every decoration setup is ₹0 complimentary with its celebration package.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {celebrationPackages.flatMap((pkg) =>
                pkg.decorationPhotos.map((url, idx) => (
                  <div
                    key={`${pkg.id}-dec-${idx}`}
                    className="bg-white border border-[#E8DDD1] rounded-lg overflow-hidden"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <SafeImage
                        src={url}
                        alt={`${pkg.name} decor`}
                        className="w-full h-full object-cover"
                        fallbackTitle={pkg.category}
                      />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#702C3A]">{pkg.category}</span>
                        <StatusBadge status={pkg.approvalStatus} />
                      </div>
                      <p className="text-sm font-semibold text-[#292321]">{pkg.name}</p>
                      <p className="text-xs text-[#6B5F5C]">{pkg.restaurantName}</p>
                      <p className="text-[11px] font-medium text-[#292321] bg-[#E7EFD9] px-2 py-0.5 rounded inline-block mt-1">
                        Decoration Charge: ₹0
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* OFFER MANAGEMENT */}
        {activeSection === 'offers' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Platform Offer Management
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Manage active dining offers and assign Basic (₹{platformSettings.basicOfferFeePerGuest}/guest) or Premium (₹{platformSettings.premiumOfferFeePerGuest}/guest) platform booking fee tiers.
              </p>
            </div>

            <form
              onSubmit={handleCreateOffer}
              className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4"
            >
              <h2 className="text-base font-semibold text-[#292321] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#702C3A]" />
                Publish Platform Offer (Demo)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <select
                  value={offerRestId}
                  onChange={(e) => setOfferRestId(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg bg-white"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Offer Title (e.g., 20% Off Rooftop Dinner)"
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  placeholder="Promo Code (e.g., KASHI20)"
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg font-mono uppercase"
                />
                <input
                  type="text"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                  placeholder="Discount Label (e.g., 20% OFF)"
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
                <select
                  value={offerTier}
                  onChange={(e) => setOfferTier(e.target.value as 'Basic' | 'Premium')}
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg bg-white"
                >
                  <option value="Basic">
                    Basic Offer (₹{platformSettings.basicOfferFeePerGuest}/guest fee)
                  </option>
                  <option value="Premium">
                    Premium Offer (₹{platformSettings.premiumOfferFeePerGuest}/guest fee)
                  </option>
                </select>
                <select
                  value={offerCategory}
                  onChange={(e) => setOfferCategory(e.target.value as DiningOffer['category'])}
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg bg-white"
                >
                  <option value="Flat Discount">Flat Discount</option>
                  <option value="Complimentary">Complimentary</option>
                  <option value="Celebration">Celebration</option>
                  <option value="Weekday Special">Weekday Special</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={offerTerms}
                  onChange={(e) => setOfferTerms(e.target.value)}
                  placeholder="Terms & eligibility details..."
                  className="flex-1 px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
                >
                  Publish Offer
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((o) => {
                const feePerGuest =
                  o.offerTier === 'Premium'
                    ? platformSettings.premiumOfferFeePerGuest
                    : platformSettings.basicOfferFeePerGuest;
                return (
                  <div
                    key={o.id}
                    className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-semibold text-[#702C3A]">
                        {o.code} · {o.discountLabel} · {o.offerTier} Offer (₹{feePerGuest}/guest)
                      </p>
                      <h3 className="text-base font-semibold text-[#292321]">{o.title}</h3>
                      <p className="text-xs text-[#6B5F5C]">
                        {o.restaurantName} · Valid until {formatDisplayDate(o.validUntil)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleOfferActive(o.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded border shrink-0 ${
                        o.active
                          ? 'bg-[#E7EFD9] border-[#C8D8AC]'
                          : 'bg-[#FFF6E9] border-[#E8DDD1]'
                      }`}
                    >
                      {o.active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOOKING FEE & ADVANCE PERCENT SETTINGS */}
        {activeSection === 'fees' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Booking Fee &amp; Advance Payment Settings
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Configure per-guest platform booking fees for DineRestro Offer Table Bookings and default advance payment percentages for Pre-Orders and Celebration Packages.
              </p>
            </div>

            <form
              onSubmit={handleSavePlatformFees}
              className="bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B5F5C] mb-1">
                    Basic Offer Fee Per Guest (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={basicFee}
                    onChange={(e) => setBasicFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E8DDD1] rounded-lg"
                  />
                  <p className="text-[11px] text-[#6B5F5C] mt-1">Default: ₹19 per guest</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5F5C] mb-1">
                    Premium Offer Fee Per Guest (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={premiumFee}
                    onChange={(e) => setPremiumFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E8DDD1] rounded-lg"
                  />
                  <p className="text-[11px] text-[#6B5F5C] mt-1">Default: ₹29 per guest</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5F5C] mb-1">
                    Food Pre-Order Advance (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={preOrderAdvPct}
                    onChange={(e) => setPreOrderAdvPct(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E8DDD1] rounded-lg"
                  />
                  <p className="text-[11px] text-[#6B5F5C] mt-1">Default: 50% advance</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5F5C] mb-1">
                    Celebration Package Advance (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={celAdvPct}
                    onChange={(e) => setCelAdvPct(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E8DDD1] rounded-lg"
                  />
                  <p className="text-[11px] text-[#6B5F5C] mt-1">Default: 50% advance</p>
                </div>
              </div>

              <div className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-4 text-xs text-[#292321] space-y-1">
                <p className="font-semibold">Business Rule Enforcement:</p>
                <p>• Regular Table Reservations without an offer (`Order at Restaurant`) always incur ₹0 platform fee.</p>
                <p>• Offer Table Bookings charge `Number of Guests × Selected Offer Per-Guest Fee` separately from restaurant food bills.</p>
                <p>• Celebration Decoration Charge is always ₹0 (`Decoration Included – No Additional Charges`).</p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
              >
                Save Platform Fee Settings (Demo)
              </button>
            </form>
          </div>
        )}

        {/* RESERVATIONS */}
        {activeSection === 'reservations' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                All Platform Table Reservations (Demo)
              </h1>
              <select
                value={resStatusFilter}
                onChange={(e) => setResStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Restaurant</th>
                    <th className="py-3 px-4 font-semibold">Schedule</th>
                    <th className="py-3 px-4 font-semibold text-right">Guests</th>
                    <th className="py-3 px-4 font-semibold">Booking Mode &amp; Fee</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {reservations
                    .filter((r) => resStatusFilter === 'All' || r.status === resStatusFilter)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-[#FFF6E9]/40">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#702C3A]">
                          {r.id}
                        </td>
                        <td className="py-3 px-4 font-medium">{r.customerName}</td>
                        <td className="py-3 px-4 text-xs text-[#6B5F5C]">{r.restaurantName}</td>
                        <td className="py-3 px-4 text-xs tabular-nums">
                          {formatDisplayDate(r.date)} · {r.time}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">{r.guests}</td>
                        <td className="py-3 px-4 text-xs">
                          <span className="font-medium text-[#292321]">{r.orderMode}</span>
                          {r.platformFeeTotal ? (
                            <div className="text-[#702C3A] font-mono">
                              {formatINR(r.platformFeeTotal)} ({r.offerTier} Offer)
                            </div>
                          ) : (
                            <div className="text-[#6B5F5C]">₹0 Platform Fee</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRE-ORDERS */}
        {activeSection === 'preorders' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Platform Food Pre-Orders (Demo)
            </h1>
            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Customer &amp; Restaurant</th>
                    <th className="py-3 px-4 font-semibold">Plate Package</th>
                    <th className="py-3 px-4 font-semibold text-right">Plates</th>
                    <th className="py-3 px-4 font-semibold text-right">Total / Advance</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {preOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-[#FFF6E9]/40">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#702C3A]">
                        {po.id}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-semibold text-[#292321]">{po.customerName}</div>
                        <div className="text-[#6B5F5C]">
                          {po.restaurantName} · {formatDisplayDate(po.date)} {po.time}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-[#292321]">{po.packageName}</div>
                        <div className="text-[#6B5F5C]">{po.foodPreference}</div>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">{po.plateCount}</td>
                      <td className="py-3 px-4 text-right text-xs tabular-nums">
                        <div className="font-semibold">{formatINR(po.totalFoodAmount)}</div>
                        <div className="text-[#702C3A]">
                          Adv ({po.advancePercent}%): {formatINR(po.advanceAmount)}{' '}
                          {po.advancePaid ? '(Paid)' : '(Pending)'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={po.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EVENT QUOTATIONS */}
        {activeSection === 'quotations' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Celebration Inquiries &amp; Quotations (Demo)
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {celebrationBookings.map((cb) => (
                <div
                  key={cb.id}
                  className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#702C3A]">{cb.id}</span>
                    <StatusBadge status={cb.status} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#292321]">
                      {cb.celebrationType} — {cb.packageName}
                    </h3>
                    <p className="text-xs text-[#6B5F5C]">
                      {cb.customerName} · {cb.restaurantName} · {formatDisplayDate(cb.eventDate)} {cb.eventTime}
                    </p>
                  </div>
                  <div className="bg-[#FFF6E9] border border-[#E8DDD1] rounded p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Plates ({cb.platesCount} × {formatINR(cb.pricePerPlate)})</span>
                      <span className="font-semibold tabular-nums">{formatINR(cb.totalPackageAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[#292321]">
                      <span>Decoration Included – No Additional Charges</span>
                      <span className="font-mono font-semibold">₹0</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E8DDD1] font-semibold">
                      <span>Quoted Total / {cb.advancePercent}% Advance</span>
                      <span className="tabular-nums">
                        {formatINR(cb.quotedTotalAmount)} / {formatINR(cb.advanceAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENT RECORDS */}
        {activeSection === 'payments' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  Simulated Payment Records (DEMO ONLY)
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Separated transaction logs for Offer Platform Booking Fees, Pre-Order Advances, and Celebration Advances. No real payments processed.
                </p>
              </div>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
              >
                <option value="All">All Payment Types</option>
                <option value="Platform Booking Fee">Platform Booking Fee</option>
                <option value="Food Pre-Order Advance">Food Pre-Order Advance</option>
                <option value="Celebration Advance">Celebration Advance</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Platform Booking Fees (DEMO)</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {formatINR(totalPlatformFeesCollected)}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Food Pre-Order Advances (DEMO)</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {formatINR(totalPreOrderAdvances)}
                </p>
              </div>
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                <p className="text-xs text-[#6B5F5C]">Celebration Advances (DEMO)</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                  {formatINR(totalCelebrationAdvances)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Transaction ID</th>
                    <th className="py-3 px-4 font-semibold">Booking Ref</th>
                    <th className="py-3 px-4 font-semibold">Payment Type</th>
                    <th className="py-3 px-4 font-semibold">Customer &amp; Restaurant</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-[#FFF6E9]/40">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#702C3A]">
                        {pay.transactionId}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{pay.referenceId}</td>
                      <td className="py-3 px-4 text-xs font-medium">{pay.paymentType}</td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-semibold text-[#292321]">{pay.customerName}</div>
                        <div className="text-[#6B5F5C]">{pay.restaurantName}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {formatINR(pay.amount)}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#6B5F5C]">{pay.paymentMethod}</td>
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

        {/* REVIEWS MODERATION */}
        {activeSection === 'reviews' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Customer Reviews Moderation
            </h1>
            <div className="space-y-3">
              {reviews.map((rv) => (
                <div
                  key={rv.id}
                  className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#6B5F5C]">
                      <span className="font-semibold text-[#702C3A]">{rv.restaurantName}</span>
                      <span>· Rating {rv.rating}/5</span>
                      <span>· {formatDisplayDate(rv.date)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#292321]">{rv.customerName}</p>
                    <p className="text-xs text-[#6B5F5C]">{rv.comment}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleReviewVisibility(rv.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border shrink-0 ${
                      rv.visible
                        ? 'bg-[#E7EFD9] border-[#C8D8AC] text-[#292321]'
                        : 'bg-[#FDECEF] border-[#F4A6B8] text-[#702C3A]'
                    }`}
                  >
                    {rv.visible ? 'Visible on Profile' : 'Hidden by Admin'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUPPORT TICKETS */}
        {activeSection === 'support' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Support Tickets Queue (Demo)
            </h1>
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-[#702C3A]">{t.id}</span>
                      <span className="text-[#6B5F5C]">
                        · {t.userName} ({t.userRole})
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#292321]">{t.subject}</h3>
                    <p className="text-xs text-[#6B5F5C]">{t.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={t.status} />
                    {t.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(t.id, 'Resolved')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Platform Analytics (DEMO DATA)
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                All metrics and revenue numbers shown below are simulated sample data for Phase 1 evaluation.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Weekly Reservation Demand"
                subtitle="Simulated bookings across Varanasi localities"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Projected Dining Value (DEMO DATA)"
                subtitle="Sample INR thousands (not actual platform revenue)"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({
                  label: d.label,
                  value: Math.round(d.revenue / 1000),
                }))}
                formatValue={(v) => `₹${v}k`}
                barColor="#292321"
              />
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <div className="max-w-xl bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Platform Configuration (Demo)
            </h1>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-[#E8DDD1]">
                <span className="text-[#6B5F5C]">Active Launch City</span>
                <span className="font-semibold">Varanasi, Uttar Pradesh</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E8DDD1]">
                <span className="text-[#6B5F5C]">Backend Mode</span>
                <span className="font-mono text-xs text-[#702C3A]">Phase 1 Frontend Simulation</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E8DDD1]">
                <span className="text-[#6B5F5C]">Celebration Decoration Charge Rule</span>
                <span className="font-mono text-xs text-[#292321]">Always ₹0 (Free)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E8DDD1]">
                <span className="text-[#6B5F5C]">Offer Booking Fee (Basic / Premium)</span>
                <span className="font-mono text-xs text-[#702C3A]">
                  ₹{platformSettings.basicOfferFeePerGuest} / ₹{platformSettings.premiumOfferFeePerGuest} per guest
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  addToast({
                    type: 'info',
                    title: 'Settings Preview Saved',
                    description: 'Phase 2 backend persistence will connect here later.',
                  })
                }
                className="px-5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Save Demo Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant Approval Detail Modal */}
      {inspectRest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E8DDD1] rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#292321]">{inspectRest.name}</h3>
              <button type="button" onClick={() => setInspectRest(null)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[16/7] rounded-lg overflow-hidden border border-[#E8DDD1]">
              <SafeImage
                src={inspectRest.image}
                alt={inspectRest.name}
                className="w-full h-full object-cover"
                fallbackTitle={inspectRest.name}
              />
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[#6B5F5C]">Owner:</span> {inspectRest.ownerName} (
                {inspectRest.ownerEmail})
              </p>
              <p>
                <span className="text-[#6B5F5C]">Address:</span> {inspectRest.address},{' '}
                {inspectRest.city} - {inspectRest.pinCode}
              </p>
              <p>
                <span className="text-[#6B5F5C]">Contact:</span> {inspectRest.contactNumber}
              </p>
              <p>
                <span className="text-[#6B5F5C]">Cuisine:</span> {inspectRest.cuisines.join(', ')}
              </p>
              <p>
                <span className="text-[#6B5F5C]">Amenities:</span>{' '}
                {inspectRest.amenities.join(', ') || 'None selected'}
              </p>
              <p>
                <span className="text-[#6B5F5C]">Menu Pages Uploaded:</span>{' '}
                {inspectRest.menuPhotos.length} photo page(s)
              </p>
              <p className="text-xs text-[#6B5F5C] pt-1">{inspectRest.description}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DDD1]">
              <button
                type="button"
                onClick={() => {
                  updateRestaurantApproval(inspectRest.id, 'Approved');
                  setInspectRest(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded-lg"
              >
                Approve Venue
              </button>
              <button
                type="button"
                onClick={() => {
                  updateRestaurantApproval(inspectRest.id, 'Rejected');
                  setInspectRest(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded-lg"
              >
                Reject Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
