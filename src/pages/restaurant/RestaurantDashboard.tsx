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
  CelebrationCategory,
  DiningTable,
  PhotoCategory,
  PlateCourseItem,
  PreOrderStatus,
  Reservation,
} from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

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
  { label: 'Event Inquiries', to: '/restaurant/events', icon: PartyPopper },
  { label: 'Quotations', to: '/restaurant/quotations', icon: MessageSquareQuote },
  { label: 'Payment Records', to: '/restaurant/payments', icon: Receipt },
  { label: 'Offers', to: '/restaurant/offers', icon: Tag },
  { label: 'Analytics', to: '/restaurant/analytics', icon: BarChart3 },
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
    sendCelebrationQuotation,
    updateCelebrationBookingStatus,
    reservations,
    updateReservationStatus,
    tables,
    updateTableStatus,
    addTable,
    offers,
    addOffer,
    toggleOfferActive,
    payments,
    addToast,
  } = useApp();

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
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

  // Quotation form state
  const [quoteBookingId, setQuoteBookingId] = useState<string | null>(null);
  const [quoteTotal, setQuoteTotal] = useState<number>(12000);
  const [quoteNotes, setQuoteNotes] = useState('');

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
  const restTables = tables.filter((t) => t.restaurantId === activeRestaurant.id);
  const displayTables = restTables.length > 0 ? restTables : tables;
  const restOffers = offers.filter((o) => o.restaurantId === activeRestaurant.id);
  const restPayments = payments.filter((p) => p.restaurantName === activeRestaurant.name);

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
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#FFF6E9] border border-[#702C3A]/30 text-sm text-[#292321]">
            <Clock className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#702C3A]">
                Your restaurant registration is pending approval.{' '}
              </span>
              <span className="text-xs text-[#6B5F5C]">
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
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                  {activeRestaurant.name} Overview
                </h1>
                <p className="text-sm text-[#6B5F5C] mt-1">
                  Reservations, food pre-orders, celebration inquiries &amp; sample revenue (DEMO DATA).
                </p>
              </div>
              <StatusBadge status={activeRestaurant.approvalStatus} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Reservations', val: displayReservations.length },
                { label: 'Food Pre-Orders', val: displayPreOrders.length },
                { label: 'Celebration Inquiries', val: displayCelBookings.length },
                { label: 'Menu Pages', val: activeRestaurant.menuPhotos.length },
                { label: 'Celebration Pkgs', val: restCelPackages.length },
                { label: 'Sample Revenue (Demo)', val: formatINR(184500) },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                  <p className="text-xs text-[#6B5F5C]">{stat.label}</p>
                  <p className="text-xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
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
                barColor="#292321"
              />
            </div>
          </div>
        )}

        {/* RESTAURANT PROFILE */}
        {activeSection === 'profile' && (
          <div className="max-w-2xl bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Restaurant Profile
            </h1>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={profHours}
                    onChange={(e) => setProfHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Host Desk Phone</label>
                  <input
                    type="tel"
                    value={profContact}
                    onChange={(e) => setProfContact(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={profDesc}
                  onChange={(e) => setProfDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
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
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Restaurant Photo Gallery, Logo &amp; Cover Photo
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Upload multiple Interior, Exterior, Dining Area, Ambience, and Gallery photos, preview, replace, delete, or set cover photo.
              </p>
            </div>

            {/* Logo & Cover */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                <h2 className="text-base font-semibold text-[#292321]">Restaurant Logo</h2>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#E8DDD1] shrink-0">
                    <SafeImage src={activeRestaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg cursor-pointer hover:bg-[#58202C]">
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
                    <p className="text-[11px] text-[#6B5F5C]">Stored in browser preview state.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                <h2 className="text-base font-semibold text-[#292321]">Active Cover Photo</h2>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-[#E8DDD1] shrink-0">
                    <SafeImage src={activeRestaurant.image} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg cursor-pointer hover:bg-[#58202C]">
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
                    <p className="text-[11px] text-[#6B5F5C]">Or click &ldquo;Set as Cover&rdquo; on any photo below.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Multiple Upload Controls */}
            <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
              <h2 className="text-base font-semibold text-[#292321]">
                Upload Multiple Restaurant Photos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold mb-1">Photo Category</label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value as PhotoCategory)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg cursor-pointer hover:bg-[#58202C]">
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
                    className="px-3 py-2 text-xs font-semibold border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9]"
                  >
                    + Add Sample Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeRestaurant.photos.map((photo) => (
                <div key={photo.id} className="bg-white border border-[#E8DDD1] rounded-lg overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <SafeImage src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#702C3A]">{photo.category}</p>
                      <p className="text-sm font-medium text-[#292321] mt-0.5">{photo.caption}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8DDD1]">
                      <button
                        type="button"
                        onClick={() => setRestaurantCover(photo.url)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#FFF6E9] border border-[#E8DDD1] rounded hover:border-[#702C3A]"
                      >
                        Set as Cover
                      </button>
                      <label className="px-2.5 py-1 text-xs font-medium border border-[#E8DDD1] rounded cursor-pointer hover:bg-[#FFF6E9]">
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
                        className="px-2.5 py-1 text-xs font-medium text-[#702C3A] border border-[#F4A6B8] rounded hover:bg-[#FDECEF]"
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
          <div className="bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Restaurant Amenities
              </h1>
              <p className="text-sm text-[#6B5F5C] mt-1">
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
                        ? 'border-[#702C3A] bg-[#FFF6E9]'
                        : 'border-[#E8DDD1] bg-white hover:bg-[#FFF6E9]/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="accent-[#702C3A] w-4 h-4"
                    />
                    <span className="text-sm font-medium text-[#292321]">{amenity}</span>
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
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Menu Gallery (Photo-Based Menu Pages)
              </h1>
              <p className="text-sm text-[#6B5F5C] mt-1">
                Upload photographs of your complete printed menu pages. Customers inspect these pages before booking or pre-ordering plates.
              </p>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold mb-1">Menu Page Label</label>
                <input
                  type="text"
                  value={menuPageTitle}
                  onChange={(e) => setMenuPageTitle(e.target.value)}
                  placeholder="e.g., Starters, Curries & Breads Menu"
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg cursor-pointer hover:bg-[#58202C]">
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
                className="px-4 py-2.5 text-xs font-semibold border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9]"
              >
                + Add Sample Menu Page
              </button>
            </div>

            {activeRestaurant.menuPhotos.length === 0 ? (
              <div className="bg-white border border-[#E8DDD1] rounded-lg p-10 text-center text-sm text-[#6B5F5C]">
                No menu photos uploaded yet. Upload your first menu page photograph above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeRestaurant.menuPhotos.map((page, index) => (
                  <div key={page.id} className="bg-white border border-[#E8DDD1] rounded-lg overflow-hidden flex flex-col">
                    <button
                      type="button"
                      onClick={() => setMenuPreviewUrl({ url: page.url, title: page.title })}
                      className="aspect-[3/4] w-full overflow-hidden bg-[#FFF6E9]"
                    >
                      <SafeImage src={page.url} alt={page.title} className="w-full h-full object-cover" />
                    </button>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#702C3A]">
                          Page {page.pageNumber}
                        </p>
                        <p className="text-sm font-semibold text-[#292321]">{page.title}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8DDD1]">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => reorderMenuPhoto(page.id, 'up')}
                          className="p-1.5 border border-[#E8DDD1] rounded disabled:opacity-40"
                          title="Move page earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === activeRestaurant.menuPhotos.length - 1}
                          onClick={() => reorderMenuPhoto(page.id, 'down')}
                          className="p-1.5 border border-[#E8DDD1] rounded disabled:opacity-40"
                          title="Move page later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <label className="px-2.5 py-1 text-xs font-medium border border-[#E8DDD1] rounded cursor-pointer hover:bg-[#FFF6E9]">
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
                          className="ml-auto px-2.5 py-1 text-xs font-medium text-[#702C3A] border border-[#F4A6B8] rounded hover:bg-[#FDECEF]"
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
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Table Management
            </h1>
            <form
              onSubmit={handleAddTable}
              className="bg-white border border-[#E8DDD1] rounded-lg p-4 flex flex-wrap items-end gap-3"
            >
              <div>
                <label className="block text-xs font-semibold mb-1">Table No.</label>
                <input
                  type="text"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="RT-04"
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg w-28"
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
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg w-24 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Zone</label>
                <select
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value as DiningTable['zone'])}
                  className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                >
                  <option>Rooftop</option>
                  <option>Courtyard</option>
                  <option>Indoor AC</option>
                  <option>Private Lounge</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Table</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTables.map((tbl) => (
                <div key={tbl.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-semibold text-[#292321]">{tbl.tableNumber}</span>
                    <StatusBadge status={tbl.status} />
                  </div>
                  <p className="text-xs text-[#6B5F5C] tabular-nums">
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
                            ? 'bg-[#702C3A] text-white border-[#702C3A]'
                            : 'border-[#E8DDD1] hover:bg-[#FFF6E9]'
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
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Table Reservations
              </h1>
              <div className="flex flex-wrap gap-1.5 bg-white border border-[#E8DDD1] p-1 rounded-lg">
                {['All', 'Pending', 'Accepted', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setResFilter(status)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      resFilter === status
                        ? 'bg-[#702C3A] text-white'
                        : 'text-[#292321] hover:bg-[#FFF6E9]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Guest</th>
                    <th className="py-3 px-4 font-semibold">Booking Mode</th>
                    <th className="py-3 px-4 font-semibold">Schedule</th>
                    <th className="py-3 px-4 font-semibold text-right">Guests</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {displayReservations
                    .filter((r) => resFilter === 'All' || r.status === resFilter)
                    .map((res) => (
                      <tr key={res.id} className="hover:bg-[#FFF6E9]/40">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#292321]">{res.customerName}</p>
                          <p className="text-xs text-[#6B5F5C] tabular-nums">{res.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className="font-medium text-[#292321]">{res.orderMode}</span>
                          {res.platformFeeTotal ? (
                            <p className="text-[11px] text-[#702C3A]">
                              Fee: {formatINR(res.platformFeeTotal)}
                            </p>
                          ) : null}
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
                            className="px-2 py-1 text-xs font-semibold bg-[#E7EFD9] rounded"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Confirmed')}
                            className="px-2 py-1 text-xs font-semibold border border-[#E8DDD1] rounded"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Completed')}
                            className="px-2 py-1 text-xs font-semibold border border-[#E8DDD1] rounded"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Rejected')}
                            className="px-2 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedReservation(res)}
                            className="px-2 py-1 text-xs font-medium border border-[#E8DDD1] rounded"
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
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Food Pre-Orders &amp; Plate-Wise Packages
              </h1>
              <p className="text-sm text-[#6B5F5C] mt-1">
                Review incoming customer plate pre-orders, update kitchen status, and define structured plate-wise food packages.
              </p>
            </div>

            {/* Incoming Pre-Orders */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#292321]">
                Incoming Food Pre-Orders ({displayPreOrders.length})
              </h2>
              {displayPreOrders.map((po) => (
                <div key={po.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono font-semibold text-[#702C3A]">
                        {po.id} · {formatDisplayDate(po.date)} at {po.time}
                      </p>
                      <h3 className="text-lg font-semibold text-[#292321]">
                        {po.customerName} — {po.plateCount} × {po.packageName}
                      </h3>
                      <p className="text-xs text-[#6B5F5C]">
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
                            ? 'bg-[#702C3A] text-white border-[#702C3A]'
                            : 'border-[#E8DDD1] hover:bg-[#FFF6E9]'
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
            <div className="bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-5">
              <h2 className="text-xl font-semibold text-[#292321]">
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
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
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
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Min Plates</label>
                    <input
                      type="number"
                      min={1}
                      value={prePkgMin}
                      onChange={(e) => setPrePkgMin(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
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
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Dietary Option</label>
                    <select
                      value={prePkgDiet}
                      onChange={(e) => setPrePkgDiet(e.target.value as typeof prePkgDiet)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
                >
                  Publish Pre-Order Plate Package (Demo)
                </button>
              </form>

              <div className="pt-4 border-t border-[#E8DDD1] grid grid-cols-1 md:grid-cols-2 gap-4">
                {restPrePackages.map((pkg) => (
                  <div key={pkg.id} className="border border-[#E8DDD1] rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-[#292321]">{pkg.name}</h3>
                        <p className="text-xs text-[#6B5F5C]">
                          {pkg.dietaryType} · Min {pkg.minPlates} plates · {formatINR(pkg.pricePerPlate)}/plate
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deletePreOrderPackage(pkg.id)}
                        className="p-1.5 text-[#702C3A] hover:bg-[#FDECEF] rounded"
                        aria-label="Delete pre-order package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#6B5F5C] space-y-0.5">
                      {pkg.plateItems.map((pi) => (
                        <div key={pi.id}>
                          <strong className="text-[#292321]">{pi.course}:</strong> {pi.itemName} ({pi.quantity})
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
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Celebration Packages Builder
              </h1>
              <p className="text-sm text-[#6B5F5C] mt-1">
                Decoration is included free (₹0) with every celebration package. At least one real decoration photograph is mandatory before submitting for approval.
              </p>
            </div>

            <form
              onSubmit={handleCreateCelebrationPkg}
              className="bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-[#292321]">
                  Build New Celebration Package
                </h2>
                <span className="px-3 py-1 rounded bg-[#E7EFD9] border border-[#C8D8AC] text-xs font-semibold text-[#292321]">
                  Decoration Included – No Additional Charges (₹0)
                </span>
              </div>

              {celFormError && (
                <div className="px-4 py-2.5 rounded-lg bg-[#FDECEF] border border-[#F4A6B8] text-xs font-medium text-[#702C3A]">
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
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Celebration Category *</label>
                  <select
                    value={celCategory}
                    onChange={(e) => setCelCategory(e.target.value as CelebrationCategory)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Min Plates</label>
                  <input
                    type="number"
                    min={2}
                    value={celMinPlates}
                    onChange={(e) => setCelMinPlates(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Plates</label>
                  <input
                    type="number"
                    min={2}
                    value={celMaxPlates}
                    onChange={(e) => setCelMaxPlates(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Dietary Option</label>
                  <select
                    value={celDiet}
                    onChange={(e) => setCelDiet(e.target.value as typeof celDiet)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
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
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
              </div>

              {/* Mandatory Decoration Photographs */}
              <div className="border border-[#E8DDD1] rounded-lg p-4 bg-[#FFF6E9]/45 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#292321]">
                      Decoration Photographs (Mandatory * — {celDecorPhotos.length} uploaded)
                    </p>
                    <p className="text-[11px] text-[#6B5F5C]">
                      Upload real setup photographs of your venue&apos;s celebration decor.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg cursor-pointer">
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
                      className="px-3 py-2 text-xs font-semibold border border-[#E8DDD1] bg-white rounded-lg"
                    >
                      + Use Sample Decor Photos
                    </button>
                  </div>
                </div>

                {celDecorPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {celDecorPhotos.map((url, idx) => (
                      <div key={`new-dec-${idx}`} className="relative aspect-[4/3] rounded overflow-hidden border border-[#E8DDD1]">
                        <SafeImage src={url} alt={`Decor ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setCelDecorPhotos((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-[#702C3A]"
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
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
              >
                Submit Celebration Package for Admin Approval (Demo)
              </button>
            </form>

            {/* Existing Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {restCelPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#702C3A]">{pkg.category}</p>
                      <h3 className="text-lg font-semibold text-[#292321]">{pkg.name}</h3>
                    </div>
                    <StatusBadge status={pkg.approvalStatus} />
                  </div>
                  <p className="text-xs text-[#6B5F5C] tabular-nums">
                    {formatINR(pkg.pricePerPlate)}/plate · {pkg.minPlates}–{pkg.maxPlates} plates · Decoration: ₹0 (FREE)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {pkg.decorationPhotos.slice(0, 3).map((url, idx) => (
                      <div key={idx} className="aspect-[4/3] rounded overflow-hidden border border-[#E8DDD1]">
                        <SafeImage src={url} alt={pkg.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteCelebrationPackage(pkg.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#702C3A] border border-[#F4A6B8] rounded"
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
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Decoration Photography Gallery
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                All decoration setups across your celebration packages (Decoration Included – No Additional Charges).
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restCelPackages.flatMap((pkg) =>
                pkg.decorationPhotos.map((url, idx) => (
                  <div key={`${pkg.id}-${idx}`} className="bg-white border border-[#E8DDD1] rounded-lg overflow-hidden">
                    <div className="aspect-[4/3]">
                      <SafeImage src={url} alt={pkg.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold text-[#702C3A]">{pkg.category}</p>
                      <p className="text-sm font-semibold text-[#292321]">{pkg.name}</p>
                      <p className="text-xs text-[#6B5F5C] mt-1">{pkg.decorationDetails}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* EVENT INQUIRIES & QUOTATIONS */}
        {(activeSection === 'events' || activeSection === 'quotations') && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                {activeSection === 'quotations' ? 'Celebration Quotations' : 'Event Inquiries'}
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Send custom quotations (Decoration Charge locked at ₹0) and manage confirmed celebration events.
              </p>
            </div>

            <div className="space-y-4">
              {displayCelBookings.map((cb) => (
                <div key={cb.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono font-semibold text-[#702C3A]">
                        {cb.id} · {cb.celebrationType} · {formatDisplayDate(cb.eventDate)} at {cb.eventTime}
                      </p>
                      <h3 className="text-lg font-semibold text-[#292321]">
                        {cb.customerName} — {cb.packageName}
                      </h3>
                      <p className="text-xs text-[#6B5F5C] tabular-nums">
                        {cb.platesCount} Plates × {formatINR(cb.pricePerPlate)} · Quoted Total: {formatINR(cb.quotedTotalAmount)} · Decoration: ₹0 (FREE) · Advance ({cb.advancePercent}%): {formatINR(cb.advanceAmount)} ({cb.advancePaid ? 'DEMO PAID' : 'Pending'})
                      </p>
                      {cb.specialRequests && (
                        <p className="text-xs text-[#292321] mt-1">Requests: {cb.specialRequests}</p>
                      )}
                    </div>
                    <StatusBadge status={cb.status} />
                  </div>

                  {quoteBookingId === cb.id ? (
                    <div className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            Quoted Food Total (₹) — Decor ₹0
                          </label>
                          <input
                            type="number"
                            value={quoteTotal}
                            onChange={(e) => setQuoteTotal(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg tabular-nums"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold mb-1">Quotation Notes</label>
                          <input
                            type="text"
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            placeholder="Includes terrace corner reserve & custom floral runner (FREE)"
                            className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            sendCelebrationQuotation(cb.id, Number(quoteTotal), quoteNotes);
                            setQuoteBookingId(null);
                          }}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                        >
                          Send Quotation to Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuoteBookingId(null)}
                          className="px-3 py-1.5 text-xs border border-[#E8DDD1] bg-white rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteBookingId(cb.id);
                          setQuoteTotal(cb.quotedTotalAmount);
                          setQuoteNotes(cb.quotationNotes || '');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-[#702C3A] border border-[#702C3A] rounded-lg hover:bg-[#FFF6E9]"
                      >
                        Send / Update Custom Quotation
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCelebrationBookingStatus(cb.id, 'Confirmed')}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded-lg"
                      >
                        Mark Confirmed
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCelebrationBookingStatus(cb.id, 'Completed')}
                        className="px-3 py-1.5 text-xs font-semibold border border-[#E8DDD1] rounded-lg"
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENT RECORDS */}
        {activeSection === 'payments' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Demo Payment Records (Not Real Money)
            </h1>
            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Demo Txn ID</th>
                    <th className="py-3 px-4 font-semibold">Reference</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {(restPayments.length > 0 ? restPayments : payments).map((pay) => (
                    <tr key={pay.id}>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#702C3A]">
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
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Restaurant Offers (Basic &amp; Premium Tiers)
            </h1>
            <form
              onSubmit={handleCreateOffer}
              className="bg-white border border-[#E8DDD1] rounded-lg p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
            >
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">Offer Title</label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Evening Ganga Terrace Privilege"
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
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
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Offer Tier</label>
                <select
                  value={offerTier}
                  onChange={(e) => setOfferTier(e.target.value as 'Basic' | 'Premium')}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                >
                  <option value="Basic">Basic Offer</option>
                  <option value="Premium">Premium Offer</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Publish Offer
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(restOffers.length > 0 ? restOffers : offers.slice(0, 2)).map((o) => (
                <div key={o.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono font-semibold text-[#702C3A]">
                      {o.code} · {o.discountLabel} · {o.offerTier} Tier
                    </p>
                    <h3 className="text-base font-semibold text-[#292321] mt-0.5">{o.title}</h3>
                    <p className="text-xs text-[#6B5F5C] mt-0.5">{o.terms}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleOfferActive(o.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border ${
                      o.active ? 'bg-[#E7EFD9] border-[#C8D8AC]' : 'bg-[#FFF6E9] border-[#E8DDD1]'
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
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
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
                barColor="#292321"
              />
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <div className="max-w-xl bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Partner Settings (Demo)
            </h1>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between py-2 border-b border-[#E8DDD1]">
                <span>Accept plate-wise food pre-orders (50% advance)</span>
                <input type="checkbox" defaultChecked className="accent-[#702C3A]" />
              </label>
              <label className="flex items-center justify-between py-2 border-b border-[#E8DDD1]">
                <span>Include free decoration on all celebration packages (₹0)</span>
                <input type="checkbox" checked readOnly className="accent-[#702C3A]" />
              </label>
              <button
                type="button"
                onClick={() => addToast({ type: 'success', title: 'Demo Settings Saved' })}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white border border-[#E8DDD1] rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#292321]">
                Reservation {selectedReservation.id}
              </h3>
              <button type="button" onClick={() => setSelectedReservation(null)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#6B5F5C]">Guest:</span> {selectedReservation.customerName}</p>
              <p><span className="text-[#6B5F5C]">Phone:</span> {selectedReservation.customerPhone}</p>
              <p><span className="text-[#6B5F5C]">Mode:</span> {selectedReservation.orderMode}</p>
              {selectedReservation.platformFeeTotal ? (
                <p>
                  <span className="text-[#6B5F5C]">Platform Fee Paid (DEMO):</span>{' '}
                  {formatINR(selectedReservation.platformFeeTotal)}
                </p>
              ) : null}
              <p><span className="text-[#6B5F5C]">Schedule:</span> {formatDisplayDate(selectedReservation.date)} at {selectedReservation.time}</p>
              <p><span className="text-[#6B5F5C]">Party Size:</span> {selectedReservation.guests} Guests</p>
              <p><span className="text-[#6B5F5C]">Notes:</span> {selectedReservation.specialRequest || 'None'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  updateReservationStatus(selectedReservation.id, 'Confirmed');
                  setSelectedReservation(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#702C3A] text-white rounded-lg"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-2 text-xs font-medium border border-[#E8DDD1] rounded-lg"
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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setMenuPreviewUrl(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-[#E8DDD1] flex justify-between items-center">
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
