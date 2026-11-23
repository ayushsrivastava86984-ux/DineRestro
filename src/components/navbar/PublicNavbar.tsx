import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, User, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role } = useApp();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
      isActive
        ? 'text-[#C84A1B] border-[#C84A1B]'
        : 'text-[#321D17] border-transparent hover:text-[#C84A1B] hover:border-[#F6B27B]'
    }`;

  const dashboardPath =
    role === 'customer'
      ? '/customer/dashboard'
      : role === 'restaurant'
        ? '/restaurant/dashboard'
        : role === 'admin'
          ? '/admin/dashboard'
          : null;

  return (
    <header className="sticky top-0 z-40 bg-[#FFF5EA]/95 backdrop-blur-xs text-[#321D17] border-b border-[#EAD8C9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="DineRestro Home"
          className="inline-flex items-center shrink-0 py-1"
        >
          <BrandLogo variant="compact" surface="light" />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-6"
        >
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/explore" className={navLinkClass}>
            Restaurants
          </NavLink>
          <Link
            to="/explore?action=book"
            className="text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 text-[#321D17] hover:text-[#C84A1B] pb-1 border-b-2 border-transparent hover:border-[#F6B27B] transition-colors"
          >
            Book a Table
          </Link>
          <Link
            to="/explore?action=preorder"
            className="text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 text-[#321D17] hover:text-[#C84A1B] pb-1 border-b-2 border-transparent hover:border-[#F6B27B] transition-colors"
          >
            Pre-Order Food
          </Link>
          <NavLink to="/events" className={navLinkClass}>
            Celebrate
          </NavLink>
          <NavLink to="/offers" className={navLinkClass}>
            Offers
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/explore')}
            aria-label="Search Varanasi restaurants"
            className="p-2 rounded-lg text-[#321D17] hover:text-[#C84A1B] hover:bg-[#FCEBDD] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {dashboardPath ? (
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Open Dashboard</span>
            </button>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-3.5 py-2 text-xs font-semibold text-[#321D17] border border-[#EAD8C9] bg-white rounded-lg hover:border-[#C84A1B] hover:text-[#C84A1B] transition-colors whitespace-nowrap shrink-0"
              >
                Login
              </Link>
              <Link
                to="/customer/signup"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors whitespace-nowrap shrink-0"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate('/explore')}
            aria-label="Search restaurants"
            className="p-2 rounded-lg text-[#321D17] hover:bg-[#FCEBDD] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-lg text-[#321D17] hover:bg-[#FCEBDD] transition-colors"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#FCEBDD] border-t border-[#EAD8C9] px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2.5" aria-label="Mobile navigation">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              Home
            </Link>
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              Restaurants
            </Link>
            <Link to="/explore?action=book" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              Book a Table
            </Link>
            <Link to="/explore?action=preorder" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              Pre-Order Food
            </Link>
            <Link to="/events" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              Celebrate
            </Link>
            <Link to="/offers" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              Offers
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              About
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#321D17] hover:text-[#C84A1B]">
              Contact
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#EAD8C9] flex flex-col gap-2">
            {dashboardPath ? (
              <Link
                to={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2.5 text-xs font-semibold text-[#321D17] bg-white border border-[#EAD8C9] rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/customer/signup"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2.5 text-xs font-semibold text-white bg-[#C84A1B] rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
                <Link
                  to="/restaurant/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-xs font-semibold text-[#C84A1B] border border-[#C84A1B] bg-[#FFF5EA] rounded-lg"
                >
                  Partner With Us
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
