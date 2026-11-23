import { useState } from 'react';
import { Check, Copy, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoBanner } from '../../components/common/DemoBanner';
import { formatDisplayDate } from '../../utils/formatters';

export function OffersPage() {
  const { offers, restaurants, platformSettings, openRestaurantModal, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = ['All', 'Flat Discount', 'Complimentary', 'Celebration', 'Weekday Special'];

  const visibleOffers = offers.filter(
    (o) => o.active && (selectedCategory === 'All' || o.category === selectedCategory)
  );

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    addToast({
      type: 'success',
      title: `Promo Code ${code} Copied`,
      description: 'Demo promo code ready for table reservation preview.',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-[#FAF9F6] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase mb-1">
            Varanasi Dining Deals
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
            Exclusive Offers &amp; Limited-Time Promotions
          </h1>
          <p className="text-sm text-[#57534E] mt-1.5 max-w-2xl">
            Unlock curated table discounts, complimentary desserts, and celebration upgrades across partner restaurants. All table reservations incur a configurable per-guest platform fee of ₹{platformSettings.basicOfferFeePerGuest}/guest (Basic) or ₹{platformSettings.premiumOfferFeePerGuest}/guest (Premium) separately from restaurant food bills.
          </p>
        </div>

        <DemoBanner message="Promotional codes and dining discounts shown here are simulated sample offers for Phase 1 demonstration." />

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#6E1E2E] text-white border-[#6E1E2E]'
                  : 'bg-white text-[#1C1917] border-[#E5E0D8] hover:bg-[#F3F1ED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleOffers.map((offer) => {
            const matchedRest = restaurants.find((r) => r.id === offer.restaurantId);
            const feePerGuest =
              offer.offerTier === 'Premium'
                ? platformSettings.premiumOfferFeePerGuest
                : platformSettings.basicOfferFeePerGuest;
            return (
              <div
                key={offer.id}
                className="border border-[#E5E0D8] rounded-lg p-6 bg-white flex flex-col justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#57534E]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#F3F1ED] border border-[#E5E0D8] font-semibold text-[#6E1E2E]">
                      <Tag className="w-3.5 h-3.5 text-[#6E1E2E]" />
                      {offer.category} · {offer.discountLabel} · {offer.offerTier} Offer (₹{feePerGuest}/guest)
                    </span>
                    <span className="tabular-nums">
                      Expires {formatDisplayDate(offer.validUntil)}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                    {offer.title}
                  </h2>
                  <p className="text-sm font-medium text-[#6E1E2E]">
                    {offer.restaurantName} · {offer.area}, Varanasi
                  </p>
                  <p className="text-sm text-[#57534E] leading-relaxed">
                    {offer.terms}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] text-xs font-mono font-semibold text-[#1C1917] hover:border-[#6E1E2E]"
                  >
                    <span>CODE: {offer.code}</span>
                    {copiedCode === offer.code ? (
                      <Check className="w-3.5 h-3.5 text-[#6E1E2E]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#6E1E2E]" />
                    )}
                  </button>

                  {matchedRest && (
                    <button
                      type="button"
                      onClick={() => openRestaurantModal(matchedRest, 'book')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
                    >
                      Book Table With Offer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
