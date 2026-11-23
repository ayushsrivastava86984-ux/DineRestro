import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  IMAGES,
  INITIAL_CELEBRATION_BOOKINGS,
  INITIAL_CELEBRATION_PACKAGES,
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
} from '../data/mockData';
import type {
  AmenityType,
  AppNotification,
  CelebrationBooking,
  CelebrationBookingStatus,
  CelebrationPackage,
  CuisineType,
  CustomerProfile,
  DiningOffer,
  DiningTable,
  FoodPreOrder,
  MenuPagePhoto,
  PaymentRecord,
  PhotoCategory,
  PlatformSettings,
  PortalRole,
  PreOrderPlatePackage,
  PreOrderStatus,
  Reservation,
  ReservationStatus,
  Restaurant,
  RestaurantApprovalStatus,
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

  loginCustomerDemo: (email?: string, name?: string) => void;
  signupCustomerDemo: (data: { fullName: string; email: string; mobile: string }) => void;
  updateCustomerProfile: (updates: Partial<CustomerAuthInfo>) => void;

  loginRestaurantDemo: (email?: string) => void;
  signupRestaurantDemo: (data: RestaurantRegistrationInput) => void;
  updateActiveRestaurantProfile: (updates: Partial<Restaurant>, targetRestId?: string) => void;

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

  // Reservations (Book a Table / Order at Restaurant / Offer Table Booking)
  createTableReservation: (payload: {
    restaurant: Restaurant;
    date: string;
    time: string;
    guests: number;
    customerName: string;
    customerPhone: string;
    orderMode: 'Order at Restaurant' | 'Offer Table Booking';
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

  // Celebration Bookings & Quotations
  createCelebrationBooking: (payload: {
    restaurant: Restaurant;
    pkg: CelebrationPackage;
    eventDate: string;
    eventTime: string;
    platesCount: number;
    foodPreference: string;
    specialRequests: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    advancePercent: number;
    payAdvanceNow: boolean;
    transactionId?: string;
  }) => CelebrationBooking;
  sendCelebrationQuotation: (
    bookingId: string,
    quotedTotalAmount: number,
    quotationNotes: string
  ) => void;
  acceptCelebrationQuotation: (bookingId: string) => void;
  markCelebrationAdvancePaid: (bookingId: string, transactionId: string) => void;
  updateCelebrationBookingStatus: (
    bookingId: string,
    status: CelebrationBookingStatus
  ) => void;

  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addTable: (table: Omit<DiningTable, 'id' | 'restaurantId'>) => void;

  addOffer: (offer: Omit<DiningOffer, 'id'>) => void;
  toggleOfferActive: (offerId: string) => void;

  updatePlatformSettings: (settings: PlatformSettings) => void;
  updateRestaurantApproval: (restaurantId: string, status: RestaurantApprovalStatus) => void;
  updateCustomerStatus: (customerId: string, status: CustomerProfile['status']) => void;
  toggleReviewVisibility: (reviewId: string) => void;
  submitSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  markAllNotificationsRead: (targetRole: Exclude<PortalRole, 'guest'>) => void;
}

const DEFAULT_CUSTOMER: CustomerAuthInfo = {
  id: 'cust-1',
  fullName: 'Aarav Srivastava',
  email: 'aarav.varanasi@example.com',
  mobile: '+91 98390 11223',
  city: 'Varanasi',
  preferredCuisine: 'North Indian',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<PortalRole>('guest');
  const [customerUser, setCustomerUser] = useState<CustomerAuthInfo>(DEFAULT_CUSTOMER);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>('rest-kashi-terrace');

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
    'rest-kashi-terrace',
    'rest-darbar-haveli',
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedRestaurantForModal, setSelectedRestaurantForModal] =
    useState<Restaurant | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<
    'overview' | 'book' | 'preorder' | 'celebrate'
  >('overview');
  const [activeDemoPayment, setActiveDemoPayment] = useState<DemoPaymentPayload | null>(null);

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

  const openDemoPayment = useCallback((payload: DemoPaymentPayload) => {
    setActiveDemoPayment(payload);
  }, []);

  const closeDemoPayment = useCallback(() => {
    setActiveDemoPayment(null);
  }, []);

  const completeDemoPayment = useCallback(
    (method: string) => {
      if (!activeDemoPayment) return null;
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
        createdAt: '2026-11-23',
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
    [activeDemoPayment, addToast]
  );

  const loginCustomerDemo = useCallback(
    (email?: string, name?: string) => {
      setRole('customer');
      if (email || name) {
        setCustomerUser((prev) => ({
          ...prev,
          email: email || prev.email,
          fullName: name || prev.fullName,
        }));
      }
      addToast({
        type: 'success',
        title: 'Demo Customer Session Started',
        description: 'Explore bookings, pre-orders, and celebration quotes.',
      });
    },
    [addToast]
  );

  const signupCustomerDemo = useCallback(
    (data: { fullName: string; email: string; mobile: string }) => {
      const newCust: CustomerProfile = {
        id: `cust-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        city: 'Varanasi',
        joinedDate: '2026-11-23',
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
        city: 'Varanasi',
        preferredCuisine: 'North Indian',
      });
      setRole('customer');
      addToast({
        type: 'success',
        title: 'Demo Customer Account Created',
        description: 'Redirected to your Customer Dashboard (Demo Mode).',
      });
    },
    [addToast]
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
      setActiveRestaurantId(matched ? matched.id : 'rest-kashi-terrace');
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
      const newRest: Restaurant = {
        id: newId,
        name: data.restaurantName,
        slug: data.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        contactNumber: data.contactNumber,
        address: data.address,
        area: 'Sigra',
        city: data.city || 'Varanasi',
        state: data.state || 'Uttar Pradesh',
        pinCode: data.pinCode,
        cuisines: [data.cuisine],
        primaryCuisine: data.cuisine,
        rating: 4.5,
        reviewCount: 0,
        priceForTwo: 1200,
        priceRange: '₹1,200 for two',
        offerText: 'New Partner Launch Preview',
        logoUrl: IMAGES.heritageCourtyard,
        image: IMAGES.heritageCourtyard,
        photos: [
          {
            id: `p-${Date.now()}`,
            url: IMAGES.heritageCourtyard,
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
        registrationDate: '2026-11-23',
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
    [addToast]
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
      orderMode: 'Order at Restaurant' | 'Offer Table Booking';
      selectedOffer?: DiningOffer;
      feePerGuest?: number;
      platformFeeTotal?: number;
      occasion?: string;
      specialRequest?: string;
      transactionId?: string;
    }) => {
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
        orderMode: payload.orderMode,
        selectedOfferId: payload.selectedOffer?.id,
        selectedOfferTitle: payload.selectedOffer?.title,
        offerTier: payload.selectedOffer?.offerTier,
        feePerGuest: payload.feePerGuest,
        platformFeeTotal: payload.platformFeeTotal,
        occasion: payload.occasion,
        specialRequest: payload.specialRequest,
        status: payload.transactionId ? 'Confirmed' : 'Pending',
        createdAt: '2026-11-23',
      };
      setReservations((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: `Demo Table Booking Logged (${created.id})`,
        description:
          payload.orderMode === 'Order at Restaurant'
            ? 'Order at Restaurant selected — ₹0 advance food payment required.'
            : `Offer platform fee recorded (${payload.guests} × ₹${payload.feePerGuest}).`,
      });
      return created;
    },
    [addToast, customerUser.id]
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
        createdAt: '2026-11-23',
      };
      setPreOrders((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: `Demo Pre-Order Created (${created.id})`,
        description: `${payload.plateCount} × ${payload.pkg.name} · Simulated reference only.`,
      });
      return created;
    },
    [addToast, customerUser.id]
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
      specialRequests: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      advancePercent: number;
      payAdvanceNow: boolean;
      transactionId?: string;
    }) => {
      const totalPackageAmount = payload.pkg.pricePerPlate * payload.platesCount;
      const advanceAmount = Math.round((totalPackageAmount * payload.advancePercent) / 100);
      const remainingAmount = totalPackageAmount - advanceAmount;
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
        advancePaid: payload.payAdvanceNow,
        transactionId: payload.transactionId,
        foodPreference: payload.foodPreference,
        specialRequests: payload.specialRequests,
        status: payload.payAdvanceNow ? 'Advance Paid' : 'Inquiry Received',
        createdAt: '2026-11-23',
      };
      setCelebrationBookings((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: `Celebration Booking Logged (${created.id})`,
        description: 'Decoration Charge: ₹0 (FREE). Simulated Phase 1 preview.',
      });
      return created;
    },
    [addToast, customerUser.id]
  );

  const sendCelebrationQuotation = useCallback(
    (bookingId: string, quotedTotalAmount: number, quotationNotes: string) => {
      setCelebrationBookings((prev) =>
        prev.map((cb) => {
          if (cb.id !== bookingId) return cb;
          const advanceAmount = Math.round((quotedTotalAmount * cb.advancePercent) / 100);
          return {
            ...cb,
            quotedTotalAmount,
            decorationCharge: 0, // Always ₹0
            quotationNotes,
            advanceAmount,
            remainingAmount: quotedTotalAmount - advanceAmount,
            status: 'Quotation Sent',
          };
        })
      );
      addToast({
        type: 'success',
        title: 'Custom Quotation Sent to Customer (Demo)',
        description: 'Customer must accept quotation before advance payment.',
      });
    },
    [addToast]
  );

  const acceptCelebrationQuotation = useCallback(
    (bookingId: string) => {
      setCelebrationBookings((prev) =>
        prev.map((cb) =>
          cb.id === bookingId ? { ...cb, status: 'Advance Pending' } : cb
        )
      );
      addToast({
        type: 'success',
        title: 'Quotation Accepted (Demo)',
        description: 'Proceed to pay the 50% demo advance to confirm your celebration.',
      });
    },
    [addToast]
  );

  const markCelebrationAdvancePaid = useCallback(
    (bookingId: string, transactionId: string) => {
      setCelebrationBookings((prev) =>
        prev.map((cb) =>
          cb.id === bookingId
            ? { ...cb, advancePaid: true, transactionId, status: 'Advance Paid' }
            : cb
        )
      );
    },
    []
  );

  const updateCelebrationBookingStatus = useCallback(
    (bookingId: string, status: CelebrationBookingStatus) => {
      setCelebrationBookings((prev) =>
        prev.map((cb) => (cb.id === bookingId ? { ...cb, status } : cb))
      );
      addToast({ type: 'success', title: `Celebration Status: ${status} (Demo)` });
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
        addToast,
        dismissToast,
        openRestaurantModal,
        closeRestaurantModal,
        openDemoPayment,
        closeDemoPayment,
        completeDemoPayment,
        loginCustomerDemo,
        signupCustomerDemo,
        updateCustomerProfile,
        loginRestaurantDemo,
        signupRestaurantDemo,
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
        sendCelebrationQuotation,
        acceptCelebrationQuotation,
        markCelebrationAdvancePaid,
        updateCelebrationBookingStatus,
        updateTableStatus,
        addTable,
        addOffer,
        toggleOfferActive,
        updatePlatformSettings,
        updateRestaurantApproval,
        updateCustomerStatus,
        toggleReviewVisibility,
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
