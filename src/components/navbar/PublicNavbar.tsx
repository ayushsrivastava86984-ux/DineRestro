import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role } = useApp();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
      isActive
        ? 'text-[#702C3A] border-b border-[#702C3A]'
        : 'text-[#292321] hover:text-[#702C3A]'
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E8DDD1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-[#702C3A] whitespace-nowrap shrink-0"
        >
          DineRestro
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-6"
        >
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/explore" className={navLinkClass}>
            Explore Restaurants
          </NavLink>
          <NavLink to="/offers" className={navLinkClass}>
            Offers
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            Events
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {dashboardPath ? (
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Open Dashboard</span>
            </button>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-3 py-2 text-xs font-semibold text-[#292321] hover:text-[#702C3A] transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/customer/signup"
                className="px-3.5 py-2 text-xs font-semibold text-[#702C3A] border border-[#702C3A] rounded-lg hover:bg-[#FFF6E9] transition-colors whitespace-nowrap shrink-0"
              >
                Sign Up
              </Link>
              <Link
                to="/restaurant/signup"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors whitespace-nowrap shrink-0"
              >
                Partner With Us
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-lg text-[#292321] hover:bg-[#FFF6E9] transition-colors"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-[#E8DDD1] px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2.5" aria-label="Mobile navigation">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#292321]">
              Home
            </Link>
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#292321]">
              Explore Restaurants
            </Link>
            <Link to="/offers" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#292321]">
              Offers
            </Link>
            <Link to="/events" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#292321]">
              Events
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#292321]">
              About Us
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-1.5 text-[#292321]">
              Contact
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#E8DDD1] flex flex-col gap-2">
            {dashboardPath ? (
              <Link
                to={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2.5 text-xs font-semibold text-[#292321] border border-[#E8DDD1] rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/customer/signup"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2.5 text-xs font-semibold text-[#702C3A] border border-[#702C3A] rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
                <Link
                  to="/restaurant/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
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
