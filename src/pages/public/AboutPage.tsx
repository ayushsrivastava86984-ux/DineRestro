import { Link } from 'react-router-dom';
import { IMAGES } from '../../data/mockData';
import { SafeImage } from '../../components/common/SafeImage';

export function AboutPage() {
  return (
    <div className="bg-[#FFF5EA] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            <p className="text-xs font-semibold text-[#C84A1B] tracking-widest uppercase">
              Our Launch City · Varanasi, Uttar Pradesh
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#321D17] leading-tight">
              Hospitality Rooted in Craft, Built for Celebration.
            </h1>
            <p className="text-base text-[#6E4B41] leading-relaxed">
              DineRestro begins in Varanasi with a straightforward goal: connect diners with authentic local restaurants, make table planning effortless, and turn birthdays, anniversaries, and family evenings into seamless experiences.
            </p>
            <p className="text-sm text-[#6E4B41] leading-relaxed">
              From heritage havelis in Nadesar and riverfront rooftops along Assi Ghat to modern specialty cafés in Sigra and Rathyatra, we bring curated discovery and partner-first floor management together in one clean platform.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors"
              >
                Explore Varanasi Venues
              </Link>
              <Link
                to="/restaurant/signup"
                className="px-5 py-2.5 text-sm font-semibold text-[#C84A1B] border border-[#C84A1B] rounded-lg hover:bg-[#FCEBDD] transition-colors"
              >
                Partner With Us
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-lg overflow-hidden border border-[#EAD8C9] min-h-[320px]">
            <SafeImage
              src={IMAGES.heritageCourtyard}
              alt="Heritage courtyard dining room in Varanasi"
              className="w-full h-full object-cover"
              fallbackTitle="Varanasi Heritage Dining"
            />
          </div>
        </div>

        {/* Three Pillars */}
        <div className="border-t border-[#EAD8C9] pt-12">
          <h2 className="font-display text-3xl font-semibold text-[#321D17] mb-8">
            Three Dedicated Experiences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#EAD8C9] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#C84A1B]">01.</p>
              <h3 className="text-lg font-semibold text-[#321D17]">For Diners</h3>
              <p className="text-sm text-[#6E4B41] leading-relaxed">
                Search by locality, cuisine, or occasion, preview uploaded photo menus and offers, and keep all upcoming table plans and celebrations organized.
              </p>
            </div>
            <div className="border border-[#EAD8C9] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#C84A1B]">02.</p>
              <h3 className="text-lg font-semibold text-[#321D17]">For Restaurant Owners</h3>
              <p className="text-sm text-[#6E4B41] leading-relaxed">
                Manage incoming table reservations, floor capacity across rooftops and indoor sections, photo menus, offers, and celebration quotations.
              </p>
            </div>
            <div className="border border-[#EAD8C9] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#C84A1B]">03.</p>
              <h3 className="text-lg font-semibold text-[#321D17]">Curation &amp; Quality</h3>
              <p className="text-sm text-[#6E4B41] leading-relaxed">
                Every partner restaurant goes through an onboarding review before appearing in public discovery so guests can book with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
