import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Eye,
  Lock,
  PartyPopper,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CELEBRATION_CATEGORIES, IMAGES, SPECIAL_EVENTS } from '../../data/mockData';
import type { CelebrationCategory, CelebrationPackage, VegNonVegPreference } from '../../types';
import { SafeImage } from '../../components/common/SafeImage';
import { DemoBanner } from '../../components/common/DemoBanner';
import { CelebrationPackageCard } from '../../components/common/CelebrationPackageCard';
import { PaymentBreakdownCard } from '../../components/common/PaymentBreakdownCard';
import {
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

const VEG_OPTIONS: VegNonVegPreference[] = [
  'Pure Veg',
  'Veg & Non-Veg',
  'Non-Veg',
  'Jain Options Available',
];

function readFilesAsDataUrls(files: FileList | null, callback: (urls: string[]) => void) {
  if (!files || files.length === 0) return;
  const promises = Array.from(files).map(
    (file) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      })
  );
  Promise.all(promises).then((urls) => {
    const valid = urls.filter(Boolean);
    if (valid.length > 0) callback(valid);
  });
}

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || '';
  const {
    restaurants,
    celebrationPackages,
    createCelebrationBooking,
    createCustomCelebrationRequest,
    openDemoPayment,
    openRestaurantModal,
    platformSettings,
    customerUser,
    role,
  } = useApp();

  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');
  const approvedPackages = celebrationPackages.filter(
    (p) => p.approvalStatus === 'Approved' && p.available
  );

  // Filter state for Option A (Ready-Made Packages)
  const initialFilter: 'All' | CelebrationCategory =
    READY_OCCASION_FILTERS.find(
      (cat) => cat !== 'All' && initialOccasion.toLowerCase().includes(cat.toLowerCase())
    ) || 'All';
  const [occasionFilter, setOccasionFilter] = useState<'All' | CelebrationCategory>(initialFilter);
  const [activeOptionView, setActiveOptionView] = useState<'both' | 'ready' | 'custom'>('both');

  const filteredPackages = useMemo(() => {
    if (occasionFilter === 'All') return approvedPackages;
    return approvedPackages.filter((p) => p.category === occasionFilter);
  }, [approvedPackages, occasionFilter]);

  // Direct Booking Modal State (Option A — NO Quotation Required)
  const [bookingPkg, setBookingPkg] = useState<CelebrationPackage | null>(null);
  const [customerName, setCustomerName] = useState(customerUser.fullName);
  const [customerEmail, setCustomerEmail] = useState(customerUser.email);
  const [customerPhone, setCustomerPhone] = useState(customerUser.mobile);
  const [eventDate, setEventDate] = useState(getTodayISO());
  const [eventTime, setEventTime] = useState('07:30 PM');
  const [platesCount, setPlatesCount] = useState(10);
  const [foodPreference, setFoodPreference] = useState('Pure Veg · Standard Spice');
  const [specialRequests, setSpecialRequests] = useState('');
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
  } | null>(null);

  // Option B: Custom Celebration Request State (Quotation Compulsory)
  const [customRestaurantId, setCustomRestaurantId] = useState(approvedRestaurants[0]?.id || '');
  const [customOccasion, setCustomOccasion] = useState<CelebrationCategory>('Anniversary');
  const [customDate, setCustomDate] = useState(getTodayISO());
  const [customTime, setCustomTime] = useState('07:30 PM');
  const [customGuests, setCustomGuests] = useState(12);
  const [customBudget, setCustomBudget] = useState(15000);
  const [customTheme, setCustomTheme] = useState('Marigold & Brass Heritage Candlelight');
  const [customColors, setCustomColors] = useState('Deep Burgundy, Warm Ivory & Champagne Gold');
  const [customCake, setCustomCake] = useState('1 kg Eggless Saffron Pistachio Cake');
  const [customFoodPref, setCustomFoodPref] = useState('Multi-Course Banarasi Feast with Live Starter Station');
  const [customVegPref, setCustomVegPref] = useState<VegNonVegPreference>('Pure Veg');
  const [customDecorReqs, setCustomDecorReqs] = useState(
    'Floral table runner, brass lamps, and personalized milestone welcome board'
  );
  const [customInstructions, setCustomInstructions] = useState('');
  const [customRefImages, setCustomRefImages] = useState<string[]>([]);
  const [customContactName, setCustomContactName] = useState(customerUser.fullName);
  const [customContactEmail, setCustomContactEmail] = useState(customerUser.email);
  const [customContactPhone, setCustomContactPhone] = useState(customerUser.mobile);
  const [customError, setCustomError] = useState('');
  const [customSubmittedRef, setCustomSubmittedRef] = useState<string | null>(null);

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
            specialRequests: specialRequests.trim(),
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
        specialRequests: specialRequests.trim(),
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
      });
    }
  };

  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    const targetRest = approvedRestaurants.find((r) => r.id === customRestaurantId);
    if (!targetRest) {
      setCustomError('Please select a Varanasi restaurant.');
      return;
    }
    if (
      !customContactName.trim() ||
      !validateEmail(customContactEmail) ||
      !validateIndianMobile(customContactPhone)
    ) {
      setCustomError('Please enter valid contact name, email, and 10-digit Indian mobile number.');
      return;
    }
    if (customGuests < 2 || customBudget < 1000 || !customTheme.trim() || !customFoodPref.trim()) {
      setCustomError(
        'Please specify valid guest count (min 2), approximate budget, decoration theme, and food preferences.'
      );
      return;
    }
    const created = createCustomCelebrationRequest({
      restaurant: targetRest,
      occasionType: customOccasion,
      preferredDate: customDate,
      preferredTime: customTime,
      guestsCount: customGuests,
      estimatedBudget: customBudget,
      decorationTheme: customTheme.trim(),
      preferredColors: customColors.trim(),
      cakeRequirements: customCake.trim() || 'No cake required',
      foodPreferences: customFoodPref.trim(),
      vegNonVegPreference: customVegPref,
      decorationRequirements: customDecorReqs.trim() || customTheme.trim(),
      specialInstructions: customInstructions.trim(),
      referenceImages: customRefImages,
      customerName: customContactName.trim(),
      customerEmail: customContactEmail.trim(),
      customerPhone: customContactPhone.trim(),
    });
    setCustomSubmittedRef(created.id);
    setCustomInstructions('');
  };

  return (
    <div className="bg-[#FAF9F6] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Header + Two Clear Booking Paths */}
        <div className="space-y-6">
          <div className="space-y-3 max-w-3xl">
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase">
              Celebrate With DineRestro · Varanasi
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1917]">
              Two Ways to Plan Your Celebration
            </h1>
            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
              Every celebration booked on DineRestro includes authentic venue decoration at ₹0 (
              <strong>Decoration Included – No Additional Charges</strong>). Book a ready-made package directly without quotation, or request a tailored celebration proposal reviewed by the restaurant.
            </p>
          </div>

          <DemoBanner message="Ready-made Celebration Packages support instant direct booking (Package → Details → Advance Payment → Confirmed) with NO quotation required. Custom Celebration Requests require a restaurant quotation and your explicit acceptance before advance payment unlocks." />

          {/* Two Prominent Option Selector Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-[#6E1E2E]/25 rounded-lg p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6E1E2E]">
                    Option A · Direct Instant Booking
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#ECF4EE] border border-[#BBD6C3] text-[11px] font-semibold text-[#1E462A]">
                    No Quotation Required
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                  Choose Your Perfect Celebration
                </h2>
                <p className="text-sm text-[#57534E]">
                  Explore beautiful celebration packages designed by our restaurant partners. Fixed price per plate, real decor photos, and instant advance confirmation.
                </p>
                <p className="text-xs font-mono text-[#1C1917] bg-[#F3F1ED] border border-[#E5E0D8] rounded px-3 py-2">
                  Package Selected → Booking Details → Advance Payment → Booking Confirmed
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="#ready-made-packages"
                  onClick={() => setActiveOptionView('ready')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
                >
                  <span>Browse Ready-Made Packages ({approvedPackages.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveOptionView('both')}
                  className="px-4 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#E5E0D8] rounded-lg hover:bg-[#F3F1ED]"
                >
                  Show All Options
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6E1E2E]">
                    Option B · Bespoke Venue Planning
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#F3F1ED] border border-[#D6CFC5] text-[11px] font-semibold text-[#6E1E2E] inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Quotation Compulsory
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                  Create Your Own Celebration
                </h2>
                <p className="text-sm text-[#57534E]">
                  Have something special in mind? Tell us your requirements and let the restaurant create a personalised celebration experience with a custom quotation.
                </p>
                <p className="text-xs font-mono text-[#1C1917] bg-[#F3F1ED] border border-[#E5E0D8] rounded px-3 py-2">
                  Request → Review → Quotation Sent → Accepted → Advance → Confirmed
                </p>
              </div>
              <div className="pt-1">
                <a
                  href="#custom-celebration-form"
                  onClick={() => setActiveOptionView('custom')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#6E1E2E] bg-[#F3F1ED] border border-[#6E1E2E]/40 rounded-lg hover:bg-[#E5E0D8]/60 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request Custom Celebration Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Celebration Categories Showcase */}
        {activeOptionView === 'both' && (
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
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917] mt-1">
                    {evt.title}
                  </h3>
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
        )}

        {/* OPTION A: READY-MADE CELEBRATION PACKAGES (DIRECT BOOKING WITHOUT QUOTATION) */}
        {(activeOptionView === 'both' || activeOptionView === 'ready') && (
          <section id="ready-made-packages" className="space-y-6 scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase">
                  Option A · Direct Booking (No Quotation Required)
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-1">
                  Choose Your Perfect Celebration
                </h2>
                <p className="text-sm text-[#57534E] mt-1">
                  Explore beautiful celebration packages designed by our restaurant partners. Decoration is always ₹0.
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
                  No ready-made packages matched <strong>{occasionFilter}</strong>. Switch filter or submit a Custom Celebration Request below.
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
                        actionLabel="Book Now (Direct Booking)"
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
        )}

        {/* OPTION B: CUSTOM CELEBRATION REQUEST FORM (QUOTATION COMPULSORY) */}
        {(activeOptionView === 'both' || activeOptionView === 'custom') && (
          <section
            id="custom-celebration-form"
            className="bg-[#F3F1ED] border border-[#E5E0D8] rounded-lg p-6 sm:p-8 scroll-mt-20"
          >
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Option B · Custom Celebration Request (Quotation Compulsory)</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-white border border-[#D6CFC5] text-[11px] font-semibold text-[#1C1917] inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#6E1E2E]" /> Advance Locked Until Quote Accepted
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                Create Your Own Celebration
              </h2>
              <p className="text-sm text-[#57534E] mt-1 mb-6">
                Have something special in mind? Tell us your requirements and let the restaurant create a personalised celebration experience. Decoration is always ₹0; advance payment unlocks only after you review and accept the restaurant&apos;s quotation.
              </p>

              {customSubmittedRef ? (
                <div className="bg-white border border-[#BBD6C3] rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#1E462A] font-semibold text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Custom Celebration Request Submitted ({customSubmittedRef})</span>
                  </div>
                  <p className="text-sm text-[#57534E]">
                    Status: <strong>Request Received</strong>. The restaurant partner has been notified and will send an itemized custom quotation (Decoration Charge: ₹0). Advance payment remains locked until you accept the quotation in your Customer Dashboard.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={role === 'customer' ? '/customer/custom-requests' : '/customer/login'}
                      className="px-4 py-2 text-xs font-semibold bg-[#6E1E2E] text-white rounded-lg hover:bg-[#541522]"
                    >
                      {role === 'customer' ? 'Track Request & Quotations' : 'Open Customer Portal to Track'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCustomSubmittedRef(null)}
                      className="px-4 py-2 text-xs font-semibold border border-[#E5E0D8] bg-white text-[#1C1917] rounded-lg hover:bg-[#FAF9F6]"
                    >
                      Submit Another Custom Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCustomRequestSubmit} className="space-y-5">
                  {customError && (
                    <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
                      {customError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        1. Select Varanasi Restaurant *
                      </label>
                      <select
                        value={customRestaurantId}
                        onChange={(e) => setCustomRestaurantId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      >
                        {approvedRestaurants.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.area}, Varanasi
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        2. Occasion Type *
                      </label>
                      <select
                        value={customOccasion}
                        onChange={(e) => setCustomOccasion(e.target.value as CelebrationCategory)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      >
                        {CELEBRATION_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        3. Event Date *
                      </label>
                      <input
                        type="date"
                        value={customDate}
                        min={getTodayISO()}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        4. Preferred Time *
                      </label>
                      <select
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      >
                        <option>01:00 PM</option>
                        <option>06:30 PM</option>
                        <option>07:30 PM</option>
                        <option>08:30 PM</option>
                        <option>09:30 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        5. Number of Guests *
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={200}
                        value={customGuests}
                        onChange={(e) => setCustomGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg tabular-nums"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        6. Approximate Budget (₹) *
                      </label>
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        value={customBudget}
                        onChange={(e) => setCustomBudget(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg tabular-nums"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        7. Decoration Theme (Included ₹0) *
                      </label>
                      <input
                        type="text"
                        value={customTheme}
                        onChange={(e) => setCustomTheme(e.target.value)}
                        placeholder="e.g., Marigold & Candlelight Courtyard"
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        8. Preferred Colours *
                      </label>
                      <input
                        type="text"
                        value={customColors}
                        onChange={(e) => setCustomColors(e.target.value)}
                        placeholder="e.g., Deep Burgundy, Warm Ivory & Gold"
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        9. Veg / Non-Veg Preference *
                      </label>
                      <select
                        value={customVegPref}
                        onChange={(e) => setCustomVegPref(e.target.value as VegNonVegPreference)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      >
                        {VEG_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        10. Cake Requirements
                      </label>
                      <input
                        type="text"
                        value={customCake}
                        onChange={(e) => setCustomCake(e.target.value)}
                        placeholder="Weight, eggless/regular, flavor & message"
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        11. Food Preferences *
                      </label>
                      <input
                        type="text"
                        value={customFoodPref}
                        onChange={(e) => setCustomFoodPref(e.target.value)}
                        placeholder="Course spread, spice level, live counters..."
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        12. Decoration Requirements (₹0 Fee)
                      </label>
                      <textarea
                        rows={2}
                        value={customDecorReqs}
                        onChange={(e) => setCustomDecorReqs(e.target.value)}
                        placeholder="Table runner, candles, backdrop lettering, rose petals..."
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        13. Special Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="Surprise entry cues, elder seating, music timing..."
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 14. Reference Images Upload */}
                  <div className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#1C1917]">
                          14. Reference Images Upload (Optional — {customRefImages.length} attached)
                        </p>
                        <p className="text-[11px] text-[#57534E]">
                          Upload setup inspiration photos or cake design references for the restaurant team.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg cursor-pointer hover:bg-[#541522]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Reference Photos</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                              readFilesAsDataUrls(e.target.files, (urls) =>
                                setCustomRefImages((prev) => [...prev, ...urls])
                              )
                            }
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomRefImages((prev) =>
                              prev.includes(IMAGES.decorProposal)
                                ? prev
                                : [...prev, IMAGES.decorProposal]
                            )
                          }
                          className="px-3 py-2 text-xs font-semibold border border-[#E5E0D8] bg-[#FAF9F6] rounded-lg text-[#1C1917]"
                        >
                          + Add Sample Inspiration
                        </button>
                      </div>
                    </div>
                    {customRefImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {customRefImages.map((url, idx) => (
                          <div
                            key={`cref-${idx}`}
                            className="relative aspect-[4/3] rounded overflow-hidden border border-[#E5E0D8]"
                          >
                            <SafeImage
                              src={url}
                              alt={`Reference ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setCustomRefImages((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-[#8B1E35]"
                              aria-label="Remove reference image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact confirmation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={customContactName}
                        onChange={(e) => setCustomContactName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customContactEmail}
                        onChange={(e) => setCustomContactEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={customContactPhone}
                        onChange={(e) => setCustomContactPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-[#E5E0D8] rounded-lg p-3.5 text-xs text-[#57534E] flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <strong className="text-[#1C1917]">Quotation Compulsory Protection:</strong> Your budget estimate ({formatINR(customBudget)}) is never charged automatically. You only pay advance after accepting the restaurant&apos;s itemized quotation.
                    </span>
                    <span className="font-semibold text-[#1E462A]">Decoration Charge: ₹0</span>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
                  >
                    Submit Custom Celebration Request (Demo)
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Direct Ready-Made Package Booking Modal (NO Quotation Step) */}
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
                  Ready-Made Celebration Package · Direct Booking Without Quotation
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
                          ? 'Your ready-made celebration package is confirmed directly with no quotation required.'
                          : 'Saved as Advance Pending. Pay your advance anytime inside Customer Portal → Celebration Bookings.'}
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
                        {formatINR(confirmedBooking.advance)} {confirmedBooking.paid ? `(DEMO PAID · ${confirmedBooking.txnId})` : '(Pending)'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#E5E0D8]">
                      <span className="text-[#57534E]">Remaining Balance at Venue</span>
                      <span className="font-mono font-semibold tabular-nums">{formatINR(confirmedBooking.remaining)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Link
                      to={role === 'customer' ? '/customer/celebrations' : '/customer/login'}
                      onClick={() => setBookingPkg(null)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
                    >
                      {role === 'customer' ? 'View in Celebration Bookings' : 'Open Customer Portal'}
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
                  <div className="grid grid-cols-4 gap-2 text-[11px] font-medium">
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
                      <label className="block text-xs font-semibold mb-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#6E1E2E]" /> Event Date *
                        </span>
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        min={getTodayISO()}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Time Slot *</label>
                      <select
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg"
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
                      <label className="block text-xs font-semibold mb-1">
                        Number of Plates ({bookingPkg.minPlates}–{bookingPkg.maxPlates}) *
                      </label>
                      <input
                        type="number"
                        min={bookingPkg.minPlates}
                        max={bookingPkg.maxPlates}
                        value={platesCount}
                        onChange={(e) => setPlatesCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg tabular-nums font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <label className="block text-xs font-semibold mb-1">Special Requests</label>
                      <input
                        type="text"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Cake timing, preferred seating zone..."
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg"
                      />
                    </div>
                  </div>

                  <PaymentBreakdownCard
                    title="Automatic Celebration Package Summary (No Quotation Required)"
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
                    footnote="Ready-made packages are booked directly at published price-per-plate rates without waiting for a quotation."
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
