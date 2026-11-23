import { Link } from 'react-router-dom';
import { User, Store, ArrowRight } from 'lucide-react';
import { DemoBanner } from '../../components/common/DemoBanner';

export function AuthSelectionPage() {
  return (
    <div className="bg-[#FFF6E9]/50 py-14 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2.5">
          <p className="text-xs font-semibold text-[#702C3A] tracking-wide">
            DineRestro Portals
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#292321]">
            Welcome to DineRestro
          </h1>
          <p className="text-base text-[#6B5F5C]">
            Choose how you want to continue.
          </p>
        </div>

        <DemoBanner message="Authentication in Phase 1 operates in simulated DEMO MODE only and is not connected to a live backend or security provider." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <div className="bg-white border border-[#E8DDD1] rounded-lg p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-lg bg-[#FFF6E9] border border-[#E8DDD1] flex items-center justify-center text-[#702C3A]">
                <User className="w-5 h-5" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#292321]">
                Customer
              </h2>
              <p className="text-sm text-[#6B5F5C] leading-relaxed">
                Discover top Varanasi restaurants, manage table reservation previews, save favorite dining rooms, and plan celebrations.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/customer/login"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
              >
                <span>Customer Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/customer/signup"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#702C3A] border border-[#702C3A] rounded-lg hover:bg-[#FFF6E9] transition-colors"
              >
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#292321] border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9] transition-colors"
              >
                <span>Explore Restaurants</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Restaurant Partner Card */}
          <div className="bg-white border border-[#E8DDD1] rounded-lg p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-lg bg-[#FFF6E9] border border-[#E8DDD1] flex items-center justify-center text-[#702C3A]">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#292321]">
                Restaurant Partner
              </h2>
              <p className="text-sm text-[#6B5F5C] leading-relaxed">
                Manage reservations, floor tables, digital menus, event inquiries, and exclusive dining offers for your Varanasi venue.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/restaurant/login"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors"
              >
                <span>Restaurant Owner Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/restaurant/signup"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#702C3A] border border-[#702C3A] rounded-lg hover:bg-[#FFF6E9] transition-colors"
              >
                <span>Register Your Restaurant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#292321] border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9] transition-colors"
              >
                <span>Grow Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
