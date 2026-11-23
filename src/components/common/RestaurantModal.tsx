import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Image as ImageIcon,
  MapPin,
  PartyPopper,
  Phone,
  Sparkles,
  Star,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from './SafeImage';
import { formatDisplayDate, formatINR, getTodayISO, validateEmail, validateIndianMobile } from '../../utils/formatters';

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
    openDemoPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'preorder' | 'celebrate'>('overview');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // A. Book a Table state
  const [tableDate, setTableDate] = useState(getTodayISO());
  const [tableTime, setTableTime] = useState('07:30 PM');
  const [tableGuests, setTableGuests] = useState(4);
  const [tableOrderMode, setTableOrderMode] = useState<'Order at Restaurant' | 'Offer Table Booking'>('Order at Restaurant');
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

  // C. Celebrate an Occasion state
  const [selectedCelPkgId, setSelectedCelPkgId] = useState('');
  const [celDate, setCelDate] = useState(getTodayISO());
  const [celTime, setCelTime] = useState('07:30 PM');
  const [celPlates, setCelPlates] = useState(6);
  const [celFoodPref, setCelFoodPref] = useState('Pure Veg · Standard Spice');
  const [celSpecialReq, setCelSpecialReq] = useState('');
  const [celEmail, setCelEmail] = useState(customerUser.email);
  const [celConfirmedRef, setCelConfirmedRef] = useState<string | null>(null);

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
      setFormError('');
      setTableConfirmedRef(null);
      setPreOrderConfirmedRef(null);
      setCelConfirmedRef(null);
      setGuestName(customerUser.fullName);
      setGuestPhone(customerUser.mobile);
      setCelEmail(customerUser.email);
      setSelectedOfferId(restOffers[0]?.id || '');
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
  const chosenOffer = restOffers.find((o) => o.id === selectedOfferId) || restOffers[0];
  const offerFeePerGuest = chosenOffer
    ? chosenOffer.offerTier === 'Premium'
      ? platformSettings.premiumOfferFeePerGuest
      : platformSettings.basicOfferFeePerGuest
    : 0;
  const totalPlatformFee =
    tableOrderMode === 'Offer Table Booking' && chosenOffer
      ? tableGuests * offerFeePerGuest
      : 0;

  const chosenPrePkg =
    restPrePackages.find((p) => p.id === selectedPrePkgId) || restPrePackages[0];
  const preOrderTotalFood = chosenPrePkg ? chosenPrePkg.pricePerPlate * plateCount : 0;
  const advancePercent = platformSettings.defaultPreOrderAdvancePercent;
  const preOrderAdvanceAmt = Math.round((preOrderTotalFood * advancePercent) / 100);
  const preOrderRemainingAmt = preOrderTotalFood - preOrderAdvanceAmt;

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

    if (tableOrderMode === 'Offer Table Booking' && chosenOffer) {
      openDemoPayment({
        title: 'Offer-Based Table Booking Fee (DEMO ONLY)',
        referenceId: `TBL-${restaurant.id.slice(-4).toUpperCase()}`,
        paymentType: 'Platform Booking Fee',
        customerName: guestName.trim(),
        restaurantName: restaurant.name,
        amount: totalPlatformFee,
        breakdownLines: [
          { label: 'Number of Guests', value: `${tableGuests} Guests` },
          { label: 'Selected Offer', value: `${chosenOffer.title} (${chosenOffer.offerTier} Offer)` },
          { label: 'Fee Per Guest', value: `${formatINR(offerFeePerGuest)} / guest` },
          { label: 'Restaurant Food Bill', value: 'Pay directly at restaurant (₹0 food advance)' },
        ],
        onComplete: (txnId) => {
          const created = createTableReservation({
            restaurant,
            date: tableDate,
            time: tableTime,
            guests: tableGuests,
            customerName: guestName.trim(),
            customerPhone: guestPhone.trim(),
            orderMode: 'Offer Table Booking',
            selectedOffer: chosenOffer,
            feePerGuest: offerFeePerGuest,
            platformFeeTotal: totalPlatformFee,
            specialRequest: tableNotes.trim() || undefined,
            transactionId: txnId,
          });
          setTableConfirmedRef(created.id);
        },
      });
    } else {
      const created = createTableReservation({
        restaurant,
        date: tableDate,
        time: tableTime,
        guests: tableGuests,
        customerName: guestName.trim(),
        customerPhone: guestPhone.trim(),
        orderMode: 'Order at Restaurant',
        specialRequest: tableNotes.trim() || 'Will order food at restaurant.',
      });
      setTableConfirmedRef(created.id);
    }
  };

  const handlePreOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (preOrderMode === 'Order at Restaurant') {
      setActiveTab('book');
      setTableOrderMode('Order at Restaurant');
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
      title: `Pre-Order Advance (${advancePercent}% · DEMO ONLY)`,
      referenceId: `PRE-${restaurant.id.slice(-4).toUpperCase()}`,
      paymentType: 'Food Pre-Order Advance',
      customerName: guestName.trim(),
      restaurantName: restaurant.name,
      amount: preOrderAdvanceAmt,
      breakdownLines: [
        { label: 'Selected Plate Package', value: chosenPrePkg.name },
        { label: 'Price Per Plate', value: formatINR(chosenPrePkg.pricePerPlate) },
        { label: 'Plate Quantity', value: `${plateCount} Plates` },
        { label: 'Total Food Amount', value: formatINR(preOrderTotalFood) },
        { label: `Advance Payment (${advancePercent}%)`, value: formatINR(preOrderAdvanceAmt) },
        { label: 'Remaining Payable at Restaurant', value: formatINR(preOrderRemainingAmt) },
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
          advancePercent,
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
          { label: 'Decoration Charge', value: 'FREE (₹0 — No Additional Charges)' },
          { label: `Advance Payment (${celAdvPercent}%)`, value: formatINR(celAdvAmt) },
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-title"
    >
      <div className="bg-white border border-[#E8DDD1] rounded-lg max-w-4xl w-full overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Hero Cover Header */}
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          <SafeImage
            src={restaurant.image}
            alt={`${restaurant.name} cover`}
            className="w-full h-full object-cover"
            fallbackTitle={restaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <button
            type="button"
            onClick={closeRestaurantModal}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-[#292321] hover:bg-white"
            aria-label="Close restaurant details"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(restaurant.id)}
            className="absolute top-3 right-14 p-2 rounded-full bg-white/95 text-[#702C3A] hover:bg-white"
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#702C3A]' : ''}`} />
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
              <p className="text-xs text-[#FFF6E9] truncate">
                {restaurant.cuisines.join(' · ')} · {restaurant.area}, {restaurant.city}
              </p>
              <h2 id="restaurant-modal-title" className="text-2xl sm:text-3xl font-semibold truncate">
                {restaurant.name}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/95 text-[#292321] text-xs font-semibold tabular-nums shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#702C3A] text-[#702C3A]" />
              <span>{restaurant.rating.toFixed(1)}</span>
              <span className="text-[#6B5F5C]">({restaurant.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* 3 Separate Booking Options + Profile Tab Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#E8DDD1] bg-[#FFF6E9] flex flex-wrap items-center gap-2 shrink-0">
          {[
            { id: 'overview' as const, label: 'Profile, Menu Photos & Gallery' },
            { id: 'book' as const, label: 'A. Book a Table' },
            { id: 'preorder' as const, label: 'B. Pre-order Food' },
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
                  ? 'bg-[#702C3A] text-white'
                  : 'bg-white text-[#292321] border border-[#E8DDD1] hover:border-[#702C3A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {formError && (
            <div className="px-4 py-2.5 rounded-lg bg-[#FDECEF] border border-[#F4A6B8] text-xs font-medium text-[#702C3A]">
              {formError}
            </div>
          )}

          {/* TAB 1: PROFILE, AMENITIES, PHOTO GALLERY, MENU PHOTOS, CELEBRATION PACKAGES */}
          {activeTab === 'overview' && (
            <div className="space-y-7">
              {/* Info Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#E8DDD1] text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#6B5F5C]">Address</p>
                    <p className="font-medium text-[#292321]">{restaurant.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#6B5F5C]">Hours &amp; Availability</p>
                    <p className="font-medium text-[#292321]">{restaurant.openingHours}</p>
                    <p className="text-xs text-[#6B5F5C]">{restaurant.priceRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#6B5F5C]">Host Desk</p>
                    <p className="font-medium text-[#292321] tabular-nums">{restaurant.contactNumber}</p>
                    <p className="text-xs text-[#702C3A]">{restaurant.availabilityNote}</p>
                  </div>
                </div>
              </div>

              {/* Three Experience Quick Launchers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  className="text-left p-4 rounded-lg border border-[#E8DDD1] bg-[#FFF6E9]/60 hover:border-[#702C3A] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#702C3A]">Option A</p>
                  <p className="text-base font-semibold text-[#292321] mt-0.5">Book a Table</p>
                  <p className="text-xs text-[#6B5F5C] mt-1">
                    Order at restaurant (₹0 advance) or apply a DineRestro offer.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preorder')}
                  className="text-left p-4 rounded-lg border border-[#E8DDD1] bg-[#FFF6E9]/60 hover:border-[#702C3A] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#702C3A]">Option B</p>
                  <p className="text-base font-semibold text-[#292321] mt-0.5">Pre-order Food</p>
                  <p className="text-xs text-[#6B5F5C] mt-1">
                    View menu photos, choose plate packages &amp; pay {advancePercent}% demo advance.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('celebrate')}
                  className="text-left p-4 rounded-lg border border-[#E8DDD1] bg-[#FFF6E9]/60 hover:border-[#702C3A] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#702C3A]">Option C</p>
                  <p className="text-base font-semibold text-[#292321] mt-0.5">Celebrate an Occasion</p>
                  <p className="text-xs text-[#6B5F5C] mt-1">
                    Full plate packages with decoration included at ₹0.
                  </p>
                </button>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-[#292321] mb-1">About {restaurant.name}</h3>
                <p className="text-sm text-[#6B5F5C] leading-relaxed">{restaurant.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-base font-semibold text-[#292321] mb-2">
                  Amenities &amp; Venue Facilities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                  {restaurant.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 px-3 py-2 rounded border border-[#E8DDD1] bg-[#FFF6E9]/45 text-[#292321]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#702C3A] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo-Based Menu Gallery (NO individual dish cards) */}
              <div>
                <div className="flex items-baseline justify-between mb-2.5">
                  <h3 className="text-base font-semibold text-[#292321]">
                    Restaurant Menu Gallery (Uploaded Menu Pages)
                  </h3>
                  <span className="text-xs text-[#6B5F5C] tabular-nums">
                    {restaurant.menuPhotos.length} page(s)
                  </span>
                </div>
                {restaurant.menuPhotos.length === 0 ? (
                  <p className="text-xs text-[#6B5F5C]">No menu photographs uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {restaurant.menuPhotos.map((page) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => setLightboxImage({ url: page.url, title: page.title })}
                        className="group text-left border border-[#E8DDD1] rounded-lg overflow-hidden hover:border-[#702C3A]"
                      >
                        <div className="aspect-[3/4] w-full overflow-hidden bg-[#FFF6E9]">
                          <SafeImage
                            src={page.url}
                            alt={page.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                            fallbackTitle={page.title}
                          />
                        </div>
                        <div className="p-2.5 bg-white">
                          <p className="text-xs font-semibold text-[#292321] truncate">
                            Page {page.pageNumber} · {page.title}
                          </p>
                          <p className="text-[11px] text-[#702C3A]">Click to enlarge menu</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Restaurant Photo Gallery */}
              <div>
                <h3 className="text-base font-semibold text-[#292321] mb-2.5">
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
                      className="text-left border border-[#E8DDD1] rounded-lg overflow-hidden hover:border-[#702C3A]"
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
                        <p className="font-semibold text-[#702C3A]">{photo.category}</p>
                        <p className="text-[#6B5F5C] truncate">{photo.caption}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Celebration Packages Preview */}
              {restCelPackages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-base font-semibold text-[#292321]">
                      Approved Celebration Packages
                    </h3>
                    <span className="text-xs font-semibold text-[#702C3A]">
                      Decoration Included – No Additional Charges
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {restCelPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border border-[#E8DDD1] rounded-lg p-4 bg-[#FFF6E9]/45 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-[#702C3A]">{pkg.category}</p>
                            <h4 className="text-base font-semibold text-[#292321]">{pkg.name}</h4>
                          </div>
                          <span className="font-mono text-sm font-semibold text-[#702C3A] tabular-nums shrink-0">
                            {formatINR(pkg.pricePerPlate)}/plate
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5F5C]">{pkg.description}</p>
                        <p className="text-xs font-semibold text-[#292321] bg-[#E7EFD9] px-2.5 py-1 rounded inline-block">
                          Decoration Included – No Additional Charges (₹0)
                        </p>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCelPkgId(pkg.id);
                              setCelPlates(pkg.minPlates);
                              setActiveTab('celebrate');
                            }}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                          >
                            Book Celebration Package
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offers & Reviews */}
              {restOffers.length > 0 && (
                <div className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-[#292321]">Active Restaurant Offers</h3>
                  {restOffers.map((off) => (
                    <div key={off.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span>
                        <strong className="text-[#702C3A]">{off.title}</strong> ({off.discountLabel} ·{' '}
                        {off.offerTier} Offer: ₹
                        {off.offerTier === 'Premium'
                          ? platformSettings.premiumOfferFeePerGuest
                          : platformSettings.basicOfferFeePerGuest}
                        /guest)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOfferId(off.id);
                          setTableOrderMode('Offer Table Booking');
                          setActiveTab('book');
                        }}
                        className="font-semibold text-[#702C3A] underline"
                      >
                        Apply in Table Booking
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {restReviews.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-[#292321] mb-2">Diner Reviews</h3>
                  <div className="space-y-2">
                    {restReviews.map((rv) => (
                      <div key={rv.id} className="border border-[#E8DDD1] rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#292321]">{rv.customerName}</span>
                          <span className="font-mono text-[#702C3A]">★ {rv.rating}</span>
                        </div>
                        <p className="text-[#6B5F5C] mt-1">{rv.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: A. BOOK A TABLE (Order at Restaurant OR Offer-Based Platform Fee) */}
          {activeTab === 'book' && (
            <div className="space-y-5">
              {tableConfirmedRef ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#702C3A] mx-auto" />
                  <h3 className="text-2xl font-semibold text-[#292321]">
                    Table Booking Logged ({tableConfirmedRef})
                  </h3>
                  <p className="text-sm text-[#6B5F5C] max-w-md mx-auto">
                    {tableOrderMode === 'Order at Restaurant'
                      ? `Reserved for ${tableGuests} guests on ${formatDisplayDate(tableDate)} at ${tableTime}. No advance food payment required — pay directly at the restaurant.`
                      : `Offer-based table reservation recorded for ${tableGuests} guests. Platform fee (${formatINR(totalPlatformFee)}) marked DEMO PAID separately from your restaurant food bill.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTableConfirmedRef(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                  >
                    Create Another Table Booking
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookTableSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-[#292321]">
                      A. Book a Table at {restaurant.name}
                    </h3>
                    <p className="text-xs text-[#6B5F5C] mt-0.5">
                      Choose between standard Order at Restaurant (₹0 advance) or an Offer-Based Table Booking.
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTableOrderMode('Order at Restaurant')}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        tableOrderMode === 'Order at Restaurant'
                          ? 'border-[#702C3A] bg-[#FFF6E9]'
                          : 'border-[#E8DDD1] bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#292321]">
                        Option B: Order at Restaurant
                      </p>
                      <p className="text-xs text-[#6B5F5C] mt-1">
                        Reserve your table now and order food after reaching the restaurant. No advance payment or platform fee required.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTableOrderMode('Offer Table Booking')}
                      disabled={restOffers.length === 0}
                      className={`p-4 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                        tableOrderMode === 'Offer Table Booking'
                          ? 'border-[#702C3A] bg-[#FFF6E9]'
                          : 'border-[#E8DDD1] bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#702C3A]">
                        Apply DineRestro Offer (Platform Fee)
                      </p>
                      <p className="text-xs text-[#6B5F5C] mt-1">
                        Select a Basic (₹{platformSettings.basicOfferFeePerGuest}/guest) or Premium (₹{platformSettings.premiumOfferFeePerGuest}/guest) dining offer.
                      </p>
                    </button>
                  </div>

                  {tableOrderMode === 'Offer Table Booking' && restOffers.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#292321]">
                        Select Eligible DineRestro Offer
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
                              onClick={() => setSelectedOfferId(off.id)}
                              className={`p-3 rounded-lg border text-left text-xs ${
                                chosenOffer?.id === off.id
                                  ? 'border-[#702C3A] bg-[#FFF6E9]'
                                  : 'border-[#E8DDD1] bg-white'
                              }`}
                            >
                              <p className="font-semibold text-[#292321]">{off.title}</p>
                              <p className="text-[#702C3A] mt-0.5 font-medium">
                                {off.discountLabel} · {off.offerTier} Offer (₹{fee}/guest)
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Date</label>
                      <input
                        type="date"
                        value={tableDate}
                        min={getTodayISO()}
                        onChange={(e) => setTableDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Time Slot</label>
                      <select
                        value={tableTime}
                        onChange={(e) => setTableTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Guests</label>
                      <select
                        value={tableGuests}
                        onChange={(e) => setTableGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg tabular-nums"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Guest Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Table Notes (Optional)</label>
                    <input
                      type="text"
                      value={tableNotes}
                      onChange={(e) => setTableNotes(e.target.value)}
                      placeholder="Quiet corner, river-facing seating..."
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    />
                  </div>

                  {/* Separate Payment Summary for A. Offer-Based Table Booking */}
                  <div className="border border-[#E8DDD1] rounded-lg p-4 bg-[#FFF6E9]/50 space-y-2 text-xs">
                    <p className="font-semibold text-[#292321]">
                      Customer Payment Summary — Table Booking
                    </p>
                    {tableOrderMode === 'Offer Table Booking' && chosenOffer ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Number of Guests</span>
                          <span className="font-mono tabular-nums font-medium">{tableGuests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Selected Offer</span>
                          <span className="font-medium text-[#292321]">
                            {chosenOffer.title} ({chosenOffer.offerTier} Offer)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Platform Fee Per Guest</span>
                          <span className="font-mono tabular-nums">{formatINR(offerFeePerGuest)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#E8DDD1] font-semibold text-sm text-[#702C3A]">
                          <span>Total Platform Fee ({tableGuests} × ₹{offerFeePerGuest})</span>
                          <span className="font-mono tabular-nums">{formatINR(totalPlatformFee)}</span>
                        </div>
                        <p className="text-[11px] text-[#6B5F5C]">
                          Note: Platform booking fee is separate from your restaurant food bill, which is settled directly at {restaurant.name}.
                        </p>
                      </>
                    ) : (
                      <div className="flex justify-between font-semibold text-[#292321]">
                        <span>Order at Restaurant — Advance Food Payment</span>
                        <span className="font-mono text-[#702C3A]">₹0 (Pay food bill at restaurant)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
                    >
                      {tableOrderMode === 'Offer Table Booking'
                        ? `Proceed to Demo Fee Payment (${formatINR(totalPlatformFee)})`
                        : 'Confirm Table Reservation (Demo)'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: B. PRE-ORDER FOOD (Plate Packages + Menu Photo View) */}
          {activeTab === 'preorder' && (
            <div className="space-y-5">
              {preOrderConfirmedRef ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#702C3A] mx-auto" />
                  <h3 className="text-2xl font-semibold text-[#292321]">
                    Food Pre-Order Recorded ({preOrderConfirmedRef})
                  </h3>
                  <p className="text-sm text-[#6B5F5C] max-w-md mx-auto">
                    {plateCount} × {chosenPrePkg?.name}. Advance ({formatINR(preOrderAdvanceAmt)}) marked DEMO PAID. Remaining {formatINR(preOrderRemainingAmt)} payable at {restaurant.name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreOrderConfirmedRef(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                  >
                    Create Another Pre-Order
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePreOrderSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-[#292321]">
                      B. Pre-order Food — Plate-Wise Ordering
                    </h3>
                    <p className="text-xs text-[#6B5F5C] mt-0.5">
                      Inspect uploaded menu photos, choose a plate package, and pay the configurable {advancePercent}% advance (DEMO ONLY).
                    </p>
                  </div>

                  {/* Option A vs Option B */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreOrderMode('Pre-order Food')}
                      className={`p-3.5 rounded-lg border text-left ${
                        preOrderMode === 'Pre-order Food'
                          ? 'border-[#702C3A] bg-[#FFF6E9]'
                          : 'border-[#E8DDD1] bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#702C3A]">
                        Option A: Pre-order Food ({advancePercent}% Advance)
                      </p>
                      <p className="text-xs text-[#6B5F5C] mt-0.5">
                        Select plate packages and quantities ahead of arrival.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreOrderMode('Order at Restaurant');
                        setActiveTab('book');
                        setTableOrderMode('Order at Restaurant');
                      }}
                      className="p-3.5 rounded-lg border border-[#E8DDD1] bg-white text-left hover:border-[#702C3A]"
                    >
                      <p className="text-sm font-semibold text-[#292321]">
                        Option B: Order at Restaurant (₹0 Advance)
                      </p>
                      <p className="text-xs text-[#6B5F5C] mt-0.5">
                        Reserve a table only and pay your food bill directly at the restaurant.
                      </p>
                    </button>
                  </div>

                  {/* Quick Menu Photo Strip */}
                  {restaurant.menuPhotos.length > 0 && (
                    <div className="border border-[#E8DDD1] rounded-lg p-3.5 bg-white space-y-2">
                      <p className="text-xs font-semibold text-[#292321] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#702C3A]" />
                        <span>Uploaded Restaurant Menu Pages (Click to Preview)</span>
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {restaurant.menuPhotos.map((mp) => (
                          <button
                            key={mp.id}
                            type="button"
                            onClick={() => setLightboxImage({ url: mp.url, title: mp.title })}
                            className="w-24 shrink-0 border border-[#E8DDD1] rounded overflow-hidden hover:border-[#702C3A]"
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
                    <div className="p-5 border border-[#E8DDD1] rounded-lg text-sm text-[#6B5F5C]">
                      This restaurant currently accepts table reservations with ordering at the venue. Switch to Option A (Book a Table) above.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-[#292321]">
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
                                  ? 'border-[#702C3A] bg-[#FFF6E9]'
                                  : 'border-[#E8DDD1] bg-white'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[#292321]">{pkg.name}</p>
                                  <p className="text-xs text-[#6B5F5C]">
                                    {pkg.dietaryType} · Min {pkg.minPlates} plates · {pkg.description}
                                  </p>
                                </div>
                                <span className="font-mono text-sm font-semibold text-[#702C3A] tabular-nums shrink-0">
                                  {formatINR(pkg.pricePerPlate)}/plate
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-[#E8DDD1]/80 text-[11px]">
                                {pkg.plateItems.map((pi) => (
                                  <div key={pi.id} className="text-[#292321]">
                                    <span className="font-semibold text-[#702C3A]">{pi.course}: </span>
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
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
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
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Arrival Time</label>
                          <select
                            value={preOrderTime}
                            onChange={(e) => setPreOrderTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Guest Name</label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      {/* Separate Payment Summary for B. Regular Food Pre-order */}
                      <div className="border border-[#E8DDD1] rounded-lg p-4 bg-[#FFF6E9]/50 space-y-2 text-xs">
                        <p className="font-semibold text-[#292321]">
                          Customer Payment Summary — Regular Food Pre-order
                        </p>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Selected Plates</span>
                          <span className="font-medium">{plateCount} × {chosenPrePkg?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Price Per Plate</span>
                          <span className="font-mono tabular-nums">{formatINR(chosenPrePkg?.pricePerPlate || 0)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-[#6B5F5C]">Total Food Amount</span>
                          <span className="font-mono tabular-nums">{formatINR(preOrderTotalFood)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#E8DDD1] font-semibold text-sm text-[#702C3A]">
                          <span>Advance Payment Required ({advancePercent}%)</span>
                          <span className="font-mono tabular-nums">{formatINR(preOrderAdvanceAmt)}</span>
                        </div>
                        <div className="flex justify-between text-[#292321]">
                          <span>Remaining Amount (Payable at Restaurant)</span>
                          <span className="font-mono tabular-nums font-medium">{formatINR(preOrderRemainingAmt)}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
                        >
                          Pay {advancePercent}% Demo Advance ({formatINR(preOrderAdvanceAmt)})
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          )}

          {/* TAB 4: C. CELEBRATE AN OCCASION */}
          {activeTab === 'celebrate' && (
            <div className="space-y-5">
              {celConfirmedRef ? (
                <div className="py-8 text-center space-y-3">
                  <PartyPopper className="w-10 h-10 text-[#702C3A] mx-auto" />
                  <h3 className="text-2xl font-semibold text-[#292321]">
                    Celebration Booking Logged ({celConfirmedRef})
                  </h3>
                  <p className="text-sm text-[#6B5F5C] max-w-md mx-auto">
                    {chosenCelPkg?.name} for {celPlates} plates on {formatDisplayDate(celDate)}. Decoration Charge: FREE (₹0). Check your Customer Dashboard Events tab for quotation &amp; status tracking.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCelConfirmedRef(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                  >
                    Plan Another Celebration
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-[#292321]">
                      C. Celebrate an Occasion at {restaurant.name}
                    </h3>
                    <p className="text-xs text-[#6B5F5C] mt-0.5">
                      Every celebration package includes custom table decoration at ₹0.
                    </p>
                  </div>

                  {restCelPackages.length === 0 ? (
                    <div className="p-5 border border-[#E8DDD1] rounded-lg text-sm text-[#6B5F5C]">
                      No approved celebration packages are currently listed for {restaurant.name}. Visit the Events page to inquire across all Varanasi venues.
                    </div>
                  ) : (
                    <>
                      {/* Package Selector */}
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
                                ? 'border-[#702C3A] bg-[#FFF6E9]/70'
                                : 'border-[#E8DDD1] bg-white'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-[#702C3A]">
                                  {pkg.category} · {pkg.dietaryType}
                                </p>
                                <h4 className="text-lg font-semibold text-[#292321]">{pkg.name}</h4>
                                <p className="text-xs text-[#6B5F5C] mt-0.5">{pkg.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono text-base font-semibold text-[#702C3A] tabular-nums">
                                  {formatINR(pkg.pricePerPlate)} / plate
                                </p>
                                <p className="text-[11px] text-[#6B5F5C] tabular-nums">
                                  {pkg.minPlates}–{pkg.maxPlates} plates
                                </p>
                              </div>
                            </div>

                            {/* Actual Decoration Photos + Free Decoration Badge */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[#292321]">
                                  Included Decoration Setup:
                                </span>
                                <span className="text-xs font-semibold text-[#292321] bg-[#E7EFD9] border border-[#C8D8AC] px-2.5 py-0.5 rounded">
                                  Decoration Included – No Additional Charges (₹0)
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {pkg.decorationPhotos.map((url, i) => (
                                  <div
                                    key={`${pkg.id}-dec-${i}`}
                                    className="aspect-[4/3] rounded overflow-hidden border border-[#E8DDD1]"
                                  >
                                    <SafeImage
                                      src={url}
                                      alt={`${pkg.name} decoration`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-[#6B5F5C]">{pkg.decorationDetails}</p>
                            </div>

                            {/* Food Included in Every Plate */}
                            <div className="pt-2 border-t border-[#E8DDD1] space-y-1.5">
                              <p className="text-xs font-semibold text-[#292321] flex items-center gap-1.5">
                                <Utensils className="w-3.5 h-3.5 text-[#702C3A]" />
                                <span>Food Included in Every Plate:</span>
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                {pkg.plateItems.map((pi) => (
                                  <div key={pi.id}>
                                    <span className="font-semibold text-[#702C3A]">{pi.course}: </span>
                                    <span>{pi.itemName} ({pi.quantity})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Event Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Event Date</label>
                          <input
                            type="date"
                            value={celDate}
                            min={getTodayISO()}
                            onChange={(e) => setCelDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Event Time</label>
                          <select
                            value={celTime}
                            onChange={(e) => setCelTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
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
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Email</label>
                          <input
                            type="email"
                            value={celEmail}
                            onChange={(e) => setCelEmail(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
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
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Special Requests</label>
                          <input
                            type="text"
                            value={celSpecialReq}
                            onChange={(e) => setCelSpecialReq(e.target.value)}
                            placeholder="Custom cake note, floral color..."
                            className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Separate Payment Summary for C. Celebration */}
                      <div className="border border-[#E8DDD1] rounded-lg p-4 bg-[#FFF6E9]/50 space-y-2 text-xs">
                        <p className="font-semibold text-[#292321]">
                          Customer Payment Summary — Celebration
                        </p>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Package Name</span>
                          <span className="font-medium text-[#292321]">{chosenCelPkg?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Food Included</span>
                          <span className="font-medium">{chosenCelPkg?.plateItems.length} courses per plate</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Price Per Plate</span>
                          <span className="font-mono tabular-nums">{formatINR(chosenCelPkg?.pricePerPlate || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Number of Plates</span>
                          <span className="font-mono tabular-nums">{celPlates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B5F5C]">Decoration Charge</span>
                          <span className="font-semibold text-[#292321]">FREE (₹0 — No Additional Charges)</span>
                        </div>
                        <div className="flex justify-between font-semibold text-[#292321]">
                          <span>Total Package Amount</span>
                          <span className="font-mono tabular-nums">{formatINR(celTotalAmt)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#E8DDD1] font-semibold text-sm text-[#702C3A]">
                          <span>Approved Advance Amount ({celAdvPercent}%)</span>
                          <span className="font-mono tabular-nums">{formatINR(celAdvAmt)}</span>
                        </div>
                        <div className="flex justify-between text-[#292321]">
                          <span>Remaining Payment (At Restaurant)</span>
                          <span className="font-mono tabular-nums font-medium">{formatINR(celRemainingAmt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleCelebrationSubmit(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-[#702C3A] border border-[#702C3A] rounded-lg hover:bg-[#FFF6E9]"
                        >
                          Request Custom Quotation First
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCelebrationSubmit(true)}
                          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
                        >
                          Pay {celAdvPercent}% Demo Advance ({formatINR(celAdvAmt)})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Preview for Menu Photos & Gallery */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#E8DDD1] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#292321]">{lightboxImage.title}</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-[#FFF6E9]">
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
