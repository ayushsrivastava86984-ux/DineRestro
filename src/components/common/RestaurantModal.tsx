import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Image as ImageIcon,
  MapPin,
  PartyPopper,
  Phone,
  Sparkles,
  Star,
  Utensils,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CELEBRATION_CATEGORIES } from '../../data/mockData';
import type { CelebrationCategory } from '../../types';
import { SafeImage } from './SafeImage';
import { PaymentBreakdownCard } from './PaymentBreakdownCard';
import {
  formatDisplayDate,
  formatINR,
  getTodayISO,
  validateEmail,
  validateIndianMobile,
} from '../../utils/formatters';

const TIME_SLOTS = [
  '12:30 PM',
  '01:30 PM',
  '06:30 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:15 PM',
];

export function RestaurantModal() {
  const {
    selectedRestaurantForModal,
    modalInitialTab,
    closeRestaurantModal,
    favoriteIds,
    toggleFavorite,
    customerUser,
    offers,
    preOrderPackages,
    celebrationPackages,
    reviews,
    platformSettings,
    createTableReservation,
    createFoodPreOrder,
    createCelebrationBooking,
    createCustomCelebrationRequest,
    openDemoPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'preorder' | 'celebrate'>('overview');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // A. Multi-step Book a Table state
  const [tableStep, setTableStep] = useState<1 | 2 | 3>(1);
  const [tableDate, setTableDate] = useState(getTodayISO());
  const [tableTime, setTableTime] = useState('07:30 PM');
  const [tableGuests, setTableGuests] = useState(4);
  const [tableTier, setTableTier] = useState<'Basic' | 'Premium'>('Basic');
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [guestName, setGuestName] = useState(customerUser.fullName);
  const [guestPhone, setGuestPhone] = useState(customerUser.mobile);
  const [tableNotes, setTableNotes] = useState('');
  const [tableConfirmedRef, setTableConfirmedRef] = useState<string | null>(null);

  // B. Pre-Order Food state
  const [preOrderMode, setPreOrderMode] = useState<'Pre-order Food' | 'Order at Restaurant'>('Pre-order Food');
  const [selectedPrePkgId, setSelectedPrePkgId] = useState('');
  const [plateCount, setPlateCount] = useState(2);
  const [foodPreference, setFoodPreference] = useState('Pure Veg · Medium Spice');
  const [preOrderDate, setPreOrderDate] = useState(getTodayISO());
  const [preOrderTime, setPreOrderTime] = useState('08:00 PM');
  const [preOrderConfirmedRef, setPreOrderConfirmedRef] = useState<string | null>(null);

  // C. Celebrate an Occasion state (Approved Packages vs Custom Request)
  const [celSubTab, setCelSubTab] = useState<'packages' | 'custom'>('packages');
  const [selectedCelPkgId, setSelectedCelPkgId] = useState('');
  const [celDate, setCelDate] = useState(getTodayISO());
  const [celTime, setCelTime] = useState('07:30 PM');
  const [celPlates, setCelPlates] = useState(6);
  const [celFoodPref, setCelFoodPref] = useState('Pure Veg · Standard Spice');
  const [celSpecialReq, setCelSpecialReq] = useState('');
  const [celEmail, setCelEmail] = useState(customerUser.email);
  const [celConfirmedRef, setCelConfirmedRef] = useState<string | null>(null);

  // Custom Celebration Request (inside Modal)
  const [customOccasion, setCustomOccasion] = useState<CelebrationCategory>('Birthday');
  const [customDate, setCustomDate] = useState(getTodayISO());
  const [customTime, setCustomTime] = useState('07:30 PM');
  const [customGuests, setCustomGuests] = useState(10);
  const [customBudget, setCustomBudget] = useState(14000);
  const [customTheme, setCustomTheme] = useState('Marigold & Candlelight Courtyard');
  const [customColors, setCustomColors] = useState('Deep Burgundy, Warm Ivory & Champagne Gold');
  const [customCake, setCustomCake] = useState('1 kg Eggless Chocolate Truffle Cake');
  const [customFoodPref, setCustomFoodPref] = useState('Pure Vegetarian Multi-Course');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customConfirmedRef, setCustomConfirmedRef] = useState<string | null>(null);

  const [formError, setFormError] = useState('');

  const restaurant = selectedRestaurantForModal;
  const restOffers = restaurant
    ? offers.filter((o) => o.active && o.restaurantId === restaurant.id)
    : [];
  const restPrePackages = restaurant
    ? preOrderPackages.filter((p) => p.restaurantId === restaurant.id && p.available)
    : [];
  const restCelPackages = restaurant
    ? celebrationPackages.filter(
        (c) =>
          c.restaurantId === restaurant.id &&
          c.available &&
          c.approvalStatus === 'Approved'
      )
    : [];
  const restReviews = restaurant
    ? reviews.filter((rv) => rv.restaurantId === restaurant.id && rv.visible)
    : [];

  useEffect(() => {
    if (restaurant) {
      setActiveTab(modalInitialTab || 'overview');
      setTableStep(1);
      setTableTier(restaurant.tier || 'Basic');
      setFormError('');
      setTableConfirmedRef(null);
      setPreOrderConfirmedRef(null);
      setCelConfirmedRef(null);
      setCustomConfirmedRef(null);
      setCelSubTab(restCelPackages.length > 0 ? 'packages' : 'custom');
      setGuestName(customerUser.fullName);
      setGuestPhone(customerUser.mobile);
      setCelEmail(customerUser.email);
      setSelectedOfferId('');
      const firstPre = restPrePackages[0];
      setSelectedPrePkgId(firstPre?.id || '');
      setPlateCount(firstPre?.minPlates || 2);
      const firstCel = restCelPackages[0];
      setSelectedCelPkgId(firstCel?.id || '');
      setCelPlates(firstCel?.minPlates || 6);
    }
  }, [restaurant?.id, modalInitialTab]);

  if (!restaurant) return null;

  const isFav = favoriteIds.includes(restaurant.id);
  const chosenOffer = restOffers.find((o) => o.id === selectedOfferId);

  // Platform booking fee applies to ALL table bookings (Basic vs Premium)
  const effectiveTier: 'Basic' | 'Premium' = chosenOffer ? chosenOffer.offerTier : tableTier;
  const feePerGuest =
    effectiveTier === 'Premium'
      ? platformSettings.premiumOfferFeePerGuest
      : platformSettings.basicOfferFeePerGuest;
  const totalPlatformFee = tableGuests * feePerGuest;

  // Restaurant-specific Pre-Order Advance Percentage
  const chosenPrePkg =
    restPrePackages.find((p) => p.id === selectedPrePkgId) || restPrePackages[0];
  const preOrderTotalFood = chosenPrePkg ? chosenPrePkg.pricePerPlate * plateCount : 0;
  const restaurantAdvancePercent =
    restaurant.preOrderAdvancePercent || platformSettings.defaultPreOrderAdvancePercent;
  const preOrderAdvanceAmt = Math.round((preOrderTotalFood * restaurantAdvancePercent) / 100);
  const preOrderRemainingAmt = preOrderTotalFood - preOrderAdvanceAmt;

  // Celebration Package Breakdown (₹0 Decoration always)
  const chosenCelPkg =
    restCelPackages.find((c) => c.id === selectedCelPkgId) || restCelPackages[0];
  const celTotalAmt = chosenCelPkg ? chosenCelPkg.pricePerPlate * celPlates : 0;
  const celAdvPercent = platformSettings.defaultCelebrationAdvancePercent;
  const celAdvAmt = Math.round((celTotalAmt * celAdvPercent) / 100);
  const celRemainingAmt = celTotalAmt - celAdvAmt;

  const handleBookTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!guestName.trim() || !validateIndianMobile(guestPhone)) {
      setFormError('Please enter a valid guest name and 10-digit mobile number.');
      return;
    }

    openDemoPayment({
      title: `${effectiveTier} Table Booking Fee (DEMO ONLY)`,
      referenceId: `TBL-${restaurant.id.slice(-4).toUpperCase()}`,
      paymentType: 'Platform Booking Fee',
      customerName: guestName.trim(),
      restaurantName: restaurant.name,
      amount: totalPlatformFee,
      breakdownLines: [
        { label: 'Booking Tier', value: `${effectiveTier} Table Booking` },
        { label: 'Date & Time', value: `${formatDisplayDate(tableDate)} · ${tableTime}` },
        { label: 'Number of Guests', value: `${tableGuests} Guests` },
        { label: 'Platform Fee Per Guest', value: `${formatINR(feePerGuest)} / guest` },
        ...(chosenOffer
          ? [{ label: 'Applied Offer', value: `${chosenOffer.title} (${chosenOffer.discountLabel})` }]
          : []),
        { label: 'Food Bill Settlement', value: 'Pay directly at restaurant (Separate from platform fee)' },
      ],
      onComplete: (txnId) => {
        const created = createTableReservation({
          restaurant,
          date: tableDate,
          time: tableTime,
          guests: tableGuests,
          customerName: guestName.trim(),
          customerPhone: guestPhone.trim(),
          bookingTier: effectiveTier,
          orderMode: chosenOffer
            ? 'Offer Table Booking'
            : effectiveTier === 'Premium'
              ? 'Premium Table Booking'
              : 'Basic Table Booking',
          selectedOffer: chosenOffer,
          feePerGuest,
          platformFeeTotal: totalPlatformFee,
          specialRequest: tableNotes.trim() || undefined,
          transactionId: txnId,
        });
        setTableConfirmedRef(created.id);
      },
    });
  };

  const handlePreOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (preOrderMode === 'Order at Restaurant') {
      setActiveTab('book');
      setTableStep(1);
      return;
    }
    if (!chosenPrePkg) {
      setFormError('No pre-order plate package is available for this restaurant.');
      return;
    }
    if (plateCount < chosenPrePkg.minPlates) {
      setFormError(`Minimum ${chosenPrePkg.minPlates} plates required for ${chosenPrePkg.name}.`);
      return;
    }
    if (!guestName.trim() || !validateIndianMobile(guestPhone)) {
      setFormError('Please enter a valid guest name and 10-digit mobile number.');
      return;
    }

    openDemoPayment({
      title: `Pre-Order Advance (${restaurantAdvancePercent}% · DEMO ONLY)`,
      referenceId: `PRE-${restaurant.id.slice(-4).toUpperCase()}`,
      paymentType: 'Food Pre-Order Advance',
      customerName: guestName.trim(),
      restaurantName: restaurant.name,
      amount: preOrderAdvanceAmt,
      breakdownLines: [
        { label: 'Selected Plate Package', value: chosenPrePkg.name },
        { label: 'Price Per Plate', value: formatINR(chosenPrePkg.pricePerPlate) },
        { label: 'Plate Quantity', value: `${plateCount} Plates` },
        { label: 'Food Order Total', value: formatINR(preOrderTotalFood) },
        {
          label: `Restaurant Advance (${restaurantAdvancePercent}%)`,
          value: formatINR(preOrderAdvanceAmt),
        },
        { label: 'Remaining Amount at Restaurant', value: formatINR(preOrderRemainingAmt) },
      ],
      onComplete: (txnId) => {
        const created = createFoodPreOrder({
          restaurant,
          pkg: chosenPrePkg,
          date: preOrderDate,
          time: preOrderTime,
          plateCount,
          foodPreference,
          customerName: guestName.trim(),
          customerPhone: guestPhone.trim(),
          advancePercent: restaurantAdvancePercent,
          advancePaid: true,
          transactionId: txnId,
        });
        setPreOrderConfirmedRef(created.id);
      },
    });
  };

  const handleCelebrationSubmit = (payAdvanceNow: boolean) => {
    setFormError('');
    if (!chosenCelPkg) {
      setFormError('No approved celebration package selected.');
      return;
    }
    if (celPlates < chosenCelPkg.minPlates || celPlates > chosenCelPkg.maxPlates) {
      setFormError(
        `Please select between ${chosenCelPkg.minPlates} and ${chosenCelPkg.maxPlates} plates for this package.`
      );
      return;
    }
    if (!guestName.trim() || !validateEmail(celEmail) || !validateIndianMobile(guestPhone)) {
      setFormError('Please enter valid guest name, email, and 10-digit mobile number.');
      return;
    }

    if (payAdvanceNow) {
      openDemoPayment({
        title: `Celebration Advance Payment (${celAdvPercent}% · DEMO ONLY)`,
        referenceId: `CEL-${restaurant.id.slice(-4).toUpperCase()}`,
        paymentType: 'Celebration Advance',
        customerName: guestName.trim(),
        restaurantName: restaurant.name,
        amount: celAdvAmt,
        breakdownLines: [
          { label: 'Celebration Package', value: chosenCelPkg.name },
          { label: 'Price Per Plate', value: formatINR(chosenCelPkg.pricePerPlate) },
          { label: 'Number of Plates', value: `${celPlates} Plates` },
          { label: 'Total Package Amount', value: formatINR(celTotalAmt) },
          { label: 'Decoration Charge', value: 'FREE (₹0 — Decoration Included)' },
          { label: `Advance Payable (${celAdvPercent}%)`, value: formatINR(celAdvAmt) },
          { label: 'Remaining at Restaurant', value: formatINR(celRemainingAmt) },
        ],
        onComplete: (txnId) => {
          const created = createCelebrationBooking({
            restaurant,
            pkg: chosenCelPkg,
            eventDate: celDate,
            eventTime: celTime,
            platesCount: celPlates,
            foodPreference: celFoodPref,
            specialRequests: celSpecialReq,
            customerName: guestName.trim(),
            customerEmail: celEmail.trim(),
            customerPhone: guestPhone.trim(),
            advancePercent: celAdvPercent,
            payAdvanceNow: true,
            transactionId: txnId,
          });
          setCelConfirmedRef(created.id);
        },
      });
    } else {
      const created = createCelebrationBooking({
        restaurant,
        pkg: chosenCelPkg,
        eventDate: celDate,
        eventTime: celTime,
        platesCount: celPlates,
        foodPreference: celFoodPref,
        specialRequests: celSpecialReq,
        customerName: guestName.trim(),
        customerEmail: celEmail.trim(),
        customerPhone: guestPhone.trim(),
        advancePercent: celAdvPercent,
        payAdvanceNow: false,
      });
      setCelConfirmedRef(created.id);
    }
  };

  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (customGuests < 2 || customBudget < 1000 || !customTheme.trim() || !customFoodPref.trim()) {
      setFormError('Please provide valid guest count, estimated budget, decoration theme, and food preferences.');
      return;
    }
    const created = createCustomCelebrationRequest({
      restaurant,
      occasionType: customOccasion,
      preferredDate: customDate,
      preferredTime: customTime,
      guestsCount: customGuests,
      estimatedBudget: customBudget,
      decorationTheme: customTheme.trim(),
      preferredColors: customColors.trim(),
      cakeRequirements: customCake.trim() || 'No cake required',
      foodPreferences: customFoodPref.trim(),
      specialInstructions: customInstructions.trim(),
      customerName: guestName.trim(),
      customerEmail: celEmail.trim(),
      customerPhone: guestPhone.trim(),
    });
    setCustomConfirmedRef(created.id);
    setCustomInstructions('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/65 p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-title"
    >
      <div className="bg-white border border-[#E5E0D8] rounded-lg max-w-4xl w-full overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Hero Cover Header */}
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          <SafeImage
            src={restaurant.image}
            alt={`${restaurant.name} cover`}
            className="w-full h-full object-cover"
            fallbackTitle={restaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/45 to-transparent" />
          <button
            type="button"
            onClick={closeRestaurantModal}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-[#1C1917] hover:bg-white"
            aria-label="Close restaurant details"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(restaurant.id)}
            className="absolute top-3 right-14 p-2 rounded-full bg-white/95 text-[#6E1E2E] hover:bg-white"
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#6E1E2E]' : ''}`} />
          </button>

          <div className="absolute bottom-4 left-5 right-5 flex items-end gap-3.5 text-white">
            <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white/80 shrink-0 bg-white">
              <SafeImage
                src={restaurant.logoUrl}
                alt={`${restaurant.name} logo`}
                className="w-full h-full object-cover"
                fallbackTitle={restaurant.name}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#FAF9F6] truncate">
                {restaurant.tier} Dining · {restaurant.cuisines.join(' · ')} · {restaurant.area}, {restaurant.city}
              </p>
              <h2
                id="restaurant-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold truncate"
              >
                {restaurant.name}
              </h2>
            </div>
            {restaurant.reviewCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/95 text-[#1C1917] text-xs font-semibold tabular-nums shrink-0">
                <Star className="w-3.5 h-3.5 fill-[#B8863B] text-[#B8863B]" />
                <span>{restaurant.rating.toFixed(1)}</span>
                <span className="text-[#57534E]">({restaurant.reviewCount})</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#E5E0D8] bg-[#FAF9F6] flex flex-wrap items-center gap-2 shrink-0">
          {[
            { id: 'overview' as const, label: 'Profile, Menu Photos & Gallery' },
            { id: 'book' as const, label: 'A. Book a Table' },
            { id: 'preorder' as const, label: 'B. Pre-Order Food' },
            { id: 'celebrate' as const, label: 'C. Celebrate an Occasion' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setFormError('');
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#6E1E2E] text-white'
                  : 'bg-white text-[#1C1917] border border-[#E5E0D8] hover:border-[#6E1E2E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {formError && (
            <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
              {formError}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#E5E0D8] text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#6E1E2E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#57534E]">Address</p>
                    <p className="font-medium text-[#1C1917]">{restaurant.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#6E1E2E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#57534E]">Hours &amp; Pricing</p>
                    <p className="font-medium text-[#1C1917]">{restaurant.openingHours}</p>
                    <p className="text-xs text-[#57534E]">{restaurant.priceRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#6E1E2E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#57534E]">Host Desk</p>
                    <p className="font-medium text-[#1C1917] tabular-nums">{restaurant.contactNumber}</p>
                    <p className="text-xs text-[#6E1E2E]">{restaurant.availabilityNote}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('book');
                    setTableStep(1);
                  }}
                  className="text-left p-4 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6]/60 hover:border-[#6E1E2E] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#6E1E2E]">Option A</p>
                  <p className="text-base font-semibold text-[#1C1917] mt-0.5">Book a Table</p>
                  <p className="text-xs text-[#57534E] mt-1">
                    Basic (₹{platformSettings.basicOfferFeePerGuest}/guest) or Premium (₹{platformSettings.premiumOfferFeePerGuest}/guest) booking.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preorder')}
                  className="text-left p-4 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6]/60 hover:border-[#6E1E2E] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#6E1E2E]">Option B</p>
                  <p className="text-base font-semibold text-[#1C1917] mt-0.5">Pre-Order Food</p>
                  <p className="text-xs text-[#57534E] mt-1">
                    Menu photos + plate packages ({restaurantAdvancePercent}% restaurant advance) or Order at Restaurant.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('celebrate')}
                  className="text-left p-4 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6]/60 hover:border-[#6E1E2E] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#6E1E2E]">Option C</p>
                  <p className="text-base font-semibold text-[#1C1917] mt-0.5">Celebrate an Occasion</p>
                  <p className="text-xs text-[#57534E] mt-1">
                    Ready celebration packages or Custom Celebration Request (₹0 decor charge).
                  </p>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1C1917] mb-1">
                  About {restaurant.name}
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">{restaurant.description}</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#1C1917] mb-2">
                  Amenities &amp; Venue Facilities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                  {restaurant.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 px-3 py-2 rounded border border-[#E5E0D8] bg-[#FAF9F6]/45 text-[#1C1917]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6E1E2E] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2.5">
                  <h3 className="text-base font-semibold text-[#1C1917]">
                    Restaurant Menu Gallery (Uploaded Menu Pages)
                  </h3>
                  <span className="text-xs text-[#57534E] tabular-nums">
                    {restaurant.menuPhotos.length} page(s)
                  </span>
                </div>
                {restaurant.menuPhotos.length === 0 ? (
                  <p className="text-xs text-[#57534E]">No menu photographs uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {restaurant.menuPhotos.map((page) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => setLightboxImage({ url: page.url, title: page.title })}
                        className="group text-left border border-[#E5E0D8] rounded-lg overflow-hidden hover:border-[#6E1E2E]"
                      >
                        <div className="aspect-[3/4] w-full overflow-hidden bg-[#FAF9F6]">
                          <SafeImage
                            src={page.url}
                            alt={page.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                            fallbackTitle={page.title}
                          />
                        </div>
                        <div className="p-2.5 bg-white">
                          <p className="text-xs font-semibold text-[#1C1917] truncate">
                            Page {page.pageNumber} · {page.title}
                          </p>
                          <p className="text-[11px] text-[#6E1E2E]">Click to enlarge menu</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#1C1917] mb-2.5">
                  Ambience, Interior &amp; Dining Area Photos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {restaurant.photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: photo.url,
                          title: `${photo.category} — ${photo.caption}`,
                        })
                      }
                      className="text-left border border-[#E5E0D8] rounded-lg overflow-hidden hover:border-[#6E1E2E]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <SafeImage
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                          fallbackTitle={photo.category}
                        />
                      </div>
                      <div className="p-2 text-[11px]">
                        <p className="font-semibold text-[#6E1E2E]">{photo.category}</p>
                        <p className="text-[#57534E] truncate">{photo.caption}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {restReviews.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-[#1C1917] mb-2">Diner Reviews</h3>
                  <div className="space-y-2">
                    {restReviews.map((rv) => (
                      <div key={rv.id} className="border border-[#E5E0D8] rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1C1917]">{rv.customerName}</span>
                          <span className="font-mono text-[#6E1E2E]">★ {rv.rating}</span>
                        </div>
                        <p className="text-[#57534E] mt-1">{rv.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: A. MULTI-STEP TABLE RESERVATION (Platform Fee for ALL Bookings) */}
          {activeTab === 'book' && (
            <div className="space-y-5">
              {tableConfirmedRef ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#6E1E2E] mx-auto" />
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                    Table Reservation Confirmed ({tableConfirmedRef})
                  </h3>
                  <p className="text-sm text-[#57534E] max-w-md mx-auto">
                    {effectiveTier} table booking logged for {tableGuests} guests on {formatDisplayDate(tableDate)} at {tableTime}. Platform fee ({formatINR(totalPlatformFee)}) marked DEMO PAID separately from your restaurant food bill.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTableConfirmedRef(null);
                      setTableStep(1);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                  >
                    Create Another Table Booking
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookTableSubmit} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                        Book a Table at {restaurant.name}
                      </h3>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        A transparent per-guest platform booking fee applies to all table bookings (Basic or Premium) and is kept strictly separate from your restaurant food bill.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {[1, 2, 3].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => setTableStep(step as 1 | 2 | 3)}
                          className={`px-2.5 py-1 rounded border ${
                            tableStep === step
                              ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                              : 'bg-white text-[#57534E] border-[#E5E0D8]'
                          }`}
                        >
                          Step {step}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 1: Date, Time & Guests */}
                  {tableStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">1. Select Date</label>
                          <input
                            type="date"
                            value={tableDate}
                            min={getTodayISO()}
                            onChange={(e) => setTableDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">2. Select Time Slot</label>
                          <select
                            value={tableTime}
                            onChange={(e) => setTableTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                          >
                            {TIME_SLOTS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">3. Number of Guests</label>
                          <select
                            value={tableGuests}
                            onChange={(e) => setTableGuests(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg tabular-nums"
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                              <option key={n} value={n}>
                                {n} {n === 1 ? 'Guest' : 'Guests'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setTableStep(2)}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                        >
                          <span>Continue to Tier Selection</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Basic vs Premium Table Booking & Optional Offer */}
                  {tableStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setTableTier('Basic');
                            setSelectedOfferId('');
                          }}
                          className={`p-4 rounded-lg border text-left transition-colors ${
                            effectiveTier === 'Basic' && !chosenOffer
                              ? 'border-[#6E1E2E] bg-[#FAF9F6]'
                              : 'border-[#E5E0D8] bg-white'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-semibold text-[#1C1917]">
                              Basic Table Booking
                            </p>
                            <span className="font-mono text-xs font-semibold text-[#6E1E2E] tabular-nums">
                              {formatINR(platformSettings.basicOfferFeePerGuest)} / guest
                            </span>
                          </div>
                          <p className="text-xs text-[#57534E] mt-1">
                            Guaranteed standard seating ({tableGuests} × ₹{platformSettings.basicOfferFeePerGuest} = {formatINR(tableGuests * platformSettings.basicOfferFeePerGuest)} platform fee). Order and pay food directly at the restaurant.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTableTier('Premium');
                            setSelectedOfferId('');
                          }}
                          className={`p-4 rounded-lg border text-left transition-colors ${
                            effectiveTier === 'Premium' && !chosenOffer
                              ? 'border-[#6E1E2E] bg-[#FAF9F6]'
                              : 'border-[#E5E0D8] bg-white'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-semibold text-[#6E1E2E]">
                              Premium Table Booking
                            </p>
                            <span className="font-mono text-xs font-semibold text-[#6E1E2E] tabular-nums">
                              {formatINR(platformSettings.premiumOfferFeePerGuest)} / guest
                            </span>
                          </div>
                          <p className="text-xs text-[#57534E] mt-1">
                            Priority terrace/courtyard seating &amp; concierge check-in ({tableGuests} × ₹{platformSettings.premiumOfferFeePerGuest} = {formatINR(tableGuests * platformSettings.premiumOfferFeePerGuest)} platform fee).
                          </p>
                        </button>
                      </div>

                      {restOffers.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-[#1C1917]">
                            Optional: Apply an Active Dining Offer
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {restOffers.map((off) => {
                              const fee =
                                off.offerTier === 'Premium'
                                  ? platformSettings.premiumOfferFeePerGuest
                                  : platformSettings.basicOfferFeePerGuest;
                              return (
                                <button
                                  key={off.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedOfferId((prev) => (prev === off.id ? '' : off.id))
                                  }
                                  className={`p-3 rounded-lg border text-left text-xs ${
                                    selectedOfferId === off.id
                                      ? 'border-[#6E1E2E] bg-[#FAF9F6]'
                                      : 'border-[#E5E0D8] bg-white'
                                  }`}
                                >
                                  <p className="font-semibold text-[#1C1917]">{off.title}</p>
                                  <p className="text-[#6E1E2E] mt-0.5 font-medium">
                                    {off.discountLabel} · {off.offerTier} Tier (₹{fee}/guest)
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setTableStep(1)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#57534E] hover:text-[#1C1917]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTableStep(3)}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                        >
                          <span>Review &amp; Platform Fee Summary</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Guest Details, Review & Platform Fee Breakdown */}
                  {tableStep === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Guest Name</label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Special Requests (Optional)
                        </label>
                        <input
                          type="text"
                          value={tableNotes}
                          onChange={(e) => setTableNotes(e.target.value)}
                          placeholder="River-facing seating, high chair, celebration note..."
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        />
                      </div>

                      <PaymentBreakdownCard
                        title="Platform Table Booking Fee Summary"
                        rows={[
                          { label: 'Venue', value: `${restaurant.name} (${restaurant.area})` },
                          { label: 'Reservation Slot', value: `${formatDisplayDate(tableDate)} · ${tableTime}` },
                          { label: 'Booking Tier', value: `${effectiveTier} Table Booking`, accent: true },
                          { label: 'Guest Count', value: `${tableGuests} Guests` },
                          { label: 'Fee Per Guest (Admin Configured)', value: `${formatINR(feePerGuest)} / guest` },
                          ...(chosenOffer
                            ? [{ label: 'Dining Offer Selected', value: `${chosenOffer.title} (${chosenOffer.discountLabel})` }]
                            : []),
                          { label: 'Restaurant Food Bill', value: 'Paid at Restaurant (Not included here)' },
                        ]}
                        totalLabel={`Total Platform Fee (${tableGuests} × ${formatINR(feePerGuest)})`}
                        totalValue={formatINR(totalPlatformFee)}
                        footnote="This platform booking fee is separate from your dining food bill. Clicking Confirm opens our simulated DEMO ONLY payment confirmation."
                      />

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setTableStep(2)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#57534E] hover:text-[#1C1917]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Change Tier</span>
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                        >
                          Proceed to Demo Payment ({formatINR(totalPlatformFee)})
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* TAB 3: B. PRE-ORDER FOOD (Photo Menu + Restaurant-Specific Advance %) */}
          {activeTab === 'preorder' && (
            <div className="space-y-5">
              {preOrderConfirmedRef ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#6E1E2E] mx-auto" />
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                    Food Pre-Order Recorded ({preOrderConfirmedRef})
                  </h3>
                  <p className="text-sm text-[#57534E] max-w-md mx-auto">
                    {plateCount} × {chosenPrePkg?.name}. Restaurant advance ({restaurantAdvancePercent}% = {formatINR(preOrderAdvanceAmt)}) marked DEMO PAID. Remaining {formatINR(preOrderRemainingAmt)} payable at {restaurant.name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreOrderConfirmedRef(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                  >
                    Create Another Pre-Order
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePreOrderSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                      Pre-Order Food — Photo Menu &amp; Plate Packages
                    </h3>
                    <p className="text-xs text-[#57534E] mt-0.5">
                      {restaurant.name} requires a <strong className="text-[#6E1E2E]">{restaurantAdvancePercent}% advance</strong> on pre-ordered plate totals. Or choose Order at Restaurant with ₹0 food advance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreOrderMode('Pre-order Food')}
                      className={`p-3.5 rounded-lg border text-left ${
                        preOrderMode === 'Pre-order Food'
                          ? 'border-[#6E1E2E] bg-[#FAF9F6]'
                          : 'border-[#E5E0D8] bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#6E1E2E]">
                        Pre-Order Food ({restaurantAdvancePercent}% Advance)
                      </p>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        View menu photographs &amp; reserve prepared plate packages before arrival.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreOrderMode('Order at Restaurant');
                        setActiveTab('book');
                        setTableStep(1);
                      }}
                      className="p-3.5 rounded-lg border border-[#E5E0D8] bg-white text-left hover:border-[#6E1E2E]"
                    >
                      <p className="text-sm font-semibold text-[#1C1917]">
                        Order at Restaurant (₹0 Food Advance)
                      </p>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        Reserve your table first and order directly from the menu after arrival.
                      </p>
                    </button>
                  </div>

                  {restaurant.menuPhotos.length > 0 && (
                    <div className="border border-[#E5E0D8] rounded-lg p-3.5 bg-white space-y-2">
                      <p className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#6E1E2E]" />
                        <span>Uploaded Menu Pages (Click to Enlarge)</span>
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {restaurant.menuPhotos.map((mp) => (
                          <button
                            key={mp.id}
                            type="button"
                            onClick={() => setLightboxImage({ url: mp.url, title: mp.title })}
                            className="w-24 shrink-0 border border-[#E5E0D8] rounded overflow-hidden hover:border-[#6E1E2E]"
                          >
                            <div className="aspect-[3/4]">
                              <SafeImage src={mp.url} alt={mp.title} className="w-full h-full object-cover" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {restPrePackages.length === 0 ? (
                    <div className="p-5 border border-[#E5E0D8] rounded-lg text-sm text-[#57534E]">
                      This venue currently serves walk-in and table-reservation orders at the dining table. Use Tab A (Book a Table) to reserve your seats.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-[#1C1917]">
                          Select Plate Package
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {restPrePackages.map((pkg) => (
                            <div
                              key={pkg.id}
                              onClick={() => {
                                setSelectedPrePkgId(pkg.id);
                                setPlateCount((prev) => Math.max(prev, pkg.minPlates));
                              }}
                              className={`cursor-pointer border rounded-lg p-4 space-y-2 transition-colors ${
                                chosenPrePkg?.id === pkg.id
                                  ? 'border-[#6E1E2E] bg-[#FAF9F6]'
                                  : 'border-[#E5E0D8] bg-white'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[#1C1917]">{pkg.name}</p>
                                  <p className="text-xs text-[#57534E]">
                                    {pkg.dietaryType} · Min {pkg.minPlates} plates · {pkg.description}
                                  </p>
                                </div>
                                <span className="font-mono text-sm font-semibold text-[#6E1E2E] tabular-nums shrink-0">
                                  {formatINR(pkg.pricePerPlate)}/plate
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-[#E5E0D8]/80 text-[11px]">
                                {pkg.plateItems.map((pi) => (
                                  <div key={pi.id} className="text-[#1C1917]">
                                    <span className="font-semibold text-[#6E1E2E]">{pi.course}: </span>
                                    <span>{pi.itemName} ({pi.quantity})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            Plate Quantity (Min {chosenPrePkg?.minPlates || 2})
                          </label>
                          <input
                            type="number"
                            min={chosenPrePkg?.minPlates || 1}
                            max={60}
                            value={plateCount}
                            onChange={(e) => setPlateCount(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Dining Date</label>
                          <input
                            type="date"
                            value={preOrderDate}
                            min={getTodayISO()}
                            onChange={(e) => setPreOrderDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Arrival Time</label>
                          <select
                            value={preOrderTime}
                            onChange={(e) => setPreOrderTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                          >
                            {TIME_SLOTS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Food Preferences</label>
                          <input
                            type="text"
                            value={foodPreference}
                            onChange={(e) => setFoodPreference(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Guest Name</label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      <PaymentBreakdownCard
                        title="Pre-Order Advance Payment Summary"
                        rows={[
                          { label: 'Selected Package', value: `${plateCount} × ${chosenPrePkg?.name || ''}` },
                          { label: 'Food Order Total', value: formatINR(preOrderTotalFood) },
                          {
                            label: 'Restaurant Advance Percentage',
                            value: `${restaurantAdvancePercent}%`,
                            accent: true,
                          },
                          {
                            label: 'Remaining Amount (Payable at Restaurant)',
                            value: formatINR(preOrderRemainingAmt),
                          },
                        ]}
                        totalLabel={`Advance Payable Now (${restaurantAdvancePercent}%)`}
                        totalValue={formatINR(preOrderAdvanceAmt)}
                        footnote={`Advance percentage (${restaurantAdvancePercent}%) is configured by ${restaurant.name}. Balance ${formatINR(preOrderRemainingAmt)} is paid directly at the restaurant.`}
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                        >
                          Pay {restaurantAdvancePercent}% Demo Advance ({formatINR(preOrderAdvanceAmt)})
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          )}

          {/* TAB 4: C. CELEBRATE AN OCCASION (Packages + Custom Request) */}
          {activeTab === 'celebrate' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                    Celebrate an Occasion at {restaurant.name}
                  </h3>
                  <p className="text-xs text-[#57534E] mt-0.5">
                    Decoration Included – No Additional Charges (₹0). Choose an approved package or submit a bespoke request.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCelSubTab('packages');
                      setFormError('');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                      celSubTab === 'packages'
                        ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                        : 'bg-white text-[#1C1917] border-[#E5E0D8]'
                    }`}
                  >
                    Approved Packages
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCelSubTab('custom');
                      setFormError('');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                      celSubTab === 'custom'
                        ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                        : 'bg-white text-[#1C1917] border-[#E5E0D8]'
                    }`}
                  >
                    Custom Celebration Request
                  </button>
                </div>
              </div>

              {celSubTab === 'packages' ? (
                celConfirmedRef ? (
                  <div className="py-8 text-center space-y-3">
                    <PartyPopper className="w-10 h-10 text-[#6E1E2E] mx-auto" />
                    <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                      Celebration Booking Logged ({celConfirmedRef})
                    </h3>
                    <p className="text-sm text-[#57534E] max-w-md mx-auto">
                      {chosenCelPkg?.name} for {celPlates} plates on {formatDisplayDate(celDate)}. Decoration Charge: ₹0 (Included). Track quotation &amp; confirmation inside your Customer Portal.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCelConfirmedRef(null)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                    >
                      Plan Another Celebration
                    </button>
                  </div>
                ) : restCelPackages.length === 0 ? (
                  <div className="p-5 border border-[#E5E0D8] rounded-lg space-y-3">
                    <p className="text-sm text-[#57534E]">
                      No pre-built celebration packages are published for {restaurant.name} yet. Submit a Custom Celebration Request instead!
                    </p>
                    <button
                      type="button"
                      onClick={() => setCelSubTab('custom')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                    >
                      Open Custom Celebration Request Form
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      {restCelPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            setSelectedCelPkgId(pkg.id);
                            setCelPlates(pkg.minPlates);
                          }}
                          className={`cursor-pointer border rounded-lg p-4 space-y-3 transition-colors ${
                            chosenCelPkg?.id === pkg.id
                              ? 'border-[#6E1E2E] bg-[#FAF9F6]/70'
                              : 'border-[#E5E0D8] bg-white'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-[#6E1E2E]">
                                {pkg.category} · {pkg.dietaryType}
                              </p>
                              <h4 className="text-lg font-semibold text-[#1C1917]">{pkg.name}</h4>
                              <p className="text-xs text-[#57534E] mt-0.5">{pkg.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-base font-semibold text-[#6E1E2E] tabular-nums">
                                {formatINR(pkg.pricePerPlate)} / plate
                              </p>
                              <p className="text-[11px] text-[#57534E] tabular-nums">
                                {pkg.minPlates}–{pkg.maxPlates} plates
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[#1C1917]">
                                Decoration Photos:
                              </span>
                              <span className="text-xs font-semibold text-[#1C1917] bg-[#ECF4EE] border border-[#BBD6C3] px-2.5 py-0.5 rounded">
                                Decoration Included – No Additional Charges (₹0)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {pkg.decorationPhotos.map((url, i) => (
                                <div
                                  key={`${pkg.id}-dec-${i}`}
                                  className="aspect-[4/3] rounded overflow-hidden border border-[#E5E0D8]"
                                >
                                  <SafeImage
                                    src={url}
                                    alt={`${pkg.name} decoration`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-[#57534E]">{pkg.decorationDetails}</p>
                          </div>

                          <div className="pt-2 border-t border-[#E5E0D8] space-y-1.5">
                            <p className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                              <Utensils className="w-3.5 h-3.5 text-[#6E1E2E]" />
                              <span>Food Included in Every Plate:</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                              {pkg.plateItems.map((pi) => (
                                <div key={pi.id}>
                                  <span className="font-semibold text-[#6E1E2E]">{pi.course}: </span>
                                  <span>
                                    {pi.itemName} ({pi.quantity})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Event Date</label>
                        <input
                          type="date"
                          value={celDate}
                          min={getTodayISO()}
                          onChange={(e) => setCelDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Event Time</label>
                        <select
                          value={celTime}
                          onChange={(e) => setCelTime(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Number of Plates ({chosenCelPkg?.minPlates}–{chosenCelPkg?.maxPlates})
                        </label>
                        <input
                          type="number"
                          min={chosenCelPkg?.minPlates || 2}
                          max={chosenCelPkg?.maxPlates || 60}
                          value={celPlates}
                          onChange={(e) => setCelPlates(Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Guest Name</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Email</label>
                        <input
                          type="email"
                          value={celEmail}
                          onChange={(e) => setCelEmail(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Food Preferences</label>
                        <input
                          type="text"
                          value={celFoodPref}
                          onChange={(e) => setCelFoodPref(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Special Requests</label>
                        <input
                          type="text"
                          value={celSpecialReq}
                          onChange={(e) => setCelSpecialReq(e.target.value)}
                          placeholder="Custom cake note, floral color..."
                          className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        />
                      </div>
                    </div>

                    <PaymentBreakdownCard
                      title="Celebration Payment Summary"
                      rows={[
                        { label: 'Package', value: chosenCelPkg?.name || '' },
                        { label: 'Plates & Rate', value: `${celPlates} × ${formatINR(chosenCelPkg?.pricePerPlate || 0)}` },
                        { label: 'Total Package Food Amount', value: formatINR(celTotalAmt) },
                        { label: 'Decoration Charge', value: 'FREE (₹0 — No Additional Charges)', accent: true },
                        { label: 'Remaining at Restaurant', value: formatINR(celRemainingAmt) },
                      ]}
                      totalLabel={`Advance Amount (${celAdvPercent}%)`}
                      totalValue={formatINR(celAdvAmt)}
                    />

                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleCelebrationSubmit(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-[#6E1E2E] border border-[#6E1E2E] rounded-lg hover:bg-[#FAF9F6]"
                      >
                        Request Quotation First
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCelebrationSubmit(true)}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                      >
                        Pay {celAdvPercent}% Demo Advance ({formatINR(celAdvAmt)})
                      </button>
                    </div>
                  </div>
                )
              ) : customConfirmedRef ? (
                <div className="py-8 text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-[#6E1E2E] mx-auto" />
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                    Custom Celebration Request Submitted ({customConfirmedRef})
                  </h3>
                  <p className="text-sm text-[#57534E] max-w-md mx-auto">
                    {restaurant.name} will review your theme and budget and send a custom quotation (Decoration ₹0). Advance payment unlocks only after you accept their quote in Customer Portal → Custom Requests.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCustomConfirmedRef(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                  >
                    Submit Another Custom Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">1. Occasion Type</label>
                      <select
                        value={customOccasion}
                        onChange={(e) => setCustomOccasion(e.target.value as CelebrationCategory)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      >
                        {CELEBRATION_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">2. Restaurant</label>
                      <input
                        type="text"
                        value={`${restaurant.name} (${restaurant.area})`}
                        readOnly
                        className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg text-[#1C1917]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">3. Preferred Date</label>
                      <input
                        type="date"
                        value={customDate}
                        min={getTodayISO()}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">4. Preferred Time</label>
                      <select
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">5. Number of Guests</label>
                      <input
                        type="number"
                        min={2}
                        max={150}
                        value={customGuests}
                        onChange={(e) => setCustomGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">6. Estimated Budget (₹)</label>
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        value={customBudget}
                        onChange={(e) => setCustomBudget(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">7. Decoration Theme (₹0 Fee)</label>
                      <input
                        type="text"
                        value={customTheme}
                        onChange={(e) => setCustomTheme(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">8. Preferred Colours</label>
                      <input
                        type="text"
                        value={customColors}
                        onChange={(e) => setCustomColors(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">9. Cake Requirements</label>
                      <input
                        type="text"
                        value={customCake}
                        onChange={(e) => setCustomCake(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">10. Food Preferences</label>
                      <input
                        type="text"
                        value={customFoodPref}
                        onChange={(e) => setCustomFoodPref(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">11. Special Instructions</label>
                    <textarea
                      rows={2}
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Music, surprise entrance timing, seating preference..."
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                    />
                  </div>

                  <div className="px-4 py-3 rounded-lg bg-[#ECF4EE] border border-[#BBD6C3] text-xs text-[#1C1917] flex flex-wrap justify-between gap-2">
                    <span>Decoration Included – No Additional Charges (₹0). Quote acceptance required before advance payment.</span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                    >
                      Submit Custom Request for Quotation (Demo)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[70] bg-[#1C1917]/85 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#E5E0D8] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1C1917]">{lightboxImage.title}</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-[#FAF9F6]">
              <SafeImage
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
