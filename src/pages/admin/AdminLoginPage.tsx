import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
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
    <div className="min-h-screen bg-[#FFF6E9] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-[#E8DDD1] rounded-lg p-6 sm:p-8 space-y-6">
        <div>
          <Link to="/" className="font-display text-2xl font-bold text-[#702C3A]">
            DineRestro
          </Link>
          <p className="text-xs font-semibold text-[#702C3A] tracking-wide mt-4">
            Internal Operations Portal · DEMO MODE
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#292321] mt-1">
            Internal Admin Sign In
          </h1>
          <p className="text-sm text-[#6B5F5C] mt-1">
            Restricted operations preview. Public signup is disabled for Admin accounts.
          </p>
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#FFF6E9] border border-[#E8DDD1] text-xs text-[#6B5F5C]">
          <ShieldAlert className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#292321]">DEMO LOGIN MECHANISM: </span>
            This Phase 1 screen simulates Admin portal entry using local frontend state. It does not provide real authentication or access control.
          </div>
        </div>

        {error && (
          <div className="px-4 py-2.5 rounded-lg bg-[#FDECEF] border border-[#F4A6B8] text-xs font-medium text-[#702C3A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#292321] mb-1">
              Internal Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292321] mb-1">
              Demo Access Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-[#E8DDD1] rounded-lg focus:outline-none focus:border-[#702C3A]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide access key' : 'Show access key'}
                className="absolute right-3 top-2.5 text-[#6B5F5C]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C] transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Entering Admin Demo...' : 'Enter Admin Dashboard (Demo)'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-[#E8DDD1] flex items-center justify-between text-xs text-[#6B5F5C]">
          <Link to="/" className="hover:text-[#702C3A]">
            ← Back to Public Homepage
          </Link>
          <Link to="/auth" className="hover:text-[#702C3A]">
            Customer / Partner Portals
          </Link>
        </div>
      </div>
    </div>
  );
}
