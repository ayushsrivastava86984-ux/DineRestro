import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageSquarePlus,
  Minus,
  PartyPopper,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from './SafeImage';
import { PaymentBreakdownCard } from './PaymentBreakdownCard';
import { MENU_CATEGORIES } from '../../data/mockData';
import type { FoodPreOrder, MenuItem } from '../../types';
import {
  calculateCartOrderTotals,
  type CartOrderMode,
} from '../../utils/foodOrderHelpers';
import {
  MAX_CELEBRATION_NOTE_LENGTH,
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
  const navigate = useNavigate();
  const location = useLocation();
  const {
    role,
    selectedRestaurantForModal,
    modalInitialTab,
    closeRestaurantModal,
    requireCustomerAuth,
    restoredBookingDraft,
    consumeRestoredBookingDraft,
    favoriteIds,
    toggleFavorite,
    customerUser,
    offers,
    menuItems,
    cart,
    addToCart,
    replaceCartWithItem,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    preOrderPackages,
    celebrationPackages,
    reviews,
    platformSettings,
    createTableReservation,
    createFoodPreOrder,
    createCartFoodOrder,
    createCelebrationBooking,
    openDemoPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'book' | 'preorder' | 'celebrate'>('overview');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Interactive Menu & Cart Ordering state
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All');
  const [menuDietaryFilter, setMenuDietaryFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [cartConflictItem, setCartConflictItem] = useState<MenuItem | null>(null);
  const [cartOrderMode, setCartOrderMode] = useState<CartOrderMode>('Pre-Order Advance');
  const [cartDate, setCartDate] = useState(getTodayISO());
  const [cartTime, setCartTime] = useState('08:00 PM');
  const [cartSpecialInstructions, setCartSpecialInstructions] = useState('');
  const [showCartReview, setShowCartReview] = useState(false);
  const [confirmedCartOrder, setConfirmedCartOrder] = useState<FoodPreOrder | null>(null);

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

  // C. Celebrate an Occasion state (Ready-Made Packages + Optional Note)
  const [selectedCelPkgId, setSelectedCelPkgId] = useState('');
  const [celDate, setCelDate] = useState(getTodayISO());
  const [celTime, setCelTime] = useState('07:30 PM');
  const [celPlates, setCelPlates] = useState(6);
  const [celFoodPref, setCelFoodPref] = useState('Pure Veg · Standard Spice');
  const [celCustomerNote, setCelCustomerNote] = useState('');
  const [celEmail, setCelEmail] = useState(customerUser.email);
  const [celConfirmedInfo, setCelConfirmedInfo] = useState<{
    id: string;
    note?: string;
  } | null>(null);

  const [formError, setFormError] = useState('');

  const restaurant = selectedRestaurantForModal;
  const restOffers = restaurant
    ? offers.filter((o) => o.active && o.restaurantId === restaurant.id)
    : [];
  const restMenuItems = restaurant
    ? menuItems.filter((m) => m.restaurantId === restaurant.id)
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
      const matchingDraft =
        restoredBookingDraft &&
        restoredBookingDraft.kind === 'restaurant_modal' &&
        restoredBookingDraft.restaurantId === restaurant.id
          ? restoredBookingDraft.draft
          : undefined;

      setActiveTab(modalInitialTab || 'overview');
      setTableStep(matchingDraft?.tableGuests ? 3 : 1);
      setTableTier(matchingDraft?.tableTier || restaurant.tier || 'Basic');
      setFormError('');
      setTableConfirmedRef(null);
      setPreOrderConfirmedRef(null);
      setConfirmedCartOrder(null);
      setShowCartReview(false);
      setCartConflictItem(null);
      setMenuSearch('');
      setMenuCategoryFilter('All');
      setMenuDietaryFilter('All');
      setCelConfirmedInfo(null);
      setGuestName(matchingDraft?.preOrderGuestName || customerUser.fullName);
      setGuestPhone(matchingDraft?.preOrderGuestPhone || customerUser.mobile);
      setCelEmail(customerUser.email);

      if (matchingDraft?.preOrderDate) setCartDate(matchingDraft.preOrderDate);
      if (matchingDraft?.preOrderTime) setCartTime(matchingDraft.preOrderTime);
      if (matchingDraft?.preOrderMode) {
        setCartOrderMode(
          matchingDraft.preOrderMode === 'Order at Restaurant'
            ? 'Order at Restaurant'
            : 'Pre-Order Advance'
        );
      }
      if (matchingDraft?.preOrderSpecialInstructions !== undefined) {
        setCartSpecialInstructions(matchingDraft.preOrderSpecialInstructions);
      }
      if (
        (restoredBookingDraft?.tab === 'menu' || modalInitialTab === 'menu') &&
        matchingDraft
      ) {
        setShowCartReview(true);
      }

      if (matchingDraft?.tableDate) setTableDate(matchingDraft.tableDate);
      if (matchingDraft?.tableTime) setTableTime(matchingDraft.tableTime);
      if (matchingDraft?.tableGuests) setTableGuests(matchingDraft.tableGuests);
      setSelectedOfferId(matchingDraft?.selectedOfferId || '');
      setTableNotes(matchingDraft?.tableNotes || '');

      const firstPre = restPrePackages[0];
      setSelectedPrePkgId(matchingDraft?.selectedPrePkgId || firstPre?.id || '');
      setPlateCount(matchingDraft?.plateCount || firstPre?.minPlates || 2);
      if (matchingDraft?.preOrderDate) setPreOrderDate(matchingDraft.preOrderDate);
      if (matchingDraft?.preOrderTime) setPreOrderTime(matchingDraft.preOrderTime);
      if (matchingDraft?.foodPreference) setFoodPreference(matchingDraft.foodPreference);

      const firstCel = restCelPackages[0];
      setSelectedCelPkgId(matchingDraft?.selectedCelPkgId || firstCel?.id || '');
      setCelPlates(matchingDraft?.celPlates || firstCel?.minPlates || 6);
      if (matchingDraft?.celDate) setCelDate(matchingDraft.celDate);
      if (matchingDraft?.celTime) setCelTime(matchingDraft.celTime);
      if (matchingDraft?.celFoodPref) setCelFoodPref(matchingDraft.celFoodPref);
      setCelCustomerNote(matchingDraft?.celCustomerNote || '');

      if (matchingDraft) {
        consumeRestoredBookingDraft();
      }
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

  const restaurantCart =
    cart && cart.restaurantId === restaurant.id ? cart : null;
  const restaurantCartCount = restaurantCart
    ? restaurantCart.items.reduce((sum, i) => sum + i.quantity, 0)
    : 0;
  const cartTotals = calculateCartOrderTotals(
    restaurantCart?.items || [],
    restaurantAdvancePercent,
    cartOrderMode
  );

  const availableCategoriesForRest = MENU_CATEGORIES.filter((cat) =>
    restMenuItems.some((item) => item.category === cat)
  );
  const filteredMenuItems = restMenuItems.filter((item) => {
    const q = menuSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    const matchesCategory =
      menuCategoryFilter === 'All' || item.category === menuCategoryFilter;
    const matchesDietary =
      menuDietaryFilter === 'All' || item.dietaryType === menuDietaryFilter;
    return matchesSearch && matchesCategory && matchesDietary;
  });

  const handleAddDishToCart = (item: MenuItem) => {
    setFormError('');
    setConfirmedCartOrder(null);
    const res = addToCart(restaurant, item);
    if (!res.added && res.reason === 'different_restaurant') {
      setCartConflictItem(item);
    }
  };

  const handleReviewCartCheckout = () => {
    setFormError('');
    if (!restaurantCart || restaurantCart.items.length === 0) {
      setFormError('Add at least one available dish to your cart before reviewing.');
      return;
    }
    const unavailableInCart = restaurantCart.items.find((ci) => {
      const live = restMenuItems.find((m) => m.id === ci.menuItemId);
      return !live || !live.available;
    });
    if (unavailableInCart) {
      setFormError(`"${unavailableInCart.name}" is currently unavailable. Please remove it from your cart.`);
      return;
    }
    if (!guestName.trim() || !validateIndianMobile(guestPhone)) {
      setFormError('Please enter a valid guest name and 10-digit mobile number.');
      return;
    }
    setShowCartReview(true);
  };

  const handleConfirmCartOrder = () => {
    setFormError('');
    if (!restaurantCart || restaurantCart.items.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }
    if (role !== 'customer') {
      redirectToCustomerLoginWithDraft('menu');
      return;
    }

    if (cartOrderMode === 'Order at Restaurant') {
      try {
        const created = createCartFoodOrder({
          restaurant,
          date: cartDate,
          time: cartTime,
          customerName: guestName.trim(),
          customerPhone: guestPhone.trim(),
          specialInstructions: cartSpecialInstructions.trim(),
          orderMode: 'Order at Restaurant',
        });
        setConfirmedCartOrder(created);
        setShowCartReview(false);
        setCartSpecialInstructions('');
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Unable to submit order.');
      }
      return;
    }

    openDemoPayment({
      title: `Food Pre-Order Advance (${cartTotals.advancePercent}% · DEMO ONLY)`,
      referenceId: `ORD-${restaurant.id.slice(-4).toUpperCase()}`,
      paymentType: 'Food Pre-Order Advance',
      customerName: guestName.trim(),
      restaurantName: restaurant.name,
      amount: cartTotals.advanceAmount,
      breakdownLines: [
        {
          label: 'Selected Dishes',
          value: `${cartTotals.distinctItemsCount} dish(es) · ${cartTotals.totalQuantity} qty`,
        },
        { label: 'Food Subtotal', value: formatINR(cartTotals.totalFoodAmount) },
        { label: 'Additional Charges', value: '₹0 (No platform table fee)' },
        {
          label: `Advance Payable Now (${cartTotals.advancePercent}%)`,
          value: formatINR(cartTotals.advanceAmount),
        },
        {
          label: 'Remaining Amount at Restaurant',
          value: formatINR(cartTotals.remainingAmount),
        },
      ],
      onComplete: (txnId) => {
        const created = createCartFoodOrder({
          restaurant,
          date: cartDate,
          time: cartTime,
          customerName: guestName.trim(),
          customerPhone: guestPhone.trim(),
          specialInstructions: cartSpecialInstructions.trim(),
          orderMode: 'Pre-Order Advance',
          transactionId: txnId,
        });
        setConfirmedCartOrder(created);
        setShowCartReview(false);
        setCartSpecialInstructions('');
      },
    });
  };

  const redirectToCustomerLoginWithDraft = (
    tab: 'menu' | 'book' | 'preorder' | 'celebrate'
  ) => {
    requireCustomerAuth({
      kind: 'restaurant_modal',
      restaurantId: restaurant.id,
      tab,
      returnPath: `${location.pathname}${location.search}`,
      draft: {
        tableDate,
        tableTime,
        tableGuests,
        tableTier,
        selectedOfferId,
        tableNotes,
        preOrderDate: tab === 'menu' ? cartDate : preOrderDate,
        preOrderTime: tab === 'menu' ? cartTime : preOrderTime,
        preOrderMode:
          tab === 'menu'
            ? cartOrderMode === 'Order at Restaurant'
              ? 'Order at Restaurant'
              : 'Pre-order Food'
            : preOrderMode,
        preOrderSpecialInstructions: cartSpecialInstructions,
        preOrderGuestName: guestName,
        preOrderGuestPhone: guestPhone,
        plateCount,
        selectedPrePkgId: chosenPrePkg?.id,
        foodPreference,
        celDate,
        celTime,
        celPlates,
        selectedCelPkgId: chosenCelPkg?.id,
        celFoodPref,
        celCustomerNote,
      },
    });
    navigate('/customer/login');
  };

  const handleBookTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (role !== 'customer') {
      redirectToCustomerLoginWithDraft('book');
      return;
    }
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
    if (role !== 'customer') {
      redirectToCustomerLoginWithDraft('preorder');
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
    if (role !== 'customer') {
      redirectToCustomerLoginWithDraft('celebrate');
      return;
    }
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
    const trimmedNote = celCustomerNote.trim();
    if (trimmedNote.length > MAX_CELEBRATION_NOTE_LENGTH) {
      setFormError(`Your note must be ${MAX_CELEBRATION_NOTE_LENGTH} characters or fewer.`);
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
            customerNote: trimmedNote,
            customerName: guestName.trim(),
            customerEmail: celEmail.trim(),
            customerPhone: guestPhone.trim(),
            advancePercent: celAdvPercent,
            payAdvanceNow: true,
            transactionId: txnId,
          });
          setCelConfirmedInfo({ id: created.id, note: created.customerNote });
          setCelCustomerNote('');
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
        customerNote: trimmedNote,
        customerName: guestName.trim(),
        customerEmail: celEmail.trim(),
        customerPhone: guestPhone.trim(),
        advancePercent: celAdvPercent,
        payAdvanceNow: false,
      });
      setCelConfirmedInfo({ id: created.id, note: created.customerNote });
      setCelCustomerNote('');
    }
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
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <p className="text-xs text-[#FAF9F6] truncate">
                  {restaurant.tier} Dining · {restaurant.category ? `${restaurant.category} · ` : ''}
                  {restaurant.cuisines.join(' · ')} · {restaurant.area}, {restaurant.city}
                </p>
                {restaurant.isDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF9F6] text-[#6E1E2E] shrink-0">
                    Demo Listing
                  </span>
                )}
              </div>
              <h2
                id="restaurant-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold truncate"
              >
                {restaurant.name}
              </h2>
            </div>
            {!restaurant.isDemo && restaurant.reviewCount > 0 && (
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
            { id: 'overview' as const, label: 'Profile & Gallery' },
            {
              id: 'menu' as const,
              label:
                restaurantCartCount > 0
                  ? `Menu & Order (${restaurantCartCount})`
                  : 'Menu & Order',
            },
            { id: 'book' as const, label: 'Book a Table' },
            { id: 'preorder' as const, label: 'Plate Packages' },
            { id: 'celebrate' as const, label: 'Celebrate' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setFormError('');
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#6E1E2E] text-white'
                  : 'bg-white text-[#1C1917] border border-[#E5E0D8] hover:border-[#6E1E2E]'
              }`}
            >
              {tab.id === 'menu' && <ShoppingBag className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {role !== 'customer' && activeTab !== 'overview' && (
            <div className="px-4 py-2.5 rounded-lg bg-[#FAF9F6] border border-[#6E1E2E]/30 text-xs text-[#6E1E2E] flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeTab === 'menu'
                    ? 'Browse the menu and build your cart freely. Customer login is checked only when confirming checkout; your cart will stay saved.'
                    : 'Customer login is required to complete any booking. Your selections will be preserved.'}
                </span>
              </span>
            </div>
          )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="text-left p-4 rounded-lg border border-[#6E1E2E]/40 bg-[#FAF9F6] hover:border-[#6E1E2E] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#6E1E2E]">Menu &amp; Cart</p>
                  <p className="text-base font-semibold text-[#1C1917] mt-0.5">Order From Menu</p>
                  <p className="text-xs text-[#57534E] mt-1 tabular-nums">
                    {restMenuItems.filter((m) => m.available).length} dishes · {restaurantAdvancePercent}% advance or ₹0 pay at table.
                  </p>
                </button>
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
                  <p className="text-base font-semibold text-[#1C1917] mt-0.5">Plate Packages</p>
                  <p className="text-xs text-[#57534E] mt-1">
                    Curated multi-course plate sets ({restaurantAdvancePercent}% restaurant advance).
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('celebrate')}
                  className="text-left p-4 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6]/60 hover:border-[#6E1E2E] transition-colors"
                >
                  <p className="text-xs font-semibold text-[#6E1E2E]">Option C</p>
                  <p className="text-base font-semibold text-[#1C1917] mt-0.5">Celebrate</p>
                  <p className="text-xs text-[#57534E] mt-1">
                    Ready celebration packages with ₹0 decoration &amp; optional instructions.
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-baseline gap-2.5">
                    <h3 className="text-base font-semibold text-[#1C1917]">
                      Restaurant Menu Gallery (Uploaded Menu Pages)
                    </h3>
                    <span className="text-xs text-[#57534E] tabular-nums">
                      {restaurant.menuPhotos.length} page(s)
                    </span>
                  </div>
                  {restMenuItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('menu')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6E1E2E] bg-[#FAF9F6] border border-[#6E1E2E]/40 rounded-lg hover:bg-[#6E1E2E] hover:text-white transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order Individual Dishes ({restMenuItems.length})</span>
                    </button>
                  )}
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

          {/* TAB 2: INTERACTIVE MENU & CART ORDERING */}
          {activeTab === 'menu' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E5E0D8]">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                    Menu &amp; Food Pre-Order — {restaurant.name}
                  </h3>
                  <p className="text-xs text-[#57534E] mt-0.5">
                    Select dishes directly into your cart. Choose{' '}
                    <strong className="text-[#6E1E2E]">
                      {restaurantAdvancePercent}% Pre-Order Advance
                    </strong>{' '}
                    or <strong className="text-[#1C1917]">Order at Restaurant (₹0 advance)</strong>. No table booking fee applies to food orders.
                  </p>
                </div>
                {restaurant.menuPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxImage({
                        url: restaurant.menuPhotos[0].url,
                        title: restaurant.menuPhotos[0].title,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#E5E0D8] rounded-lg bg-white text-[#1C1917] hover:border-[#6E1E2E]"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#6E1E2E]" />
                    <span>View Printed Menu Pages ({restaurant.menuPhotos.length})</span>
                  </button>
                )}
              </div>

              {cartConflictItem && cart && cart.restaurantId !== restaurant.id && (
                <div className="p-4 rounded-lg border border-[#6E1E2E]/50 bg-[#FDF2F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#6E1E2E]">
                      Cart Locked to {cart.restaurantName}
                    </p>
                    <p className="text-xs text-[#1C1917]">
                      Your cart currently holds {cart.items.length} item(s) from{' '}
                      <strong>{cart.restaurantName}</strong>. Clear your existing cart to add{' '}
                      <strong>{cartConflictItem.name}</strong> from {restaurant.name}?
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCartConflictItem(null)}
                      className="px-3 py-1.5 text-xs font-semibold border border-[#D6CFC5] bg-white text-[#1C1917] rounded-lg"
                    >
                      Keep Existing Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        replaceCartWithItem(restaurant, cartConflictItem);
                        setCartConflictItem(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#6E1E2E] text-white rounded-lg hover:bg-[#541522]"
                    >
                      Clear Cart &amp; Add Dish
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Menu Filters + Dish List */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#57534E] absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search dishes, ingredients, or category..."
                        aria-label="Search restaurant menu"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      />
                    </div>
                    <div className="inline-flex rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] p-0.5 shrink-0">
                      {(['All', 'Veg', 'Non-Veg'] as const).map((diet) => (
                        <button
                          key={diet}
                          type="button"
                          onClick={() => setMenuDietaryFilter(diet)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            menuDietaryFilter === diet
                              ? 'bg-[#6E1E2E] text-white'
                              : 'text-[#57534E] hover:text-[#1C1917]'
                          }`}
                        >
                          {diet}
                        </button>
                      ))}
                    </div>
                  </div>

                  {availableCategoriesForRest.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMenuCategoryFilter('All')}
                        className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                          menuCategoryFilter === 'All'
                            ? 'bg-[#1C1917] text-white border-[#1C1917]'
                            : 'bg-white text-[#57534E] border-[#E5E0D8] hover:border-[#6E1E2E]'
                        }`}
                      >
                        All ({restMenuItems.length})
                      </button>
                      {availableCategoriesForRest.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setMenuCategoryFilter(cat)}
                          className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                            menuCategoryFilter === cat
                              ? 'bg-[#1C1917] text-white border-[#1C1917]'
                              : 'bg-white text-[#57534E] border-[#E5E0D8] hover:border-[#6E1E2E]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {restMenuItems.length === 0 ? (
                    <div className="p-6 border border-[#E5E0D8] rounded-lg bg-[#FAF9F6] text-center space-y-2">
                      <p className="text-sm font-semibold text-[#1C1917]">
                        No individual menu items published yet
                      </p>
                      <p className="text-xs text-[#57534E]">
                        You can view printed menu pages in Profile &amp; Gallery or reserve a Plate Package.
                      </p>
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <div className="p-6 border border-[#E5E0D8] rounded-lg bg-[#FAF9F6] text-center space-y-2">
                      <p className="text-sm font-semibold text-[#1C1917]">No dishes match your filter</p>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuSearch('');
                          setMenuCategoryFilter('All');
                          setMenuDietaryFilter('All');
                        }}
                        className="text-xs font-semibold text-[#6E1E2E] underline"
                      >
                        Reset menu filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMenuItems.map((item) => {
                        const cartEntry = restaurantCart?.items.find(
                          (ci) => ci.menuItemId === item.id
                        );
                        const qtyInCart = cartEntry?.quantity || 0;
                        const isVeg = item.dietaryType === 'Veg';
                        const metaParts = [
                          item.category,
                          item.prepTimeMinutes ? `${item.prepTimeMinutes} min` : null,
                          item.isBestseller ? 'Bestseller' : null,
                          item.isRecommended ? 'Recommended' : null,
                        ].filter(Boolean);

                        return (
                          <div
                            key={item.id}
                            className={`border rounded-lg p-3.5 flex gap-3.5 transition-colors ${
                              item.available
                                ? 'border-[#E5E0D8] bg-white hover:border-[#6E1E2E]/40'
                                : 'border-[#E5E0D8] bg-[#FAF9F6]/70 opacity-75'
                            }`}
                          >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-[#E5E0D8] bg-[#FAF9F6]">
                              <SafeImage
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                fallbackTitle={item.name}
                              />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 text-[11px] font-medium text-[#57534E]">
                                  <span
                                    className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-[2px] border shrink-0 ${
                                      isVeg ? 'border-[#2F7D4F]' : 'border-[#B42318]'
                                    }`}
                                    aria-hidden="true"
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isVeg ? 'bg-[#2F7D4F]' : 'bg-[#B42318]'
                                      }`}
                                    />
                                  </span>
                                  <span className={isVeg ? 'text-[#2F7D4F] font-semibold' : 'text-[#B42318] font-semibold'}>
                                    {item.dietaryType}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="truncate">{metaParts.join(' · ')}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#1C1917] mt-0.5 leading-snug">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-[#57534E] mt-0.5 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-mono text-sm font-semibold text-[#1C1917] tabular-nums">
                                    {formatINR(item.price)}
                                  </span>
                                  {!item.available && (
                                    <span className="text-[11px] font-medium text-[#B42318]">
                                      Unavailable
                                    </span>
                                  )}
                                </div>

                                {!item.available ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] text-[#57534E] cursor-not-allowed"
                                  >
                                    Unavailable
                                  </button>
                                ) : qtyInCart > 0 ? (
                                  <div className="inline-flex items-center border border-[#6E1E2E] rounded-lg overflow-hidden bg-white">
                                    <button
                                      type="button"
                                      onClick={() => updateCartItemQuantity(item.id, -1)}
                                      aria-label={`Decrease ${item.name} quantity`}
                                      className="px-2.5 py-1.5 text-[#6E1E2E] hover:bg-[#FAF9F6]"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="px-2.5 py-1 text-xs font-mono font-semibold text-[#1C1917] tabular-nums">
                                      {qtyInCart}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateCartItemQuantity(item.id, 1)}
                                      aria-label={`Increase ${item.name} quantity`}
                                      className="px-2.5 py-1.5 text-[#6E1E2E] hover:bg-[#FAF9F6]"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddDishToCart(item)}
                                    className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add</span>
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

                {/* Right Column: Restaurant-Locked Cart, Checkout & Review */}
                <div className="lg:col-span-5 border border-[#E5E0D8] rounded-lg bg-[#FAF9F6] p-4 sm:p-5 space-y-4">
                  {confirmedCartOrder ? (
                    <div className="py-5 text-center space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-[#2F7D4F] mx-auto" />
                      <h4 className="font-display text-2xl font-semibold text-[#1C1917]">
                        Order Recorded ({confirmedCartOrder.id})
                      </h4>
                      <p className="text-xs text-[#57534E] leading-relaxed">
                        {confirmedCartOrder.orderMode === 'Order at Restaurant'
                          ? `Order at Restaurant confirmed for ${formatDisplayDate(confirmedCartOrder.date)} at ${confirmedCartOrder.time}. Total ${formatINR(confirmedCartOrder.totalFoodAmount)} payable directly at ${confirmedCartOrder.restaurantName}.`
                          : `Pre-order advance of ${formatINR(confirmedCartOrder.advanceAmount)} (${confirmedCartOrder.advancePercent}%) recorded. Remaining ${formatINR(confirmedCartOrder.remainingAmount)} payable at ${confirmedCartOrder.restaurantName}.`}
                      </p>
                      <div className="text-left border border-[#E5E0D8] bg-white rounded-lg p-3 space-y-1.5 text-xs">
                        {confirmedCartOrder.items?.map((oi) => (
                          <div key={oi.id} className="flex items-center justify-between gap-2">
                            <span className="text-[#1C1917] truncate">
                              {oi.quantity} × {oi.itemName}
                            </span>
                            <span className="font-mono text-[#1C1917] tabular-nums shrink-0">
                              {formatINR(oi.subtotal)}
                            </span>
                          </div>
                        ))}
                        {confirmedCartOrder.specialInstructions && (
                          <p className="pt-1.5 border-t border-[#E5E0D8] text-[11px] text-[#57534E]">
                            Note: {confirmedCartOrder.specialInstructions}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmedCartOrder(null)}
                        className="w-full py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                      >
                        Start Another Menu Order
                      </button>
                    </div>
                  ) : cart && cart.restaurantId !== restaurant.id && cart.items.length > 0 ? (
                    <div className="space-y-3 text-center py-4">
                      <ShoppingBag className="w-8 h-8 text-[#6E1E2E] mx-auto" />
                      <h4 className="text-sm font-semibold text-[#1C1917]">
                        Active Cart belongs to {cart.restaurantName}
                      </h4>
                      <p className="text-xs text-[#57534E]">
                        DineRestro keeps each food order strictly tied to one restaurant ({cart.items.length} item(s) waiting in your {cart.restaurantName} cart).
                      </p>
                      <button
                        type="button"
                        onClick={() => clearCart()}
                        className="px-4 py-2 text-xs font-semibold border border-[#D6CFC5] bg-white text-[#1C1917] rounded-lg hover:border-[#6E1E2E]"
                      >
                        Clear {cart.restaurantName} Cart
                      </button>
                    </div>
                  ) : !restaurantCart || restaurantCart.items.length === 0 ? (
                    <div className="py-6 text-center space-y-2.5">
                      <ShoppingBag className="w-8 h-8 text-[#6E1E2E]/70 mx-auto" />
                      <h4 className="text-sm font-semibold text-[#1C1917]">Your Cart is Empty</h4>
                      <p className="text-xs text-[#57534E] leading-relaxed">
                        Add individual dishes from {restaurant.name}&apos;s menu to build your food order. Pre-orders require a {restaurantAdvancePercent}% advance, or pick Order at Restaurant with ₹0 online advance.
                      </p>
                    </div>
                  ) : showCartReview ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2.5">
                        <div>
                          <p className="text-[11px] font-semibold text-[#6E1E2E] uppercase tracking-wider">
                            Step 2 · Review &amp; Confirm
                          </p>
                          <h4 className="text-base font-semibold text-[#1C1917]">
                            {restaurant.name}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCartReview(false)}
                          className="text-xs font-semibold text-[#6E1E2E] hover:underline"
                        >
                          Edit Cart
                        </button>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {restaurantCart.items.map((ci) => (
                          <div
                            key={ci.menuItemId}
                            className="bg-white border border-[#E5E0D8] rounded-lg p-2.5 flex items-center gap-2.5 text-xs"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-[#E5E0D8]">
                              <SafeImage src={ci.imageUrl} alt={ci.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#1C1917] truncate">{ci.name}</p>
                              <p className="text-[11px] text-[#57534E] tabular-nums">
                                {formatINR(ci.price)} × {ci.quantity}
                              </p>
                            </div>
                            <span className="font-mono font-semibold text-[#1C1917] tabular-nums shrink-0">
                              {formatINR(ci.price * ci.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white border border-[#E5E0D8] rounded-lg p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-[#57534E]">Dining Slot</span>
                          <span className="font-medium text-[#1C1917]">
                            {formatDisplayDate(cartDate)} · {cartTime}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#57534E]">Guest</span>
                          <span className="font-medium text-[#1C1917]">
                            {guestName} ({guestPhone})
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#57534E]">Order Type</span>
                          <span className="font-semibold text-[#6E1E2E]">{cartOrderMode}</span>
                        </div>
                        {cartSpecialInstructions.trim() && (
                          <div className="pt-1 border-t border-[#E5E0D8]">
                            <p className="text-[#57534E]">Special Instructions:</p>
                            <p className="text-[#1C1917]">{cartSpecialInstructions}</p>
                          </div>
                        )}
                      </div>

                      <PaymentBreakdownCard
                        title="Order Payment Summary"
                        rows={[
                          { label: 'Food Subtotal', value: formatINR(cartTotals.totalFoodAmount) },
                          { label: 'Additional Charges (No table fee)', value: '₹0' },
                          { label: 'Total Amount', value: formatINR(cartTotals.totalFoodAmount), accent: true },
                          {
                            label: 'Remaining Payable at Restaurant',
                            value: formatINR(cartTotals.remainingAmount),
                          },
                        ]}
                        totalLabel={
                          cartOrderMode === 'Order at Restaurant'
                            ? 'Online Advance Payable Now'
                            : `Advance Payable Now (${cartTotals.advancePercent}%)`
                        }
                        totalValue={formatINR(cartTotals.advanceAmount)}
                      />

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCartReview(false)}
                          className="sm:w-1/3 py-2.5 text-xs font-semibold border border-[#D6CFC5] bg-white text-[#1C1917] rounded-lg hover:bg-[#F3F1ED]"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmCartOrder}
                          className="sm:w-2/3 py-2.5 px-4 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                        >
                          {role !== 'customer'
                            ? 'Sign In to Confirm Order'
                            : cartOrderMode === 'Order at Restaurant'
                              ? 'Confirm Order at Restaurant (₹0 Advance)'
                              : `Pay ${cartTotals.advancePercent}% Advance (${formatINR(cartTotals.advanceAmount)})`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2.5">
                        <div>
                          <h4 className="text-base font-semibold text-[#1C1917]">
                            Your Cart ({cartTotals.totalQuantity} item{cartTotals.totalQuantity === 1 ? '' : 's'})
                          </h4>
                          <p className="text-[11px] text-[#57534E]">{restaurant.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => clearCart()}
                          className="text-xs font-medium text-[#B42318] hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {restaurantCart.items.map((ci) => (
                          <div
                            key={ci.menuItemId}
                            className="bg-white border border-[#E5E0D8] rounded-lg p-2.5 space-y-2"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-11 h-11 rounded overflow-hidden shrink-0 border border-[#E5E0D8]">
                                <SafeImage src={ci.imageUrl} alt={ci.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#1C1917] truncate">
                                  {ci.name}
                                </p>
                                <p className="text-[11px] text-[#57534E] tabular-nums">
                                  {formatINR(ci.price)} each · {ci.dietaryType}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(ci.menuItemId)}
                                aria-label={`Remove ${ci.name}`}
                                className="p-1 text-[#57534E] hover:text-[#B42318]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="inline-flex items-center border border-[#E5E0D8] rounded overflow-hidden bg-[#FAF9F6]">
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQuantity(ci.menuItemId, -1)}
                                  aria-label={`Decrease ${ci.name}`}
                                  className="px-2 py-1 text-[#1C1917] hover:bg-white"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2.5 text-xs font-mono font-semibold tabular-nums">
                                  {ci.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQuantity(ci.menuItemId, 1)}
                                  aria-label={`Increase ${ci.name}`}
                                  className="px-2 py-1 text-[#1C1917] hover:bg-white"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#1C1917] tabular-nums">
                                {formatINR(ci.price * ci.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Mode Selection */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-[#1C1917]">Payment &amp; Order Mode</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCartOrderMode('Pre-Order Advance')}
                            className={`p-2.5 rounded-lg border text-left text-xs ${
                              cartOrderMode === 'Pre-Order Advance'
                                ? 'border-[#6E1E2E] bg-white'
                                : 'border-[#E5E0D8] bg-[#FAF9F6]'
                            }`}
                          >
                            <p className="font-semibold text-[#6E1E2E]">
                              Pre-Order ({restaurantAdvancePercent}% Adv)
                            </p>
                            <p className="text-[11px] text-[#57534E] mt-0.5 tabular-nums">
                              Pay {formatINR(calculateCartOrderTotals(restaurantCart.items, restaurantAdvancePercent, 'Pre-Order Advance').advanceAmount)} now
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCartOrderMode('Order at Restaurant')}
                            className={`p-2.5 rounded-lg border text-left text-xs ${
                              cartOrderMode === 'Order at Restaurant'
                                ? 'border-[#6E1E2E] bg-white'
                                : 'border-[#E5E0D8] bg-[#FAF9F6]'
                            }`}
                          >
                            <p className="font-semibold text-[#1C1917]">Order at Restaurant</p>
                            <p className="text-[11px] text-[#57534E] mt-0.5">₹0 online advance</p>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Dining Date</label>
                          <input
                            type="date"
                            value={cartDate}
                            min={getTodayISO()}
                            onChange={(e) => setCartDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Arrival Time</label>
                          <select
                            value={cartTime}
                            onChange={(e) => setCartTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                          >
                            {TIME_SLOTS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Guest Name</label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E0D8] rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          Special Instructions (Optional)
                        </label>
                        <textarea
                          rows={2}
                          maxLength={400}
                          value={cartSpecialInstructions}
                          onChange={(e) => setCartSpecialInstructions(e.target.value)}
                          placeholder="Spice level, allergy notes, serving timing..."
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E0D8] rounded-lg resize-y"
                        />
                      </div>

                      <div className="bg-white border border-[#E5E0D8] rounded-lg p-3 space-y-1 text-xs tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Food Total</span>
                          <span className="font-semibold text-[#1C1917]">
                            {formatINR(cartTotals.totalFoodAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Additional Charges</span>
                          <span className="font-medium text-[#2F7D4F]">₹0</span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-[#E5E0D8]">
                          <span className="font-semibold text-[#1C1917]">
                            {cartOrderMode === 'Order at Restaurant'
                              ? 'Advance Now'
                              : `Advance (${cartTotals.advancePercent}%)`}
                          </span>
                          <span className="font-mono font-semibold text-[#6E1E2E]">
                            {formatINR(cartTotals.advanceAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#57534E]">
                          <span>Remaining at Restaurant</span>
                          <span>{formatINR(cartTotals.remainingAmount)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleReviewCartCheckout}
                        className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
                      >
                        Review &amp; Confirm Order ({formatINR(cartTotals.totalFoodAmount)})
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

          {/* TAB 4: C. CELEBRATE AN OCCASION (Ready-Made Packages + Optional Note) */}
          {activeTab === 'celebrate' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                  Celebrate an Occasion at {restaurant.name}
                </h3>
                <p className="text-xs text-[#57534E] mt-0.5">
                  Decoration Included – No Additional Charges (₹0). Select a ready-made package, share any optional instructions, and book directly.
                </p>
              </div>

              {celConfirmedInfo ? (
                <div className="py-6 text-center space-y-4">
                  <PartyPopper className="w-10 h-10 text-[#6E1E2E] mx-auto" />
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                    Celebration Booking Recorded ({celConfirmedInfo.id})
                  </h3>
                  <p className="text-sm text-[#57534E] max-w-md mx-auto">
                    {chosenCelPkg?.name} for {celPlates} plates on {formatDisplayDate(celDate)}. Decoration Charge: ₹0 (Included). Track or manage inside Customer Portal → My Celebrations.
                  </p>
                  {celConfirmedInfo.note && (
                    <div className="max-w-md mx-auto text-left bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-3.5 text-xs space-y-1">
                      <p className="font-semibold text-[#1C1917]">Special Instructions (Your Note)</p>
                      <p className="text-[#57534E]">{celConfirmedInfo.note}</p>
                      <p className="text-[11px] text-[#57534E]">
                        Your note has been shared with the restaurant. The restaurant will confirm whether it can accommodate your request.
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setCelConfirmedInfo(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
                  >
                    Book Another Celebration
                  </button>
                </div>
              ) : restCelPackages.length === 0 ? (
                <div className="p-5 border border-[#E5E0D8] bg-[#FAF9F6] rounded-lg space-y-2">
                  <p className="text-sm font-medium text-[#1C1917]">
                    No ready-made celebration packages are published for {restaurant.name} yet.
                  </p>
                  <p className="text-xs text-[#57534E]">
                    You can reserve a dining table under Tab A and include your occasion details in the reservation notes.
                  </p>
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

                    <div>
                      <label className="block text-xs font-semibold mb-1">Food Preferences</label>
                      <input
                        type="text"
                        value={celFoodPref}
                        onChange={(e) => setCelFoodPref(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      />
                    </div>

                    {/* Add a Note — Optional Special Instructions */}
                    <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="modal-special-instructions-note"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5 text-[#6E1E2E]" aria-hidden="true" />
                          <span>Special Instructions (Optional)</span>
                        </label>
                        <span className="text-[11px] font-mono tabular-nums text-[#57534E]">
                          {celCustomerNote.length} / {MAX_CELEBRATION_NOTE_LENGTH}
                        </span>
                      </div>
                      <textarea
                        id="modal-special-instructions-note"
                        rows={3}
                        maxLength={MAX_CELEBRATION_NOTE_LENGTH}
                        value={celCustomerNote}
                        onChange={(e) =>
                          setCelCustomerNote(e.target.value.slice(0, MAX_CELEBRATION_NOTE_LENGTH))
                        }
                        placeholder="Tell the restaurant about any special requests, preferences, or arrangements..."
                        className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] placeholder:text-[#57534E]/75 focus:outline-none focus:border-[#6E1E2E] resize-y min-h-[84px]"
                      />
                      <p className="text-[11px] text-[#57534E] leading-relaxed">
                        Your note will be shared with the restaurant. The restaurant will confirm whether it can accommodate your request.
                      </p>
                    </div>

                    <PaymentBreakdownCard
                      title="Direct Celebration Booking Summary"
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
                        className="px-4 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#D6CFC5] bg-white rounded-lg hover:bg-[#F3F1ED]"
                      >
                        Save Booking (Pay Advance Later)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCelebrationSubmit(true)}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                      >
                        Pay {celAdvPercent}% Demo Advance &amp; Confirm ({formatINR(celAdvAmt)})
                      </button>
                    </div>
                  </div>
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
