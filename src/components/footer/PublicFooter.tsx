import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function PublicFooter() {
  const { addToast } = useApp();

  const handleInfoNotice = (label: string) => {
    addToast({
      type: 'info',
      title: `${label} (Phase 1 Preview)`,
      description: 'Legal and policy documents are summarized for demo preview.',
    });
  };

  return (
    <footer className="bg-[#FFF6E9] border-t border-[#E8DDD1] text-[#292321]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="font-display text-2xl font-bold text-[#702C3A]">
              DineRestro
            </Link>
            <p className="text-sm text-[#6B5F5C] leading-relaxed">
              Discover. Reserve. Celebrate. Curating Varanasi&apos;s finest riverfront rooftops, heritage courtyards, and neighborhood tables.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#702C3A]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Launching in Varanasi, Uttar Pradesh, India</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#292321] mb-3">Company &amp; Support</h4>
            <ul className="space-y-2 text-sm text-[#6B5F5C]">
              <li>
                <Link to="/about" className="hover:text-[#702C3A] transition-colors">
                  About DineRestro
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#702C3A] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/contact#help-center" className="hover:text-[#702C3A] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="hover:text-[#702C3A] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#292321] mb-3">Portals &amp; Legal</h4>
            <ul className="space-y-2 text-sm text-[#6B5F5C]">
              <li>
                <Link to="/customer/login" className="hover:text-[#702C3A] transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link to="/restaurant/login" className="hover:text-[#702C3A] transition-colors">
                  Restaurant Partner Login
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleInfoNotice('Privacy Policy')}
                  className="hover:text-[#702C3A] transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleInfoNotice('Terms and Conditions')}
                  className="hover:text-[#702C3A] transition-colors text-left"
                >
                  Terms and Conditions
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#292321] mb-3">Connect With Us</h4>
            <p className="text-xs text-[#6B5F5C] mb-3 leading-relaxed">
              Follow Varanasi dining stories, seasonal chef menus, and celebration packages.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#instagram"
                onClick={(e) => {
                  e.preventDefault();
                  handleInfoNotice('DineRestro Instagram');
                }}
                aria-label="DineRestro on Instagram"
                className="p-2 rounded-lg bg-white border border-[#E8DDD1] text-[#292321] hover:text-[#702C3A] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                onClick={(e) => {
                  e.preventDefault();
                  handleInfoNotice('DineRestro Facebook');
                }}
                aria-label="DineRestro on Facebook"
                className="p-2 rounded-lg bg-white border border-[#E8DDD1] text-[#292321] hover:text-[#702C3A] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => {
                  e.preventDefault();
                  handleInfoNotice('DineRestro X');
                }}
                aria-label="DineRestro on X"
                className="p-2 rounded-lg bg-white border border-[#E8DDD1] text-[#292321] hover:text-[#702C3A] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#linkedin"
                onClick={(e) => {
                  e.preventDefault();
                  handleInfoNotice('DineRestro LinkedIn');
                }}
                aria-label="DineRestro on LinkedIn"
                className="p-2 rounded-lg bg-white border border-[#E8DDD1] text-[#292321] hover:text-[#702C3A] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E8DDD1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B5F5C]">
          <p>© 2026 DineRestro Hospitality Pvt. Ltd. · Varanasi, Uttar Pradesh</p>
          <p>Phase 1 Frontend Preview (Simulated Local Demo Data)</p>
        </div>
      </div>
    </footer>
  );
}
