import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IMAGES } from '../../data/mockData';
import { SafeImage } from '../../components/common/SafeImage';

export function AboutPage() {
  const { selectedCity, activeCityConfig } = useApp();

  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-widest uppercase">
              Official Launch City · {activeCityConfig.name}, {activeCityConfig.state}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#1C1917] leading-tight">
              Discover {selectedCity}. Reserve Your Table. Celebrate Every Moment.
            </h1>
            <p className="text-base text-[#57534E] leading-relaxed">
              DineRestro launches in {selectedCity} with a clear mission: connect diners with verified local restaurants, make table planning effortless, and turn birthdays, anniversaries, and family evenings into memorable occasions.
            </p>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Spanning {activeCityConfig.neighbourhoods.join(', ')}, our platform is built city-ready from day one—pairing curated discovery with partner-first table and celebration management while expanding across Uttar Pradesh and India.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to={`/explore?city=${encodeURIComponent(selectedCity)}`}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors"
              >
                Explore {selectedCity} Venues
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
              src={IMAGES.lucknowHeritage}
              alt={`Heritage fine-dining room in ${selectedCity}`}
              className="w-full h-full object-cover"
              fallbackTitle={`${selectedCity} Heritage Dining`}
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
                Search by city and neighbourhood, preview uploaded photo menus and offers, and keep all upcoming table plans and celebrations organized.
              </p>
            </div>
            <div className="border border-[#E5E0D8] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#6E1E2E]">02.</p>
              <h3 className="text-lg font-semibold text-[#1C1917]">For Restaurant Owners</h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Manage incoming table reservations, floor capacity across rooftops and indoor sections, photo menus, offers, and ready-made celebration packages.
              </p>
            </div>
            <div className="border border-[#E5E0D8] rounded-lg p-6 bg-white space-y-2">
              <p className="font-display text-2xl font-semibold text-[#6E1E2E]">03.</p>
              <h3 className="text-lg font-semibold text-[#1C1917]">Curation &amp; Multi-City Growth</h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Every partner restaurant goes through an onboarding review before appearing in public discovery, and administrators can activate additional cities anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
