import { useState } from 'react';
import { Check, Copy, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoBanner } from '../../components/common/DemoBanner';
import { formatDisplayDate } from '../../utils/formatters';

export function OffersPage() {
  const { offers, restaurants, openRestaurantModal, addToast } = useApp();
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
    <div className="bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-[#702C3A] tracking-wide mb-1">
            Varanasi Dining Deals
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
            Exclusive Offers &amp; Limited-Time Promotions
          </h1>
          <p className="text-sm text-[#6B5F5C] mt-1.5 max-w-2xl">
            Unlock curated table discounts, complimentary desserts, and celebration upgrades across partner restaurants.
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
                  ? 'bg-[#702C3A] text-white border-[#702C3A]'
                  : 'bg-white text-[#292321] border-[#E8DDD1] hover:bg-[#FFF6E9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleOffers.map((offer) => {
            const matchedRest = restaurants.find((r) => r.id === offer.restaurantId);
            return (
              <div
                key={offer.id}
                className="border border-[#E8DDD1] rounded-lg p-6 bg-[#FFF6E9]/60 flex flex-col justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#6B5F5C]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#702C3A]">
                      <Tag className="w-3.5 h-3.5" />
                      {offer.category} · {offer.discountLabel}
                    </span>
                    <span className="tabular-nums">
                      Expires {formatDisplayDate(offer.validUntil)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#292321]">
                    {offer.title}
                  </h2>
                  <p className="text-sm font-medium text-[#702C3A]">
                    {offer.restaurantName} · {offer.area}, Varanasi
                  </p>
                  <p className="text-sm text-[#6B5F5C] leading-relaxed">
                    {offer.terms}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8DDD1] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E8DDD1] bg-white text-xs font-mono font-semibold text-[#292321] hover:border-[#702C3A]"
                  >
                    <span>CODE: {offer.code}</span>
                    {copiedCode === offer.code ? (
                      <Check className="w-3.5 h-3.5 text-[#702C3A]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#6B5F5C]" />
                    )}
                  </button>

                  {matchedRest && (
                    <button
                      type="button"
                      onClick={() => openRestaurantModal(matchedRest, true)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
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
