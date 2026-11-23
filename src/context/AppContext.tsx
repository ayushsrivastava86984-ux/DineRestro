import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  IMAGES,
  INITIAL_CUSTOMERS,
  INITIAL_EVENT_INQUIRIES,
  INITIAL_MENU_ITEMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OFFERS,
  INITIAL_RESERVATIONS,
  INITIAL_RESTAURANTS,
  INITIAL_TABLES,
  INITIAL_TICKETS,
} from '../data/mockData';
import type {
  AppNotification,
  ApprovalStatus,
  BookingStatus,
  CuisineType,
  CustomerProfile,
  DiningOffer,
  DiningTable,
  EventInquiry,
  MenuItem,
  PortalRole,
  Reservation,
  Restaurant,
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

interface AppContextValue {
  role: PortalRole;
  customerUser: CustomerAuthInfo;
  activeRestaurantId: string;
  activeRestaurant: Restaurant;
  restaurants: Restaurant[];
  reservations: Reservation[];
  menuItems: MenuItem[];
  tables: DiningTable[];
  offers: DiningOffer[];
  eventInquiries: EventInquiry[];
  customers: CustomerProfile[];
  tickets: SupportTicket[];
  notifications: AppNotification[];
  favoriteIds: string[];
  toasts: ToastMessage[];
  selectedRestaurantForModal: Restaurant | null;
  modalOpenBookingTab: boolean;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  openRestaurantModal: (restaurant: Restaurant, startWithBooking?: boolean) => void;
  closeRestaurantModal: () => void;

  loginCustomerDemo: (email?: string, name?: string) => void;
  signupCustomerDemo: (data: {
    fullName: string;
    email: string;
    mobile: string;
  }) => void;
  updateCustomerProfile: (updates: Partial<CustomerAuthInfo>) => void;

  loginRestaurantDemo: (email?: string) => void;
  signupRestaurantDemo: (data: RestaurantRegistrationInput) => void;
  updateActiveRestaurantProfile: (updates: Partial<Restaurant>) => void;

  loginAdminDemo: (email?: string) => void;
  logoutPortal: () => void;

  toggleFavorite: (restaurantId: string) => void;
  createReservationPreview: (payload: {
    restaurant: Restaurant;
    date: string;
    time: string;
    guests: number;
    customerName: string;
    customerPhone: string;
    occasion?: string;
    specialRequest?: string;
  }) => Reservation;
  updateReservationStatus: (reservationId: string, status: BookingStatus) => void;

  addMenuItem: (item: Omit<MenuItem, 'id' | 'restaurantId'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addTable: (table: Omit<DiningTable, 'id' | 'restaurantId'>) => void;

  addOffer: (offer: Omit<DiningOffer, 'id'>) => void;
  toggleOfferActive: (offerId: string) => void;

  submitEventInquiry: (
    inquiry: Omit<EventInquiry, 'id' | 'status' | 'createdAt'>
  ) => EventInquiry;
  updateEventInquiryStatus: (
    inquiryId: string,
    status: EventInquiry['status']
  ) => void;

  updateRestaurantApproval: (restaurantId: string, status: ApprovalStatus) => void;
  updateCustomerStatus: (customerId: string, status: CustomerProfile['status']) => void;
  submitSupportTicket: (
    ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>
  ) => void;
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [tables, setTables] = useState<DiningTable[]>(INITIAL_TABLES);
  const [offers, setOffers] = useState<DiningOffer[]>(INITIAL_OFFERS);
  const [eventInquiries, setEventInquiries] = useState<EventInquiry[]>(INITIAL_EVENT_INQUIRIES);
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
  const [modalOpenBookingTab, setModalOpenBookingTab] = useState<boolean>(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const openRestaurantModal = useCallback(
    (restaurant: Restaurant, startWithBooking = false) => {
      setSelectedRestaurantForModal(restaurant);
      setModalOpenBookingTab(startWithBooking);
    },
    []
  );

  const closeRestaurantModal = useCallback(() => {
    setSelectedRestaurantForModal(null);
    setModalOpenBookingTab(false);
  }, []);

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
        description: 'Explore your simulated customer dashboard and bookings.',
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
        joinedDate: '2026-11-22',
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
      addToast({
        type: 'success',
        title: 'Demo Profile Updated',
        description: 'Changes saved in local session state.',
      });
    },
    [addToast]
  );

  const loginRestaurantDemo = useCallback(
    (email?: string) => {
      setRole('restaurant');
      const matched = email
        ? restaurants.find(
            (r) => r.ownerEmail.toLowerCase() === email.toLowerCase()
          )
        : undefined;
      setActiveRestaurantId(matched ? matched.id : 'rest-kashi-terrace');
      addToast({
        type: 'success',
        title: 'Demo Partner Session Started',
        description: 'Managing sample restaurant reservations and menu.',
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
        image: IMAGES.heritageCourtyard,
        description: data.description,
        openingHours: '11:00 AM – 11:00 PM',
        features: ['Table Reservations', 'Event Hosting'],
        approvalStatus: 'Pending',
        registrationDate: '2026-11-22',
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
    (updates: Partial<Restaurant>) => {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === activeRestaurantId ? { ...r, ...updates } : r))
      );
      addToast({
        type: 'success',
        title: 'Restaurant Profile Updated (Demo)',
        description: 'Sample venue details updated in local state.',
      });
    },
    [activeRestaurantId, addToast]
  );

  const loginAdminDemo = useCallback(() => {
    setRole('admin');
    addToast({
      type: 'success',
      title: 'Demo Admin Session Started',
      description: 'Viewing simulated DineRestro internal operations portal.',
    });
  }, [addToast]);

  const logoutPortal = useCallback(() => {
    setRole('guest');
    addToast({
      type: 'info',
      title: 'Signed Out of Demo Session',
      description: 'Returned to public DineRestro mode.',
    });
  }, [addToast]);

  const toggleFavorite = useCallback(
    (restaurantId: string) => {
      setFavoriteIds((prev) => {
        const exists = prev.includes(restaurantId);
        addToast({
          type: 'info',
          title: exists ? 'Removed from Favorites' : 'Saved to Favorites',
          description: 'Updated in your local demo session.',
        });
        return exists
          ? prev.filter((id) => id !== restaurantId)
          : [...prev, restaurantId];
      });
    },
    [addToast]
  );

  const createReservationPreview = useCallback(
    (payload: {
      restaurant: Restaurant;
      date: string;
      time: string;
      guests: number;
      customerName: string;
      customerPhone: string;
      occasion?: string;
      specialRequest?: string;
    }) => {
      const newRes: Reservation = {
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
        occasion: payload.occasion,
        specialRequest: payload.specialRequest,
        status: 'Pending',
        createdAt: '2026-11-22',
      };
      setReservations((prev) => [newRes, ...prev]);
      addToast({
        type: 'success',
        title: 'Demo Booking Request Created',
        description: `Preview #${newRes.id} at ${payload.restaurant.name} (not a live restaurant confirmation).`,
      });
      return newRes;
    },
    [addToast, customerUser.id]
  );

  const updateReservationStatus = useCallback(
    (reservationId: string, status: BookingStatus) => {
      setReservations((prev) =>
        prev.map((res) => (res.id === reservationId ? { ...res, status } : res))
      );
      addToast({
        type: 'success',
        title: `Reservation ${status} (Demo)`,
        description: `Booking ${reservationId} status updated locally.`,
      });
    },
    [addToast]
  );

  const addMenuItem = useCallback(
    (item: Omit<MenuItem, 'id' | 'restaurantId'>) => {
      const newItem: MenuItem = {
        ...item,
        id: `menu-${Date.now()}`,
        restaurantId: activeRestaurantId,
      };
      setMenuItems((prev) => [newItem, ...prev]);
      addToast({
        type: 'success',
        title: 'Menu Item Added (Demo)',
        description: `${item.name} added to your sample menu.`,
      });
    },
    [activeRestaurantId, addToast]
  );

  const updateMenuItem = useCallback(
    (id: string, updates: Partial<MenuItem>) => {
      setMenuItems((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
      addToast({
        type: 'success',
        title: 'Menu Item Updated (Demo)',
      });
    },
    [addToast]
  );

  const deleteMenuItem = useCallback(
    (id: string) => {
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      addToast({
        type: 'info',
        title: 'Menu Item Removed (Demo)',
      });
    },
    [addToast]
  );

  const updateTableStatus = useCallback(
    (tableId: string, status: TableStatus) => {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status } : t))
      );
      addToast({
        type: 'info',
        title: `Table Status Set to ${status}`,
      });
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
      addToast({
        type: 'success',
        title: `Table ${table.tableNumber} Added (Demo)`,
      });
    },
    [activeRestaurantId, addToast]
  );

  const addOffer = useCallback(
    (offer: Omit<DiningOffer, 'id'>) => {
      const created: DiningOffer = {
        ...offer,
        id: `off-${Date.now()}`,
      };
      setOffers((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Promotional Offer Published (Demo)',
        description: `Code ${offer.code} is now visible in sample offers.`,
      });
    },
    [addToast]
  );

  const toggleOfferActive = useCallback(
    (offerId: string) => {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o))
      );
      addToast({
        type: 'info',
        title: 'Offer Availability Toggled (Demo)',
      });
    },
    [addToast]
  );

  const submitEventInquiry = useCallback(
    (inquiry: Omit<EventInquiry, 'id' | 'status' | 'createdAt'>) => {
      const created: EventInquiry = {
        ...inquiry,
        id: `EVT-${Math.floor(910 + Math.random() * 89)}`,
        status: 'Pending Review',
        createdAt: '2026-11-22',
      };
      setEventInquiries((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Event Inquiry Submitted (Demo)',
        description: `Reference ${created.id} logged in local state.`,
      });
      return created;
    },
    [addToast]
  );

  const updateEventInquiryStatus = useCallback(
    (inquiryId: string, status: EventInquiry['status']) => {
      setEventInquiries((prev) =>
        prev.map((e) => (e.id === inquiryId ? { ...e, status } : e))
      );
      addToast({
        type: 'success',
        title: `Event Inquiry Marked ${status}`,
      });
    },
    [addToast]
  );

  const updateRestaurantApproval = useCallback(
    (restaurantId: string, status: ApprovalStatus) => {
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurantId ? { ...r, approvalStatus: status } : r
        )
      );
      addToast({
        type: status === 'Approved' ? 'success' : 'info',
        title: `Restaurant ${status} (Demo)`,
        description: 'Approval state updated in local Phase 1 demo state.',
      });
    },
    [addToast]
  );

  const updateCustomerStatus = useCallback(
    (customerId: string, status: CustomerProfile['status']) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, status } : c))
      );
      addToast({
        type: 'info',
        title: `Customer Status: ${status} (Demo)`,
      });
    },
    [addToast]
  );

  const submitSupportTicket = useCallback(
    (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => {
      const created: SupportTicket = {
        ...ticket,
        id: `TKT-${Math.floor(310 + Math.random() * 89)}`,
        status: 'Open',
        createdAt: '2026-11-22',
      };
      setTickets((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Support Request Logged (Demo)',
        description: `Ticket ${created.id} added to local queue.`,
      });
    },
    [addToast]
  );

  const updateTicketStatus = useCallback(
    (ticketId: string, status: SupportTicket['status']) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );
      addToast({
        type: 'success',
        title: `Ticket Marked ${status}`,
      });
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

  return (
    <AppContext.Provider
      value={{
        role,
        customerUser,
        activeRestaurantId,
        activeRestaurant,
        restaurants,
        reservations,
        menuItems,
        tables,
        offers,
        eventInquiries,
        customers,
        tickets,
        notifications,
        favoriteIds,
        toasts,
        selectedRestaurantForModal,
        modalOpenBookingTab,
        addToast,
        dismissToast,
        openRestaurantModal,
        closeRestaurantModal,
        loginCustomerDemo,
        signupCustomerDemo,
        updateCustomerProfile,
        loginRestaurantDemo,
        signupRestaurantDemo,
        updateActiveRestaurantProfile,
        loginAdminDemo,
        logoutPortal,
        toggleFavorite,
        createReservationPreview,
        updateReservationStatus,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        updateTableStatus,
        addTable,
        addOffer,
        toggleOfferActive,
        submitEventInquiry,
        updateEventInquiryStatus,
        updateRestaurantApproval,
        updateCustomerStatus,
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
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
