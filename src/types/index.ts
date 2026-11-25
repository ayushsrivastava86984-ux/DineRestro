export type PortalRole = 'guest' | 'customer' | 'restaurant' | 'admin';

export type CuisineType =
  | 'North Indian'
  | 'Awadhi'
  | 'Mughlai'
  | 'South Indian'
  | 'Chinese'
  | 'Italian'
  | 'Continental'
  | 'Multi-cuisine'
  | 'Cafe'
  | 'Fast Food'
  | 'Desserts';

export type RestaurantCategory =
  | 'Fine Dining'
  | 'Family Restaurant'
  | 'Casual Dining'
  | 'Cafe'
  | 'Rooftop Dining'
  | 'Heritage Dining'
  | 'Patisserie & Bistro';

export type AmenityType =
  | 'Wi-Fi'
  | 'Air Conditioning'
  | 'Parking'
  | 'Valet Parking'
  | 'Outdoor Seating'
  | 'Rooftop Seating'
  | 'Private Dining'
  | 'Family Friendly'
  | 'Couple Friendly'
  | 'Live Music'
  | 'Wheelchair Accessible'
  | 'Kids Play Area'
  | 'Party Hall'
  | 'Smoking Area';

export type CelebrationCategory =
  | 'Birthday'
  | 'Anniversary'
  | 'Candlelight Dinner'
  | 'Romantic Dinner'
  | 'Marriage Proposal'
  | 'Family Celebration'
  | 'Private Party';

export type RestaurantApprovalStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export type ReservationStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export type PreOrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Advance Paid'
  | 'Preparing'
  | 'Ready'
  | 'Completed';

export type CelebrationBookingStatus =
  | 'Pending'
  | 'Accepted'
  | 'Advance Pending'
  | 'Advance Paid'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export type TableStatus = 'Available' | 'Occupied' | 'Reserved';

export type PhotoCategory =
  | 'Interior'
  | 'Exterior'
  | 'Dining Area'
  | 'Ambience'
  | 'Gallery';

export interface RestaurantPhoto {
  id: string;
  url: string;
  category: PhotoCategory;
  caption: string;
}

export interface MenuPagePhoto {
  id: string;
  url: string;
  title: string;
  pageNumber: number;
}

export type MenuCategoryName =
  | 'Starters'
  | 'Main Course'
  | 'Biryani and Rice'
  | 'Breads'
  | 'Snacks'
  | 'Desserts'
  | 'Beverages'
  | 'Combos';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategoryName;
  dietaryType: 'Veg' | 'Non-Veg';
  imageUrl: string;
  available: boolean;
  isBestseller?: boolean;
  isRecommended?: boolean;
  prepTimeMinutes?: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategoryName;
  dietaryType: 'Veg' | 'Non-Veg';
  imageUrl: string;
  quantity: number;
}

export interface RestaurantCart {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
}

export interface FoodOrderItemSnapshot {
  id: string;
  menuItemId: string;
  itemName: string;
  itemDescription: string;
  category: MenuCategoryName;
  dietaryType: 'Veg' | 'Non-Veg';
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface PlateCourseItem {
  id: string;
  course:
    | 'Welcome Drink'
    | 'Starter'
    | 'Main Course'
    | 'Bread'
    | 'Rice'
    | 'Dessert'
    | 'Additional Included Items';
  itemName: string;
  quantity: string;
}

export interface PreOrderPlatePackage {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  dietaryType: 'Veg' | 'Non-Veg' | 'Veg & Non-Veg';
  pricePerPlate: number;
  minPlates: number;
  available: boolean;
  plateItems: PlateCourseItem[];
}

export interface CelebrationPackage {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantArea?: string;
  name: string;
  category: CelebrationCategory;
  description: string;
  decorationPhotos: string[];
  decorationDetails: string;
  pricePerPlate: number;
  minPlates: number;
  maxPlates: number;
  dietaryType: 'Veg' | 'Non-Veg' | 'Veg & Non-Veg';
  plateItems: PlateCourseItem[];
  advancePercent?: number;
  available: boolean;
  specialInstructions: string;
  approvalStatus: RestaurantApprovalStatus;
}

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
  category?: RestaurantCategory;
  tier: 'Basic' | 'Premium';
  preOrderAdvancePercent: number;
  rating: number;
  reviewCount: number;
  priceForTwo: number;
  priceRange: string;
  offerText: string;
  logoUrl: string;
  image: string; // cover photo
  photos: RestaurantPhoto[];
  menuPhotos: MenuPagePhoto[];
  amenities: AmenityType[];
  description: string;
  openingHours: string;
  availabilityNote: string;
  features: string[];
  approvalStatus: RestaurantApprovalStatus;
  registrationDate: string;
  featured?: boolean;
  isDemo?: boolean;
  isActive?: boolean;
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
  bookingTier: 'Basic' | 'Premium';
  orderMode: 'Order at Restaurant' | 'Offer Table Booking' | 'Basic Table Booking' | 'Premium Table Booking';
  selectedOfferId?: string;
  selectedOfferTitle?: string;
  offerTier?: 'Basic' | 'Premium';
  feePerGuest: number;
  platformFeeTotal: number;
  transactionId?: string;
  occasion?: string;
  specialRequest?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface FoodPreOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantArea: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  packageId: string;
  packageName: string;
  plateCount: number;
  pricePerPlate: number;
  foodPreference: string;
  orderSource?: 'menu_cart' | 'plate_package';
  orderMode?: 'Pre-Order Advance' | 'Order at Restaurant';
  items?: FoodOrderItemSnapshot[];
  specialInstructions?: string;
  paymentStatus?: 'Advance Paid' | 'Pay at Restaurant' | 'Unpaid';
  totalFoodAmount: number;
  advancePercent: number;
  advanceAmount: number;
  remainingAmount: number;
  advancePaid: boolean;
  transactionId?: string;
  status: PreOrderStatus;
  createdAt: string;
}

export interface CelebrationBooking {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantArea: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  celebrationType: CelebrationCategory;
  packageId: string;
  packageName: string;
  decorationArrangement: string;
  decorationPhoto: string;
  plateItems: PlateCourseItem[];
  eventDate: string;
  eventTime: string;
  platesCount: number;
  pricePerPlate: number;
  totalPackageAmount: number;
  decorationCharge: 0; // Always ₹0 per business rule
  quotedTotalAmount: number;
  advancePercent: number;
  advanceAmount: number;
  remainingAmount: number;
  advancePaid: boolean;
  transactionId?: string;
  foodPreference: string;
  customerNote?: string;
  specialRequests: string;
  status: CelebrationBookingStatus;
  createdAt: string;
}

export interface PendingBookingIntent {
  kind: 'restaurant_modal' | 'events_package';
  restaurantId?: string;
  tab?: 'overview' | 'menu' | 'book' | 'preorder' | 'celebrate';
  celebrationPackageId?: string;
  returnPath: string;
  draft?: {
    tableDate?: string;
    tableTime?: string;
    tableGuests?: number;
    tableTier?: 'Basic' | 'Premium';
    selectedOfferId?: string;
    tableNotes?: string;
    preOrderDate?: string;
    preOrderTime?: string;
    plateCount?: number;
    selectedPrePkgId?: string;
    foodPreference?: string;
    preOrderMode?: 'Pre-order Food' | 'Order at Restaurant';
    preOrderSpecialInstructions?: string;
    preOrderGuestName?: string;
    preOrderGuestPhone?: string;
    celDate?: string;
    celTime?: string;
    celPlates?: number;
    selectedCelPkgId?: string;
    celFoodPref?: string;
    celCustomerNote?: string;
  };
}

export interface EventCategory {
  id: string;
  title: string;
  category: CelebrationCategory;
  subtitle: string;
  description: string;
  image: string;
  startingBudget: string;
  idealGroupSize: string;
}

export interface DiningOffer {
  id: string;
  title: string;
  code: string;
  discountLabel: string;
  offerTier: 'Basic' | 'Premium';
  restaurantId: string;
  restaurantName: string;
  area: string;
  validUntil: string;
  terms: string;
  active: boolean;
  category: 'Flat Discount' | 'Complimentary' | 'Celebration' | 'Weekday Special';
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  referenceId: string;
  paymentType:
    | 'Platform Booking Fee'
    | 'Food Pre-Order Advance'
    | 'Celebration Advance'
    | 'Custom Celebration Advance';
  customerName: string;
  restaurantName: string;
  amount: number;
  paymentMethod: string;
  status: 'DEMO PAID' | 'DEMO REFUNDED';
  createdAt: string;
}

export interface RestaurantReview {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  visible: boolean;
}

export interface PlatformSettings {
  basicOfferFeePerGuest: number;
  premiumOfferFeePerGuest: number;
  defaultPreOrderAdvancePercent: number;
  defaultCelebrationAdvancePercent: number;
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

export interface CityConfig {
  id: string;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
  isDefaultLaunchCity: boolean;
  neighbourhoods: string[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
