import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Utensils } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPECIAL_EVENTS } from '../../data/mockData';
import { SafeImage } from '../../components/common/SafeImage';
import { DemoBanner } from '../../components/common/DemoBanner';
import { formatINR, getTodayISO, validateEmail, validateIndianMobile } from '../../utils/formatters';

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || '';
  const {
    restaurants,
    celebrationPackages,
    createCelebrationBooking,
    openRestaurantModal,
    platformSettings,
  } = useApp();

  const approvedPackages = celebrationPackages.filter(
    (p) => p.approvalStatus === 'Approved' && p.available
  );

  const matchedInitPkg =
    approvedPackages.find((p) =>
      initialOccasion.toLowerCase().includes(p.category.toLowerCase())
    ) || approvedPackages[0];

  const [selectedPkgId, setSelectedPkgId] = useState(matchedInitPkg?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventDate, setEventDate] = useState(getTodayISO());
  const [eventTime, setEventTime] = useState('07:30 PM');
  const [platesCount, setPlatesCount] = useState(matchedInitPkg?.minPlates || 6);
  const [foodPreference, setFoodPreference] = useState('Pure Veg · Standard Spice');
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

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

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-semibold text-[#702C3A] tracking-wide">
            Celebrate With DineRestro
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#292321]">
            Decorated Celebration Packages
          </h1>
          <p className="text-sm sm:text-base text-[#6B5F5C] leading-relaxed">
            Every celebration package includes authentic restaurant decoration at ₹0. View real venue decoration photography, plate-wise courses, and request a custom quotation or pay a 50% demo advance.
          </p>
        </div>

        <DemoBanner message="Decoration Included – No Additional Charges (₹0). Celebration inquiries & quotations operate in simulated Phase 1 DEMO MODE." />

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIAL_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className="border border-[#E8DDD1] rounded-lg overflow-hidden bg-white flex flex-col"
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
                <p className="text-xs text-[#6B5F5C] tabular-nums">
                  {evt.idealGroupSize} · {evt.startingBudget}
                </p>
                <h2 className="text-xl font-semibold text-[#292321] mt-1">{evt.title}</h2>
                <p className="text-sm text-[#6B5F5C] mt-1.5 leading-relaxed flex-1">
                  {evt.description}
                </p>
                <p className="text-xs font-semibold text-[#702C3A] mt-3">
                  Decoration Included – No Additional Charges
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Approved Celebration Packages Showcase */}
        <section className="space-y-5">
          <h2 className="font-display text-3xl font-semibold text-[#292321]">
            Ready-to-Book Varanasi Celebration Packages
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {approvedPackages.map((pkg) => {
              const rest = restaurants.find((r) => r.id === pkg.restaurantId);
              return (
                <div
                  key={pkg.id}
                  className="border border-[#E8DDD1] rounded-lg overflow-hidden bg-white flex flex-col"
                >
                  <div className="grid grid-cols-2 gap-1 h-44 bg-[#FFF6E9]">
                    {pkg.decorationPhotos.slice(0, 2).map((url, idx) => (
                      <SafeImage
                        key={`${pkg.id}-img-${idx}`}
                        src={url}
                        alt={`${pkg.name} decoration photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ))}
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#702C3A]">
                          {pkg.category} · {pkg.restaurantName}
                        </p>
                        <h3 className="text-xl font-semibold text-[#292321] mt-0.5">
                          {pkg.name}
                        </h3>
                      </div>
                      <span className="font-mono text-base font-semibold text-[#702C3A] tabular-nums shrink-0">
                        {formatINR(pkg.pricePerPlate)}/plate
                      </span>
                    </div>

                    <p className="text-xs text-[#6B5F5C] leading-relaxed">{pkg.description}</p>
                    <div className="px-3 py-1.5 rounded bg-[#E7EFD9] border border-[#C8D8AC] text-xs font-semibold text-[#292321]">
                      Decoration Included – No Additional Charges (₹0)
                    </div>
                    <p className="text-xs text-[#6B5F5C]">{pkg.decorationDetails}</p>

                    <div className="pt-2 border-t border-[#E8DDD1] space-y-1 text-xs">
                      <p className="font-semibold text-[#292321] flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-[#702C3A]" />
                        <span>Plate Includes ({pkg.minPlates}–{pkg.maxPlates} plates):</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#6B5F5C]">
                        {pkg.plateItems.map((pi) => (
                          <div key={pi.id}>
                            <strong className="text-[#292321]">{pi.course}:</strong> {pi.itemName}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 mt-auto flex flex-wrap gap-2">
                      <a
                        href="#celebration-inquiry-form"
                        onClick={() => {
                          setSelectedPkgId(pkg.id);
                          setPlatesCount(pkg.minPlates);
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
                      >
                        Select Package Below
                      </a>
                      {rest && (
                        <button
                          type="button"
                          onClick={() => openRestaurantModal(rest, 'celebrate')}
                          className="px-4 py-2 text-xs font-semibold text-[#702C3A] border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9]"
                        >
                          Book Directly in Venue Modal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Celebration Inquiry Form */}
        <section
          id="celebration-inquiry-form"
          className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-6 sm:p-8"
        >
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#292321]">
              Request Celebration Booking / Custom Quotation (Demo)
            </h2>
            <p className="text-sm text-[#6B5F5C] mt-1 mb-6">
              Decoration Charge is always ₹0. Restaurants can review your plate count and send a custom quotation inside the dashboard.
            </p>

            {submittedRef ? (
              <div className="bg-white border border-[#C8D8AC] rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#702C3A] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Celebration Inquiry Logged ({submittedRef})</span>
                </div>
                <p className="text-sm text-[#6B5F5C]">
                  Your request for {activePkg?.name} ({platesCount} plates · Decoration ₹0) is now visible in Customer Events and Restaurant Event Inquiries.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="px-4 py-2 text-xs font-semibold bg-[#702C3A] text-white rounded-lg"
                >
                  Submit Another Celebration Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {error && (
                  <div className="px-4 py-2.5 rounded-lg bg-[#FDECEF] border border-[#F4A6B8] text-xs font-medium text-[#702C3A]">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Select Approved Celebration Package
                    </label>
                    <select
                      value={selectedPkgId}
                      onChange={(e) => {
                        const pkg = approvedPackages.find((p) => p.id === e.target.value);
                        setSelectedPkgId(e.target.value);
                        if (pkg) setPlatesCount(pkg.minPlates);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                    >
                      {approvedPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} — {pkg.restaurantName} (₹{pkg.pricePerPlate}/plate)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Number of Plates ({activePkg?.minPlates}–{activePkg?.maxPlates})
                    </label>
                    <input
                      type="number"
                      min={activePkg?.minPlates || 2}
                      max={activePkg?.maxPlates || 60}
                      value={platesCount}
                      onChange={(e) => setPlatesCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg tabular-nums"
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
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Preferred Time</label>
                    <select
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
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
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                  />
                </div>

                {activePkg && (
                  <div className="bg-white border border-[#E8DDD1] rounded-lg p-4 space-y-1.5 text-xs">
                    <p className="font-semibold text-[#292321]">
                      Estimated Celebration Breakdown
                    </p>
                    <div className="flex justify-between">
                      <span className="text-[#6B5F5C]">
                        {platesCount} Plates × {formatINR(activePkg.pricePerPlate)}
                      </span>
                      <span className="font-mono tabular-nums font-medium">
                        {formatINR(totalPackageAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5F5C]">Decoration Charge</span>
                      <span className="font-semibold text-[#292321]">FREE (₹0)</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-[#E8DDD1] font-semibold text-[#702C3A]">
                      <span>{advPercent}% Advance (After Quotation Acceptance)</span>
                      <span className="font-mono tabular-nums">{formatINR(advAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[#6B5F5C]">
                      <span>Remaining at Restaurant</span>
                      <span className="font-mono tabular-nums">{formatINR(remAmount)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
                >
                  Submit Celebration Inquiry (Demo)
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
