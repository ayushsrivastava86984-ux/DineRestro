import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPECIAL_EVENTS } from '../../data/mockData';
import { SafeImage } from '../../components/common/SafeImage';
import { DemoBanner } from '../../components/common/DemoBanner';
import { getTodayISO, validateEmail, validateIndianMobile } from '../../utils/formatters';

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || SPECIAL_EVENTS[0].title;
  const { restaurants, submitEventInquiry } = useApp();

  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');

  const [eventType, setEventType] = useState(initialOccasion);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [restaurantId, setRestaurantId] = useState(approvedRestaurants[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState(getTodayISO());
  const [guests, setGuests] = useState(10);
  const [budgetRange, setBudgetRange] = useState('₹10,000 – ₹20,000');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!validateEmail(customerEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validateIndianMobile(customerPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    const chosenRest = approvedRestaurants.find((r) => r.id === restaurantId);
    if (!chosenRest) {
      setError('Please select a venue.');
      return;
    }
    const created = submitEventInquiry({
      eventType,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      restaurantId: chosenRest.id,
      restaurantName: chosenRest.name,
      preferredDate,
      guests,
      budgetRange,
      notes: notes.trim(),
    });
    setSubmittedRef(created.id);
    setNotes('');
  };

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-semibold text-[#702C3A] tracking-wide">
            Celebrate With DineRestro
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#292321]">
            Special Events &amp; Group Dining
          </h1>
          <p className="text-sm sm:text-base text-[#6B5F5C] leading-relaxed">
            From candlelit anniversaries overlooking Assi Ghat to executive dinners and family feasts, plan private dining effortlessly across Varanasi.
          </p>
        </div>

        <DemoBanner message="Event inquiries submitted below are saved in local frontend demo state and immediately visible inside the Restaurant & Admin demo dashboards." />

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
                <h2 className="text-xl font-semibold text-[#292321] mt-1">
                  {evt.title}
                </h2>
                <p className="text-sm text-[#6B5F5C] mt-1.5 leading-relaxed flex-1">
                  {evt.description}
                </p>
                <div className="pt-4">
                  <a
                    href="#event-inquiry-form"
                    onClick={() => setEventType(evt.title)}
                    className="inline-block px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
                  >
                    Plan {evt.title}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event Inquiry Form */}
        <section
          id="event-inquiry-form"
          className="bg-[#FFF6E9] border border-[#E8DDD1] rounded-lg p-6 sm:p-8"
        >
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#292321]">
              Submit an Event Dining Inquiry (Demo)
            </h2>
            <p className="text-sm text-[#6B5F5C] mt-1 mb-6">
              Share your occasion details to preview how DineRestro routes event inquiries to partner venues.
            </p>

            {submittedRef ? (
              <div className="bg-white border border-[#C8D8AC] rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#702C3A] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Demo Event Inquiry Logged ({submittedRef})</span>
                </div>
                <p className="text-sm text-[#6B5F5C]">
                  Your sample inquiry for <span className="font-medium text-[#292321]">{eventType}</span> ({guests} guests) has been added to local demo state.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="px-4 py-2 text-xs font-semibold bg-[#702C3A] text-white rounded-lg"
                >
                  Submit Another Demo Inquiry
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
                      Celebration Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    >
                      {SPECIAL_EVENTS.map((ev) => (
                        <option key={ev.id} value={ev.title}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Preferred Venue in Varanasi
                    </label>
                    <select
                      value={restaurantId}
                      onChange={(e) => setRestaurantId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    >
                      {approvedRestaurants.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.area})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98390 00000"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      min={getTodayISO()}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Estimated Guests
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={120}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292321] mb-1">
                      Estimated Budget
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                    >
                      <option>₹4,000 – ₹10,000</option>
                      <option>₹10,000 – ₹20,000</option>
                      <option>₹20,000 – ₹40,000</option>
                      <option>₹40,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Decor, Menu, or Seating Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share cake, floral decor, vegetarian menu, or seating preferences..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
                >
                  Submit Event Inquiry (Demo)
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
