import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Copy,
  Headphones,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IMAGES, POPULAR_CUISINES } from '../../data/mockData';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { SafeImage } from '../../components/common/SafeImage';
import { RestaurantSearchPanel } from '../../components/common/RestaurantSearchPanel';
import { EmptyStateCard } from '../../components/common/EmptyStateCard';
import { formatDisplayDate } from '../../utils/formatters';

export function HomePage() {
  const { restaurants, offers, openRestaurantModal, addToast } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');
  const featuredRestaurants = approvedRestaurants
    .filter((r) => r.featured)
    .concat(approvedRestaurants.filter((r) => !r.featured))
    .slice(0, 4);

  const activeOffers = offers.filter((o) => o.active).slice(0, 4);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    addToast({
      type: 'success',
      title: `Offer Code ${code} Copied`,
      description: 'Apply this offer code inside the table booking preview.',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-[#FFF5EA] text-[#321D17]">
      {/* 1. Cinematic Full-Width Luxury Editorial Hero */}
      <section className="relative min-h-[580px] lg:min-h-[630px] flex items-center bg-[#3A180F] overflow-hidden">
        <SafeImage
          src={IMAGES.heroVaranasi}
          alt="Candlelit rooftop dining overlooking the Varanasi riverfront ghats"
          className="absolute inset-0 w-full h-full object-cover"
          fallbackTitle="Varanasi Rooftop Dining"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#3A180F]/95 via-[#3A180F]/68 to-[#542719]/45"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 w-full">
          <div className="max-w-2xl text-white space-y-4">
            <p className="text-xs sm:text-sm font-semibold text-[#F6B27B] tracking-[0.18em] uppercase">
              DineRestro · Varanasi, Uttar Pradesh
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[60px] font-semibold leading-[1.06] tracking-tight text-white">
              Discover. Reserve. Celebrate.
            </h1>
            <p className="text-base sm:text-lg text-[#FFF5EA]/90 leading-relaxed max-w-xl">
              Find the perfect restaurant, book your table, pre-order delicious food or celebrate life&apos;s special moments.
            </p>

            {/* 3 Prominent Service Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/explore?action=book"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#C84A1B] text-white rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap"
              >
                <span>Book a Table</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore?action=preorder"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#FFF5EA] text-[#321D17] rounded-lg hover:bg-[#FCEBDD] transition-colors whitespace-nowrap"
              >
                <span>Pre-Order Food</span>
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold border border-[#F6B27B]/70 text-[#FFF5EA] bg-[#542719]/75 rounded-lg hover:bg-[#542719] transition-colors whitespace-nowrap"
              >
                <span>Celebrate Occasions</span>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <RestaurantSearchPanel heroMode />
          </div>
        </div>
      </section>

      {/* 2. Soft Cream 4-Item Benefits Strip */}
      <section className="bg-[#FCEBDD] border-b border-[#EAD8C9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                Icon: Sparkles,
                title: 'No Extra Decoration Charges',
                desc: '₹0 decoration fees on all approved celebration packages & custom requests.',
              },
              {
                Icon: ShieldCheck,
                title: 'Secure Payments',
                desc: 'Separated table fee, pre-order advance & celebration payment breakdowns.',
              },
              {
                Icon: CalendarCheck,
                title: 'Easy Reservations',
                desc: 'Instant Varanasi table slots, photo menu previews & effortless confirmations.',
              },
              {
                Icon: Headphones,
                title: 'Customer Support',
                desc: 'Direct coordination between diners and verified Varanasi host desks.',
              },
            ].map((item) => {
              const Icon = item.Icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFF5EA] border border-[#EAD8C9] text-[#C84A1B] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#321D17]">{item.title}</h2>
                    <p className="text-xs text-[#6E4B41] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Popular Restaurants in Varanasi (4 Cards) */}
      <section className="py-16 bg-[#FFF5EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <p className="text-xs font-semibold text-[#C84A1B] tracking-widest uppercase mb-1">
                Editorial Selection
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#321D17]">
                Popular Restaurants in Varanasi
              </h2>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C84A1B] hover:text-[#A83B19] whitespace-nowrap"
            >
              <span>View All Restaurants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredRestaurants.length === 0 ? (
            <EmptyStateCard
              title="No Restaurants Published Yet"
              description="Approved Varanasi dining destinations will appear here automatically."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Deep Espresso Celebration Split Banner */}
      <section className="bg-[#3A180F] text-[#FFF5EA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 px-6 sm:px-10 lg:px-12 py-14 lg:py-20 flex flex-col justify-center space-y-5">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded bg-[#542719] border border-[#D99555]/40 text-xs font-semibold text-[#F6B27B] tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D99555]" aria-hidden="true" />
                <span>Zero Additional Decoration Charges</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08] text-white">
                Celebrate in Style
              </h2>
              <p className="text-base sm:text-lg text-[#F6B27B] leading-relaxed max-w-lg font-medium">
                Beautiful decorations. Delicious food. Unforgettable memories.
              </p>
              <p className="text-sm text-[#FFF5EA]/80 leading-relaxed max-w-lg">
                Reserve curated Birthday, Anniversary, Candlelight, and Marriage Proposal plate packages with authentic setup photos—or submit a tailored Custom Celebration Request with ₹0 decoration fees.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/events"
                  className="px-6 py-3 text-sm font-semibold bg-[#C84A1B] text-white rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap"
                >
                  Explore Celebration Packages
                </Link>
                <Link
                  to="/events#custom-celebration-form"
                  className="px-5 py-3 text-sm font-semibold bg-[#542719] border border-[#D99555]/50 text-[#FFF5EA] rounded-lg hover:bg-[#542719]/80 transition-colors whitespace-nowrap"
                >
                  Request Custom Setup
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 min-h-[320px] lg:min-h-[460px] overflow-hidden bg-[#542719]">
              <SafeImage
                src={IMAGES.decorProposal}
                alt="Candlelit brass lanterns and rose petal celebration setup overlooking Varanasi"
                className="w-full h-full object-cover"
                fallbackTitle="Celebrate in Style"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Varanasi Cuisines & Dining Offers */}
      <section className="py-16 bg-white border-b border-[#EAD8C9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-xs font-semibold text-[#C84A1B] tracking-widest uppercase mb-1">
                  Explore by Flavor
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#321D17]">
                  Varanasi Cuisines
                </h2>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C84A1B] hover:text-[#A83B19]"
              >
                <span>Browse All Cuisines</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {POPULAR_CUISINES.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  to={`/explore?cuisine=${encodeURIComponent(item.name)}`}
                  className="group bg-[#FFF5EA]/65 border border-[#EAD8C9] rounded-lg overflow-hidden hover:border-[#C84A1B] transition-colors"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <SafeImage
                      src={item.image}
                      alt={`${item.name} dining in Varanasi`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      fallbackTitle={item.name}
                    />
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#321D17] group-hover:text-[#C84A1B]">
                        {item.name}
                      </h3>
                      <span className="text-xs font-mono tabular-nums text-[#6E4B41]">
                        {item.spotsCount} spots
                      </span>
                    </div>
                    <p className="text-xs text-[#6E4B41] mt-1 line-clamp-1">{item.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-xs font-semibold text-[#C84A1B] tracking-widest uppercase mb-1">
                  Dining Privileges
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#321D17]">
                  Current Restaurant Offers
                </h2>
              </div>
              <Link
                to="/offers"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C84A1B] hover:text-[#A83B19]"
              >
                <span>View All Offers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeOffers.map((offer) => {
                const matchedRest = restaurants.find((r) => r.id === offer.restaurantId);
                return (
                  <div
                    key={offer.id}
                    className="bg-[#FFF5EA] border border-[#EAD8C9] rounded-lg p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#6E4B41] mb-1.5">
                        <span className="font-semibold text-[#C84A1B]">
                          {offer.category} · {offer.discountLabel} · {offer.offerTier}
                        </span>
                        <span className="tabular-nums">
                          Valid until {formatDisplayDate(offer.validUntil)}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-[#321D17]">
                        {offer.title}
                      </h3>
                      <p className="text-sm font-medium text-[#A83B19] mt-0.5">
                        {offer.restaurantName} · {offer.area}
                      </p>
                      <p className="text-xs text-[#6E4B41] mt-2 leading-relaxed">{offer.terms}</p>
                    </div>

                    <div className="pt-3 border-t border-[#EAD8C9] flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(offer.code)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#EAD8C9] bg-white text-xs font-mono font-semibold text-[#321D17] hover:border-[#C84A1B] transition-colors"
                      >
                        <span>{offer.code}</span>
                        {copiedCode === offer.code ? (
                          <Check className="w-3.5 h-3.5 text-[#C84A1B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#6E4B41]" />
                        )}
                      </button>
                      {matchedRest && (
                        <button
                          type="button"
                          onClick={() => openRestaurantModal(matchedRest, 'book')}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors"
                        >
                          Book With Offer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
