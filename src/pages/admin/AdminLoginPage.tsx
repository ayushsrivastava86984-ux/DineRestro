import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { validateEmail } from '../../utils/formatters';

export function AdminLoginPage() {
  const { loginAdminDemo } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('ops.admin@dinerestro.example.in');
  const [password, setPassword] = useState('admin-demo-only');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid admin demo email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter the demo passcode.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginAdminDemo(email.trim());
      navigate('/admin/dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FFF5EA] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-[#EAD8C9] rounded-lg p-6 sm:p-8 space-y-6">
        <div>
          <Link to="/" aria-label="DineRestro Home" className="inline-block">
            <BrandLogo variant="full" surface="light" />
          </Link>
          <p className="text-xs font-semibold text-[#C84A1B] tracking-wide mt-4">
            Internal Operations Portal · DEMO MODE
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#321D17] mt-1">
            Internal Admin Sign In
          </h1>
          <p className="text-sm text-[#6E4B41] mt-1">
            Restricted operations preview. Public signup is disabled for Admin accounts.
          </p>
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#FCEBDD] border border-[#EAD8C9] text-xs text-[#6E4B41]">
          <ShieldAlert className="w-4 h-4 text-[#C84A1B] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#321D17]">DEMO LOGIN MECHANISM: </span>
            This Phase 1 screen simulates Admin portal entry using local frontend state. It does not provide real authentication or access control.
          </div>
        </div>

        {error && (
          <div className="px-4 py-2.5 rounded-lg bg-[#FDECE6] border border-[#F6B27B] text-xs font-medium text-[#A83B19]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#321D17] mb-1">
              Internal Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#321D17] mb-1">
              Demo Access Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-[#EAD8C9] rounded-lg focus:outline-none focus:border-[#C84A1B]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide access key' : 'Show access key'}
                className="absolute right-3 top-2.5 text-[#6E4B41]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#C84A1B] rounded-lg hover:bg-[#A83B19] transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Entering Admin Demo...' : 'Enter Admin Dashboard (Demo)'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-[#EAD8C9] flex items-center justify-between text-xs text-[#6E4B41]">
          <Link to="/" className="hover:text-[#C84A1B]">
            ← Back to Public Homepage
          </Link>
          <Link to="/auth" className="hover:text-[#C84A1B]">
            Customer / Partner Portals
          </Link>
        </div>
      </div>
    </div>
  );
}
