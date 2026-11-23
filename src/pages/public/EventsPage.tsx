import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CELEBRATION_CATEGORIES, SPECIAL_EVENTS } from '../../data/mockData';
import type { CelebrationCategory } from '../../types';
import { SafeImage } from '../../components/common/SafeImage';
import { DemoBanner } from '../../components/common/DemoBanner';
import { CelebrationPackageCard } from '../../components/common/CelebrationPackageCard';
import { formatINR, getTodayISO, validateEmail, validateIndianMobile } from '../../utils/formatters';

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || '';
  const {
    restaurants,
    celebrationPackages,
    createCelebrationBooking,
    createCustomCelebrationRequest,
    openRestaurantModal,
    platformSettings,
    customerUser,
  } = useApp();

  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');
  const approvedPackages = celebrationPackages.filter(
    (p) => p.approvalStatus === 'Approved' && p.available
  );

  const matchedInitPkg =
    approvedPackages.find((p) =>
      initialOccasion.toLowerCase().includes(p.category.toLowerCase())
    ) || approvedPackages[0];

  const [selectedPkgId, setSelectedPkgId] = useState(matchedInitPkg?.id || '');
  const [customerName, setCustomerName] = useState(customerUser.fullName);
  const [customerEmail, setCustomerEmail] = useState(customerUser.email);
  const [customerPhone, setCustomerPhone] = useState(customerUser.mobile);
  const [eventDate, setEventDate] = useState(getTodayISO());
  const [eventTime, setEventTime] = useState('07:30 PM');
  const [platesCount, setPlatesCount] = useState(matchedInitPkg?.minPlates || 6);
  const [foodPreference, setFoodPreference] = useState('Pure Veg · Standard Spice');
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const [customOccasion, setCustomOccasion] = useState<CelebrationCategory>('Anniversary');
  const [customRestaurantId, setCustomRestaurantId] = useState(
    approvedRestaurants[0]?.id || ''
  );
  const [customDate, setCustomDate] = useState(getTodayISO());
  const [customTime, setCustomTime] = useState('07:30 PM');
  const [customGuests, setCustomGuests] = useState(12);
  const [customBudget, setCustomBudget] = useState(15000);
  const [customTheme, setCustomTheme] = useState('Marigold & Brass Heritage Candlelight');
  const [customColors, setCustomColors] = useState('Terracotta, Warm Ivory & Gold');
  const [customCake, setCustomCake] = useState('1 kg Eggless Saffron Pistachio Cake');
  const [customFoodPref, setCustomFoodPref] = useState('Pure Vegetarian Multi-Course Thali');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customError, setCustomError] = useState('');
  const [customSubmittedRef, setCustomSubmittedRef] = useState<string | null>(null);

  const activePkg =
    approvedPackages.find((p) => p.id === selectedPkgId) || approvedPackages[0];
  const activeRest = activePkg
    ? restaurants.find((r) => r.id === activePkg.restaurantId)
    : undefined;

  const totalPackageAmount = activePkg ? activePkg.pricePerPlate * platesCount : 0;
  const advPercent = platformSettings.defaultCelebrationAdvancePercent;
  const advAmount = Math.round((totalPackageAmount * advPercent) / 100);
  const remAmount = totalPackageAmount - advAmount;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activePkg || !activeRest) {
      setError('Please choose an approved celebration package.');
      return;
    }
    if (!customerName.trim() || !validateEmail(customerEmail) || !validateIndianMobile(customerPhone)) {
      setError('Please enter valid name, email, and 10-digit Indian mobile number.');
      return;
    }
    if (platesCount < activePkg.minPlates || platesCount > activePkg.maxPlates) {
      setError(`Please select between ${activePkg.minPlates} and ${activePkg.maxPlates} plates.`);
      return;
    }
    const created = createCelebrationBooking({
      restaurant: activeRest,
      pkg: activePkg,
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
    setSubmittedRef(created.id);
    setSpecialRequests('');
  };

  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    const targetRest = approvedRestaurants.find((r) => r.id === customRestaurantId);
    if (!targetRest) {
      setCustomError('Please select a Varanasi restaurant.');
      return;
    }
    if (customGuests < 2 || customBudget < 1000 || !customTheme.trim() || !customFoodPref.trim()) {
      setCustomError('Please specify valid guest count (min 2), budget, decoration theme, and food preferences.');
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
      specialInstructions: customInstructions.trim(),
    });
    setCustomSubmittedRef(created.id);
    setCustomInstructions('');
  };

  return (
    <div className="bg-[#FFF5EA] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-semibold text-[#C84A1B] tracking-widest uppercase">
            Celebrate With DineRestro
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#321D17]">
            Decorated Celebration Packages &amp; Custom Requests
          </h1>
          <p className="text-sm sm:text-base text-[#6E4B41] leading-relaxed">
            Every celebration includes real restaurant decoration at ₹0 (No Additional Decoration Charges). Book an approved plate package or submit a Custom Celebration Request for a tailored venue quotation.
          </p>
        </div>

        <DemoBanner message="Decoration Included – No Additional Charges (₹0). For custom celebration requests, restaurants issue a custom quotation that you must review & accept before advance payment unlocks." />

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIAL_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className="border border-[#EAD8C9] rounded-lg overflow-hidden bg-white flex flex-col"
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
                <p className="text-xs text-[#6E4B41] tabular-nums">
                  {evt.idealGroupSize} · {evt.startingBudget}
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#321D17] mt-1">
                  {evt.title}
                </h2>
                <p className="text-sm text-[#6E4B41] mt-1.5 leading-relaxed flex-1">
                  {evt.description}
                </p>
                <p className="text-xs font-semibold text-[#C84A1B] mt-3">
                  Decoration Included – No Additional Charges (₹0)
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Approved Celebration Packages Showcase */}
        <section className="space-y-5">
          <h2 className="font-display text-3xl font-semibold text-[#321D17]">
            Ready-to-Book Varanasi Celebration Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedPackages.map((pkg) => {
              const rest = restaurants.find((r) => r.id === pkg.restaurantId);
              return (
                <CelebrationPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onSelect={(selected) => {
                    if (rest) {
                      openRestaurantModal(rest, 'celebrate');
                    } else {
                      setSelectedPkgId(selected.id);
                      setPlatesCount(selected.minPlates);
                    }
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* Custom Celebration Request Form (All 11 Required Fields) */}
        <section
          id="custom-celebration-form"
          className="bg-[#FCEBDD] border border-[#EAD8C9] rounded-lg p-6 sm:p-8"
        >
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C84A1B] tracking-widest uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Bespoke Planning</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#321D17]">
              Custom Celebration Request Form
            </h2>
            <p className="text-sm text-[#6E4B41] mt-1 mb-6">
              Share your vision below. Your chosen restaurant reviews the brief and sends a custom quotation (Decoration Charge: ₹0). No advance payment is requested until you accept their quotation.
            </p>

            {customSubmittedRef ? (
              <div className="bg-white border border-[#C8D8AC] rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#A83B19] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Custom Celebration Request Received ({customSubmittedRef})</span>
                </div>
                <p className="text-sm text-[#6E4B41]">
                  Status: <strong>Request Received</strong>. Once the restaurant sends a custom quotation, you can review and accept it in Customer Portal → Custom Requests before paying the simulated advance.
                </p>
                <button
                  type="button"
                  onClick={() => setCustomSubmittedRef(null)}
                  className="px-4 py-2 text-xs font-semibold bg-[#C84A1B] text-white rounded-lg hover:bg-[#A83B19]"
                >
                  Submit Another Custom Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomRequestSubmit} className="space-y-4">
                {customError && (
                  <div className="px-4 py-2.5 rounded-lg bg-[#FDECE6] border border-[#F6B27B] text-xs font-medium text-[#A83B19]">
                    {customError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      1. Occasion Type
                    </label>
                    <select
                      value={customOccasion}
                      onChange={(e) => setCustomOccasion(e.target.value as CelebrationCategory)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                    >
                      {CELEBRATION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      2. Restaurant
                    </label>
                    <select
                      value={customRestaurantId}
                      onChange={(e) => setCustomRestaurantId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                    >
                      {approvedRestaurants.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — {r.area}, Varanasi
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      3. Preferred Date
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      min={getTodayISO()}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      4. Preferred Time
                    </label>
                    <select
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                    >
                      <option>01:00 PM</option>
                      <option>06:30 PM</option>
                      <option>07:30 PM</option>
                      <option>08:30 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      5. Number of Guests
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={150}
                      value={customGuests}
                      onChange={(e) => setCustomGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg tabular-nums"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      6. Estimated Budget (₹)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={customBudget}
                      onChange={(e) => setCustomBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg tabular-nums"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      7. Decoration Theme (Included ₹0)
                    </label>
                    <input
                      type="text"
                      value={customTheme}
                      onChange={(e) => setCustomTheme(e.target.value)}
                      placeholder="e.g., Marigold & Candlelight Courtyard"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      8. Preferred Colours
                    </label>
                    <input
                      type="text"
                      value={customColors}
                      onChange={(e) => setCustomColors(e.target.value)}
                      placeholder="e.g., Terracotta, Cream & Gold"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      9. Cake Requirements
                    </label>
                    <input
                      type="text"
                      value={customCake}
                      onChange={(e) => setCustomCake(e.target.value)}
                      placeholder="Weight, eggless/regular, flavor & message"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      10. Food Preferences
                    </label>
                    <input
                      type="text"
                      value={customFoodPref}
                      onChange={(e) => setCustomFoodPref(e.target.value)}
                      placeholder="Veg / Non-Veg / Jain / Course preferences"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#321D17] mb-1">
                    11. Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Surprise entry cues, elder seating, music timing..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                  />
                </div>

                <div className="bg-white border border-[#EAD8C9] rounded-lg p-3.5 text-xs text-[#6E4B41] flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <strong className="text-[#321D17]">Quotation-First Protection:</strong> Estimated budget ({formatINR(customBudget)}) is never charged automatically. You only pay after accepting the restaurant&apos;s final quote.
                  </span>
                  <span className="font-semibold text-[#C84A1B]">Decoration Charge: ₹0</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors"
                >
                  Submit Custom Celebration Request (Demo)
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Ready-Made Celebration Package Inquiry Form */}
        <section
          id="celebration-inquiry-form"
          className="bg-white border border-[#EAD8C9] rounded-lg p-6 sm:p-8"
        >
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#321D17]">
              Book an Approved Celebration Package (Demo)
            </h2>
            <p className="text-sm text-[#6E4B41] mt-1 mb-6">
              Decoration Charge is always ₹0. Select any pre-approved celebration package and submit your inquiry or custom quote request.
            </p>

            {submittedRef ? (
              <div className="bg-[#FFF5EA] border border-[#C8D8AC] rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#A83B19] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Celebration Inquiry Logged ({submittedRef})</span>
                </div>
                <p className="text-sm text-[#6E4B41]">
                  Your request for {activePkg?.name} ({platesCount} plates · Decoration ₹0) is now visible in Customer Celebration Bookings and Restaurant Event Inquiries.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="px-4 py-2 text-xs font-semibold bg-[#C84A1B] text-white rounded-lg hover:bg-[#A83B19]"
                >
                  Submit Another Celebration Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {error && (
                  <div className="px-4 py-2.5 rounded-lg bg-[#FDECE6] border border-[#F6B27B] text-xs font-medium text-[#A83B19]">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      Select Approved Celebration Package
                    </label>
                    <select
                      value={selectedPkgId}
                      onChange={(e) => {
                        const pkg = approvedPackages.find((p) => p.id === e.target.value);
                        setSelectedPkgId(e.target.value);
                        if (pkg) setPlatesCount(pkg.minPlates);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                    >
                      {approvedPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} — {pkg.restaurantName} (₹{pkg.pricePerPlate}/plate)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#321D17] mb-1">
                      Number of Plates ({activePkg?.minPlates}–{activePkg?.maxPlates})
                    </label>
                    <input
                      type="number"
                      min={activePkg?.minPlates || 2}
                      max={activePkg?.maxPlates || 60}
                      value={platesCount}
                      onChange={(e) => setPlatesCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg tabular-nums"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98390 00000"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Event Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      min={getTodayISO()}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Preferred Time</label>
                    <select
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                    >
                      <option>01:00 PM</option>
                      <option>07:00 PM</option>
                      <option>07:30 PM</option>
                      <option>08:30 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Food Preferences</label>
                    <input
                      type="text"
                      value={foodPreference}
                      onChange={(e) => setFoodPreference(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Special Requests</label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Cake note, seating zone, dietary customizations..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD8C9] rounded-lg"
                  />
                </div>

                {activePkg && (
                  <div className="bg-[#FCEBDD]/55 border border-[#EAD8C9] rounded-lg p-4 space-y-1.5 text-xs">
                    <p className="font-semibold text-[#321D17]">
                      Estimated Celebration Breakdown
                    </p>
                    <div className="flex justify-between">
                      <span className="text-[#6E4B41]">
                        {platesCount} Plates × {formatINR(activePkg.pricePerPlate)}
                      </span>
                      <span className="font-mono tabular-nums font-medium">
                        {formatINR(totalPackageAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E4B41]">Decoration Charge</span>
                      <span className="font-semibold text-[#321D17]">FREE (₹0)</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-[#EAD8C9] font-semibold text-[#C84A1B]">
                      <span>{advPercent}% Advance (After Quotation Acceptance)</span>
                      <span className="font-mono tabular-nums">{formatINR(advAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[#6E4B41]">
                      <span>Remaining at Restaurant</span>
                      <span className="font-mono tabular-nums">{formatINR(remAmount)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors"
                >
                  Submit Package Inquiry (Demo)
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
