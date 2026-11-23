import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  Phone,
  Star,
  Users,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from './SafeImage';
import { getTodayISO, validateIndianMobile } from '../../utils/formatters';

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
    modalOpenBookingTab,
    closeRestaurantModal,
    favoriteIds,
    toggleFavorite,
    customerUser,
    createReservationPreview,
    menuItems,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'book'>('overview');
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState('07:30 PM');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState('Casual Dining');
  const [customerName, setCustomerName] = useState(customerUser.fullName);
  const [customerPhone, setCustomerPhone] = useState(customerUser.mobile);
  const [specialRequest, setSpecialRequest] = useState('');
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRestaurantForModal) {
      setActiveTab(modalOpenBookingTab ? 'book' : 'overview');
      setSubmittedId(null);
      setError('');
      setCustomerName(customerUser.fullName);
      setCustomerPhone(customerUser.mobile);
    }
  }, [selectedRestaurantForModal, modalOpenBookingTab, customerUser]);

  if (!selectedRestaurantForModal) return null;

  const restaurant = selectedRestaurantForModal;
  const isFav = favoriteIds.includes(restaurant.id);
  const sampleDishes = menuItems.filter((m) => m.restaurantId === restaurant.id);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customerName.trim()) {
      setError('Please enter guest full name.');
      return;
    }
    if (!validateIndianMobile(customerPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!date) {
      setError('Please choose a booking date.');
      return;
    }
    const created = createReservationPreview({
      restaurant,
      date,
      time,
      guests,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      occasion,
      specialRequest: specialRequest.trim() || undefined,
    });
    setSubmittedId(created.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-title"
    >
      <div className="bg-white border border-[#E8DDD1] rounded-lg max-w-3xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <div className="relative h-52 sm:h-64 w-full shrink-0">
          <SafeImage
            src={restaurant.image}
            alt={`${restaurant.name} in ${restaurant.area}, Varanasi`}
            className="w-full h-full object-cover"
            fallbackTitle={restaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <button
            type="button"
            onClick={closeRestaurantModal}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-[#292321] hover:bg-white transition-colors"
            aria-label="Close restaurant details"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(restaurant.id)}
            className="absolute top-3 right-14 p-2 rounded-full bg-white/95 text-[#702C3A] hover:bg-white transition-colors"
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#702C3A]' : ''}`} />
          </button>
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <p className="text-xs text-[#FFF6E9] mb-1">
              {restaurant.cuisines.join(' · ')} · {restaurant.area}, {restaurant.city}
            </p>
            <h2 id="restaurant-modal-title" className="text-2xl sm:text-3xl font-semibold">
              {restaurant.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8DDD1] bg-[#FFF6E9] shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#702C3A] text-white'
                  : 'text-[#292321] hover:bg-white/70'
              }`}
            >
              Restaurant Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                activeTab === 'book'
                  ? 'bg-[#702C3A] text-white'
                  : 'text-[#292321] hover:bg-white/70'
              }`}
            >
              Book Table (Demo)
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#292321] tabular-nums">
            <Star className="w-3.5 h-3.5 fill-[#702C3A] text-[#702C3A]" />
            <span>{restaurant.rating.toFixed(1)}</span>
            <span className="text-[#6B5F5C]">({restaurant.reviewCount} reviews)</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {activeTab === 'overview' ? (
            <>
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
                    <p className="text-xs text-[#6B5F5C]">Hours & Pricing</p>
                    <p className="font-medium text-[#292321]">{restaurant.openingHours}</p>
                    <p className="text-xs text-[#6B5F5C] tabular-nums">{restaurant.priceRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#6B5F5C]">Host Desk</p>
                    <p className="font-medium text-[#292321] tabular-nums">{restaurant.contactNumber}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#292321] mb-1.5">About the Venue</h3>
                <p className="text-sm text-[#6B5F5C] leading-relaxed">{restaurant.description}</p>
              </div>

              <div className="bg-[#E7EFD9] border border-[#C8D8AC] rounded-lg px-4 py-3 text-sm text-[#292321]">
                <span className="font-semibold">Featured Offer: </span>
                <span>{restaurant.offerText}</span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#292321] mb-2">Dining Highlights</h3>
                <p className="text-sm text-[#6B5F5C]">
                  {restaurant.features.join('  ·  ')}
                </p>
              </div>

              {sampleDishes.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-[#292321] mb-2.5">
                    Sample Signature Plates
                  </h3>
                  <div className="divide-y divide-[#E8DDD1] border border-[#E8DDD1] rounded-lg">
                    {sampleDishes.slice(0, 3).map((dish) => (
                      <div
                        key={dish.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#292321]">{dish.name}</p>
                          <p className="text-xs text-[#6B5F5C]">{dish.description}</p>
                        </div>
                        <span className="text-sm font-mono tabular-nums font-semibold text-[#702C3A] shrink-0">
                          ₹{dish.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRestaurantModal}
                  className="px-4 py-2 text-sm font-medium text-[#292321] border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9] transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
                >
                  Reserve a Table (Demo)
                </button>
              </div>
            </>
          ) : submittedId ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#E7EFD9] text-[#292321] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#702C3A]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#292321]">
                Demo Booking Preview Logged
              </h3>
              <p className="text-sm text-[#6B5F5C] max-w-md mx-auto leading-relaxed">
                Reference <span className="font-mono font-semibold text-[#292321]">{submittedId}</span> for{' '}
                {guests} guests at <span className="font-medium text-[#292321]">{restaurant.name}</span> on{' '}
                {date} at {time}. This is a Phase 1 frontend simulation and is not a confirmed live reservation.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittedId(null)}
                  className="px-4 py-2 text-sm font-medium border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9]"
                >
                  Make Another Preview
                </button>
                <button
                  type="button"
                  onClick={closeRestaurantModal}
                  className="px-5 py-2 text-sm font-semibold bg-[#702C3A] text-white rounded-lg hover:bg-[#58202C]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="px-3.5 py-2.5 rounded-lg bg-[#FFF6E9] border border-[#E8DDD1] text-xs text-[#6B5F5C]">
                Phase 1 Demo Booking Preview: Submit to test reservation flow in local session state. No live restaurant SMS or confirmation is sent.
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-lg bg-[#FDECEF] border border-[#F4A6B8] text-xs font-medium text-[#702C3A]">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#292321] mb-1">
                    Booking Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      min={getTodayISO()}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#292321] mb-1">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DDD1] rounded-lg bg-white focus:outline-none focus:border-[#702C3A]"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#292321] mb-1">
                    Occasion
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg bg-white focus:outline-none focus:border-[#702C3A]"
                  >
                    <option>Casual Dining</option>
                    <option>Birthday Celebration</option>
                    <option>Anniversary Celebration</option>
                    <option>Romantic Dinner</option>
                    <option>Family Gathering</option>
                    <option>Corporate Dining</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#292321] mb-1.5">
                  Select Preferred Time Slot
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                        time === slot
                          ? 'bg-[#702C3A] text-white border-[#702C3A]'
                          : 'bg-white text-[#292321] border-[#E8DDD1] hover:bg-[#FFF6E9]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#292321] mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#292321] mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98390 00000"
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#292321] mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="Window seat, Jain/eggless cake note, high chair..."
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 text-sm font-medium border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
                >
                  Submit Demo Booking Preview
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
