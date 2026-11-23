export type PortalRole = 'guest' | 'customer' | 'restaurant' | 'admin';

export type CuisineType =
  | 'North Indian'
  | 'South Indian'
  | 'Chinese'
  | 'Italian'
  | 'Continental'
  | 'Cafe'
  | 'Fast Food'
  | 'Desserts';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Rejected' | 'Cancelled';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type TableStatus = 'Available' | 'Occupied' | 'Reserved';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  contactNumber: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
  cuisines: CuisineType[];
  primaryCuisine: CuisineType;
  rating: number;
  reviewCount: number;
  priceForTwo: number;
  priceRange: string;
  offerText: string;
  image: string;
  description: string;
  openingHours: string;
  features: string[];
  approvalStatus: ApprovalStatus;
  registrationDate: string;
  featured?: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  available: boolean;
}

export interface DiningTable {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  zone: 'Rooftop' | 'Courtyard' | 'Indoor AC' | 'Private Lounge';
  status: TableStatus;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantArea: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  specialRequest?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface EventCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  startingBudget: string;
  idealGroupSize: string;
}

export interface EventInquiry {
  id: string;
  eventType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  preferredDate: string;
  guests: number;
  budgetRange: string;
  notes: string;
  status: 'Pending Review' | 'Proposal Sent' | 'Confirmed' | 'Declined';
  createdAt: string;
}

export interface DiningOffer {
  id: string;
  title: string;
  code: string;
  discountLabel: string;
  restaurantId: string;
  restaurantName: string;
  area: string;
  validUntil: string;
  terms: string;
  active: boolean;
  category: 'Flat Discount' | 'Complimentary' | 'Celebration' | 'Weekday Special';
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  joinedDate: string;
  totalBookings: number;
  status: 'Active' | 'Suspended';
  preferredCuisine: CuisineType;
}

export interface SupportTicket {
  id: string;
  userName: string;
  userRole: 'Customer' | 'Restaurant Partner';
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  role: Exclude<PortalRole, 'guest'>;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
