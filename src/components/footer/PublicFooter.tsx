import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin, MapPin, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { validateEmail } from '../../utils/formatters';

export function PublicFooter() {
  const { addToast, selectedCity, activeCityConfig } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleInfoNotice = (label: string) => {
    addToast({
      type: 'info',
      title: `${label} (Phase 1 Preview)`,
      description: 'Policy summary displayed for Phase 1 demonstration preview.',
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(newsletterEmail)) {
      addToast({
        type: 'error',
        title: 'Enter a valid email address',
        description: 'Please enter a valid email to subscribe to dining updates.',
      });
      return;
    }
    addToast({
      type: 'success',
      title: 'Subscribed to DineRestro Editorial (Demo)',
      description: `${selectedCity} dining notes & seasonal celebration updates queued for ${newsletterEmail}.`,
    });
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#1C1917] border-t border-[#292524] text-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" aria-label="DineRestro Home" className="inline-block">
              <BrandLogo variant="full" surface="dark" showTagline />
            </Link>
            <p className="text-sm text-[#D6CFC5] leading-relaxed max-w-sm">
              Discover {selectedCity}. Reserve Your Table. Celebrate Every Moment. Curated dining discovery, photo-menu pre-orders, and zero-decor-charge celebrations across {activeCityConfig.neighbourhoods.slice(0, 4).join(', ')} &amp; beyond.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#E5D3B3]">
              <MapPin className="w-3.5 h-3.5 text-[#B8863B] shrink-0" />
              <span>
                {activeCityConfig.name}, {activeCityConfig.state}, {activeCityConfig.country}
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              {[
                { label: 'Instagram', Icon: Instagram },
                { label: 'Facebook', Icon: Facebook },
                { label: 'X', Icon: Twitter },
                { label: 'LinkedIn', Icon: Linkedin },
              ].map(({ label, Icon }) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleInfoNotice(`DineRestro ${label}`);
                  }}
                  aria-label={`DineRestro on ${label}`}
                  className="p-2 rounded-lg bg-[#292524] border border-[#44403C] text-[#FAF9F6] hover:bg-[#6E1E2E] hover:border-[#6E1E2E] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-[#E5D3B3] mb-3.5">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-[#D6CFC5]">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Restaurants
                </Link>
              </li>
              <li>
                <Link to="/explore?action=book" className="hover:text-white transition-colors">
                  Book a Table
                </Link>
              </li>
              <li>
                <Link to="/explore?action=preorder" className="hover:text-white transition-colors">
                  Pre-Order Food
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Celebrate Occasions
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Dining Offers
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-[#E5D3B3] mb-3.5">
              For Restaurants &amp; Support
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6CFC5]">
              <li>
                <Link to="/restaurant/signup" className="hover:text-white transition-colors">
                  Partner With DineRestro
                </Link>
              </li>
              <li>
                <Link to="/restaurant/login" className="hover:text-white transition-colors">
                  Restaurant Owner Login
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Customer Support &amp; FAQ
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleInfoNotice('Terms & Conditions')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleInfoNotice('Privacy Policy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-[#E5D3B3] mb-3.5">Newsletter</h4>
            <p className="text-xs text-[#D6CFC5] mb-3 leading-relaxed">
              Receive seasonal {selectedCity} chef tasting notes, partner restaurant launches, and celebration ideas.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5 pointer-events-none" aria-hidden="true" />
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Newsletter email address"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#292524] border border-[#44403C] rounded-lg text-[#FAF9F6] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#E5D3B3]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A8A29E]">
          <p>
            © 2026 DineRestro Hospitality Pvt. Ltd. · {activeCityConfig.name},{' '}
            {activeCityConfig.state}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleInfoNotice('Terms & Conditions')}
              className="hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </button>
            <button
              type="button"
              onClick={() => handleInfoNotice('Privacy Policy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span>Phase 1 Preview (Simulated Local Demo)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
