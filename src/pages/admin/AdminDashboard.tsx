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
  Receipt,
  MessageSquare,
  LifeBuoy,
  BarChart3,
  Settings,
  Search,
  Trash2,
  Plus,
  X,
  MapPin,
  Pencil,
  Power,
  RotateCcw,
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
  RESTAURANT_CATEGORIES,
} from '../../data/mockData';
import type { AmenityType, DiningOffer, Restaurant, RestaurantCategory } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Cities & Launch Areas', to: '/admin/cities', icon: MapPin },
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
  { label: 'Celebration Bookings', to: '/admin/celebrations', icon: PartyPopper },
  { label: 'Payment Records', to: '/admin/payments', icon: Receipt },
  { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
  { label: 'Support Tickets', to: '/admin/support', icon: LifeBuoy },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function AdminDashboard() {
  const location = useLocation();
  const {
    cities,
    activeCityConfig,
    addCity,
    toggleCityActive,
    setDefaultLaunchCity,
    addCityNeighbourhood,
    customers,
    updateCustomerStatus,
    restaurants,
    updateRestaurantApproval,
    toggleRestaurantActive,
    deleteRestaurant,
    editRestaurantListing,
    seedLucknowDemoRestaurants,
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
    restaurants[0]?.id || 'rest-lko-awadh-mahal'
  );
  const [inspectRest, setInspectRest] = useState<Restaurant | null>(null);
  const [restListingFilter, setRestListingFilter] = useState<'All' | 'Demo' | 'Verified'>('All');
  const [confirmDeleteRestId, setConfirmDeleteRestId] = useState<string | null>(null);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editCategory, setEditCategory] = useState<RestaurantCategory>('Fine Dining');
  const [editPriceForTwo, setEditPriceForTwo] = useState('1200');
  const [editPriceRange, setEditPriceRange] = useState<Restaurant['priceRange']>('₹₹');
  const [editOfferText, setEditOfferText] = useState('');
  const [editTier, setEditTier] = useState<Restaurant['tier']>('Basic');
  const [editDesc, setEditDesc] = useState('');

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
  const [offerRestId, setOfferRestId] = useState(restaurants[0]?.id || 'rest-lko-awadh-mahal');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerTier, setOfferTier] = useState<'Basic' | 'Premium'>('Basic');
  const [offerCategory, setOfferCategory] =
    useState<DiningOffer['category']>('Flat Discount');
  const [offerTerms, setOfferTerms] = useState('');

  // City & launch area management state
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('Uttar Pradesh');
  const [newCityAreas, setNewCityAreas] = useState('');
  const [areaInputs, setAreaInputs] = useState<Record<string, string>>({});

  const openEditRestModal = (r: Restaurant) => {
    setEditingRest(r);
    setEditName(r.name);
    setEditArea(r.area);
    setEditCategory(r.category || 'Fine Dining');
    setEditPriceForTwo(String(r.priceForTwo));
    setEditPriceRange(r.priceRange);
    setEditOfferText(r.offerText);
    setEditTier(r.tier);
    setEditDesc(r.description);
  };

  const handleSaveRestEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRest) return;
    editRestaurantListing(editingRest.id, {
      name: editName.trim() || editingRest.name,
      area: editArea.trim() || editingRest.area,
      category: editCategory,
      priceForTwo: Math.max(200, Number(editPriceForTwo) || editingRest.priceForTwo),
      priceRange: editPriceRange,
      offerText: editOfferText.trim() || editingRest.offerText,
      tier: editTier,
      description: editDesc.trim() || editingRest.description,
    });
    setEditingRest(null);
  };

  const path = location.pathname;
  const activeSection =
    path.includes('/admin/cities')
      ? 'cities'
      : path.includes('/admin/customers')
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
                            : path.includes('/admin/celebrations')
                              ? 'celebrations'
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
    .filter(
      (p) =>
        p.paymentType === 'Celebration Advance' ||
        p.paymentType === 'Custom Celebration Advance'
    )
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
        `Valid on DineRestro offer table bookings in ${targetRest.city}. Simulated Phase 1 offer.`,
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
      userTitle={`${activeCityConfig.name} Operations Desk`}
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
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
                DineRestro Operations Overview
              </h1>
              <p className="text-sm text-[#57534E] mt-1">
                {activeCityConfig.name} launch city metrics, onboarding approvals, celebration package audits, and simulated payment totals (DEMO DATA).
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
                { label: 'Celebration Bookings', val: celebrationBookings.length },
                {
                  label: 'Demo Transactions Total',
                  val: formatINR(
                    totalPlatformFeesCollected +
                      totalPreOrderAdvances +
                      totalCelebrationAdvances
                  ),
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                  <p className="text-xs text-[#57534E]">{stat.label}</p>
                  <p className="text-2xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Platform Demo Bookings (7 Days)"
                subtitle={`Simulated daily reservation volume across ${activeCityConfig.name}`}
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
                barColor="#1C1917"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Restaurant Approvals */}
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4">
                <h2 className="text-lg font-semibold text-[#1C1917]">
                  Pending Restaurant Approvals ({pendingRestApprovals.length})
                </h2>
                {pendingRestApprovals.length === 0 ? (
                  <p className="text-sm text-[#57534E]">All registered venues have been reviewed.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRestApprovals.map((r) => (
                      <div
                        key={r.id}
                        className="border border-[#E5E0D8] rounded-lg p-3.5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1C1917]">{r.name}</p>
                          <p className="text-xs text-[#57534E]">
                            {r.ownerName} · {r.area}, {r.city} · {r.primaryCuisine}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateRestaurantApproval(r.id, 'Approved')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#ECF4EE] text-[#1C1917] rounded"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRestaurantApproval(r.id, 'Rejected')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#FDF2F4] text-[#8B1E35] border border-[#EAC4CC] rounded"
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
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4">
                <h2 className="text-lg font-semibold text-[#1C1917]">
                  Pending Celebration Package Approvals ({pendingPkgApprovals.length})
                </h2>
                {pendingPkgApprovals.length === 0 ? (
                  <p className="text-sm text-[#57534E]">
                    All submitted celebration packages have been audited.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingPkgApprovals.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border border-[#E5E0D8] rounded-lg p-3.5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1C1917]">{pkg.name}</p>
                          <p className="text-xs text-[#57534E]">
                            {pkg.restaurantName} · {pkg.category} · {pkg.decorationPhotos.length} decor photo(s) · ₹0 decor
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCelebrationPackageApproval(pkg.id, 'Approved')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#ECF4EE] text-[#1C1917] rounded"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCelebrationPackageApproval(pkg.id, 'Rejected')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#FDF2F4] text-[#8B1E35] border border-[#EAC4CC] rounded"
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

        {/* CITIES & LAUNCH AREAS */}
        {activeSection === 'cities' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
                Cities &amp; Launch Neighbourhoods
              </h1>
              <p className="text-sm text-[#57534E] mt-1">
                Lucknow is DineRestro&apos;s first official launch city. Add expansion cities, manage active availability, and configure neighbourhood discovery filters.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCityName.trim()) return;
                const parsedAreas = newCityAreas
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                addCity({
                  name: newCityName.trim(),
                  state: newCityState.trim() || 'Uttar Pradesh',
                  neighbourhoods: parsedAreas.length > 0 ? parsedAreas : ['Central'],
                });
                setNewCityName('');
                setNewCityAreas('');
              }}
              className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4"
            >
              <h2 className="text-base font-semibold text-[#1C1917] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#6E1E2E]" />
                Add Expansion City
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="City name (e.g., Kanpur)"
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  required
                />
                <input
                  type="text"
                  value={newCityState}
                  onChange={(e) => setNewCityState(e.target.value)}
                  placeholder="State (e.g., Uttar Pradesh)"
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  required
                />
                <input
                  type="text"
                  value={newCityAreas}
                  onChange={(e) => setNewCityAreas(e.target.value)}
                  placeholder="Neighbourhoods (comma-separated)"
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Add City to Platform
              </button>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {cities.map((c) => {
                const areaDraft = areaInputs[c.id] || '';
                const restCount = restaurants.filter(
                  (r) =>
                    r.city.toLowerCase() === c.name.toLowerCase() &&
                    r.approvalStatus === 'Approved'
                ).length;
                return (
                  <div
                    key={c.id}
                    className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                            {c.name}
                          </h3>
                          {c.isDefaultLaunchCity && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#6E1E2E] text-white rounded">
                              Default Launch City
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                              c.isActive
                                ? 'bg-[#ECF4EE] text-[#1E462A]'
                                : 'bg-[#FAF9F6] text-[#57534E] border border-[#E5E0D8]'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-xs text-[#57534E] mt-0.5">
                          {c.state}, {c.country} · {restCount} approved restaurant{restCount === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!c.isDefaultLaunchCity && (
                          <button
                            type="button"
                            onClick={() => setDefaultLaunchCity(c.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#6E1E2E] border border-[#6E1E2E] rounded-lg hover:bg-[#FAF9F6]"
                          >
                            Set Default Launch
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={c.isDefaultLaunchCity}
                          onClick={() => toggleCityActive(c.id)}
                          className="px-3 py-1.5 text-xs font-semibold border border-[#E5E0D8] rounded-lg text-[#1C1917] hover:bg-[#FAF9F6] disabled:opacity-50"
                        >
                          {c.isActive ? 'Pause City' : 'Activate City'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#1C1917]">
                        Neighbourhoods ({c.neighbourhoods.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.neighbourhoods.map((nb) => (
                          <span
                            key={nb}
                            className="px-2.5 py-1 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded text-[#1C1917]"
                          >
                            {nb}
                          </span>
                        ))}
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!areaDraft.trim()) return;
                        addCityNeighbourhood(c.id, areaDraft.trim());
                        setAreaInputs((prev) => ({ ...prev, [c.id]: '' }));
                      }}
                      className="flex gap-2 pt-2 border-t border-[#E5E0D8]"
                    >
                      <input
                        type="text"
                        value={areaDraft}
                        onChange={(e) =>
                          setAreaInputs((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder={`Add neighbourhood in ${c.name}...`}
                        className="flex-1 px-3 py-1.5 text-xs border border-[#E5E0D8] rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                      >
                        Add Area
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CUSTOMER ACCOUNTS */}
        {activeSection === 'customers' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Customer Accounts (Demo)
              </h1>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#57534E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={custQuery}
                    onChange={(e) => setCustQuery(e.target.value)}
                    placeholder="Search customer..."
                    className="pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                  />
                </div>
                <select
                  value={custFilter}
                  onChange={(e) => setCustFilter(e.target.value as typeof custFilter)}
                  className="px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Full Name</th>
                    <th className="py-3 px-4 font-semibold">Contact</th>
                    <th className="py-3 px-4 font-semibold">Preferred Cuisine</th>
                    <th className="py-3 px-4 font-semibold text-right">Bookings</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF9F6]/40">
                      <td className="py-3 px-4 font-semibold text-[#1C1917]">{c.fullName}</td>
                      <td className="py-3 px-4 text-xs text-[#57534E]">
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
                          className="px-3 py-1 text-xs font-medium border border-[#E5E0D8] rounded hover:bg-[#FAF9F6]"
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Registered Restaurant &amp; Demo Listings
                </h1>
                <p className="text-sm text-[#57534E] mt-0.5">
                  Manage verified partner venues and Lucknow fictional demo listings. Edit details, pause/activate visibility, delete, or restore demo seeds.
                </p>
              </div>
              <button
                type="button"
                onClick={seedLucknowDemoRestaurants}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Seed / Restore 12 Lucknow Demo Listings
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'Demo', 'Verified'] as const).map((tab) => {
                const count =
                  tab === 'All'
                    ? restaurants.length
                    : tab === 'Demo'
                      ? restaurants.filter((r) => Boolean(r.isDemo)).length
                      : restaurants.filter((r) => !r.isDemo).length;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setRestListingFilter(tab)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      restListingFilter === tab
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#57534E] border-[#E5E0D8] hover:border-[#6E1E2E]/40'
                    }`}
                  >
                    {tab === 'All'
                      ? `All Listings (${count})`
                      : tab === 'Demo'
                        ? `Demo Listings (${count})`
                        : `Verified Partners (${count})`}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants
                .filter((r) =>
                  restListingFilter === 'All'
                    ? true
                    : restListingFilter === 'Demo'
                      ? Boolean(r.isDemo)
                      : !r.isDemo
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={r.logoUrl}
                          alt={r.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[#E5E0D8]"
                          fallbackTitle={r.name}
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-lg font-semibold text-[#1C1917]">{r.name}</h3>
                            {r.isDemo ? (
                              <span className="px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#B8863B]/45 text-[10px] font-semibold text-[#8A5F17]">
                                Demo Listing
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[#ECF4EE] border border-[#BBD6C3] text-[10px] font-semibold text-[#1E462A]">
                                Verified Partner
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                r.isActive === false
                                  ? 'bg-[#FDF2F4] text-[#8B1E35] border border-[#EAC4CC]'
                                  : 'bg-[#F3F1ED] text-[#1C1917] border border-[#E5E0D8]'
                              }`}
                            >
                              {r.isActive === false ? 'Paused' : 'Active'}
                            </span>
                          </div>
                          <p className="text-xs text-[#57534E]">
                            {r.area}, {r.city} · {r.category || r.primaryCuisine} · {formatINR(r.priceForTwo)} for two
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={r.approvalStatus} />
                    </div>
                    <p className="text-xs text-[#57534E]">{r.address}</p>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E0D8] text-xs">
                      <div>
                        <span className="text-[#57534E]">Gallery:</span>{' '}
                        <span className="font-semibold tabular-nums">{r.photos.length}</span>
                      </div>
                      <div>
                        <span className="text-[#57534E]">Menu Pages:</span>{' '}
                        <span className="font-semibold tabular-nums">{r.menuPhotos.length}</span>
                      </div>
                      <div>
                        <span className="text-[#57534E]">Amenities:</span>{' '}
                        <span className="font-semibold tabular-nums">{r.amenities.length}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => toggleRestaurantActive(r.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#E5E0D8] rounded hover:bg-[#FAF9F6]"
                      >
                        <Power className="w-3.5 h-3.5" />
                        {r.isActive === false ? 'Activate' : 'Pause'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditRestModal(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#E5E0D8] rounded hover:bg-[#FAF9F6]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectRest(r)}
                        className="px-3 py-1.5 text-xs font-semibold border border-[#E5E0D8] rounded hover:bg-[#FAF9F6]"
                      >
                        Inspect Full Venue
                      </button>
                      {confirmDeleteRestId === r.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              deleteRestaurant(r.id);
                              setConfirmDeleteRestId(null);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#8B1E35] rounded"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRestId(null)}
                            className="px-2 py-1.5 text-xs border border-[#E5E0D8] rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteRestId(r.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#8B1E35] border border-[#EAC4CC] bg-[#FDF2F4] rounded hover:opacity-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Restaurant Approvals Queue
              </h1>
              <p className="text-sm text-[#57534E]">
                Approve or reject partner applications in local demo state. Approved restaurants appear on the public Explore page.
              </p>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Restaurant Name</th>
                    <th className="py-3 px-4 font-semibold">Owner Name</th>
                    <th className="py-3 px-4 font-semibold">City &amp; Area</th>
                    <th className="py-3 px-4 font-semibold">Cuisine</th>
                    <th className="py-3 px-4 font-semibold">Registration Date</th>
                    <th className="py-3 px-4 font-semibold">Approval Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {restaurants.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FAF9F6]/40">
                      <td className="py-3 px-4 font-semibold text-[#1C1917]">{r.name}</td>
                      <td className="py-3 px-4 text-xs text-[#57534E]">{r.ownerName}</td>
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
                          className="px-2.5 py-1 text-xs font-medium border border-[#E5E0D8] rounded hover:bg-[#FAF9F6]"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRestaurantApproval(r.id, 'Approved')}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#ECF4EE] text-[#1C1917] rounded hover:opacity-85"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRestaurantApproval(r.id, 'Rejected')}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#FDF2F4] text-[#8B1E35] border border-[#EAC4CC] rounded hover:opacity-85"
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
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Restaurant Photos Audit
                </h1>
                <p className="text-sm text-[#57534E]">
                  Inspect logos, cover photos, and interior/exterior gallery images across partner venues.
                </p>
              </div>
              <select
                value={selectedRestaurant.id}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.photos.length} photos)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-[#57534E]">Current Logo</p>
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={selectedRestaurant.logoUrl}
                    alt={selectedRestaurant.name}
                    className="w-16 h-16 rounded-lg object-cover border border-[#E5E0D8]"
                    fallbackTitle={selectedRestaurant.name}
                  />
                  <div className="text-xs text-[#57534E]">
                    <p className="font-semibold text-[#1C1917]">{selectedRestaurant.name}</p>
                    <p>{selectedRestaurant.area}, {selectedRestaurant.city}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-[#57534E]">Current Cover Photo</p>
                <div className="aspect-[16/7] rounded overflow-hidden border border-[#E5E0D8]">
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
                  className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden"
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
                      <span className="font-semibold text-[#6E1E2E]">{photo.category}</span>
                      <span className="text-[#57534E] truncate max-w-[160px]">{photo.caption}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRestaurantCover(photo.url, selectedRestaurant.id)}
                        className="flex-1 py-1 text-xs font-medium border border-[#E5E0D8] rounded hover:bg-[#FAF9F6]"
                      >
                        Set Cover
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRestaurantPhoto(photo.id, selectedRestaurant.id)}
                        className="px-2.5 py-1 text-xs text-[#8B1E35] bg-[#FDF2F4] border border-[#EAC4CC] rounded inline-flex items-center gap-1"
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
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Restaurant Amenities Control
                </h1>
                <p className="text-sm text-[#57534E]">
                  Verify and toggle all 14 standardized restaurant amenities shown on public profiles.
                </p>
              </div>
              <select
                value={selectedRestaurant.id}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.amenities.length}/14)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-lg p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_AMENITIES.map((am) => {
                  const checked = selectedRestaurant.amenities.includes(am);
                  return (
                    <label
                      key={am}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#ECF4EE]/60 border-[#6E1E2E] text-[#1C1917]'
                          : 'bg-white border-[#E5E0D8] text-[#57534E] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAmenity(selectedRestaurant, am)}
                        className="accent-[#6E1E2E]"
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
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Menu Photo Galleries
                </h1>
                <p className="text-sm text-[#57534E]">
                  Regular restaurant menus are strictly photo-based pages. Review uploaded menu photographs per restaurant.
                </p>
              </div>
              <select
                value={selectedRestaurant.id}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.menuPhotos.length} pages)
                  </option>
                ))}
              </select>
            </div>

            {selectedRestaurant.menuPhotos.length === 0 ? (
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-8 text-center text-sm text-[#57534E]">
                No menu photographs uploaded for this restaurant yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {selectedRestaurant.menuPhotos.map((mp) => (
                  <div
                    key={mp.id}
                    className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden"
                  >
                    <div className="aspect-[3/4] bg-[#FAF9F6] overflow-hidden">
                      <SafeImage
                        src={mp.url}
                        alt={mp.title}
                        className="w-full h-full object-cover"
                        fallbackTitle={mp.title}
                      />
                    </div>
                    <div className="p-3.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                          Page {mp.pageNumber}
                        </p>
                        <p className="text-sm font-medium text-[#1C1917]">{mp.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMenuPhoto(mp.id, selectedRestaurant.id)}
                        className="px-2.5 py-1 text-xs text-[#8B1E35] bg-[#FDF2F4] border border-[#EAC4CC] rounded inline-flex items-center gap-1"
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Celebration Packages Moderation
              </h1>
              <p className="text-sm text-[#57534E]">
                Verify that every celebration package includes mandatory decoration photos and displays Decoration Included – No Additional Charges (₹0).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {celebrationPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="grid grid-cols-2 gap-1 bg-[#FAF9F6] p-1">
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
                        <p className="text-xs font-semibold text-[#6E1E2E]">
                          {pkg.restaurantName} · {pkg.category}
                        </p>
                        <h3 className="text-lg font-semibold text-[#1C1917]">{pkg.name}</h3>
                      </div>
                      <StatusBadge status={pkg.approvalStatus} />
                    </div>

                    <p className="text-xs text-[#57534E]">{pkg.description}</p>

                    <div className="bg-[#ECF4EE]/60 border border-[#BBD6C3] rounded px-3 py-2 text-xs font-semibold text-[#1C1917] flex items-center justify-between">
                      <span>Decoration Included – No Additional Charges</span>
                      <span className="font-mono">₹0</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[#57534E]">Per Plate:</span>{' '}
                        <span className="font-semibold tabular-nums">
                          {formatINR(pkg.pricePerPlate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#57534E]">Plates:</span>{' '}
                        <span className="font-semibold tabular-nums">
                          {pkg.minPlates}–{pkg.maxPlates}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#57534E]">Decor Photos:</span>{' '}
                        <span className="font-semibold tabular-nums">
                          {pkg.decorationPhotos.length}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E0D8] flex justify-end gap-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => updateCelebrationPackageApproval(pkg.id, 'Approved')}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#ECF4EE] text-[#1C1917] rounded"
                      >
                        Approve Package
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCelebrationPackageApproval(pkg.id, 'Rejected')}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#FDF2F4] text-[#8B1E35] border border-[#EAC4CC] rounded"
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Celebration Decoration Photo Audit
              </h1>
              <p className="text-sm text-[#57534E]">
                All decoration photographs uploaded by partner restaurants across {activeCityConfig.name} and expansion cities. Every decoration setup is ₹0 complimentary with its celebration package.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {celebrationPackages.flatMap((pkg) =>
                pkg.decorationPhotos.map((url, idx) => (
                  <div
                    key={`${pkg.id}-dec-${idx}`}
                    className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden"
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
                        <span className="font-semibold text-[#6E1E2E]">{pkg.category}</span>
                        <StatusBadge status={pkg.approvalStatus} />
                      </div>
                      <p className="text-sm font-semibold text-[#1C1917]">{pkg.name}</p>
                      <p className="text-xs text-[#57534E]">{pkg.restaurantName}</p>
                      <p className="text-[11px] font-medium text-[#1C1917] bg-[#ECF4EE] px-2 py-0.5 rounded inline-block mt-1">
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Platform Offer Management
              </h1>
              <p className="text-sm text-[#57534E]">
                Manage active dining offers and assign Basic (₹{platformSettings.basicOfferFeePerGuest}/guest) or Premium (₹{platformSettings.premiumOfferFeePerGuest}/guest) platform booking fee tiers.
              </p>
            </div>

            <form
              onSubmit={handleCreateOffer}
              className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4"
            >
              <h2 className="text-base font-semibold text-[#1C1917] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#6E1E2E]" />
                Publish Platform Offer (Demo)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <select
                  value={offerRestId}
                  onChange={(e) => setOfferRestId(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg bg-white"
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
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  placeholder="Promo Code (e.g., LUCKNOW20)"
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg font-mono uppercase"
                />
                <input
                  type="text"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                  placeholder="Discount Label (e.g., 20% OFF)"
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
                <select
                  value={offerTier}
                  onChange={(e) => setOfferTier(e.target.value as 'Basic' | 'Premium')}
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg bg-white"
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
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg bg-white"
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
                  className="flex-1 px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
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
                    className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                        {o.code} · {o.discountLabel} · {o.offerTier} Offer (₹{feePerGuest}/guest)
                      </p>
                      <h3 className="text-base font-semibold text-[#1C1917]">{o.title}</h3>
                      <p className="text-xs text-[#57534E]">
                        {o.restaurantName} · Valid until {formatDisplayDate(o.validUntil)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleOfferActive(o.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded border shrink-0 ${
                        o.active
                          ? 'bg-[#ECF4EE] border-[#BBD6C3]'
                          : 'bg-[#FAF9F6] border-[#E5E0D8]'
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Booking Fee &amp; Advance Payment Settings
              </h1>
              <p className="text-sm text-[#57534E]">
                Configure per-guest platform booking fees for DineRestro Offer Table Bookings and default advance payment percentages for Pre-Orders and Celebration Packages.
              </p>
            </div>

            <form
              onSubmit={handleSavePlatformFees}
              className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Basic Offer Fee Per Guest (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={basicFee}
                    onChange={(e) => setBasicFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E5E0D8] rounded-lg"
                  />
                  <p className="text-[11px] text-[#57534E] mt-1">Default: ₹19 per guest</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Premium Offer Fee Per Guest (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={premiumFee}
                    onChange={(e) => setPremiumFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E5E0D8] rounded-lg"
                  />
                  <p className="text-[11px] text-[#57534E] mt-1">Default: ₹29 per guest</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Food Pre-Order Advance (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={preOrderAdvPct}
                    onChange={(e) => setPreOrderAdvPct(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E5E0D8] rounded-lg"
                  />
                  <p className="text-[11px] text-[#57534E] mt-1">Default: 50% advance</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Celebration Package Advance (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={celAdvPct}
                    onChange={(e) => setCelAdvPct(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#E5E0D8] rounded-lg"
                  />
                  <p className="text-[11px] text-[#57534E] mt-1">Default: 50% advance</p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-4 text-xs text-[#1C1917] space-y-1.5">
                <p className="font-semibold">Business Rule Enforcement:</p>
                <p>
                  • <strong>Table Reservations:</strong> ALL table bookings charge a configurable per-guest platform fee (Basic ₹{platformSettings.basicOfferFeePerGuest}/guest or Premium ₹{platformSettings.premiumOfferFeePerGuest}/guest), billed separately from restaurant food bills.
                </p>
                <p>
                  • <strong>Food Pre-Orders:</strong> Advance payment percentage is configurable per restaurant (e.g., 20%, 50%, 100%; platform default {platformSettings.defaultPreOrderAdvancePercent}%).
                </p>
                <p>
                  • <strong>Celebration Bookings:</strong> Direct booking through curated Ready-Made Celebration Packages only. Decoration charge is always ₹0 (`Decoration Included – No Additional Charges`), and optional guest notes are passed to the restaurant for confirmation.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                All Platform Table Reservations (Demo)
              </h1>
              <select
                value={resStatusFilter}
                onChange={(e) => setResStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
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

            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Restaurant</th>
                    <th className="py-3 px-4 font-semibold">Schedule</th>
                    <th className="py-3 px-4 font-semibold text-right">Guests</th>
                    <th className="py-3 px-4 font-semibold">Booking Mode &amp; Fee</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {reservations
                    .filter((r) => resStatusFilter === 'All' || r.status === resStatusFilter)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-[#FAF9F6]/40">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#6E1E2E]">
                          {r.id}
                        </td>
                        <td className="py-3 px-4 font-medium">{r.customerName}</td>
                        <td className="py-3 px-4 text-xs text-[#57534E]">{r.restaurantName}</td>
                        <td className="py-3 px-4 text-xs tabular-nums">
                          {formatDisplayDate(r.date)} · {r.time}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">{r.guests}</td>
                        <td className="py-3 px-4 text-xs">
                          <span className="font-medium text-[#1C1917]">{r.orderMode}</span>
                          <div className="text-[#6E1E2E] font-mono tabular-nums">
                            {formatINR(r.platformFeeTotal || 0)} ({r.bookingTier || r.offerTier || 'Basic'} Tier)
                          </div>
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
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Platform Food Pre-Orders (Demo)
            </h1>
            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Customer &amp; Restaurant</th>
                    <th className="py-3 px-4 font-semibold">Plate Package</th>
                    <th className="py-3 px-4 font-semibold text-right">Plates</th>
                    <th className="py-3 px-4 font-semibold text-right">Total / Advance</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {preOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-[#FAF9F6]/40">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#6E1E2E]">
                        {po.id}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-semibold text-[#1C1917]">{po.customerName}</div>
                        <div className="text-[#57534E]">
                          {po.restaurantName} · {formatDisplayDate(po.date)} {po.time}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-[#1C1917]">{po.packageName}</div>
                        <div className="text-[#57534E]">{po.foodPreference}</div>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">{po.plateCount}</td>
                      <td className="py-3 px-4 text-right text-xs tabular-nums">
                        <div className="font-semibold">{formatINR(po.totalFoodAmount)}</div>
                        <div className="text-[#6E1E2E]">
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

        {/* READY-MADE CELEBRATION BOOKINGS */}
        {activeSection === 'celebrations' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Ready-Made Celebration Bookings (Direct Flow Audit)
              </h1>
              <p className="text-sm text-[#57534E]">
                Direct package bookings with zero quotation requirement, ₹0 decoration fee enforcement, and cancellation/payment tracking.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {celebrationBookings.map((cb) => (
                <div
                  key={cb.id}
                  className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#6E1E2E]">{cb.id}</span>
                    <StatusBadge status={cb.status} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1C1917]">
                      {cb.celebrationType} — {cb.packageName}
                    </h3>
                    <p className="text-xs text-[#57534E]">
                      {cb.customerName} · {cb.restaurantName} · {formatDisplayDate(cb.eventDate)} {cb.eventTime}
                    </p>
                  </div>
                  <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Plates ({cb.platesCount} × {formatINR(cb.pricePerPlate)})</span>
                      <span className="font-semibold tabular-nums">{formatINR(cb.totalPackageAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[#1E462A]">
                      <span>Decoration Included – No Additional Charges</span>
                      <span className="font-mono font-semibold">₹0</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E5E0D8] font-semibold">
                      <span>Total / {cb.advancePercent}% Advance ({cb.advancePaid ? 'DEMO PAID' : 'Pending'})</span>
                      <span className="tabular-nums">
                        {formatINR(cb.totalPackageAmount)} / {formatINR(cb.advanceAmount)}
                      </span>
                    </div>
                  </div>
                  {(cb.customerNote || cb.specialRequests) && (
                    <p className="text-xs text-[#57534E] bg-[#FAF9F6] border border-[#E5E0D8] rounded p-2.5">
                      <strong className="text-[#1C1917]">Customer Note (Unconfirmed Request):</strong>{' '}
                      {cb.customerNote || cb.specialRequests}
                    </p>
                  )}
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
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Simulated Payment Records (DEMO ONLY)
                </h1>
                <p className="text-sm text-[#57534E]">
                  Separated transaction logs for Table Platform Booking Fees, Pre-Order Advances, and Celebration Advances. No real payments processed.
                </p>
              </div>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
              >
                <option value="All">All Payment Types</option>
                <option value="Platform Booking Fee">Platform Booking Fee</option>
                <option value="Food Pre-Order Advance">Food Pre-Order Advance</option>
                <option value="Celebration Advance">Celebration Advance</option>
                <option value="Custom Celebration Advance">Legacy Celebration Advance (Historical)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Platform Booking Fees (DEMO)</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {formatINR(totalPlatformFeesCollected)}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Food Pre-Order Advances (DEMO)</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {formatINR(totalPreOrderAdvances)}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Celebration Advances (DEMO)</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {formatINR(totalCelebrationAdvances)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Transaction ID</th>
                    <th className="py-3 px-4 font-semibold">Booking Ref</th>
                    <th className="py-3 px-4 font-semibold">Payment Type</th>
                    <th className="py-3 px-4 font-semibold">Customer &amp; Restaurant</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-[#FAF9F6]/40">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#6E1E2E]">
                        {pay.transactionId}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{pay.referenceId}</td>
                      <td className="py-3 px-4 text-xs font-medium">{pay.paymentType}</td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-semibold text-[#1C1917]">{pay.customerName}</div>
                        <div className="text-[#57534E]">{pay.restaurantName}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {formatINR(pay.amount)}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#57534E]">{pay.paymentMethod}</td>
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
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Customer Reviews Moderation
            </h1>
            <div className="space-y-3">
              {reviews.map((rv) => (
                <div
                  key={rv.id}
                  className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#57534E]">
                      <span className="font-semibold text-[#6E1E2E]">{rv.restaurantName}</span>
                      <span>· Rating {rv.rating}/5</span>
                      <span>· {formatDisplayDate(rv.date)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1C1917]">{rv.customerName}</p>
                    <p className="text-xs text-[#57534E]">{rv.comment}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleReviewVisibility(rv.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border shrink-0 ${
                      rv.visible
                        ? 'bg-[#ECF4EE] border-[#BBD6C3] text-[#1C1917]'
                        : 'bg-[#F3F1ED] border-[#E5E0D8] text-[#6E1E2E]'
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
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Support Tickets Queue (Demo)
            </h1>
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-[#6E1E2E]">{t.id}</span>
                      <span className="text-[#57534E]">
                        · {t.userName} ({t.userRole})
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#1C1917]">{t.subject}</h3>
                    <p className="text-xs text-[#57534E]">{t.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={t.status} />
                    {t.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(t.id, 'Resolved')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
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
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Platform &amp; Celebration Analytics (DEMO DATA)
              </h1>
              <p className="text-sm text-[#57534E]">
                Live session celebration metrics combined with simulated weekly demand for Phase 1 evaluation.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Ready-Made Direct Bookings</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {celebrationBookings.length}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Active {activeCityConfig.name} Venues</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#6E1E2E] mt-1">
                  {
                    restaurants.filter(
                      (r) =>
                        r.city.toLowerCase() === activeCityConfig.name.toLowerCase() &&
                        r.isActive !== false
                    ).length
                  }
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">Demo Listings / Verified</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                  {restaurants.filter((r) => Boolean(r.isDemo)).length} /{' '}
                  {restaurants.filter((r) => !r.isDemo).length}
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                <p className="text-xs text-[#57534E]">₹0 Decor Rule Compliance</p>
                <p className="text-2xl font-semibold font-mono tabular-nums text-[#1E462A] mt-1">
                  100%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Weekly Reservation Demand"
                subtitle={`Simulated bookings across ${activeCityConfig.name} localities`}
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
                barColor="#1C1917"
              />
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <div className="max-w-xl bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Platform Configuration (Demo)
            </h1>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                <span className="text-[#57534E]">Active Launch City</span>
                <span className="font-semibold">{activeCityConfig.name}, {activeCityConfig.state}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                <span className="text-[#57534E]">Backend Mode</span>
                <span className="font-mono text-xs text-[#6E1E2E]">Phase 1 Frontend Simulation</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                <span className="text-[#57534E]">Celebration Decoration Charge Rule</span>
                <span className="font-mono text-xs text-[#1C1917]">Always ₹0 (Free)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                <span className="text-[#57534E]">Table Booking Fee (Basic / Premium)</span>
                <span className="font-mono text-xs text-[#6E1E2E]">
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
                className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#1C1917]">{inspectRest.name}</h3>
              <button type="button" onClick={() => setInspectRest(null)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[16/7] rounded-lg overflow-hidden border border-[#E5E0D8]">
              <SafeImage
                src={inspectRest.image}
                alt={inspectRest.name}
                className="w-full h-full object-cover"
                fallbackTitle={inspectRest.name}
              />
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[#57534E]">Owner:</span> {inspectRest.ownerName} (
                {inspectRest.ownerEmail})
              </p>
              <p>
                <span className="text-[#57534E]">Address:</span> {inspectRest.address},{' '}
                {inspectRest.city} - {inspectRest.pinCode}
              </p>
              <p>
                <span className="text-[#57534E]">Contact:</span> {inspectRest.contactNumber}
              </p>
              <p>
                <span className="text-[#57534E]">Cuisine:</span> {inspectRest.cuisines.join(', ')}
              </p>
              <p>
                <span className="text-[#57534E]">Amenities:</span>{' '}
                {inspectRest.amenities.join(', ') || 'None selected'}
              </p>
              <p>
                <span className="text-[#57534E]">Menu Pages Uploaded:</span>{' '}
                {inspectRest.menuPhotos.length} photo page(s)
              </p>
              <p className="text-xs text-[#57534E] pt-1">{inspectRest.description}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => {
                  updateRestaurantApproval(inspectRest.id, 'Approved');
                  setInspectRest(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#ECF4EE] text-[#1C1917] rounded-lg"
              >
                Approve Venue
              </button>
              <button
                type="button"
                onClick={() => {
                  updateRestaurantApproval(inspectRest.id, 'Rejected');
                  setInspectRest(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#FDF2F4] text-[#8B1E35] border border-[#EAC4CC] rounded-lg"
              >
                Reject Venue
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Restaurant Listing Modal */}
      {editingRest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveRestEdit}
            className="bg-white border border-[#E5E0D8] rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#1C1917]">Edit Restaurant Listing</h3>
                <p className="text-xs text-[#57534E]">
                  {editingRest.isDemo ? 'Demo Listing' : 'Verified Partner'} · {editingRest.city}
                </p>
              </div>
              <button type="button" onClick={() => setEditingRest(null)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#57534E] mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#57534E] mb-1">Neighbourhood / Area</label>
                <input
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#57534E] mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as RestaurantCategory)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E0D8] rounded-lg"
                >
                  {RESTAURANT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#57534E] mb-1">Price for Two (₹)</label>
                <input
                  type="number"
                  min={200}
                  value={editPriceForTwo}
                  onChange={(e) => setEditPriceForTwo(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg tabular-nums"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#57534E] mb-1">Price Range</label>
                <select
                  value={editPriceRange}
                  onChange={(e) => setEditPriceRange(e.target.value as Restaurant['priceRange'])}
                  className="w-full px-3 py-2 bg-white border border-[#E5E0D8] rounded-lg"
                >
                  <option value="₹">₹</option>
                  <option value="₹₹">₹₹</option>
                  <option value="₹₹₹">₹₹₹</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#57534E] mb-1">Offer Tier</label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value as Restaurant['tier'])}
                  className="w-full px-3 py-2 bg-white border border-[#E5E0D8] rounded-lg"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-[#57534E] mb-1">Promotional Offer Headline</label>
              <input
                type="text"
                value={editOfferText}
                onChange={(e) => setEditOfferText(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg"
              />
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-[#57534E] mb-1">Description</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E0D8] rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => setEditingRest(null)}
                className="px-4 py-2 text-xs font-medium border border-[#E5E0D8] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Save Listing Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
