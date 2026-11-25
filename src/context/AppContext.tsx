import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  IMAGES,
  INITIAL_CELEBRATION_BOOKINGS,
  INITIAL_CELEBRATION_PACKAGES,
  INITIAL_CITIES,
  INITIAL_CUSTOMERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OFFERS,
  INITIAL_PAYMENTS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_PREORDERS,
  INITIAL_PREORDER_PACKAGES,
  INITIAL_RESERVATIONS,
  INITIAL_RESTAURANTS,
  INITIAL_REVIEWS,
  INITIAL_TABLES,
  INITIAL_TICKETS,
  LUCKNOW_DEMO_RESTAURANTS,
} from '../data/mockData';
import type {
  AmenityType,
  AppNotification,
  CelebrationBooking,
  CelebrationBookingStatus,
  CelebrationPackage,
  CityConfig,
  CuisineType,
  CustomerProfile,
  DiningOffer,
  DiningTable,
  FoodPreOrder,
  MenuPagePhoto,
  PaymentRecord,
  PendingBookingIntent,
  PhotoCategory,
  PlatformSettings,
  PortalRole,
  PreOrderPlatePackage,
  PreOrderStatus,
  Reservation,
  ReservationStatus,
  Restaurant,
  RestaurantApprovalStatus,
  RestaurantCategory,
  RestaurantPhoto,
  RestaurantReview,
  SupportTicket,
  TableStatus,
  ToastMessage,
} from '../types';

interface CustomerAuthInfo {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  preferredCuisine: CuisineType;
}

interface RestaurantRegistrationInput {
  ownerName: string;
  ownerEmail: string;
  mobile: string;
  restaurantName: string;
  address: string;
  area?: string;
  city: string;
  state: string;
  pinCode: string;
  cuisine: CuisineType;
  contactNumber: string;
  restaurantEmail: string;
  description: string;
}

export interface DemoPaymentPayload {
  title: string;
  referenceId: string;
  paymentType: PaymentRecord['paymentType'];
  customerName: string;
  restaurantName: string;
  amount: number;
  breakdownLines: { label: string; value: string }[];
  onComplete: (transactionId: string, method: string) => void;
}

interface AppContextValue {
  role: PortalRole;
  cities: CityConfig[];
  activeCities: CityConfig[];
  selectedCity: string;
  activeCityConfig: CityConfig;
  setSelectedCity: (cityName: string) => void;
  addCity: (payload: { name: string; state: string; neighbourhoods: string[] }) => void;
  toggleCityActive: (cityId: string) => void;
  setDefaultLaunchCity: (cityId: string) => void;
  addCityNeighbourhood: (cityId: string, neighbourhood: string) => void;
  customerUser: CustomerAuthInfo;
  activeRestaurantId: string;
  activeRestaurant: Restaurant;
  restaurants: Restaurant[];
  reservations: Reservation[];
  preOrderPackages: PreOrderPlatePackage[];
  preOrders: FoodPreOrder[];
  celebrationPackages: CelebrationPackage[];
  celebrationBookings: CelebrationBooking[];
  tables: DiningTable[];
  offers: DiningOffer[];
  payments: PaymentRecord[];
  reviews: RestaurantReview[];
  platformSettings: PlatformSettings;
  customers: CustomerProfile[];
  tickets: SupportTicket[];
  notifications: AppNotification[];
  favoriteIds: string[];
  toasts: ToastMessage[];
  selectedRestaurantForModal: Restaurant | null;
  modalInitialTab: 'overview' | 'book' | 'preorder' | 'celebrate';
  activeDemoPayment: DemoPaymentPayload | null;
  pendingBookingIntent: PendingBookingIntent | null;
  authBookingNotice: string | null;
  restoredBookingDraft: PendingBookingIntent | null;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  openRestaurantModal: (
    restaurant: Restaurant,
    initialTab?: 'overview' | 'book' | 'preorder' | 'celebrate'
  ) => void;
  closeRestaurantModal: () => void;
  openDemoPayment: (payload: DemoPaymentPayload) => void;
  closeDemoPayment: () => void;
  completeDemoPayment: (method: string) => PaymentRecord | null;

  requireCustomerAuth: (intent: PendingBookingIntent) => boolean;
  clearAuthBookingNotice: () => void;
  consumeRestoredBookingDraft: () => void;
  setAuthBookingNoticeMessage: (message: string | null) => void;

  loginCustomerDemo: (email?: string, name?: string) => PendingBookingIntent | null;
  signupCustomerDemo: (data: {
    fullName: string;
    email: string;
    mobile: string;
  }) => PendingBookingIntent | null;
  updateCustomerProfile: (updates: Partial<CustomerAuthInfo>) => void;

  loginRestaurantDemo: (email?: string) => void;
  signupRestaurantDemo: (data: RestaurantRegistrationInput) => void;
  updateActiveRestaurantProfile: (updates: Partial<Restaurant>, targetRestId?: string) => void;
  updateRestaurantPreOrderAdvance: (advancePercent: number, targetRestId?: string) => void;

  // Photo Gallery & Logo/Cover
  setRestaurantLogo: (url: string, targetRestId?: string) => void;
  setRestaurantCover: (url: string, targetRestId?: string) => void;
  addRestaurantPhotos: (
    photos: { url: string; category: PhotoCategory; caption: string }[],
    targetRestId?: string
  ) => void;
  replaceRestaurantPhoto: (photoId: string, newUrl: string, targetRestId?: string) => void;
  deleteRestaurantPhoto: (photoId: string, targetRestId?: string) => void;

  // Amenities
  updateRestaurantAmenities: (amenities: AmenityType[], targetRestId?: string) => void;

  // Photo-Only Menu Gallery
  addMenuPhotos: (
    items: { url: string; title: string }[],
    targetRestId?: string
  ) => void;
  replaceMenuPhoto: (photoId: string, newUrl: string, targetRestId?: string) => void;
  deleteMenuPhoto: (photoId: string, targetRestId?: string) => void;
  reorderMenuPhoto: (photoId: string, direction: 'up' | 'down', targetRestId?: string) => void;

  // Plate-wise Pre-Order Packages
  addPreOrderPackage: (pkg: Omit<PreOrderPlatePackage, 'id' | 'restaurantId'>) => void;
  updatePreOrderPackage: (id: string, updates: Partial<PreOrderPlatePackage>) => void;
  deletePreOrderPackage: (id: string) => void;

  // Celebration Packages (Decoration always ₹0)
  addCelebrationPackage: (
    pkg: Omit<CelebrationPackage, 'id' | 'restaurantId' | 'restaurantName' | 'approvalStatus'>
  ) => void;
  updateCelebrationPackage: (id: string, updates: Partial<CelebrationPackage>) => void;
  deleteCelebrationPackage: (id: string) => void;
  updateCelebrationPackageApproval: (
    packageId: string,
    status: RestaurantApprovalStatus
  ) => void;

  loginAdminDemo: (email?: string) => void;
  logoutPortal: () => void;

  toggleFavorite: (restaurantId: string) => void;

  // Reservations (All Table Bookings incur configurable Basic/Premium Platform Fee)
  createTableReservation: (payload: {
    restaurant: Restaurant;
    date: string;
    time: string;
    guests: number;
    customerName: string;
    customerPhone: string;
    bookingTier?: 'Basic' | 'Premium';
    orderMode: Reservation['orderMode'];
    selectedOffer?: DiningOffer;
    feePerGuest?: number;
    platformFeeTotal?: number;
    occasion?: string;
    specialRequest?: string;
    transactionId?: string;
  }) => Reservation;
  updateReservationStatus: (reservationId: string, status: ReservationStatus) => void;

  // Regular Food Pre-Orders
  createFoodPreOrder: (payload: {
    restaurant: Restaurant;
    pkg: PreOrderPlatePackage;
    date: string;
    time: string;
    plateCount: number;
    foodPreference: string;
    customerName: string;
    customerPhone: string;
    advancePercent: number;
    advancePaid: boolean;
    transactionId?: string;
  }) => FoodPreOrder;
  updatePreOrderStatus: (preOrderId: string, status: PreOrderStatus) => void;
  markPreOrderAdvancePaid: (preOrderId: string, transactionId: string) => void;

  // Ready-Made Celebration Package Bookings (Direct Booking Without Quotation)
  createCelebrationBooking: (payload: {
    restaurant: Restaurant;
    pkg: CelebrationPackage;
    eventDate: string;
    eventTime: string;
    platesCount: number;
    foodPreference: string;
    customerNote?: string;
    specialRequests?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    advancePercent: number;
    payAdvanceNow: boolean;
    transactionId?: string;
  }) => CelebrationBooking;
  markCelebrationAdvancePaid: (bookingId: string, transactionId: string) => void;
  updateCelebrationBookingStatus: (
    bookingId: string,
    status: CelebrationBookingStatus
  ) => void;
  cancelCelebrationBooking: (bookingId: string) => void;

  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addTable: (table: Omit<DiningTable, 'id' | 'restaurantId'>) => void;

  addOffer: (offer: Omit<DiningOffer, 'id'>) => void;
  toggleOfferActive: (offerId: string) => void;

  updatePlatformSettings: (settings: PlatformSettings) => void;
  updateRestaurantApproval: (restaurantId: string, status: RestaurantApprovalStatus) => void;
  toggleRestaurantActive: (restaurantId: string) => void;
  deleteRestaurant: (restaurantId: string) => void;
  editRestaurantListing: (
    restaurantId: string,
    updates: Partial<
      Pick<
        Restaurant,
        'name' | 'area' | 'category' | 'priceForTwo' | 'priceRange' | 'description' | 'offerText' | 'tier'
      >
    >
  ) => void;
  seedLucknowDemoRestaurants: () => void;
  updateCustomerStatus: (customerId: string, status: CustomerProfile['status']) => void;
  toggleReviewVisibility: (reviewId: string) => void;
  submitReview: (payload: {
    restaurantId: string;
    restaurantName: string;
    rating: number;
    comment: string;
  }) => void;
  submitSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  markAllNotificationsRead: (targetRole: Exclude<PortalRole, 'guest'>) => void;
}

const DEFAULT_CUSTOMER: CustomerAuthInfo = {
  id: 'cust-1',
  fullName: 'Aarav Srivastava',
  email: 'aarav.lucknow@example.com',
  mobile: '+91 98390 11223',
  city: 'Lucknow',
  preferredCuisine: 'North Indian',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<PortalRole>('guest');
  const [cities, setCities] = useState<CityConfig[]>(INITIAL_CITIES);
  const [selectedCity, setSelectedCity] = useState<string>(
    INITIAL_CITIES.find((c) => c.isDefaultLaunchCity)?.name || 'Lucknow'
  );
  const [customerUser, setCustomerUser] = useState<CustomerAuthInfo>(DEFAULT_CUSTOMER);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>('rest-lko-awadh-mahal');

  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [preOrderPackages, setPreOrderPackages] =
    useState<PreOrderPlatePackage[]>(INITIAL_PREORDER_PACKAGES);
  const [preOrders, setPreOrders] = useState<FoodPreOrder[]>(INITIAL_PREORDERS);
  const [celebrationPackages, setCelebrationPackages] = useState<CelebrationPackage[]>(
    INITIAL_CELEBRATION_PACKAGES
  );
  const [celebrationBookings, setCelebrationBookings] = useState<CelebrationBooking[]>(
    INITIAL_CELEBRATION_BOOKINGS
  );
  const [tables, setTables] = useState<DiningTable[]>(INITIAL_TABLES);
  const [offers, setOffers] = useState<DiningOffer[]>(INITIAL_OFFERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [reviews, setReviews] = useState<RestaurantReview[]>(INITIAL_REVIEWS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    INITIAL_PLATFORM_SETTINGS
  );
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    'rest-lko-awadh-mahal',
    'rest-lko-nawabs-courtyard',
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedRestaurantForModal, setSelectedRestaurantForModal] =
    useState<Restaurant | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<
    'overview' | 'book' | 'preorder' | 'celebrate'
  >('overview');
  const [activeDemoPayment, setActiveDemoPayment] = useState<DemoPaymentPayload | null>(null);
  const [pendingBookingIntent, setPendingBookingIntent] =
    useState<PendingBookingIntent | null>(null);
  const [authBookingNotice, setAuthBookingNotice] = useState<string | null>(null);
  const [restoredBookingDraft, setRestoredBookingDraft] =
    useState<PendingBookingIntent | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const openRestaurantModal = useCallback(
    (
      restaurant: Restaurant,
      initialTab: 'overview' | 'book' | 'preorder' | 'celebrate' = 'overview'
    ) => {
      setSelectedRestaurantForModal(restaurant);
      setModalInitialTab(initialTab);
    },
    []
  );

  const closeRestaurantModal = useCallback(() => {
    setSelectedRestaurantForModal(null);
    setModalInitialTab('overview');
  }, []);

  const openDemoPayment = useCallback(
    (payload: DemoPaymentPayload) => {
      if (role !== 'customer') {
        setAuthBookingNotice(
          'Please log in or create an account to continue with your booking.'
        );
        addToast({
          type: 'error',
          title: 'Login Required',
          description: 'Please log in or create an account to continue with your booking.',
        });
        return;
      }
      setActiveDemoPayment(payload);
    },
    [addToast, role]
  );

  const closeDemoPayment = useCallback(() => {
    setActiveDemoPayment(null);
  }, []);

  const completeDemoPayment = useCallback(
    (method: string) => {
      if (!activeDemoPayment || role !== 'customer') return null;
      const txnId = `DEMO-TXN-${Math.floor(100000 + Math.random() * 899999)}`;
      const record: PaymentRecord = {
        id: `PAY-${Math.floor(200 + Math.random() * 799)}`,
        transactionId: txnId,
        referenceId: activeDemoPayment.referenceId,
        paymentType: activeDemoPayment.paymentType,
        customerName: activeDemoPayment.customerName,
        restaurantName: activeDemoPayment.restaurantName,
        amount: activeDemoPayment.amount,
        paymentMethod: `${method} (DEMO ONLY)`,
        status: 'DEMO PAID',
        createdAt: '2026-11-25',
      };
      setPayments((prev) => [record, ...prev]);
      activeDemoPayment.onComplete(txnId, method);
      addToast({
        type: 'success',
        title: `Demo Payment Recorded (${txnId})`,
        description: 'DEMO ONLY — No real money was charged.',
      });
      return record;
    },
    [activeDemoPayment, addToast, role]
  );

  const requireCustomerAuth = useCallback(
    (intent: PendingBookingIntent) => {
      if (role === 'customer') return true;
      setPendingBookingIntent(intent);
      setAuthBookingNotice(
        'Please log in or create an account to continue with your booking.'
      );
      setSelectedRestaurantForModal(null);
      addToast({
        type: 'info',
        title: 'Login Required',
        description: 'Please log in or create an account to continue with your booking.',
      });
      return false;
    },
    [addToast, role]
  );

  const clearAuthBookingNotice = useCallback(() => {
    setAuthBookingNotice(null);
  }, []);

  const consumeRestoredBookingDraft = useCallback(() => {
    setRestoredBookingDraft(null);
  }, []);

  const setAuthBookingNoticeMessage = useCallback((message: string | null) => {
    setAuthBookingNotice(message);
  }, []);

  const restorePendingIntentAfterAuth = useCallback(
    (intent: PendingBookingIntent | null) => {
      if (!intent) return null;
      setRestoredBookingDraft(intent);
      setPendingBookingIntent(null);
      if (intent.kind === 'restaurant_modal' && intent.restaurantId) {
        const matchedRest = restaurants.find((r) => r.id === intent.restaurantId);
        if (matchedRest) {
          setSelectedRestaurantForModal(matchedRest);
          setModalInitialTab(intent.tab || 'book');
        }
      }
      return intent;
    },
    [restaurants]
  );

  const loginCustomerDemo = useCallback(
    (email?: string, name?: string) => {
      setRole('customer');
      setAuthBookingNotice(null);
      if (email || name) {
        setCustomerUser((prev) => ({
          ...prev,
          email: email || prev.email,
          fullName: name || prev.fullName,
        }));
      }
      const intentToRestore = restorePendingIntentAfterAuth(pendingBookingIntent);
      addToast({
        type: 'success',
        title: 'Customer Session Started',
        description: intentToRestore
          ? 'Restored your selected restaurant & booking details.'
          : 'Explore bookings, food pre-orders, and celebration packages across Lucknow.',
      });
      return intentToRestore;
    },
    [addToast, pendingBookingIntent, restorePendingIntentAfterAuth]
  );

  const signupCustomerDemo = useCallback(
    (data: { fullName: string; email: string; mobile: string }) => {
      const newCust: CustomerProfile = {
        id: `cust-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        city: selectedCity,
        joinedDate: '2026-11-25',
        totalBookings: 0,
        status: 'Active',
        preferredCuisine: 'North Indian',
      };
      setCustomers((prev) => [newCust, ...prev]);
      setCustomerUser({
        id: newCust.id,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        city: selectedCity,
        preferredCuisine: 'North Indian',
      });
      setRole('customer');
      setAuthBookingNotice(null);
      const intentToRestore = restorePendingIntentAfterAuth(pendingBookingIntent);
      addToast({
        type: 'success',
        title: 'Customer Account Created',
        description: intentToRestore
          ? 'Returning to complete your booking.'
          : 'Welcome to DineRestro Lucknow.',
      });
      return intentToRestore;
    },
    [addToast, pendingBookingIntent, restorePendingIntentAfterAuth, selectedCity]
  );

  const updateCustomerProfile = useCallback(
    (updates: Partial<CustomerAuthInfo>) => {
      setCustomerUser((prev) => ({ ...prev, ...updates }));
      addToast({ type: 'success', title: 'Demo Profile Updated' });
    },
    [addToast]
  );

  const loginRestaurantDemo = useCallback(
    (email?: string) => {
      setRole('restaurant');
      const matched = email
        ? restaurants.find((r) => r.ownerEmail.toLowerCase() === email.toLowerCase())
        : undefined;
      setActiveRestaurantId(matched ? matched.id : 'rest-lko-awadh-mahal');
      addToast({
        type: 'success',
        title: 'Demo Partner Session Started',
        description: 'Manage photos, amenities, menu pages, pre-orders & celebration packages.',
      });
    },
    [addToast, restaurants]
  );

  const signupRestaurantDemo = useCallback(
    (data: RestaurantRegistrationInput) => {
      const newId = `rest-${Date.now()}`;
      const cityMatch = cities.find(
        (c) => c.name.toLowerCase() === (data.city || selectedCity).trim().toLowerCase()
      );
      const resolvedCity = cityMatch?.name || data.city.trim() || selectedCity;
      const resolvedArea =
        data.area?.trim() || cityMatch?.neighbourhoods[0] || 'Gomti Nagar';
      const newRest: Restaurant = {
        id: newId,
        name: data.restaurantName,
        slug: data.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        contactNumber: data.contactNumber,
        address: data.address,
        area: resolvedArea,
        city: resolvedCity,
        state: data.state || cityMatch?.state || 'Uttar Pradesh',
        pinCode: data.pinCode,
        cuisines: [data.cuisine],
        primaryCuisine: data.cuisine,
        category: 'Casual Dining',
        tier: 'Basic',
        preOrderAdvancePercent: platformSettings.defaultPreOrderAdvancePercent,
        rating: 0,
        reviewCount: 0,
        priceForTwo: 1200,
        priceRange: '₹1,200 for two',
        offerText: 'New Partner Launch Preview',
        logoUrl: IMAGES.lucknowHeritage,
        image: IMAGES.lucknowHeritage,
        photos: [
          {
            id: `p-${Date.now()}`,
            url: IMAGES.lucknowHeritage,
            category: 'Dining Area',
            caption: `${data.restaurantName} dining preview`,
          },
        ],
        menuPhotos: [
          {
            id: `mp-${Date.now()}`,
            url: IMAGES.menuHeritage,
            title: 'Sample Menu Page 1',
            pageNumber: 1,
          },
        ],
        amenities: ['Air Conditioning', 'Family Friendly'],
        description: data.description,
        openingHours: '11:00 AM – 11:00 PM',
        availabilityNote: 'Pending partner review.',
        features: ['Table Reservations', 'Celebration Hosting'],
        approvalStatus: 'Pending Approval',
        isDemo: false,
        isActive: true,
        registrationDate: '2026-11-25',
        featured: false,
      };
      setRestaurants((prev) => [newRest, ...prev]);
      setActiveRestaurantId(newId);
      setRole('restaurant');
      addToast({
        type: 'info',
        title: 'Demo Registration Submitted',
        description: 'Your restaurant registration is pending approval (Demo Mode).',
      });
    },
    [addToast, cities, platformSettings.defaultPreOrderAdvancePercent, selectedCity]
  );

  const updateActiveRestaurantProfile = useCallback(
    (updates: Partial<Restaurant>, targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      addToast({ type: 'success', title: 'Restaurant Profile Updated (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const updateRestaurantPreOrderAdvance = useCallback(
    (advancePercent: number, targetRestId?: string) => {
      const safePercent = Math.min(100, Math.max(10, Math.round(advancePercent)));
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, preOrderAdvancePercent: safePercent } : r))
      );
      addToast({
        type: 'success',
        title: `Pre-Order Advance Set to ${safePercent}% (Demo)`,
        description: 'Customers booking food pre-orders at your venue will pay this percentage in advance.',
      });
    },
    [activeRestaurantId, addToast]
  );

  const setRestaurantLogo = useCallback(
    (url: string, targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, logoUrl: url } : r))
      );
      addToast({ type: 'success', title: 'Restaurant Logo Updated (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const setRestaurantCover = useCallback(
    (url: string, targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, image: url } : r))
      );
      addToast({ type: 'success', title: 'Cover Photo Updated (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const addRestaurantPhotos = useCallback(
    (
      photos: { url: string; category: PhotoCategory; caption: string }[],
      targetRestId?: string
    ) => {
      const id = targetRestId || activeRestaurantId;
      const created: RestaurantPhoto[] = photos.map((p, idx) => ({
        id: `photo-${Date.now()}-${idx}`,
        url: p.url,
        category: p.category,
        caption: p.caption,
      }));
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, photos: [...created, ...r.photos] } : r))
      );
      addToast({
        type: 'success',
        title: `${created.length} Photo(s) Added to Gallery (Demo)`,
      });
    },
    [activeRestaurantId, addToast]
  );

  const replaceRestaurantPhoto = useCallback(
    (photoId: string, newUrl: string, targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                photos: r.photos.map((p) => (p.id === photoId ? { ...p, url: newUrl } : p)),
              }
            : r
        )
      );
      addToast({ type: 'success', title: 'Photo Replaced (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const deleteRestaurantPhoto = useCallback(
    (photoId: string, targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, photos: r.photos.filter((p) => p.id !== photoId) } : r
        )
      );
      addToast({ type: 'info', title: 'Photo Deleted from Gallery (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const updateRestaurantAmenities = useCallback(
    (amenities: AmenityType[], targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, amenities } : r))
      );
      addToast({ type: 'success', title: 'Restaurant Amenities Updated (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const addMenuPhotos = useCallback(
    (items: { url: string; title: string }[], targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const startNum = r.menuPhotos.length + 1;
          const appended: MenuPagePhoto[] = items.map((item, idx) => ({
            id: `mp-${Date.now()}-${idx}`,
            url: item.url,
            title: item.title || `Menu Page ${startNum + idx}`,
            pageNumber: startNum + idx,
          }));
          return { ...r, menuPhotos: [...r.menuPhotos, ...appended] };
        })
      );
      addToast({
        type: 'success',
        title: `${items.length} Menu Photo(s) Uploaded (Demo)`,
      });
    },
    [activeRestaurantId, addToast]
  );

  const replaceMenuPhoto = useCallback(
    (photoId: string, newUrl: string, targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                menuPhotos: r.menuPhotos.map((m) =>
                  m.id === photoId ? { ...m, url: newUrl } : m
                ),
              }
            : r
        )
      );
      addToast({ type: 'success', title: 'Menu Page Replaced (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const deleteMenuPhoto = useCallback(
    (photoId: string, targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const remaining = r.menuPhotos
            .filter((m) => m.id !== photoId)
            .map((m, i) => ({ ...m, pageNumber: i + 1 }));
          return { ...r, menuPhotos: remaining };
        })
      );
      addToast({ type: 'info', title: 'Menu Page Deleted (Demo)' });
    },
    [activeRestaurantId, addToast]
  );

  const reorderMenuPhoto = useCallback(
    (photoId: string, direction: 'up' | 'down', targetRestId?: string) => {
      const id = targetRestId || activeRestaurantId;
      setRestaurants((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const idx = r.menuPhotos.findIndex((m) => m.id === photoId);
          if (idx === -1) return r;
          const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= r.menuPhotos.length) return r;
          const copy = [...r.menuPhotos];
          const temp = copy[idx];
          copy[idx] = copy[swapIdx];
          copy[swapIdx] = temp;
          return {
            ...r,
            menuPhotos: copy.map((m, i) => ({ ...m, pageNumber: i + 1 })),
          };
        })
      );
    },
    [activeRestaurantId]
  );

  const addPreOrderPackage = useCallback(
    (pkg: Omit<PreOrderPlatePackage, 'id' | 'restaurantId'>) => {
      const created: PreOrderPlatePackage = {
        ...pkg,
        id: `prepkg-${Date.now()}`,
        restaurantId: activeRestaurantId,
      };
      setPreOrderPackages((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Pre-Order Plate Package Created (Demo)',
        description: `${pkg.name} · ₹${pkg.pricePerPlate}/plate`,
      });
    },
    [activeRestaurantId, addToast]
  );

  const updatePreOrderPackage = useCallback(
    (id: string, updates: Partial<PreOrderPlatePackage>) => {
      setPreOrderPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      addToast({ type: 'success', title: 'Pre-Order Package Updated (Demo)' });
    },
    [addToast]
  );

  const deletePreOrderPackage = useCallback(
    (id: string) => {
      setPreOrderPackages((prev) => prev.filter((p) => p.id !== id));
      addToast({ type: 'info', title: 'Pre-Order Package Removed (Demo)' });
    },
    [addToast]
  );

  const addCelebrationPackage = useCallback(
    (
      pkg: Omit<
        CelebrationPackage,
        'id' | 'restaurantId' | 'restaurantName' | 'approvalStatus'
      >
    ) => {
      const targetRest =
        restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0];
      const created: CelebrationPackage = {
        ...pkg,
        id: `celpkg-${Date.now()}`,
        restaurantId: targetRest.id,
        restaurantName: targetRest.name,
        restaurantArea: targetRest.area,
        approvalStatus: 'Pending Approval',
      };
      setCelebrationPackages((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Celebration Package Submitted for Approval (Demo)',
        description: 'Decoration Included – No Additional Charges (₹0).',
      });
    },
    [activeRestaurantId, addToast, restaurants]
  );

  const updateCelebrationPackage = useCallback(
    (id: string, updates: Partial<CelebrationPackage>) => {
      setCelebrationPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      addToast({ type: 'success', title: 'Celebration Package Updated (Demo)' });
    },
    [addToast]
  );

  const deleteCelebrationPackage = useCallback(
    (id: string) => {
      setCelebrationPackages((prev) => prev.filter((p) => p.id !== id));
      addToast({ type: 'info', title: 'Celebration Package Deleted (Demo)' });
    },
    [addToast]
  );

  const updateCelebrationPackageApproval = useCallback(
    (packageId: string, status: RestaurantApprovalStatus) => {
      setCelebrationPackages((prev) =>
        prev.map((p) => (p.id === packageId ? { ...p, approvalStatus: status } : p))
      );
      addToast({
        type: status === 'Approved' ? 'success' : 'info',
        title: `Celebration Package ${status} (Demo)`,
      });
    },
    [addToast]
  );

  const loginAdminDemo = useCallback(() => {
    setRole('admin');
    addToast({
      type: 'success',
      title: 'Demo Admin Session Started',
      description: 'Managing approvals, offers, booking fee settings & platform records.',
    });
  }, [addToast]);

  const logoutPortal = useCallback(() => {
    setRole('guest');
    addToast({ type: 'info', title: 'Signed Out of Demo Session' });
  }, [addToast]);

  const toggleFavorite = useCallback(
    (restaurantId: string) => {
      setFavoriteIds((prev) => {
        const exists = prev.includes(restaurantId);
        addToast({
          type: 'info',
          title: exists ? 'Removed from Favorites' : 'Saved to Favorites',
        });
        return exists ? prev.filter((id) => id !== restaurantId) : [...prev, restaurantId];
      });
    },
    [addToast]
  );

  const createTableReservation = useCallback(
    (payload: {
      restaurant: Restaurant;
      date: string;
      time: string;
      guests: number;
      customerName: string;
      customerPhone: string;
      bookingTier?: 'Basic' | 'Premium';
      orderMode: Reservation['orderMode'];
      selectedOffer?: DiningOffer;
      feePerGuest?: number;
      platformFeeTotal?: number;
      occasion?: string;
      specialRequest?: string;
      transactionId?: string;
    }) => {
      if (role !== 'customer') {
        throw new Error('Authentication required before booking.');
      }
      const resolvedTier =
        payload.bookingTier ||
        payload.selectedOffer?.offerTier ||
        payload.restaurant.tier ||
        'Basic';
      const resolvedFeePerGuest =
        payload.feePerGuest ??
        (resolvedTier === 'Premium'
          ? platformSettings.premiumOfferFeePerGuest
          : platformSettings.basicOfferFeePerGuest);
      const resolvedPlatformFeeTotal =
        payload.platformFeeTotal ?? payload.guests * resolvedFeePerGuest;

      const created: Reservation = {
        id: `DR-${Math.floor(2100 + Math.random() * 800)}`,
        restaurantId: payload.restaurant.id,
        restaurantName: payload.restaurant.name,
        restaurantArea: payload.restaurant.area,
        customerId: customerUser.id,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        date: payload.date,
        time: payload.time,
        guests: payload.guests,
        bookingTier: resolvedTier,
        orderMode: payload.orderMode,
        selectedOfferId: payload.selectedOffer?.id,
        selectedOfferTitle: payload.selectedOffer?.title,
        offerTier: payload.selectedOffer?.offerTier || resolvedTier,
        feePerGuest: resolvedFeePerGuest,
        platformFeeTotal: resolvedPlatformFeeTotal,
        transactionId: payload.transactionId,
        occasion: payload.occasion,
        specialRequest: payload.specialRequest,
        status: payload.transactionId ? 'Confirmed' : 'Pending',
        createdAt: '2026-11-25',
      };
      setReservations((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: `Demo Table Booking Logged (${created.id})`,
        description: `${resolvedTier} tier platform fee (${payload.guests} × ₹${resolvedFeePerGuest} = ₹${resolvedPlatformFeeTotal}) recorded separately from food bill.`,
      });
      return created;
    },
    [
      addToast,
      customerUser.id,
      platformSettings.basicOfferFeePerGuest,
      platformSettings.premiumOfferFeePerGuest,
      role,
    ]
  );

  const updateReservationStatus = useCallback(
    (reservationId: string, status: ReservationStatus) => {
      setReservations((prev) =>
        prev.map((res) => (res.id === reservationId ? { ...res, status } : res))
      );
      addToast({ type: 'success', title: `Reservation ${status} (Demo)` });
    },
    [addToast]
  );

  const createFoodPreOrder = useCallback(
    (payload: {
      restaurant: Restaurant;
      pkg: PreOrderPlatePackage;
      date: string;
      time: string;
      plateCount: number;
      foodPreference: string;
      customerName: string;
      customerPhone: string;
      advancePercent: number;
      advancePaid: boolean;
      transactionId?: string;
    }) => {
      if (role !== 'customer') {
        throw new Error('Authentication required before pre-ordering.');
      }
      const totalFoodAmount = payload.pkg.pricePerPlate * payload.plateCount;
      const advanceAmount = Math.round((totalFoodAmount * payload.advancePercent) / 100);
      const remainingAmount = totalFoodAmount - advanceAmount;
      const created: FoodPreOrder = {
        id: `PO-${Math.floor(4200 + Math.random() * 700)}`,
        restaurantId: payload.restaurant.id,
        restaurantName: payload.restaurant.name,
        restaurantArea: payload.restaurant.area,
        customerId: customerUser.id,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        date: payload.date,
        time: payload.time,
        packageId: payload.pkg.id,
        packageName: payload.pkg.name,
        plateCount: payload.plateCount,
        pricePerPlate: payload.pkg.pricePerPlate,
        foodPreference: payload.foodPreference,
        totalFoodAmount,
        advancePercent: payload.advancePercent,
        advanceAmount,
        remainingAmount,
        advancePaid: payload.advancePaid,
        transactionId: payload.transactionId,
        status: payload.advancePaid ? 'Advance Paid' : 'Pending',
        createdAt: '2026-11-25',
      };
      setPreOrders((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: `Demo Pre-Order Created (${created.id})`,
        description: `${payload.plateCount} × ${payload.pkg.name} · Simulated reference only.`,
      });
      return created;
    },
    [addToast, customerUser.id, role]
  );

  const updatePreOrderStatus = useCallback(
    (preOrderId: string, status: PreOrderStatus) => {
      setPreOrders((prev) =>
        prev.map((po) => (po.id === preOrderId ? { ...po, status } : po))
      );
      addToast({ type: 'success', title: `Pre-Order Marked ${status} (Demo)` });
    },
    [addToast]
  );

  const markPreOrderAdvancePaid = useCallback(
    (preOrderId: string, transactionId: string) => {
      setPreOrders((prev) =>
        prev.map((po) =>
          po.id === preOrderId
            ? { ...po, advancePaid: true, transactionId, status: 'Advance Paid' }
            : po
        )
      );
    },
    []
  );

  const createCelebrationBooking = useCallback(
    (payload: {
      restaurant: Restaurant;
      pkg: CelebrationPackage;
      eventDate: string;
      eventTime: string;
      platesCount: number;
      foodPreference: string;
      customerNote?: string;
      specialRequests?: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      advancePercent: number;
      payAdvanceNow: boolean;
      transactionId?: string;
    }) => {
      if (role !== 'customer') {
        throw new Error('Authentication required before booking a celebration package.');
      }
      const totalPackageAmount = payload.pkg.pricePerPlate * payload.platesCount;
      const advanceAmount = Math.round((totalPackageAmount * payload.advancePercent) / 100);
      const remainingAmount = totalPackageAmount - advanceAmount;
      const isPaid = Boolean(payload.payAdvanceNow && payload.transactionId);
      const normalizedNote = (payload.customerNote ?? payload.specialRequests ?? '')
        .trim()
        .slice(0, 500);
      const created: CelebrationBooking = {
        id: `CEL-${Math.floor(920 + Math.random() * 79)}`,
        restaurantId: payload.restaurant.id,
        restaurantName: payload.restaurant.name,
        restaurantArea: payload.restaurant.area,
        customerId: customerUser.id,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        celebrationType: payload.pkg.category,
        packageId: payload.pkg.id,
        packageName: payload.pkg.name,
        decorationArrangement: `${payload.pkg.decorationDetails} (Decoration Included – No Additional Charges)`,
        decorationPhoto: payload.pkg.decorationPhotos[0] || IMAGES.decorBirthday,
        plateItems: payload.pkg.plateItems,
        eventDate: payload.eventDate,
        eventTime: payload.eventTime,
        platesCount: payload.platesCount,
        pricePerPlate: payload.pkg.pricePerPlate,
        totalPackageAmount,
        decorationCharge: 0,
        quotedTotalAmount: totalPackageAmount,
        advancePercent: payload.advancePercent,
        advanceAmount,
        remainingAmount,
        advancePaid: isPaid,
        transactionId: payload.transactionId,
        foodPreference: payload.foodPreference,
        customerNote: normalizedNote,
        specialRequests: normalizedNote,
        status: isPaid ? 'Confirmed' : 'Advance Pending',
        createdAt: '2026-11-25',
      };
      setCelebrationBookings((prev) => [created, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-cel-${Date.now()}`,
          role: 'restaurant',
          title: `Celebration Reservation (${created.id})`,
          message: `${created.customerName} booked ${created.packageName} (${created.platesCount} plates · Decoration ₹0 · ${isPaid ? 'Confirmed & Advance Paid' : 'Advance Pending'}).${normalizedNote ? ' Includes a customer note — review and confirm availability.' : ''}`,
          timeAgo: 'Just now',
          read: false,
        },
        ...prev,
      ]);
      addToast({
        type: 'success',
        title: isPaid
          ? `Celebration Booking Confirmed (${created.id})`
          : `Celebration Reserved (${created.id})`,
        description: isPaid
          ? 'Ready-made package confirmed directly (Decoration Charge: ₹0).'
          : 'Complete demo advance payment in My Celebrations to confirm.',
      });
      return created;
    },
    [addToast, customerUser.id, role]
  );

  const markCelebrationAdvancePaid = useCallback(
    (bookingId: string, transactionId: string) => {
      setCelebrationBookings((prev) =>
        prev.map((cb) =>
          cb.id === bookingId
            ? { ...cb, advancePaid: true, transactionId, status: 'Confirmed' }
            : cb
        )
      );
      addToast({
        type: 'success',
        title: `Celebration Confirmed (${bookingId})`,
        description: 'Demo advance payment recorded.',
      });
    },
    [addToast]
  );

  const updateCelebrationBookingStatus = useCallback(
    (bookingId: string, status: CelebrationBookingStatus) => {
      setCelebrationBookings((prev) =>
        prev.map((cb) => (cb.id === bookingId ? { ...cb, status } : cb))
      );
      addToast({ type: 'success', title: `Celebration Booking Marked ${status} (Demo)` });
    },
    [addToast]
  );

  const cancelCelebrationBooking = useCallback(
    (bookingId: string) => {
      setCelebrationBookings((prev) =>
        prev.map((cb) => (cb.id === bookingId ? { ...cb, status: 'Cancelled' } : cb))
      );
      addToast({ type: 'info', title: `Celebration Booking Cancelled (${bookingId})` });
    },
    [addToast]
  );

  const updateTableStatus = useCallback(
    (tableId: string, status: TableStatus) => {
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
      addToast({ type: 'info', title: `Table Status Set to ${status}` });
    },
    [addToast]
  );

  const addTable = useCallback(
    (table: Omit<DiningTable, 'id' | 'restaurantId'>) => {
      const created: DiningTable = {
        ...table,
        id: `tbl-${Date.now()}`,
        restaurantId: activeRestaurantId,
      };
      setTables((prev) => [...prev, created]);
      addToast({ type: 'success', title: `Table ${table.tableNumber} Added (Demo)` });
    },
    [activeRestaurantId, addToast]
  );

  const addOffer = useCallback(
    (offer: Omit<DiningOffer, 'id'>) => {
      const created: DiningOffer = { ...offer, id: `off-${Date.now()}` };
      setOffers((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Offer Published (Demo)',
        description: `${offer.code} (${offer.offerTier} Offer tier)`,
      });
    },
    [addToast]
  );

  const toggleOfferActive = useCallback(
    (offerId: string) => {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o))
      );
      addToast({ type: 'info', title: 'Offer Availability Toggled (Demo)' });
    },
    [addToast]
  );

  const updatePlatformSettings = useCallback(
    (settings: PlatformSettings) => {
      setPlatformSettings(settings);
      addToast({
        type: 'success',
        title: 'Platform Booking Fee Settings Updated (Demo)',
        description: `Basic: ₹${settings.basicOfferFeePerGuest}/guest · Premium: ₹${settings.premiumOfferFeePerGuest}/guest`,
      });
    },
    [addToast]
  );

  const updateRestaurantApproval = useCallback(
    (restaurantId: string, status: RestaurantApprovalStatus) => {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, approvalStatus: status } : r))
      );
      addToast({
        type: status === 'Approved' ? 'success' : 'info',
        title: `Restaurant ${status} (Demo)`,
      });
    },
    [addToast]
  );

  const toggleRestaurantActive = useCallback(
    (restaurantId: string) => {
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurantId ? { ...r, isActive: r.isActive === false ? true : false } : r
        )
      );
      addToast({ type: 'info', title: 'Restaurant Visibility Updated' });
    },
    [addToast]
  );

  const deleteRestaurant = useCallback(
    (restaurantId: string) => {
      setRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
      addToast({ type: 'info', title: 'Restaurant Listing Removed' });
    },
    [addToast]
  );

  const editRestaurantListing = useCallback(
    (
      restaurantId: string,
      updates: Partial<
        Pick<
          Restaurant,
          'name' | 'area' | 'category' | 'priceForTwo' | 'priceRange' | 'description' | 'offerText' | 'tier'
        >
      >
    ) => {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, ...updates } : r))
      );
      addToast({ type: 'success', title: 'Restaurant Listing Updated' });
    },
    [addToast]
  );

  const seedLucknowDemoRestaurants = useCallback(() => {
    setRestaurants((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const missing = LUCKNOW_DEMO_RESTAURANTS.filter((demo) => !existingIds.has(demo.id));
      if (missing.length === 0) {
        return prev;
      }
      return [...missing, ...prev];
    });
    addToast({
      type: 'success',
      title: 'Lucknow Demo Listings Verified',
      description: 'All 12 fictional Lucknow demo listings are available without duplicates.',
    });
  }, [addToast]);

  const updateCustomerStatus = useCallback(
    (customerId: string, status: CustomerProfile['status']) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, status } : c))
      );
      addToast({ type: 'info', title: `Customer Status: ${status} (Demo)` });
    },
    [addToast]
  );

  const toggleReviewVisibility = useCallback(
    (reviewId: string) => {
      setReviews((prev) =>
        prev.map((rv) => (rv.id === reviewId ? { ...rv, visible: !rv.visible } : rv))
      );
      addToast({ type: 'info', title: 'Review Visibility Toggled (Demo)' });
    },
    [addToast]
  );

  const submitReview = useCallback(
    (payload: {
      restaurantId: string;
      restaurantName: string;
      rating: number;
      comment: string;
    }) => {
      const created: RestaurantReview = {
        id: `rev-${Date.now()}`,
        restaurantId: payload.restaurantId,
        restaurantName: payload.restaurantName,
        customerName: customerUser.fullName,
        rating: payload.rating,
        comment: payload.comment.trim(),
        date: '2026-11-23',
        visible: true,
      };
      setReviews((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Dining Review Submitted (Demo)',
        description: `Thank you for reviewing ${payload.restaurantName}.`,
      });
    },
    [addToast, customerUser.fullName]
  );

  const submitSupportTicket = useCallback(
    (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => {
      const created: SupportTicket = {
        ...ticket,
        id: `TKT-${Math.floor(310 + Math.random() * 89)}`,
        status: 'Open',
        createdAt: '2026-11-23',
      };
      setTickets((prev) => [created, ...prev]);
      addToast({ type: 'success', title: `Support Ticket ${created.id} Logged (Demo)` });
    },
    [addToast]
  );

  const updateTicketStatus = useCallback(
    (ticketId: string, status: SupportTicket['status']) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );
      addToast({ type: 'success', title: `Ticket Marked ${status}` });
    },
    [addToast]
  );

  const markAllNotificationsRead = useCallback(
    (targetRole: Exclude<PortalRole, 'guest'>) => {
      setNotifications((prev) =>
        prev.map((n) => (n.role === targetRole ? { ...n, read: true } : n))
      );
    },
    []
  );

  const addCity = useCallback(
    (payload: { name: string; state: string; neighbourhoods: string[] }) => {
      const cleanName = payload.name.trim();
      if (!cleanName) return;
      const existing = cities.find(
        (c) => c.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        addToast({
          type: 'error',
          title: 'City Already Exists',
          description: `${existing.name} is already configured on DineRestro.`,
        });
        return;
      }
      const created: CityConfig = {
        id: `city-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        name: cleanName,
        state: payload.state.trim() || 'Uttar Pradesh',
        country: 'India',
        isActive: true,
        isDefaultLaunchCity: false,
        neighbourhoods: payload.neighbourhoods.map((n) => n.trim()).filter(Boolean),
      };
      setCities((prev) => [...prev, created]);
      addToast({
        type: 'success',
        title: `${created.name} Added`,
        description: `${created.neighbourhoods.length} neighbourhood filter(s) ready for discovery.`,
      });
    },
    [addToast, cities]
  );

  const toggleCityActive = useCallback(
    (cityId: string) => {
      setCities((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== cityId) return c;
          if (c.isDefaultLaunchCity && c.isActive) {
            return c;
          }
          return { ...c, isActive: !c.isActive };
        });
        return updated;
      });
      addToast({ type: 'info', title: 'City Availability Updated' });
    },
    [addToast]
  );

  const setDefaultLaunchCity = useCallback(
    (cityId: string) => {
      const target = cities.find((c) => c.id === cityId);
      if (!target) return;
      setCities((prev) =>
        prev.map((c) => ({
          ...c,
          isDefaultLaunchCity: c.id === cityId,
          isActive: c.id === cityId ? true : c.isActive,
        }))
      );
      setSelectedCity(target.name);
      addToast({
        type: 'success',
        title: `${target.name} Set as Default Launch City`,
      });
    },
    [addToast, cities]
  );

  const addCityNeighbourhood = useCallback(
    (cityId: string, neighbourhood: string) => {
      const clean = neighbourhood.trim();
      if (!clean) return;
      setCities((prev) =>
        prev.map((c) =>
          c.id === cityId && !c.neighbourhoods.some((n) => n.toLowerCase() === clean.toLowerCase())
            ? { ...c, neighbourhoods: [...c.neighbourhoods, clean] }
            : c
        )
      );
      addToast({ type: 'success', title: `Neighbourhood "${clean}" Added` });
    },
    [addToast]
  );

  const activeCities = cities.filter((c) => c.isActive);
  const activeCityConfig =
    cities.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase()) ||
    cities.find((c) => c.isDefaultLaunchCity) ||
    cities[0];

  const activeRestaurant =
    restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0];

  const liveSelectedRestaurant = selectedRestaurantForModal
    ? restaurants.find((r) => r.id === selectedRestaurantForModal.id) ||
      selectedRestaurantForModal
    : null;

  return (
    <AppContext.Provider
      value={{
        role,
        cities,
        activeCities,
        selectedCity,
        activeCityConfig,
        setSelectedCity,
        addCity,
        toggleCityActive,
        setDefaultLaunchCity,
        addCityNeighbourhood,
        customerUser,
        activeRestaurantId,
        activeRestaurant,
        restaurants,
        reservations,
        preOrderPackages,
        preOrders,
        celebrationPackages,
        celebrationBookings,
        tables,
        offers,
        payments,
        reviews,
        platformSettings,
        customers,
        tickets,
        notifications,
        favoriteIds,
        toasts,
        selectedRestaurantForModal: liveSelectedRestaurant,
        modalInitialTab,
        activeDemoPayment,
        pendingBookingIntent,
        authBookingNotice,
        restoredBookingDraft,
        addToast,
        dismissToast,
        openRestaurantModal,
        closeRestaurantModal,
        openDemoPayment,
        closeDemoPayment,
        completeDemoPayment,
        requireCustomerAuth,
        clearAuthBookingNotice,
        consumeRestoredBookingDraft,
        setAuthBookingNoticeMessage,
        loginCustomerDemo,
        signupCustomerDemo,
        updateCustomerProfile,
        loginRestaurantDemo,
        signupRestaurantDemo,
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
        addPreOrderPackage,
        updatePreOrderPackage,
        deletePreOrderPackage,
        addCelebrationPackage,
        updateCelebrationPackage,
        deleteCelebrationPackage,
        updateCelebrationPackageApproval,
        loginAdminDemo,
        logoutPortal,
        toggleFavorite,
        createTableReservation,
        updateReservationStatus,
        createFoodPreOrder,
        updatePreOrderStatus,
        markPreOrderAdvancePaid,
        createCelebrationBooking,
        markCelebrationAdvancePaid,
        updateCelebrationBookingStatus,
        cancelCelebrationBooking,
        updateTableStatus,
        addTable,
        addOffer,
        toggleOfferActive,
        updatePlatformSettings,
        updateRestaurantApproval,
        toggleRestaurantActive,
        deleteRestaurant,
        editRestaurantListing,
        seedLucknowDemoRestaurants,
        updateCustomerStatus,
        toggleReviewVisibility,
        submitReview,
        submitSupportTicket,
        updateTicketStatus,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
