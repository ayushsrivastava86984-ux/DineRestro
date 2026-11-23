import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Eye, MessageSquarePlus, PartyPopper, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPECIAL_EVENTS } from '../../data/mockData';
import type { CelebrationCategory, CelebrationPackage } from '../../types';
import { SafeImage } from '../../components/common/SafeImage';
import { DemoBanner } from '../../components/common/DemoBanner';
import { CelebrationPackageCard } from '../../components/common/CelebrationPackageCard';
import { PaymentBreakdownCard } from '../../components/common/PaymentBreakdownCard';
import {
  MAX_CELEBRATION_NOTE_LENGTH,
  formatDisplayDate,
  formatINR,
  getTodayISO,
  validateEmail,
  validateIndianMobile,
} from '../../utils/formatters';

const READY_OCCASION_FILTERS: ('All' | CelebrationCategory)[] = [
  'All',
  'Birthday',
  'Anniversary',
  'Candlelight Dinner',
  'Romantic Dinner',
  'Marriage Proposal',
  'Family Celebration',
  'Private Party',
];

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || '';
  const {
    restaurants,
    celebrationPackages,
    createCelebrationBooking,
    openDemoPayment,
    openRestaurantModal,
    platformSettings,
    customerUser,
    role,
  } = useApp();

  const approvedPackages = celebrationPackages.filter(
    (p) => p.approvalStatus === 'Approved' && p.available
  );

  // Filter state for Ready-Made Packages
  const initialFilter: 'All' | CelebrationCategory =
    READY_OCCASION_FILTERS.find(
      (cat) => cat !== 'All' && initialOccasion.toLowerCase().includes(cat.toLowerCase())
    ) || 'All';
  const [occasionFilter, setOccasionFilter] = useState<'All' | CelebrationCategory>(initialFilter);

  const filteredPackages = useMemo(() => {
    if (occasionFilter === 'All') return approvedPackages;
    return approvedPackages.filter((p) => p.category === occasionFilter);
  }, [approvedPackages, occasionFilter]);

  // Celebration Package Direct Booking Modal State
  const [bookingPkg, setBookingPkg] = useState<CelebrationPackage | null>(null);
  const [customerName, setCustomerName] = useState(customerUser.fullName);
  const [customerEmail, setCustomerEmail] = useState(customerUser.email);
  const [customerPhone, setCustomerPhone] = useState(customerUser.mobile);
  const [eventDate, setEventDate] = useState(getTodayISO());
  const [eventTime, setEventTime] = useState('07:30 PM');
  const [platesCount, setPlatesCount] = useState(10);
  const [foodPreference, setFoodPreference] = useState('Pure Veg · Standard Spice');
  const [customerNote, setCustomerNote] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    txnId?: string;
    paid: boolean;
    pkgName: string;
    restName: string;
    date: string;
    time: string;
    plates: number;
    total: number;
    advance: number;
    remaining: number;
    note?: string;
  } | null>(null);

  const openDirectBooking = (pkg: CelebrationPackage) => {
    setBookingPkg(pkg);
    setPlatesCount(pkg.minPlates);
    setFoodPreference(
      pkg.dietaryType === 'Veg'
        ? 'Pure Veg · Standard Spice'
        : pkg.dietaryType === 'Non-Veg'
          ? 'Non-Veg · Standard Spice'
          : 'Veg & Non-Veg Mixed'
    );
    setCustomerNote('');
    setBookingError('');
    setConfirmedBooking(null);
  };

  const bookingRest = bookingPkg
    ? restaurants.find((r) => r.id === bookingPkg.restaurantId)
    : undefined;
  const totalPackageAmount = bookingPkg ? bookingPkg.pricePerPlate * platesCount : 0;
  const advPercent =
    bookingPkg?.advancePercent || platformSettings.defaultCelebrationAdvancePercent;
  const advAmount = Math.round((totalPackageAmount * advPercent) / 100);
  const remAmount = totalPackageAmount - advAmount;

  const handleDirectBooking = (payAdvanceNow: boolean) => {
    setBookingError('');
    if (!bookingPkg || !bookingRest) {
      setBookingError('Please choose an approved celebration package.');
      return;
    }
    if (!customerName.trim() || !validateEmail(customerEmail) || !validateIndianMobile(customerPhone)) {
      setBookingError('Please enter valid name, email, and 10-digit Indian mobile number.');
      return;
    }
    if (platesCount < bookingPkg.minPlates || platesCount > bookingPkg.maxPlates) {
      setBookingError(
        `Please select between ${bookingPkg.minPlates} and ${bookingPkg.maxPlates} plates.`
      );
      return;
    }
    const trimmedNote = customerNote.trim();
    if (trimmedNote.length > MAX_CELEBRATION_NOTE_LENGTH) {
      setBookingError(
        `Your note must be ${MAX_CELEBRATION_NOTE_LENGTH} characters or fewer.`
      );
      return;
    }

    if (payAdvanceNow) {
      openDemoPayment({
        title: `Celebration Advance (${advPercent}% · DEMO ONLY)`,
        referenceId: `CEL-${bookingRest.id.slice(-4).toUpperCase()}`,
        paymentType: 'Celebration Advance',
        customerName: customerName.trim(),
        restaurantName: bookingRest.name,
        amount: advAmount,
        breakdownLines: [
          { label: 'Ready-Made Package', value: bookingPkg.name },
          { label: 'Price Per Plate', value: formatINR(bookingPkg.pricePerPlate) },
          { label: 'Number of Plates', value: `${platesCount} Plates` },
          { label: 'Total Package Price', value: formatINR(totalPackageAmount) },
          { label: 'Decoration Charge', value: 'FREE (₹0 — Decoration Included – No Additional Charges)' },
          { label: `Advance Payable (${advPercent}%)`, value: formatINR(advAmount) },
          { label: 'Remaining Balance at Restaurant', value: formatINR(remAmount) },
        ],
        onComplete: (txnId) => {
          const created = createCelebrationBooking({
            restaurant: bookingRest,
            pkg: bookingPkg,
            eventDate,
            eventTime,
            platesCount,
            foodPreference,
            customerNote: trimmedNote,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: customerPhone.trim(),
            advancePercent: advPercent,
            payAdvanceNow: true,
            transactionId: txnId,
          });
          setConfirmedBooking({
            id: created.id,
            txnId,
            paid: true,
            pkgName: bookingPkg.name,
            restName: bookingRest.name,
            date: eventDate,
            time: eventTime,
            plates: platesCount,
            total: totalPackageAmount,
            advance: advAmount,
            remaining: remAmount,
            note: created.customerNote,
          });
        },
      });
    } else {
      const created = createCelebrationBooking({
        restaurant: bookingRest,
        pkg: bookingPkg,
        eventDate,
        eventTime,
        platesCount,
        foodPreference,
        customerNote: trimmedNote,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        advancePercent: advPercent,
        payAdvanceNow: false,
      });
      setConfirmedBooking({
        id: created.id,
        paid: false,
        pkgName: bookingPkg.name,
        restName: bookingRest.name,
        date: eventDate,
        time: eventTime,
        plates: platesCount,
        total: totalPackageAmount,
        advance: advAmount,
        remaining: remAmount,
        note: created.customerNote,
      });
    }
  };

  return (
    <div className="bg-[#FAF9F6] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Header */}
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F3F1ED] border border-[#D6CFC5] text-xs font-semibold text-[#6E1E2E] tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#B8863B]" aria-hidden="true" />
                <span>Celebrate With DineRestro · Varanasi</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1917]">
                Choose Your Perfect Celebration
              </h1>
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
                Explore curated celebration packages designed by our restaurant partners. Every package includes authentic venue decoration at ₹0 (
                <strong className="text-[#1C1917]">Decoration Included – No Additional Charges</strong>
                ) and lets you share an optional note directly with the restaurant.
              </p>
            </div>
            <div className="bg-white border border-[#E5E0D8] rounded-lg px-4 py-3 text-xs text-[#1C1917] shrink-0 space-y-1">
              <p className="font-semibold text-[#6E1E2E] uppercase tracking-wider text-[11px]">
                Direct Package Flow
              </p>
              <p className="font-mono text-[#57534E]">
                Package → Details &amp; Optional Note → Advance → Confirmed
              </p>
            </div>
          </div>

          <DemoBanner message="Ready-made Celebration Packages support direct instant booking (Package Selected → Booking Details → Advance Payment → Booking Confirmed) with ₹0 decoration fees and optional Special Instructions notes." />
        </div>

        {/* Supported Celebration Categories Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIAL_EVENTS.map((evt) => (
            <button
              key={evt.id}
              type="button"
              onClick={() => {
                setOccasionFilter(evt.category);
                const el = document.getElementById('ready-made-packages');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left border border-[#E5E0D8] rounded-lg overflow-hidden bg-white flex flex-col hover:border-[#6E1E2E] transition-colors"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <SafeImage
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover"
                  fallbackTitle={evt.title}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs text-[#57534E] tabular-nums">
                  {evt.idealGroupSize} · {evt.startingBudget}
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#1C1917] mt-1">
                  {evt.title}
                </h2>
                <p className="text-sm text-[#57534E] mt-1.5 leading-relaxed flex-1">
                  {evt.description}
                </p>
                <p className="text-xs font-semibold text-[#1E462A] mt-3">
                  Decoration Included – No Additional Charges (₹0)
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* READY-MADE CELEBRATION PACKAGES (DIRECT BOOKING) */}
        <section id="ready-made-packages" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase">
                Curated Celebration Packages ({approvedPackages.length})
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-1">
                Book a Ready-Made Celebration Package
              </h2>
              <p className="text-sm text-[#57534E] mt-1">
                Transparent per-plate pricing, real setup photography, ₹0 decoration fee, and an optional note field for special requests.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#1E462A] bg-[#ECF4EE] border border-[#BBD6C3] px-3 py-2 rounded-lg shrink-0">
              Total = Price Per Plate × Plates · Decoration ₹0
            </div>
          </div>

          {/* Occasion Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {READY_OCCASION_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setOccasionFilter(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  occasionFilter === cat
                    ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                    : 'bg-white text-[#1C1917] border-[#E5E0D8] hover:bg-[#F3F1ED]'
                }`}
              >
                {cat === 'All' ? 'All Occasions' : cat}
              </button>
            ))}
          </div>

          {filteredPackages.length === 0 ? (
            <div className="bg-white border border-[#E5E0D8] rounded-lg p-8 text-center space-y-3">
              <p className="text-sm text-[#57534E]">
                No ready-made packages matched <strong>{occasionFilter}</strong>. Reset the occasion filter to inspect all celebration packages.
              </p>
              <button
                type="button"
                onClick={() => setOccasionFilter('All')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg"
              >
                View All Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => {
                const rest = restaurants.find((r) => r.id === pkg.restaurantId);
                return (
                  <div key={pkg.id} className="flex flex-col space-y-2">
                    <CelebrationPackageCard
                      pkg={pkg}
                      actionLabel="Book Now"
                      onSelect={openDirectBooking}
                    />
                    {rest && (
                      <button
                        type="button"
                        onClick={() => openRestaurantModal(rest, 'overview')}
                        className="text-xs font-medium text-[#57534E] hover:text-[#6E1E2E] inline-flex items-center justify-center gap-1.5 py-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect {rest.name} Profile &amp; Photo Menu</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Direct Ready-Made Package Booking Modal (With Optional "Add a Note") */}
      {bookingPkg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/65 p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="direct-cel-booking-title"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-lg max-w-3xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col shadow-xl">
            <div className="px-5 py-4 bg-[#1C1917] text-[#FAF9F6] flex items-center justify-between gap-3 shrink-0">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#E5D3B3]">
                  Celebration Package Booking · Decoration Included (₹0)
                </p>
                <h2 id="direct-cel-booking-title" className="font-display text-2xl font-semibold">
                  {bookingPkg.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setBookingPkg(null)}
                className="p-1.5 rounded hover:bg-white/15"
                aria-label="Close package booking modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {confirmedBooking ? (
                <div className="py-4 space-y-5">
                  <div className="p-5 rounded-lg bg-[#ECF4EE] border border-[#BBD6C3] flex items-start gap-3">
                    <PartyPopper className="w-6 h-6 text-[#1E462A] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                        {confirmedBooking.paid
                          ? `Celebration Booking Confirmed (${confirmedBooking.id})`
                          : `Celebration Package Reserved (${confirmedBooking.id})`}
                      </h3>
                      <p className="text-sm text-[#57534E]">
                        {confirmedBooking.paid
                          ? 'Your celebration reservation is confirmed with no additional decoration charges.'
                          : 'Saved as Advance Pending. Pay your advance anytime inside Customer Portal → My Celebrations.'}
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#E5E0D8] rounded-lg p-4 bg-[#FAF9F6] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Restaurant</span>
                      <span className="font-semibold text-[#1C1917]">{confirmedBooking.restName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Schedule</span>
                      <span className="font-semibold text-[#1C1917]">
                        {formatDisplayDate(confirmedBooking.date)} at {confirmedBooking.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Plates Booked</span>
                      <span className="font-semibold tabular-nums">{confirmedBooking.plates} Plates</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Decoration Included</span>
                      <span className="font-semibold text-[#1E462A]">₹0 (No Additional Charges)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Total Package Price</span>
                      <span className="font-mono font-semibold tabular-nums">{formatINR(confirmedBooking.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Advance ({advPercent}%)</span>
                      <span className="font-mono font-semibold text-[#6E1E2E] tabular-nums">
                        {formatINR(confirmedBooking.advance)}{' '}
                        {confirmedBooking.paid ? `(DEMO PAID · ${confirmedBooking.txnId})` : '(Pending)'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#E5E0D8]">
                      <span className="text-[#57534E]">Remaining Balance at Venue</span>
                      <span className="font-mono font-semibold tabular-nums">{formatINR(confirmedBooking.remaining)}</span>
                    </div>
                    {confirmedBooking.note && (
                      <div className="pt-2.5 mt-2 border-t border-[#E5E0D8] space-y-1">
                        <p className="font-semibold text-[#1C1917]">Special Instructions (Your Note)</p>
                        <p className="text-[#57534E] bg-white border border-[#E5E0D8] rounded p-2.5 leading-relaxed">
                          {confirmedBooking.note}
                        </p>
                        <p className="text-[11px] text-[#57534E]">
                          Your note has been shared with the restaurant. The restaurant will confirm whether it can accommodate your request.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Link
                      to={role === 'customer' ? '/customer/celebrations' : '/customer/login'}
                      onClick={() => setBookingPkg(null)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                    >
                      {role === 'customer' ? 'View in My Celebrations' : 'Open Customer Portal'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBookingPkg(null)}
                      className="px-4 py-2 text-xs font-semibold border border-[#E5E0D8] rounded-lg"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium">
                    {[
                      '1. Package Selected',
                      '2. Booking Details',
                      '3. Advance Payment',
                      '4. Booking Confirmed',
                    ].map((step, i) => (
                      <div
                        key={step}
                        className={`px-2.5 py-2 rounded border text-center ${
                          i <= 1
                            ? 'bg-[#F3F1ED] border-[#6E1E2E]/40 text-[#6E1E2E] font-semibold'
                            : 'bg-[#FAF9F6] border-[#E5E0D8] text-[#57534E]'
                        }`}
                      >
                        {step}
                      </div>
                    ))}
                  </div>

                  {/* Decor Photos + Course List Summary */}
                  <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {bookingPkg.decorationPhotos.map((url, idx) => (
                        <div
                          key={`${bookingPkg.id}-modal-pic-${idx}`}
                          className="aspect-[16/10] rounded overflow-hidden border border-[#E5E0D8]"
                        >
                          <SafeImage src={url} alt={bookingPkg.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#1C1917]">
                        {bookingPkg.restaurantName} · {bookingPkg.category} ({bookingPkg.dietaryType})
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#ECF4EE] border border-[#BBD6C3] font-semibold text-[#1E462A]">
                        Decoration Included – No Additional Charges (₹0)
                      </span>
                    </div>
                    <p className="text-xs text-[#57534E]">{bookingPkg.decorationDetails}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-[#E5E0D8]">
                      {bookingPkg.plateItems.map((pi) => (
                        <div key={pi.id}>
                          <strong className="text-[#6E1E2E]">{pi.course}:</strong> {pi.itemName} ({pi.quantity})
                        </div>
                      ))}
                    </div>
                  </div>

                  {bookingError && (
                    <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
                      {bookingError}
                    </div>
                  )}

                  {/* Booking Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#6E1E2E]" /> Event Date *
                        </span>
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        min={getTodayISO()}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">Time Slot *</label>
                      <select
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      >
                        <option>12:30 PM</option>
                        <option>01:30 PM</option>
                        <option>06:30 PM</option>
                        <option>07:30 PM</option>
                        <option>08:30 PM</option>
                        <option>09:15 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Number of Plates ({bookingPkg.minPlates}–{bookingPkg.maxPlates}) *
                      </label>
                      <input
                        type="number"
                        min={bookingPkg.minPlates}
                        max={bookingPkg.maxPlates}
                        value={platesCount}
                        onChange={(e) => setPlatesCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums font-semibold focus:outline-none focus:border-[#6E1E2E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">Food Preferences</label>
                    <input
                      type="text"
                      value={foodPreference}
                      onChange={(e) => setFoodPreference(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    />
                  </div>

                  {/* Add a Note — Optional Special Instructions */}
                  <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-lg p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="events-special-instructions-note"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1917]"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-[#6E1E2E]" aria-hidden="true" />
                        <span>Special Instructions (Optional)</span>
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-[#57534E]">
                        {customerNote.length} / {MAX_CELEBRATION_NOTE_LENGTH}
                      </span>
                    </div>
                    <textarea
                      id="events-special-instructions-note"
                      rows={3}
                      maxLength={MAX_CELEBRATION_NOTE_LENGTH}
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value.slice(0, MAX_CELEBRATION_NOTE_LENGTH))}
                      placeholder="Tell the restaurant about any special requests, preferences, or arrangements..."
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#1C1917] placeholder:text-[#57534E]/75 focus:outline-none focus:border-[#6E1E2E] resize-y min-h-[84px]"
                    />
                    <p className="text-[11px] text-[#57534E] leading-relaxed">
                      Your note will be shared with the restaurant. The restaurant will confirm whether it can accommodate your request.
                    </p>
                  </div>

                  <PaymentBreakdownCard
                    title="Celebration Package Summary"
                    rows={[
                      {
                        label: 'Package Cost Calculation',
                        value: `${platesCount} Plates × ${formatINR(bookingPkg.pricePerPlate)} = ${formatINR(totalPackageAmount)}`,
                      },
                      {
                        label: 'Decoration Charge',
                        value: 'FREE (₹0 — Decoration Included – No Additional Charges)',
                        accent: true,
                      },
                      { label: 'Remaining Payable at Restaurant', value: formatINR(remAmount) },
                    ]}
                    totalLabel={`Advance Payable Now (${advPercent}%)`}
                    totalValue={formatINR(advAmount)}
                    footnote="Ready-made packages use published price-per-plate rates. Any special note is subject to restaurant confirmation."
                  />

                  <div className="flex flex-wrap justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDirectBooking(false)}
                      className="px-4 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#D6CFC5] bg-white rounded-lg hover:bg-[#F3F1ED]"
                    >
                      Save Booking (Pay Advance Later)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectBooking(true)}
                      className="px-6 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
                    >
                      Pay {advPercent}% Demo Advance &amp; Confirm ({formatINR(advAmount)})
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
