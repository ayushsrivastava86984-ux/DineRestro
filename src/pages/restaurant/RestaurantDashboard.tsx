import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Images as ImagesIcon,
  CheckSquare,
  FileImage,
  Armchair,
  CalendarClock,
  Utensils,
  PartyPopper,
  Sparkles,
  MessageSquareQuote,
  Receipt,
  Tag,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Clock,
  X,
  Bell,
  Lock,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { SafeImage } from '../../components/common/SafeImage';
import { PlatePackageEditor } from '../../components/common/PlatePackageEditor';
import {
  ALL_AMENITIES,
  CELEBRATION_CATEGORIES,
  DEMO_ANALYTICS_WEEKLY,
  IMAGES,
} from '../../data/mockData';
import type {
  AmenityType,
  CelebrationBooking,
  CelebrationCategory,
  CelebrationQuotationItem,
  CustomCelebrationRequest,
  DiningTable,
  PhotoCategory,
  PlateCourseItem,
  PreOrderStatus,
  Reservation,
} from '../../types';
import { formatDisplayDate, formatINR, getTodayISO } from '../../utils/formatters';

const RESTAURANT_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/restaurant/dashboard', icon: LayoutDashboard },
  { label: 'Restaurant Profile', to: '/restaurant/profile', icon: Store },
  { label: 'Photo Gallery', to: '/restaurant/gallery', icon: ImagesIcon },
  { label: 'Amenities', to: '/restaurant/amenities', icon: CheckSquare },
  { label: 'Menu Gallery', to: '/restaurant/menu', icon: FileImage },
  { label: 'Table Management', to: '/restaurant/tables', icon: Armchair },
  { label: 'Reservations', to: '/restaurant/reservations', icon: CalendarClock },
  { label: 'Food Pre-orders', to: '/restaurant/preorders', icon: Utensils },
  { label: 'Celebration Packages', to: '/restaurant/celebrations', icon: PartyPopper },
  { label: 'Decoration Gallery', to: '/restaurant/decorations', icon: Sparkles },
  { label: 'Celebration Reservations', to: '/restaurant/events', icon: PartyPopper },
  { label: 'Custom Requests', to: '/restaurant/custom-requests', icon: Wand2 },
  { label: 'Custom Quotations', to: '/restaurant/quotations', icon: MessageSquareQuote },
  { label: 'Payment Records', to: '/restaurant/payments', icon: Receipt },
  { label: 'Offers', to: '/restaurant/offers', icon: Tag },
  { label: 'Analytics', to: '/restaurant/analytics', icon: BarChart3 },
  { label: 'Notifications', to: '/restaurant/notifications', icon: Bell },
  { label: 'Settings', to: '/restaurant/settings', icon: Settings },
];

function readFilesAsDataUrls(
  files: FileList | null,
  callback: (urls: string[]) => void
) {
  if (!files || files.length === 0) return;
  const promises = Array.from(files).map(
    (file) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      })
  );
  Promise.all(promises).then((urls) => {
    const valid = urls.filter(Boolean);
    if (valid.length > 0) callback(valid);
  });
}

export function RestaurantDashboard() {
  const location = useLocation();
  const {
    activeRestaurant,
    updateActiveRestaurantProfile,
    updateRestaurantPreOrderAdvance,
    setRestaurantLogo,
    setRestaurantCover,
    addRestaurantPhotos,
    replaceRestaurantPhoto,
    deleteRestaurantPhoto,
    updateRestaurantAmenities,
    addMenuPhotos,
    replaceMenuPhoto,
    deleteMenuPhoto,
    reorderMenuPhoto,
    preOrderPackages,
    addPreOrderPackage,
    deletePreOrderPackage,
    preOrders,
    updatePreOrderStatus,
    celebrationPackages,
    addCelebrationPackage,
    deleteCelebrationPackage,
    celebrationBookings,
    updateCelebrationBookingStatus,
    customRequests,
    markCustomRequestUnderReview,
    upsertAndSendCustomQuotation,
    updateCustomRequestStatus,
    reservations,
    updateReservationStatus,
    tables,
    updateTableStatus,
    addTable,
    offers,
    addOffer,
    toggleOfferActive,
    payments,
    notifications,
    markAllNotificationsRead,
    addToast,
  } = useApp();

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedCelReservation, setSelectedCelReservation] = useState<CelebrationBooking | null>(null);
  const [resFilter, setResFilter] = useState<string>('All');
  const [menuPreviewUrl, setMenuPreviewUrl] = useState<{ url: string; title: string } | null>(null);

  // Photo upload helper state
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>('Interior');
  const [photoCaption, setPhotoCaption] = useState('');

  // Menu photo upload helper state
  const [menuPageTitle, setMenuPageTitle] = useState('');

  // Profile form state
  const [profName, setProfName] = useState(activeRestaurant.name);
  const [profAddress, setProfAddress] = useState(activeRestaurant.address);
  const [profHours, setProfHours] = useState(activeRestaurant.openingHours);
  const [profContact, setProfContact] = useState(activeRestaurant.contactNumber);
  const [profDesc, setProfDesc] = useState(activeRestaurant.description);

  // Table state
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);
  const [newTableZone, setNewTableZone] = useState<DiningTable['zone']>('Rooftop');

  // Pre-Order Plate Package Builder state
  const [prePkgName, setPrePkgName] = useState('');
  const [prePkgDesc, setPrePkgDesc] = useState('');
  const [prePkgPrice, setPrePkgPrice] = useState(699);
  const [prePkgMin, setPrePkgMin] = useState(2);
  const [prePkgDiet, setPrePkgDiet] = useState<'Veg' | 'Non-Veg' | 'Veg & Non-Veg'>('Veg');
  const [prePkgItems, setPrePkgItems] = useState<PlateCourseItem[]>([]);

  // Celebration Package Builder state (Decoration always ₹0, photos mandatory)
  const [celName, setCelName] = useState('');
  const [celCategory, setCelCategory] = useState<CelebrationCategory>('Birthday');
  const [celDesc, setCelDesc] = useState('');
  const [celDecorDetails, setCelDecorDetails] = useState('');
  const [celDecorPhotos, setCelDecorPhotos] = useState<string[]>([]);
  const [celPrice, setCelPrice] = useState(1199);
  const [celMinPlates, setCelMinPlates] = useState(6);
  const [celMaxPlates, setCelMaxPlates] = useState(30);
  const [celDiet, setCelDiet] = useState<'Veg' | 'Non-Veg' | 'Veg & Non-Veg'>('Veg');
  const [celInstructions, setCelInstructions] = useState('');
  const [celItems, setCelItems] = useState<PlateCourseItem[]>([]);
  const [celFormError, setCelFormError] = useState('');

  // Structured Custom Celebration Quotation Builder state
  const [customQuoteReqId, setCustomQuoteReqId] = useState<string | null>(null);
  const [qFoodDetails, setQFoodDetails] = useState('');
  const [qPricePerPlate, setQPricePerPlate] = useState(1250);
  const [qPlatesCount, setQPlatesCount] = useState(10);
  const [qCakeCharge, setQCakeCharge] = useState(1200);
  const [qSpecialServices, setQSpecialServices] = useState('');
  const [qDecorDetails, setQDecorDetails] = useState('');
  const [qAdditionalServices, setQAdditionalServices] = useState('');
  const [qLineItems, setQLineItems] = useState<CelebrationQuotationItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CelebrationQuotationItem['category']>('Service');
  const [newItemAmount, setNewItemAmount] = useState(500);
  const [qAdvancePct, setQAdvancePct] = useState(50);
  const [qValidUntil, setQValidUntil] = useState('2026-12-10');
  const [qTerms, setQTerms] = useState(
    'Advance payment confirms custom celebration slot and menu preparation. Remaining balance settled at restaurant.'
  );
  const [qAdditionalNotes, setQAdditionalNotes] = useState('');

  const openQuotationBuilder = (req: CustomCelebrationRequest) => {
    if (req.quotation?.locked) {
      addToast({
        type: 'error',
        title: 'Quotation Locked',
        description: 'This quotation has been accepted by the customer and cannot be modified.',
      });
      return;
    }
    const existing = req.quotation;
    setCustomQuoteReqId(req.id);
    setQFoodDetails(
      existing?.foodPackageDetails ||
        `${req.guestsCount} guests · ${req.foodPreferences} (${req.vegNonVegPreference})`
    );
    setQPricePerPlate(
      existing?.pricePerPlate ??
        Math.max(500, Math.round((req.estimatedBudget * 0.85) / Math.max(1, req.guestsCount)))
    );
    setQPlatesCount(existing?.platesCount ?? req.guestsCount);
    setQCakeCharge(existing?.cakeCharge ?? (req.cakeRequirements.toLowerCase().includes('no') ? 0 : 1200));
    setQSpecialServices(existing?.specialServicesNotes || '');
    setQDecorDetails(
      existing?.decorationDetails || `${req.decorationTheme} (${req.preferredColors}) — ${req.decorationRequirements}`
    );
    setQAdditionalServices(existing?.additionalIncludedServices || 'Dedicated celebration table steward');
    setQLineItems(existing?.lineItems || []);
    setQAdvancePct(existing?.advancePercent ?? req.advancePercent ?? 50);
    setQValidUntil(existing?.validUntil || req.preferredDate || getTodayISO());
    setQTerms(
      existing?.termsAndConditions ||
        'Advance payment confirms custom celebration setup and food preparation. Balance due at restaurant.'
    );
    setQAdditionalNotes(existing?.additionalNotes || 'Decoration Included – No Additional Charges (₹0).');
  };

  const qFoodSubtotal = Math.max(0, qPricePerPlate) * Math.max(1, qPlatesCount);
  const qLineItemsTotal = qLineItems.reduce((sum, li) => sum + Math.max(0, li.amount), 0);
  const qGrandTotal = qFoodSubtotal + Math.max(0, qCakeCharge) + qLineItemsTotal; // Decoration is ALWAYS ₹0
  const qAdvanceAmt = Math.round((qGrandTotal * qAdvancePct) / 100);
  const qRemainingAmt = qGrandTotal - qAdvanceAmt;

  // Pre-Order Advance Percentage custom input state
  const [customAdvancePct, setCustomAdvancePct] = useState<number>(
    activeRestaurant.preOrderAdvancePercent
  );

  // Offer state
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerLabel, setOfferLabel] = useState('Flat 15% Off');
  const [offerTier, setOfferTier] = useState<'Basic' | 'Premium'>('Basic');

  const path = location.pathname;
  const activeSection =
    path.includes('/restaurant/profile')
      ? 'profile'
      : path.includes('/restaurant/gallery')
        ? 'gallery'
        : path.includes('/restaurant/amenities')
          ? 'amenities'
          : path.includes('/restaurant/menu')
            ? 'menu'
            : path.includes('/restaurant/tables')
              ? 'tables'
              : path.includes('/restaurant/reservations')
                ? 'reservations'
                : path.includes('/restaurant/preorders')
                  ? 'preorders'
                  : path.includes('/restaurant/celebrations')
                    ? 'celebrations'
                    : path.includes('/restaurant/decorations')
                      ? 'decorations'
                      : path.includes('/restaurant/custom-requests')
                        ? 'custom-requests'
                        : path.includes('/restaurant/events')
                          ? 'events'
                          : path.includes('/restaurant/quotations')
                            ? 'quotations'
                            : path.includes('/restaurant/payments')
                              ? 'payments'
                              : path.includes('/restaurant/offers')
                                ? 'offers'
                                : path.includes('/restaurant/analytics')
                                  ? 'analytics'
                                  : path.includes('/restaurant/notifications')
                                    ? 'notifications'
                                    : path.includes('/restaurant/settings')
                                      ? 'settings'
                                      : 'overview';

  const restReservations = reservations.filter((r) => r.restaurantId === activeRestaurant.id);
  const displayReservations = restReservations.length > 0 ? restReservations : reservations;
  const restPreOrders = preOrders.filter((p) => p.restaurantId === activeRestaurant.id);
  const displayPreOrders = restPreOrders.length > 0 ? restPreOrders : preOrders;
  const restPrePackages = preOrderPackages.filter((p) => p.restaurantId === activeRestaurant.id);
  const restCelPackages = celebrationPackages.filter((c) => c.restaurantId === activeRestaurant.id);
  const restCelBookings = celebrationBookings.filter((c) => c.restaurantId === activeRestaurant.id);
  const displayCelBookings = restCelBookings.length > 0 ? restCelBookings : celebrationBookings;
  const restCustomRequests = customRequests.filter((c) => c.restaurantId === activeRestaurant.id);
  const displayCustomRequests = restCustomRequests.length > 0 ? restCustomRequests : customRequests;
  const restTables = tables.filter((t) => t.restaurantId === activeRestaurant.id);
  const displayTables = restTables.length > 0 ? restTables : tables;
  const restOffers = offers.filter((o) => o.restaurantId === activeRestaurant.id);
  const restPayments = payments.filter((p) => p.restaurantName === activeRestaurant.name);
  const restNotifications = notifications.filter((n) => n.role === 'restaurant');

  const toggleAmenity = (amenity: AmenityType) => {
    const exists = activeRestaurant.amenities.includes(amenity);
    const updated = exists
      ? activeRestaurant.amenities.filter((a) => a !== amenity)
      : [...activeRestaurant.amenities, amenity];
    updateRestaurantAmenities(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveRestaurantProfile({
      name: profName.trim() || activeRestaurant.name,
      address: profAddress.trim() || activeRestaurant.address,
      openingHours: profHours.trim() || activeRestaurant.openingHours,
      contactNumber: profContact.trim() || activeRestaurant.contactNumber,
      description: profDesc.trim() || activeRestaurant.description,
    });
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;
    addTable({
      tableNumber: newTableNum.trim().toUpperCase(),
      capacity: Number(newTableCap),
      zone: newTableZone,
      status: 'Available',
    });
    setNewTableNum('');
  };

  const handleCreatePreOrderPkg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prePkgName.trim() || prePkgItems.length === 0) {
      addToast({
        type: 'error',
        title: 'Complete Plate Package',
        description: 'Enter a package name and add at least 1 plate item.',
      });
      return;
    }
    addPreOrderPackage({
      name: prePkgName.trim(),
      description: prePkgDesc.trim() || 'Freshly prepared multi-course plate package.',
      dietaryType: prePkgDiet,
      pricePerPlate: Number(prePkgPrice),
      minPlates: Number(prePkgMin),
      available: true,
      plateItems: prePkgItems,
    });
    setPrePkgName('');
    setPrePkgDesc('');
    setPrePkgItems([]);
  };

  const handleCreateCelebrationPkg = (e: React.FormEvent) => {
    e.preventDefault();
    setCelFormError('');
    if (!celName.trim()) {
      setCelFormError('Package name is required.');
      return;
    }
    if (celDecorPhotos.length === 0) {
      setCelFormError(
        'At least one real decoration photograph is mandatory before submitting a celebration package for approval.'
      );
      return;
    }
    if (celItems.length === 0) {
      setCelFormError('Please add at least one food item included in each plate.');
      return;
    }
    addCelebrationPackage({
      name: celName.trim(),
      category: celCategory,
      description: celDesc.trim() || 'Complete celebration dining and complimentary decor.',
      decorationPhotos: celDecorPhotos,
      decorationDetails:
        celDecorDetails.trim() || 'Curated floral centerpiece & candle styling (₹0).',
      pricePerPlate: Number(celPrice),
      minPlates: Number(celMinPlates),
      maxPlates: Number(celMaxPlates),
      dietaryType: celDiet,
      plateItems: celItems,
      available: true,
      specialInstructions: celInstructions.trim() || '24 hours advance booking preferred.',
    });
    setCelName('');
    setCelDesc('');
    setCelDecorDetails('');
    setCelDecorPhotos([]);
    setCelItems([]);
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !offerCode.trim()) return;
    addOffer({
      title: offerTitle.trim(),
      code: offerCode.trim().toUpperCase(),
      discountLabel: offerLabel,
      offerTier,
      restaurantId: activeRestaurant.id,
      restaurantName: activeRestaurant.name,
      area: activeRestaurant.area,
      validUntil: '2026-12-31',
      terms: `Valid on DineRestro bookings (${offerTier} Offer tier).`,
      active: true,
      category: 'Flat Discount',
    });
    setOfferTitle('');
    setOfferCode('');
  };

  return (
    <DashboardLayout
      portalRole="restaurant"
      portalLabel="Restaurant Partner Portal"
      userTitle={activeRestaurant.name}
      userSubtitle={`${activeRestaurant.area}, ${activeRestaurant.city} · ${activeRestaurant.ownerName}`}
      navItems={RESTAURANT_NAV}
    >
      <div className="space-y-6">
        {activeRestaurant.approvalStatus === 'Pending Approval' && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#FAF9F6] border border-[#6E1E2E]/30 text-sm text-[#1C1917]">
            <Clock className="w-4 h-4 text-[#6E1E2E] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#6E1E2E]">
                Your restaurant registration is pending approval.{' '}
              </span>
              <span className="text-xs text-[#57534E]">
                (Phase 1 Demo Status — Admin can approve or reject in the Admin Demo Portal.)
              </span>
            </div>
          </div>
        )}

        <DemoBanner message="Restaurant Partner Portal (DEMO MODE). Photo uploads, photo-based menu gallery, plate-wise packages, free-decoration celebrations, and quotations operate in local frontend state." />

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
                  {activeRestaurant.name} Overview
                </h1>
                <p className="text-sm text-[#57534E] mt-1">
                  Reservations, food pre-orders, celebration bookings, custom quotations &amp; sample revenue (DEMO DATA).
                </p>
              </div>
              <StatusBadge status={activeRestaurant.approvalStatus} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Reservations', val: displayReservations.length },
                { label: 'Food Pre-Orders', val: displayPreOrders.length },
                { label: 'Celebration Bookings', val: displayCelBookings.length },
                { label: 'Menu Pages', val: activeRestaurant.menuPhotos.length },
                { label: 'Celebration Pkgs', val: restCelPackages.length },
                { label: 'Sample Revenue (Demo)', val: formatINR(184500) },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-[#E5E0D8] rounded-lg p-4">
                  <p className="text-xs text-[#57534E]">{stat.label}</p>
                  <p className="text-xl font-semibold font-mono tabular-nums text-[#1C1917] mt-1">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Weekly Demo Reservations"
                subtitle="Simulated daily table turns"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Weekly Sample Revenue (INR)"
                subtitle="Estimated demo dining revenue (not actual revenue)"
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

        {/* RESTAURANT PROFILE */}
        {activeSection === 'profile' && (
          <div className="max-w-2xl bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Restaurant Profile
            </h1>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={profHours}
                    onChange={(e) => setProfHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Host Desk Phone</label>
                  <input
                    type="tel"
                    value={profContact}
                    onChange={(e) => setProfContact(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={profDesc}
                  onChange={(e) => setProfDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Save Restaurant Details (Demo)
              </button>
            </form>
          </div>
        )}

        {/* PHOTO GALLERY & LOGO/COVER MANAGEMENT */}
        {activeSection === 'gallery' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Restaurant Photo Gallery, Logo &amp; Cover Photo
              </h1>
              <p className="text-sm text-[#57534E]">
                Upload multiple Interior, Exterior, Dining Area, Ambience, and Gallery photos, preview, replace, delete, or set cover photo.
              </p>
            </div>

            {/* Logo & Cover */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                <h2 className="text-base font-semibold text-[#1C1917]">Restaurant Logo</h2>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#E5E0D8] shrink-0">
                    <SafeImage src={activeRestaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg cursor-pointer hover:bg-[#541522]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          readFilesAsDataUrls(e.target.files, (urls) => setRestaurantLogo(urls[0]))
                        }
                      />
                    </label>
                    <p className="text-[11px] text-[#57534E]">Stored in browser preview state.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                <h2 className="text-base font-semibold text-[#1C1917]">Active Cover Photo</h2>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-[#E5E0D8] shrink-0">
                    <SafeImage src={activeRestaurant.image} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg cursor-pointer hover:bg-[#541522]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Cover Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          readFilesAsDataUrls(e.target.files, (urls) => setRestaurantCover(urls[0]))
                        }
                      />
                    </label>
                    <p className="text-[11px] text-[#57534E]">Or click &ldquo;Set as Cover&rdquo; on any photo below.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Multiple Upload Controls */}
            <div className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-4">
              <h2 className="text-base font-semibold text-[#1C1917]">
                Upload Multiple Restaurant Photos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold mb-1">Photo Category</label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value as PhotoCategory)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                  >
                    <option>Interior</option>
                    <option>Exterior</option>
                    <option>Dining Area</option>
                    <option>Ambience</option>
                    <option>Gallery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Caption</label>
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="e.g., Sunset terrace table layout"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg cursor-pointer hover:bg-[#541522]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Image Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        readFilesAsDataUrls(e.target.files, (urls) => {
                          addRestaurantPhotos(
                            urls.map((url, idx) => ({
                              url,
                              category: photoCategory,
                              caption: photoCaption.trim() || `${photoCategory} view ${idx + 1}`,
                            }))
                          );
                          setPhotoCaption('');
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addRestaurantPhotos([
                        {
                          url: IMAGES.modernBistro,
                          category: photoCategory,
                          caption: photoCaption.trim() || `Sample ${photoCategory} photo`,
                        },
                      ])
                    }
                    className="px-3 py-2 text-xs font-semibold border border-[#E5E0D8] rounded-lg hover:bg-[#FAF9F6]"
                  >
                    + Add Sample Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeRestaurant.photos.map((photo) => (
                <div key={photo.id} className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <SafeImage src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#6E1E2E]">{photo.category}</p>
                      <p className="text-sm font-medium text-[#1C1917] mt-0.5">{photo.caption}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E0D8]">
                      <button
                        type="button"
                        onClick={() => setRestaurantCover(photo.url)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#FAF9F6] border border-[#E5E0D8] rounded hover:border-[#6E1E2E]"
                      >
                        Set as Cover
                      </button>
                      <label className="px-2.5 py-1 text-xs font-medium border border-[#E5E0D8] rounded cursor-pointer hover:bg-[#FAF9F6]">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            readFilesAsDataUrls(e.target.files, (urls) =>
                              replaceRestaurantPhoto(photo.id, urls[0])
                            )
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteRestaurantPhoto(photo.id)}
                        className="px-2.5 py-1 text-xs font-medium text-[#6E1E2E] border border-[#E5E0D8] rounded hover:bg-[#F3F1ED]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AMENITIES */}
        {activeSection === 'amenities' && (
          <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Restaurant Amenities
              </h1>
              <p className="text-sm text-[#57534E] mt-1">
                Select amenities available at {activeRestaurant.name}. Selected amenities appear directly on customer discovery and restaurant profiles.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_AMENITIES.map((amenity) => {
                const checked = activeRestaurant.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#6E1E2E] bg-[#FAF9F6]'
                        : 'border-[#E5E0D8] bg-white hover:bg-[#FAF9F6]/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="accent-[#6E1E2E] w-4 h-4"
                    />
                    <span className="text-sm font-medium text-[#1C1917]">{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* PHOTO-BASED MENU GALLERY (NO INDIVIDUAL DISH UPLOADS) */}
        {activeSection === 'menu' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Menu Gallery (Photo-Based Menu Pages)
              </h1>
              <p className="text-sm text-[#57534E] mt-1">
                Upload photographs of your complete printed menu pages. Customers inspect these pages before booking or pre-ordering plates.
              </p>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold mb-1">Menu Page Label</label>
                <input
                  type="text"
                  value={menuPageTitle}
                  onChange={(e) => setMenuPageTitle(e.target.value)}
                  placeholder="e.g., Starters, Curries & Breads Menu"
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg cursor-pointer hover:bg-[#541522]">
                <Upload className="w-4 h-4" />
                <span>Upload Menu Page Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    readFilesAsDataUrls(e.target.files, (urls) => {
                      addMenuPhotos(
                        urls.map((url, idx) => ({
                          url,
                          title: menuPageTitle.trim() || `Uploaded Menu Page ${idx + 1}`,
                        }))
                      );
                      setMenuPageTitle('');
                    })
                  }
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  addMenuPhotos([
                    {
                      url: IMAGES.menuHeritage,
                      title: menuPageTitle.trim() || 'Seasonal Specials Menu Sheet',
                    },
                  ])
                }
                className="px-4 py-2.5 text-xs font-semibold border border-[#E5E0D8] rounded-lg hover:bg-[#FAF9F6]"
              >
                + Add Sample Menu Page
              </button>
            </div>

            {activeRestaurant.menuPhotos.length === 0 ? (
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-10 text-center text-sm text-[#57534E]">
                No menu photos uploaded yet. Upload your first menu page photograph above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeRestaurant.menuPhotos.map((page, index) => (
                  <div key={page.id} className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden flex flex-col">
                    <button
                      type="button"
                      onClick={() => setMenuPreviewUrl({ url: page.url, title: page.title })}
                      className="aspect-[3/4] w-full overflow-hidden bg-[#FAF9F6]"
                    >
                      <SafeImage src={page.url} alt={page.title} className="w-full h-full object-cover" />
                    </button>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                          Page {page.pageNumber}
                        </p>
                        <p className="text-sm font-semibold text-[#1C1917]">{page.title}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E0D8]">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => reorderMenuPhoto(page.id, 'up')}
                          className="p-1.5 border border-[#E5E0D8] rounded disabled:opacity-40"
                          title="Move page earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === activeRestaurant.menuPhotos.length - 1}
                          onClick={() => reorderMenuPhoto(page.id, 'down')}
                          className="p-1.5 border border-[#E5E0D8] rounded disabled:opacity-40"
                          title="Move page later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <label className="px-2.5 py-1 text-xs font-medium border border-[#E5E0D8] rounded cursor-pointer hover:bg-[#FAF9F6]">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              readFilesAsDataUrls(e.target.files, (urls) =>
                                replaceMenuPhoto(page.id, urls[0])
                              )
                            }
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => deleteMenuPhoto(page.id)}
                          className="ml-auto px-2.5 py-1 text-xs font-medium text-[#6E1E2E] border border-[#E5E0D8] rounded hover:bg-[#F3F1ED]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TABLE MANAGEMENT */}
        {activeSection === 'tables' && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Table Management
            </h1>
            <form
              onSubmit={handleAddTable}
              className="bg-white border border-[#E5E0D8] rounded-lg p-4 flex flex-wrap items-end gap-3"
            >
              <div>
                <label className="block text-xs font-semibold mb-1">Table No.</label>
                <input
                  type="text"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="RT-04"
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg w-28"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Capacity</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={newTableCap}
                  onChange={(e) => setNewTableCap(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg w-24 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Zone</label>
                <select
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value as DiningTable['zone'])}
                  className="px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                >
                  <option>Rooftop</option>
                  <option>Courtyard</option>
                  <option>Indoor AC</option>
                  <option>Private Lounge</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Table</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTables.map((tbl) => (
                <div key={tbl.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-semibold text-[#1C1917]">{tbl.tableNumber}</span>
                    <StatusBadge status={tbl.status} />
                  </div>
                  <p className="text-xs text-[#57534E] tabular-nums">
                    {tbl.zone} · Seats {tbl.capacity} guests
                  </p>
                  <div className="flex gap-2">
                    {(['Available', 'Reserved', 'Occupied'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateTableStatus(tbl.id, st)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded border ${
                          tbl.status === st
                            ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                            : 'border-[#E5E0D8] hover:bg-[#FAF9F6]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESERVATIONS */}
        {activeSection === 'reservations' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Table Reservations
              </h1>
              <div className="flex flex-wrap gap-1.5 bg-white border border-[#E5E0D8] p-1 rounded-lg">
                {['All', 'Pending', 'Accepted', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setResFilter(status)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      resFilter === status
                        ? 'bg-[#6E1E2E] text-white'
                        : 'text-[#1C1917] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Guest</th>
                    <th className="py-3 px-4 font-semibold">Booking Mode</th>
                    <th className="py-3 px-4 font-semibold">Schedule</th>
                    <th className="py-3 px-4 font-semibold text-right">Guests</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {displayReservations
                    .filter((r) => resFilter === 'All' || r.status === resFilter)
                    .map((res) => (
                      <tr key={res.id} className="hover:bg-[#FAF9F6]/40">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#1C1917]">{res.customerName}</p>
                          <p className="text-xs text-[#57534E] tabular-nums">{res.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className="font-medium text-[#1C1917]">{res.orderMode}</span>
                          <p className="text-[11px] text-[#6E1E2E] tabular-nums">
                            {res.bookingTier || res.offerTier || 'Basic'} Tier · Platform Fee: {formatINR(res.platformFeeTotal || 0)}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs tabular-nums">
                          {formatDisplayDate(res.date)} · {res.time}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">{res.guests}</td>
                        <td className="py-3 px-4"><StatusBadge status={res.status} /></td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Accepted')}
                            className="px-2 py-1 text-xs font-semibold bg-[#ECF4EE] rounded"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Confirmed')}
                            className="px-2 py-1 text-xs font-semibold border border-[#E5E0D8] rounded"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Completed')}
                            className="px-2 py-1 text-xs font-semibold border border-[#E5E0D8] rounded"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Rejected')}
                            className="px-2 py-1 text-xs font-semibold bg-[#FDF2F4] text-[#8B1E35] border border-[#EAC4CC] rounded"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedReservation(res)}
                            className="px-2 py-1 text-xs font-medium border border-[#E5E0D8] rounded"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOD PRE-ORDERS + PLATE-WISE PRE-ORDER PACKAGE BUILDER */}
        {activeSection === 'preorders' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Food Pre-Orders &amp; Plate-Wise Packages
                </h1>
                <p className="text-sm text-[#57534E] mt-1">
                  Configure your venue&apos;s pre-order advance percentage, review incoming customer pre-orders, and manage structured plate packages.
                </p>
              </div>
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-3.5 space-y-2 min-w-[280px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#1C1917]">
                    Pre-Order Advance Policy
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#6E1E2E]">
                    {activeRestaurant.preOrderAdvancePercent}% Required
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[20, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setCustomAdvancePct(pct);
                        updateRestaurantPreOrderAdvance(pct);
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                        activeRestaurant.preOrderAdvancePercent === pct
                          ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                          : 'bg-[#FAF9F6] border-[#E5E0D8] text-[#1C1917]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={customAdvancePct}
                      onChange={(e) => setCustomAdvancePct(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs font-mono border border-[#E5E0D8] rounded"
                      aria-label="Custom advance percentage"
                    />
                    <button
                      type="button"
                      onClick={() => updateRestaurantPreOrderAdvance(customAdvancePct)}
                      className="px-2.5 py-1 text-xs font-semibold border border-[#6E1E2E] text-[#6E1E2E] rounded hover:bg-[#FAF9F6]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Incoming Pre-Orders */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#1C1917]">
                Incoming Food Pre-Orders ({displayPreOrders.length})
              </h2>
              {displayPreOrders.map((po) => (
                <div key={po.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                        {po.id} · {formatDisplayDate(po.date)} at {po.time}
                      </p>
                      <h3 className="text-lg font-semibold text-[#1C1917]">
                        {po.customerName} — {po.plateCount} × {po.packageName}
                      </h3>
                      <p className="text-xs text-[#57534E]">
                        Preference: {po.foodPreference} · Total: {formatINR(po.totalFoodAmount)} · Advance ({po.advancePercent}%): {formatINR(po.advanceAmount)} ({po.advancePaid ? 'DEMO PAID' : 'Unpaid'}) · Remaining at Venue: {formatINR(po.remainingAmount)}
                      </p>
                    </div>
                    <StatusBadge status={po.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ['Accepted', 'Preparing', 'Ready', 'Completed', 'Rejected'] as PreOrderStatus[]
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updatePreOrderStatus(po.id, st)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded border ${
                          po.status === st
                            ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                            : 'border-[#E5E0D8] hover:bg-[#FAF9F6]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pre-Order Plate Package Builder */}
            <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-5">
              <h2 className="text-xl font-semibold text-[#1C1917]">
                Create Pre-Order Plate Package (Structured Food Management)
              </h2>
              <form onSubmit={handleCreatePreOrderPkg} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">Package Name *</label>
                    <input
                      type="text"
                      value={prePkgName}
                      onChange={(e) => setPrePkgName(e.target.value)}
                      placeholder="e.g., Varanasi Evening Thali Plate"
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Price / Plate (₹)</label>
                    <input
                      type="number"
                      min={150}
                      value={prePkgPrice}
                      onChange={(e) => setPrePkgPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Min Plates</label>
                    <input
                      type="number"
                      min={1}
                      value={prePkgMin}
                      onChange={(e) => setPrePkgMin(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">Short Description</label>
                    <input
                      type="text"
                      value={prePkgDesc}
                      onChange={(e) => setPrePkgDesc(e.target.value)}
                      placeholder="Prepared fresh for table arrival time"
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Dietary Option</label>
                    <select
                      value={prePkgDiet}
                      onChange={(e) => setPrePkgDiet(e.target.value as typeof prePkgDiet)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                    >
                      <option>Veg</option>
                      <option>Non-Veg</option>
                      <option>Veg &amp; Non-Veg</option>
                    </select>
                  </div>
                </div>

                <PlatePackageEditor items={prePkgItems} onChange={setPrePkgItems} />

                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                >
                  Publish Pre-Order Plate Package (Demo)
                </button>
              </form>

              <div className="pt-4 border-t border-[#E5E0D8] grid grid-cols-1 md:grid-cols-2 gap-4">
                {restPrePackages.map((pkg) => (
                  <div key={pkg.id} className="border border-[#E5E0D8] rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-[#1C1917]">{pkg.name}</h3>
                        <p className="text-xs text-[#57534E]">
                          {pkg.dietaryType} · Min {pkg.minPlates} plates · {formatINR(pkg.pricePerPlate)}/plate
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deletePreOrderPackage(pkg.id)}
                        className="p-1.5 text-[#8B1E35] hover:bg-[#FDF2F4] rounded"
                        aria-label="Delete pre-order package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#57534E] space-y-0.5">
                      {pkg.plateItems.map((pi) => (
                        <div key={pi.id}>
                          <strong className="text-[#1C1917]">{pi.course}:</strong> {pi.itemName} ({pi.quantity})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CELEBRATION PACKAGES BUILDER (DECORATION ALWAYS FREE ₹0, PHOTOS MANDATORY) */}
        {activeSection === 'celebrations' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Celebration Packages Builder
              </h1>
              <p className="text-sm text-[#57534E] mt-1">
                Decoration is included free (₹0) with every celebration package. At least one real decoration photograph is mandatory before submitting for approval.
              </p>
            </div>

            <form
              onSubmit={handleCreateCelebrationPkg}
              className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-[#1C1917]">
                  Build New Celebration Package
                </h2>
                <span className="px-3 py-1 rounded bg-[#ECF4EE] border border-[#BBD6C3] text-xs font-semibold text-[#1C1917]">
                  Decoration Included – No Additional Charges (₹0)
                </span>
              </div>

              {celFormError && (
                <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
                  {celFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Package Name *</label>
                  <input
                    type="text"
                    value={celName}
                    onChange={(e) => setCelName(e.target.value)}
                    placeholder="e.g., Sunset Marigold Anniversary Table"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Celebration Category *</label>
                  <select
                    value={celCategory}
                    onChange={(e) => setCelCategory(e.target.value as CelebrationCategory)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                  >
                    {CELEBRATION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Price / Plate (₹)</label>
                  <input
                    type="number"
                    min={200}
                    value={celPrice}
                    onChange={(e) => setCelPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Min Plates</label>
                  <input
                    type="number"
                    min={2}
                    value={celMinPlates}
                    onChange={(e) => setCelMinPlates(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Plates</label>
                  <input
                    type="number"
                    min={2}
                    value={celMaxPlates}
                    onChange={(e) => setCelMaxPlates(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Dietary Option</label>
                  <select
                    value={celDiet}
                    onChange={(e) => setCelDiet(e.target.value as typeof celDiet)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                  >
                    <option>Veg</option>
                    <option>Non-Veg</option>
                    <option>Veg &amp; Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Package Description</label>
                  <textarea
                    rows={2}
                    value={celDesc}
                    onChange={(e) => setCelDesc(e.target.value)}
                    placeholder="Describe seating ambiance and hospitality experience..."
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Included Decoration Details (Always ₹0)
                  </label>
                  <textarea
                    rows={2}
                    value={celDecorDetails}
                    onChange={(e) => setCelDecorDetails(e.target.value)}
                    placeholder="Marigold floral runner, candle holders, personalized table card..."
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  />
                </div>
              </div>

              {/* Mandatory Decoration Photographs */}
              <div className="border border-[#E5E0D8] rounded-lg p-4 bg-[#FAF9F6]/45 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#1C1917]">
                      Decoration Photographs (Mandatory * — {celDecorPhotos.length} uploaded)
                    </p>
                    <p className="text-[11px] text-[#57534E]">
                      Upload real setup photographs of your venue&apos;s celebration decor.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Decor Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          readFilesAsDataUrls(e.target.files, (urls) =>
                            setCelDecorPhotos((prev) => [...prev, ...urls])
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setCelDecorPhotos((prev) => [
                          ...prev,
                          IMAGES.decorBirthday,
                          IMAGES.decorProposal,
                        ])
                      }
                      className="px-3 py-2 text-xs font-semibold border border-[#E5E0D8] bg-white rounded-lg"
                    >
                      + Use Sample Decor Photos
                    </button>
                  </div>
                </div>

                {celDecorPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {celDecorPhotos.map((url, idx) => (
                      <div key={`new-dec-${idx}`} className="relative aspect-[4/3] rounded overflow-hidden border border-[#E5E0D8]">
                        <SafeImage src={url} alt={`Decor ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setCelDecorPhotos((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-[#6E1E2E]"
                          aria-label="Remove decor photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <PlatePackageEditor items={celItems} onChange={setCelItems} />

              <div>
                <label className="block text-xs font-semibold mb-1">Special Instructions</label>
                <input
                  type="text"
                  value={celInstructions}
                  onChange={(e) => setCelInstructions(e.target.value)}
                  placeholder="Cake timing, music slot, advance notice..."
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Submit Celebration Package for Admin Approval (Demo)
              </button>
            </form>

            {/* Existing Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {restCelPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#6E1E2E]">{pkg.category}</p>
                      <h3 className="text-lg font-semibold text-[#1C1917]">{pkg.name}</h3>
                    </div>
                    <StatusBadge status={pkg.approvalStatus} />
                  </div>
                  <p className="text-xs text-[#57534E] tabular-nums">
                    {formatINR(pkg.pricePerPlate)}/plate · {pkg.minPlates}–{pkg.maxPlates} plates · Decoration: ₹0 (FREE)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {pkg.decorationPhotos.slice(0, 3).map((url, idx) => (
                      <div key={idx} className="aspect-[4/3] rounded overflow-hidden border border-[#E5E0D8]">
                        <SafeImage src={url} alt={pkg.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteCelebrationPackage(pkg.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#6E1E2E] border border-[#E5E0D8] rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Package</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DECORATION GALLERY */}
        {activeSection === 'decorations' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Decoration Photography Gallery
              </h1>
              <p className="text-sm text-[#57534E]">
                All decoration setups across your celebration packages (Decoration Included – No Additional Charges).
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restCelPackages.flatMap((pkg) =>
                pkg.decorationPhotos.map((url, idx) => (
                  <div key={`${pkg.id}-${idx}`} className="bg-white border border-[#E5E0D8] rounded-lg overflow-hidden">
                    <div className="aspect-[4/3]">
                      <SafeImage src={url} alt={pkg.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold text-[#6E1E2E]">{pkg.category}</p>
                      <p className="text-sm font-semibold text-[#1C1917]">{pkg.name}</p>
                      <p className="text-xs text-[#57534E] mt-1">{pkg.decorationDetails}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CUSTOM CELEBRATION REQUESTS & QUOTATION BUILDER */}
        {(activeSection === 'custom-requests' || activeSection === 'quotations') && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                {activeSection === 'quotations'
                  ? 'Custom Celebration Quotations'
                  : 'Custom Celebration Requests'}
              </h1>
              <p className="text-sm text-[#57534E] mt-1">
                Review incoming bespoke celebration briefs &amp; reference photos, mark requests Under Review, and build itemized quotations (Decoration Charge is permanently locked at ₹0). Once accepted by the customer, quotations become locked.
              </p>
            </div>

            {displayCustomRequests.length === 0 ? (
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-10 text-center text-sm text-[#57534E]">
                No custom celebration requests received yet.
              </div>
            ) : (
              <div className="space-y-5">
                {displayCustomRequests
                  .filter((req) => (activeSection === 'quotations' ? Boolean(req.quotation) || customQuoteReqId === req.id : true))
                  .map((req) => {
                    const isLocked = Boolean(req.quotation?.locked);
                    return (
                      <div key={req.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 sm:p-6 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                              {req.id} · {req.occasionType} · {formatDisplayDate(req.preferredDate)} at {req.preferredTime}
                            </p>
                            <h3 className="text-lg font-semibold text-[#1C1917] mt-0.5">
                              {req.customerName} — {req.guestsCount} Guests (Approx. Budget: {formatINR(req.estimatedBudget)})
                            </h3>
                            <p className="text-xs text-[#57534E] mt-0.5">
                              {req.customerEmail} · {req.customerPhone} · Dietary: {req.vegNonVegPreference}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ECF4EE] border border-[#BBD6C3] text-[11px] font-semibold text-[#1E462A]">
                                <Lock className="w-3 h-3" /> Quote Locked
                              </span>
                            )}
                            <StatusBadge status={req.status} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-4 text-xs">
                          <div>
                            <span className="text-[#57534E] block">Decoration Theme</span>
                            <span className="font-semibold text-[#1C1917]">{req.decorationTheme}</span>
                          </div>
                          <div>
                            <span className="text-[#57534E] block">Preferred Colours</span>
                            <span className="font-semibold text-[#1C1917]">{req.preferredColors}</span>
                          </div>
                          <div>
                            <span className="text-[#57534E] block">Decoration Requirements</span>
                            <span className="font-semibold text-[#1C1917]">{req.decorationRequirements}</span>
                          </div>
                          <div>
                            <span className="text-[#57534E] block">Cake Requirements</span>
                            <span className="font-semibold text-[#1C1917]">{req.cakeRequirements}</span>
                          </div>
                          <div>
                            <span className="text-[#57534E] block">Food Preferences</span>
                            <span className="font-semibold text-[#1C1917]">
                              {req.foodPreferences} ({req.vegNonVegPreference})
                            </span>
                          </div>
                          <div>
                            <span className="text-[#57534E] block">Decoration Charge Rule</span>
                            <span className="font-semibold text-[#1E462A]">₹0 (Complimentary)</span>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <span className="text-[#57534E] block">Special Instructions</span>
                            <span className="font-medium text-[#1C1917]">
                              {req.specialInstructions || 'None specified'}
                            </span>
                          </div>
                        </div>

                        {req.referenceImages.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-[#1C1917]">
                              Customer Reference Images ({req.referenceImages.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {req.referenceImages.map((img, i) => (
                                <div key={i} className="w-24 h-16 rounded overflow-hidden border border-[#E5E0D8]">
                                  <SafeImage src={img} alt={`Customer ref ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {req.quotation && (
                          <div className="rounded-lg border border-[#BBD6C3] bg-[#ECF4EE]/45 p-4 text-xs space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-[#1C1917] inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-[#1E462A]" />
                                Quotation {req.quotation.id} ({req.quotation.status}) · Total:{' '}
                                <strong className="font-mono text-[#6E1E2E]">{formatINR(req.quotation.totalAmount)}</strong>
                              </span>
                              <span className="text-[#57534E] tabular-nums">
                                Valid Until {formatDisplayDate(req.quotation.validUntil)} · {req.quotation.advancePercent}% Advance: {formatINR(req.quotation.advanceAmount)}{' '}
                                {req.advancePaid ? `(DEMO PAID · ${req.transactionId})` : '(Unpaid)'}
                              </span>
                            </div>
                            <p className="text-[#57534E]">
                              Food: {req.quotation.platesCount} × {formatINR(req.quotation.pricePerPlate)} · Cake: {formatINR(req.quotation.cakeCharge)} · Decor: ₹0 · Line Items: {req.quotation.lineItems.length}
                            </p>
                            {req.quotation.rejectionReason && (
                              <p className="text-[#8B1E35] font-medium">
                                Customer Decline Reason: {req.quotation.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}

                        {customQuoteReqId === req.id && !isLocked ? (
                          <div className="bg-[#FAF9F6] border-2 border-[#6E1E2E]/30 rounded-lg p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-display text-xl font-semibold text-[#1C1917]">
                                Structured Quotation Builder ({req.id})
                              </h4>
                              <span className="px-2.5 py-1 rounded bg-[#ECF4EE] border border-[#BBD6C3] text-[11px] font-semibold text-[#1E462A]">
                                Decoration Charge Locked at ₹0
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold mb-1">Food Package Details *</label>
                                <input
                                  type="text"
                                  value={qFoodDetails}
                                  onChange={(e) => setQFoodDetails(e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1">Price Per Plate (₹) *</label>
                                <input
                                  type="number"
                                  min={100}
                                  value={qPricePerPlate}
                                  onChange={(e) => setQPricePerPlate(Number(e.target.value))}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg tabular-nums"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1">Number of Plates *</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={qPlatesCount}
                                  onChange={(e) => setQPlatesCount(Number(e.target.value))}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg tabular-nums"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1">Custom Cake Charge (₹)</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={qCakeCharge}
                                  onChange={(e) => setQCakeCharge(Number(e.target.value))}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg tabular-nums"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1">Advance Percentage (%)</label>
                                <select
                                  value={qAdvancePct}
                                  onChange={(e) => setQAdvancePct(Number(e.target.value))}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                                >
                                  <option value={20}>20% Advance</option>
                                  <option value={30}>30% Advance</option>
                                  <option value={50}>50% Advance</option>
                                  <option value={100}>100% Full Advance</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1">Quotation Validity Date *</label>
                                <input
                                  type="date"
                                  value={qValidUntil}
                                  min={getTodayISO()}
                                  onChange={(e) => setQValidUntil(e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1">
                                  Decoration Arrangement Details (Fee: ₹0 Fixed)
                                </label>
                                <input
                                  type="text"
                                  value={qDecorDetails}
                                  onChange={(e) => setQDecorDetails(e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1">Special Services &amp; Charges Note</label>
                                <input
                                  type="text"
                                  value={qSpecialServices}
                                  onChange={(e) => setQSpecialServices(e.target.value)}
                                  placeholder="Live acoustic artist, photographer window, dedicated host..."
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1">Additional Included Services</label>
                              <input
                                type="text"
                                value={qAdditionalServices}
                                onChange={(e) => setQAdditionalServices(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                              />
                            </div>

                            {/* Itemized Special Line Items */}
                            <div className="bg-white border border-[#E5E0D8] rounded-lg p-3.5 space-y-2.5">
                              <p className="text-xs font-semibold text-[#1C1917]">
                                Additional Itemized Charges (Music, AV, Exclusive Lounge, etc.)
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                <input
                                  type="text"
                                  value={newItemLabel}
                                  onChange={(e) => setNewItemLabel(e.target.value)}
                                  placeholder="e.g., Acoustic Flute Artist"
                                  className="sm:col-span-2 px-3 py-1.5 text-xs border border-[#E5E0D8] rounded"
                                />
                                <select
                                  value={newItemCategory}
                                  onChange={(e) =>
                                    setNewItemCategory(e.target.value as CelebrationQuotationItem['category'])
                                  }
                                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E0D8] rounded"
                                >
                                  <option value="Service">Service</option>
                                  <option value="Food">Food</option>
                                  <option value="Cake">Cake</option>
                                  <option value="Other">Other</option>
                                </select>
                                <div className="flex gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={newItemAmount}
                                    onChange={(e) => setNewItemAmount(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 text-xs border border-[#E5E0D8] rounded tabular-nums"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!newItemLabel.trim()) return;
                                      setQLineItems((prev) => [
                                        ...prev,
                                        {
                                          id: `qli-${Date.now()}`,
                                          label: newItemLabel.trim(),
                                          category: newItemCategory,
                                          amount: Math.max(0, newItemAmount),
                                        },
                                      ]);
                                      setNewItemLabel('');
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold bg-[#1C1917] text-white rounded shrink-0"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              {qLineItems.length > 0 && (
                                <div className="divide-y divide-[#E5E0D8] text-xs">
                                  {qLineItems.map((li) => (
                                    <div key={li.id} className="py-1.5 flex items-center justify-between">
                                      <span>
                                        {li.label} <span className="text-[#57534E]">({li.category})</span>
                                      </span>
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono tabular-nums">{formatINR(li.amount)}</span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setQLineItems((prev) => prev.filter((item) => item.id !== li.id))
                                          }
                                          className="text-[#8B1E35] hover:underline"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1">Terms &amp; Conditions *</label>
                                <textarea
                                  rows={2}
                                  value={qTerms}
                                  onChange={(e) => setQTerms(e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1">Additional Notes to Guest</label>
                                <textarea
                                  rows={2}
                                  value={qAdditionalNotes}
                                  onChange={(e) => setQAdditionalNotes(e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                                />
                              </div>
                            </div>

                            {/* Live Total Preview */}
                            <div className="bg-white border border-[#E5E0D8] rounded-lg p-3.5 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-[#57534E]">
                                  Food Total ({qPlatesCount} × {formatINR(qPricePerPlate)})
                                </span>
                                <span className="font-mono tabular-nums">{formatINR(qFoodSubtotal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#57534E]">Cake + Additional Line Items</span>
                                <span className="font-mono tabular-nums">
                                  {formatINR(qCakeCharge + qLineItemsTotal)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#57534E]">Decoration Charge (Mandatory Rule)</span>
                                <span className="font-mono font-semibold text-[#1E462A]">₹0 (FREE)</span>
                              </div>
                              <div className="flex justify-between pt-1.5 border-t border-[#E5E0D8] font-semibold text-sm text-[#1C1917]">
                                <span>Total Quoted Amount</span>
                                <span className="font-mono tabular-nums">{formatINR(qGrandTotal)}</span>
                              </div>
                              <div className="flex justify-between font-semibold text-[#6E1E2E]">
                                <span>Advance ({qAdvancePct}%) / Remaining at Venue</span>
                                <span className="font-mono tabular-nums">
                                  {formatINR(qAdvanceAmt)} / {formatINR(qRemainingAmt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  upsertAndSendCustomQuotation(req.id, {
                                    foodPackageDetails: qFoodDetails,
                                    pricePerPlate: Number(qPricePerPlate),
                                    platesCount: Number(qPlatesCount),
                                    cakeCharge: Number(qCakeCharge),
                                    specialServicesNotes: qSpecialServices,
                                    decorationDetails: qDecorDetails,
                                    additionalIncludedServices: qAdditionalServices,
                                    lineItems: qLineItems,
                                    advancePercent: Number(qAdvancePct),
                                    validUntil: qValidUntil,
                                    termsAndConditions: qTerms,
                                    additionalNotes: qAdditionalNotes,
                                  });
                                  setCustomQuoteReqId(null);
                                }}
                                className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                              >
                                Send Quotation to Customer
                              </button>
                              <button
                                type="button"
                                onClick={() => setCustomQuoteReqId(null)}
                                className="px-4 py-2 text-xs border border-[#E5E0D8] bg-white rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {req.status === 'Request Received' && (
                              <button
                                type="button"
                                onClick={() => markCustomRequestUnderReview(req.id)}
                                className="px-3.5 py-1.5 text-xs font-semibold border border-[#E5E0D8] bg-[#FAF9F6] rounded-lg hover:bg-[#F3F1ED]"
                              >
                                Mark Under Review
                              </button>
                            )}
                            {!isLocked && req.status !== 'Cancelled' && (
                              <button
                                type="button"
                                onClick={() => openQuotationBuilder(req)}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                              >
                                {req.quotation ? 'Edit & Resend Quotation' : 'Create & Send Quotation'}
                              </button>
                            )}
                            {req.advancePaid && req.status !== 'Completed' && (
                              <button
                                type="button"
                                onClick={() => updateCustomRequestStatus(req.id, 'Completed')}
                                className="px-3.5 py-1.5 text-xs font-semibold bg-[#ECF4EE] text-[#1E462A] border border-[#BBD6C3] rounded-lg"
                              >
                                Mark Completed
                              </button>
                            )}
                            {!req.advancePaid && req.status !== 'Cancelled' && req.status !== 'Completed' && (
                              <button
                                type="button"
                                onClick={() => updateCustomRequestStatus(req.id, 'Cancelled')}
                                className="px-3 py-1.5 text-xs font-semibold text-[#8B1E35] border border-[#EAC4CC] bg-[#FDF2F4] rounded-lg"
                              >
                                Cancel Request
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* READY-MADE CELEBRATION RESERVATIONS (WITH OPTIONAL CUSTOMER NOTES) */}
        {activeSection === 'events' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                Celebration Reservations
              </h1>
              <p className="text-sm text-[#57534E]">
                Ready-made celebration package reservations (Decoration Charge: ₹0). Review optional customer notes carefully — notes are guest requests and are not automatically confirmed as included services or extra items.
              </p>
            </div>

            {displayCelBookings.length === 0 ? (
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-8 text-center text-sm text-[#57534E]">
                No celebration reservations logged yet.
              </div>
            ) : (
              <div className="space-y-4">
                {displayCelBookings.map((cb) => {
                  const noteText = cb.customerNote || cb.specialRequests;
                  return (
                    <div key={cb.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                            {cb.id} · {cb.celebrationType} · {formatDisplayDate(cb.eventDate)} at {cb.eventTime}
                          </p>
                          <h3 className="text-lg font-semibold text-[#1C1917]">
                            {cb.customerName} — {cb.packageName}
                          </h3>
                          <p className="text-xs text-[#57534E] tabular-nums">
                            {cb.platesCount} Plates × {formatINR(cb.pricePerPlate)} ={' '}
                            <strong className="text-[#1C1917]">{formatINR(cb.totalPackageAmount)}</strong> · Decoration: ₹0 (FREE) · Advance ({cb.advancePercent}%): {formatINR(cb.advanceAmount)}{' '}
                            ({cb.advancePaid ? `DEMO PAID · ${cb.transactionId}` : 'Advance Pending'})
                          </p>
                        </div>
                        <StatusBadge status={cb.status} />
                      </div>

                      {noteText && (
                        <div className="bg-[#FAF9F6] border-l-4 border-[#B8863B] border-y border-r border-y-[#E5E0D8] border-r-[#E5E0D8] rounded-r-lg p-3.5 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-[#1C1917]">
                              Customer Note — Special Instructions
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#F3F1ED] border border-[#D6CFC5] text-[10px] font-semibold text-[#6E1E2E]">
                              Unconfirmed Request · Review Required
                            </span>
                          </div>
                          <p className="text-[#1C1917] leading-relaxed">{noteText}</p>
                          <p className="text-[11px] text-[#57534E]">
                            Note only: Not automatically confirmed as an included service or extra item. Confirm feasibility directly with the guest ({cb.customerPhone}).
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCelReservation(cb)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-[#1C1917] border border-[#E5E0D8] bg-[#FAF9F6] rounded-lg hover:bg-[#F3F1ED]"
                        >
                          View Details
                        </button>
                        {cb.status !== 'Confirmed' && cb.status !== 'Completed' && cb.status !== 'Cancelled' && cb.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => updateCelebrationBookingStatus(cb.id, 'Confirmed')}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-[#ECF4EE] text-[#1E462A] border border-[#BBD6C3] rounded-lg"
                          >
                            Mark Confirmed
                          </button>
                        )}
                        {cb.status !== 'Completed' && cb.status !== 'Cancelled' && cb.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => updateCelebrationBookingStatus(cb.id, 'Completed')}
                            className="px-3.5 py-1.5 text-xs font-semibold border border-[#E5E0D8] rounded-lg hover:bg-[#FAF9F6]"
                          >
                            Mark Completed
                          </button>
                        )}
                        {!cb.advancePaid && cb.status !== 'Rejected' && cb.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => updateCelebrationBookingStatus(cb.id, 'Rejected')}
                            className="px-3.5 py-1.5 text-xs font-semibold text-[#8B1E35] border border-[#EAC4CC] bg-[#FDF2F4] rounded-lg"
                          >
                            Reject Booking
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT RECORDS */}
        {activeSection === 'payments' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Demo Payment Records (Not Real Money)
            </h1>
            <div className="bg-white border border-[#E5E0D8] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#FAF9F6] text-xs text-[#57534E]">
                    <th className="py-3 px-4 font-semibold">Demo Txn ID</th>
                    <th className="py-3 px-4 font-semibold">Reference</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {(restPayments.length > 0 ? restPayments : payments).map((pay) => (
                    <tr key={pay.id}>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#6E1E2E]">
                        {pay.transactionId}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{pay.referenceId}</td>
                      <td className="py-3 px-4 text-xs">{pay.customerName}</td>
                      <td className="py-3 px-4 text-xs">{pay.paymentType}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {formatINR(pay.amount)}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={pay.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OFFERS */}
        {activeSection === 'offers' && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Restaurant Offers (Basic &amp; Premium Tiers)
            </h1>
            <form
              onSubmit={handleCreateOffer}
              className="bg-white border border-[#E5E0D8] rounded-lg p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
            >
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">Offer Title</label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Evening Ganga Terrace Privilege"
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Promo Code</label>
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  placeholder="GHAT15"
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Offer Tier</label>
                <select
                  value={offerTier}
                  onChange={(e) => setOfferTier(e.target.value as 'Basic' | 'Premium')}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                >
                  <option value="Basic">Basic Offer</option>
                  <option value="Premium">Premium Offer</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg"
              >
                Publish Offer
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(restOffers.length > 0 ? restOffers : offers.slice(0, 2)).map((o) => (
                <div key={o.id} className="bg-white border border-[#E5E0D8] rounded-lg p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono font-semibold text-[#6E1E2E]">
                      {o.code} · {o.discountLabel} · {o.offerTier} Tier
                    </p>
                    <h3 className="text-base font-semibold text-[#1C1917] mt-0.5">{o.title}</h3>
                    <p className="text-xs text-[#57534E] mt-0.5">{o.terms}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleOfferActive(o.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border ${
                      o.active ? 'bg-[#ECF4EE] border-[#BBD6C3]' : 'bg-[#FAF9F6] border-[#E5E0D8]'
                    }`}
                  >
                    {o.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Sample Venue Analytics (DEMO DATA)
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Bookings by Day of Week"
                subtitle="Simulated weekly reservation counts"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Estimated Cover Revenue (Demo)"
                subtitle="Sample figures in thousands (INR)"
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

        {/* NOTIFICATIONS */}
        {activeSection === 'notifications' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
                  Partner Notifications
                </h1>
                <p className="text-sm text-[#57534E]">
                  Updates on table bookings, food pre-orders, custom celebration requests, and admin approvals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  markAllNotificationsRead('restaurant');
                  addToast({ type: 'success', title: 'All partner notifications marked read' });
                }}
                className="px-4 py-2 text-xs font-semibold border border-[#E5E0D8] bg-white rounded-lg hover:bg-[#FAF9F6]"
              >
                Mark All Read
              </button>
            </div>
            <div className="space-y-3">
              {restNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white border rounded-lg p-4 flex items-start justify-between gap-3 ${
                    n.read ? 'border-[#E5E0D8]' : 'border-[#6E1E2E]'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917]">{n.title}</p>
                    <p className="text-xs text-[#57534E] mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[11px] text-[#57534E] shrink-0">{n.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <div className="max-w-xl bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Partner Settings (Demo)
            </h1>
            <div className="space-y-4 text-sm">
              <div className="py-3 border-b border-[#E5E0D8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#1C1917]">
                    Food Pre-Order Advance Percentage
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#6E1E2E]">
                    {activeRestaurant.preOrderAdvancePercent}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[20, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setCustomAdvancePct(pct);
                        updateRestaurantPreOrderAdvance(pct);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded border ${
                        activeRestaurant.preOrderAdvancePercent === pct
                          ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                          : 'bg-[#FAF9F6] border-[#E5E0D8]'
                      }`}
                    >
                      {pct}% Advance
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between py-2 border-b border-[#E5E0D8]">
                <span>Accept plate-wise food pre-orders ({activeRestaurant.preOrderAdvancePercent}% advance)</span>
                <input type="checkbox" defaultChecked className="accent-[#6E1E2E]" />
              </label>
              <label className="flex items-center justify-between py-2 border-b border-[#E5E0D8]">
                <span>Include free decoration on all celebration packages (₹0)</span>
                <input type="checkbox" checked readOnly className="accent-[#6E1E2E]" />
              </label>
              <button
                type="button"
                onClick={() => addToast({ type: 'success', title: 'Demo Settings Saved' })}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 p-4" role="dialog" aria-modal="true">
          <div className="bg-white border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#1C1917]">
                Reservation {selectedReservation.id}
              </h3>
              <button type="button" onClick={() => setSelectedReservation(null)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#57534E]">Guest:</span> {selectedReservation.customerName}</p>
              <p><span className="text-[#57534E]">Phone:</span> {selectedReservation.customerPhone}</p>
              <p><span className="text-[#57534E]">Mode:</span> {selectedReservation.orderMode}</p>
              {selectedReservation.platformFeeTotal ? (
                <p>
                  <span className="text-[#57534E]">Platform Fee Paid (DEMO):</span>{' '}
                  {formatINR(selectedReservation.platformFeeTotal)}
                </p>
              ) : null}
              <p><span className="text-[#57534E]">Schedule:</span> {formatDisplayDate(selectedReservation.date)} at {selectedReservation.time}</p>
              <p><span className="text-[#57534E]">Party Size:</span> {selectedReservation.guests} Guests</p>
              <p><span className="text-[#57534E]">Notes:</span> {selectedReservation.specialRequest || 'None'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  updateReservationStatus(selectedReservation.id, 'Confirmed');
                  setSelectedReservation(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#6E1E2E] text-white rounded-lg"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-2 text-xs font-medium border border-[#E5E0D8] rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Reservation Detail Modal */}
      {selectedCelReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/65 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 space-y-4 my-auto shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-mono font-semibold text-[#6E1E2E]">
                  Celebration Reservation · {selectedCelReservation.id}
                </p>
                <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                  {selectedCelReservation.packageName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCelReservation(null)}
                aria-label="Close celebration details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-4">
              <p>
                <span className="text-[#57534E]">Guest:</span>{' '}
                <strong className="text-[#1C1917]">{selectedCelReservation.customerName}</strong>
              </p>
              <p>
                <span className="text-[#57534E]">Contact:</span> {selectedCelReservation.customerPhone} ·{' '}
                {selectedCelReservation.customerEmail}
              </p>
              <p>
                <span className="text-[#57534E]">Schedule:</span>{' '}
                {formatDisplayDate(selectedCelReservation.eventDate)} at {selectedCelReservation.eventTime}
              </p>
              <p>
                <span className="text-[#57534E]">Package Total:</span> {selectedCelReservation.platesCount} ×{' '}
                {formatINR(selectedCelReservation.pricePerPlate)} ={' '}
                <strong>{formatINR(selectedCelReservation.totalPackageAmount)}</strong> (Decor ₹0)
              </p>
              <p>
                <span className="text-[#57534E]">Advance ({selectedCelReservation.advancePercent}%):</span>{' '}
                {formatINR(selectedCelReservation.advanceAmount)} (
                {selectedCelReservation.advancePaid ? 'DEMO PAID' : 'Pending'})
              </p>
              <p>
                <span className="text-[#57534E]">Food Preference:</span> {selectedCelReservation.foodPreference}
              </p>
            </div>
            <div className="bg-[#FAF9F6] border-l-4 border-[#B8863B] border-y border-r border-y-[#E5E0D8] border-r-[#E5E0D8] rounded-r-lg p-3.5 text-xs space-y-1">
              <p className="font-semibold text-[#1C1917]">Customer Special Instructions (Note)</p>
              <p className="text-[#1C1917]">
                {selectedCelReservation.customerNote ||
                  selectedCelReservation.specialRequests ||
                  'No special instructions provided.'}
              </p>
              {(selectedCelReservation.customerNote || selectedCelReservation.specialRequests) && (
                <p className="text-[11px] text-[#57534E]">
                  Advisory: Treat as an unconfirmed request until your team verifies availability; it does not add automatic included services or extra items.
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCelReservation(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#6E1E2E] text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Photo Lightbox */}
      {menuPreviewUrl && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1917]/85 flex items-center justify-center p-4"
          onClick={() => setMenuPreviewUrl(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-[#E5E0D8] flex justify-between items-center">
              <span className="text-sm font-semibold">{menuPreviewUrl.title}</span>
              <button type="button" onClick={() => setMenuPreviewUrl(null)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto">
              <SafeImage src={menuPreviewUrl.url} alt={menuPreviewUrl.title} className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
