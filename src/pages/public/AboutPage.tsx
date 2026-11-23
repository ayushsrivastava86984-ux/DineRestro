import { Link } from 'react-router-dom';
import { IMAGES } from '../../data/mockData';
import { SafeImage } from '../../components/common/SafeImage';

export function AboutPage() {
  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase">
              Our Launch City · Varanasi, Uttar Pradesh
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#1C1917] leading-tight">
              Hospitality Rooted in Craft, Built for Celebration.
            </h1>
            <p className="text-base text-[#57534E] leading-relaxed">
              DineRestro begins in Varanasi with a straightforward goal: connect diners with authentic local restaurants, make table planning effortless, and turn birthdays, anniversaries, and family evenings into seamless experiences.
            </p>
            <p className="text-sm text-[#57534E] leading-relaxed">
              From heritage havelis in Nadesar and riverfront rooftops along Assi Ghat to modern specialty cafés in Sigra and Rathyatra, we bring curated discovery and partner-first floor management together in one clean platform.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
              >
                Explore Varanasi Venues
              </Link>
              <Link
                to="/restaurant/signup"
                className="px-5 py-2.5 text-sm font-semibold text-[#1C1917] bg-white border border-[#D6CFC5] rounded-lg hover:bg-[#F3F1ED] transition-colors"
              >
                Partner With Us
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-lg overflow-hidden border border-[#E5E0D8] min-h-[320px]">
            <SafeImage
              src={IMAGES.heritageCourtyard}
              alt="Heritage courtyard dining room in Varanasi"
              className="w-full h-full object-cover"
              fallbackTitle="Varanasi Heritage Dining"
            />
          </div>
        </div>

        {/* Three Pillars */}
        <div className="border-t border-[#E5E0D8] pt-12">
          <h2 className="font-display text-3xl font-semibold text-[#1C1917] mb-8">
            Three Dedicated Experiences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#E5E0D8] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#6E1E2E]">01.</p>
              <h3 className="text-lg font-semibold text-[#1C1917]">For Diners</h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Search by locality, cuisine, or occasion, preview uploaded photo menus and offers, and keep all upcoming table plans and celebrations organized.
              </p>
            </div>
            <div className="border border-[#E5E0D8] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#6E1E2E]">02.</p>
              <h3 className="text-lg font-semibold text-[#1C1917]">For Restaurant Owners</h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Manage incoming table reservations, floor capacity across rooftops and indoor sections, photo menus, offers, and celebration quotations.
              </p>
            </div>
            <div className="border border-[#E5E0D8] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#6E1E2E]">03.</p>
              <h3 className="text-lg font-semibold text-[#1C1917]">Curation &amp; Quality</h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Every partner restaurant goes through an onboarding review before appearing in public discovery so guests can book with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
