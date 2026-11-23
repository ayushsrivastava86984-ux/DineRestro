import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoBanner } from '../../components/common/DemoBanner';
import { validateEmail, validateIndianMobile } from '../../utils/formatters';

export function CustomerSignupPage() {
  const { signupCustomerDemo } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validateIndianMobile(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms and Conditions to continue.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Demo customer account created! Redirecting to dashboard...');
      signupCustomerDemo({
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      });
      navigate('/customer/dashboard');
    }, 550);
  };

  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-wide mb-1">
              Customer Portal · DEMO MODE
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Create Customer Account
            </h1>
            <p className="text-sm text-[#57534E] mt-1">
              Reserve Varanasi tables, unlock offers, and track your dining plans.
            </p>
          </div>

          <DemoBanner message="Simulated Phase 1 signup only. This demo registration is not connected to a backend or production security." />

          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-2.5 rounded-lg bg-[#ECF4EE] border border-[#BBD6C3] text-xs font-medium text-[#1C1917] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1E462A]" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Srivastava"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98390 11223"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#57534E] hover:text-[#1C1917]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-2.5 text-[#57534E] hover:text-[#1C1917]"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-[#57534E] cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 accent-[#6E1E2E]"
              />
              <span>
                I understand this is a Phase 1 frontend demo and agree to the DineRestro preview Terms and Conditions.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Creating Demo Account...' : 'Create Customer Account (Demo)'}</span>
            </button>
          </form>

          <p className="text-xs text-center text-[#57534E]">
            Already have a demo customer account?{' '}
            <Link to="/customer/login" className="font-semibold text-[#6E1E2E] hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function CustomerLoginPage() {
  const { loginCustomerDemo } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('aarav.varanasi@example.com');
  const [password, setPassword] = useState('demo1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your demo password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginCustomerDemo(email.trim());
      navigate('/customer/dashboard');
    }, 450);
  };

  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-wide mb-1">
              Customer Login · DEMO MODE
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Sign In as Diner
            </h1>
            <p className="text-sm text-[#57534E] mt-1">
              Access your table booking previews, offers, and saved Varanasi spots.
            </p>
          </div>

          <DemoBanner message="Demo credentials are pre-filled for Phase 1 testing. This simulated login is not production-ready authentication." />

          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#57534E]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#57534E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#6E1E2E]"
                />
                <span>Remember Me</span>
              </label>
              <Link
                to="/customer/forgot-password"
                className="font-semibold text-[#6E1E2E] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Signing In...' : 'Login to Customer Dashboard (Demo)'}</span>
            </button>
          </form>

          <p className="text-xs text-center text-[#57534E]">
            New diner?{' '}
            <Link to="/customer/signup" className="font-semibold text-[#6E1E2E] hover:underline">
              Create customer account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-wide mb-1">
              Customer Portal · DEMO MODE
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Reset Password
            </h1>
            <p className="text-sm text-[#57534E] mt-1">
              Simulated password recovery preview for Phase 1.
            </p>
          </div>

          {sent ? (
            <div className="p-4 rounded-lg bg-[#ECF4EE] border border-[#BBD6C3] text-xs text-[#1C1917] space-y-2">
              <p className="font-semibold">Simulated Reset Link Preview</p>
              <p>
                In a live Phase 2 setup, instructions would be sent to <span className="font-medium">{email}</span>. You can return to Customer Login and sign in with demo credentials.
              </p>
              <Link
                to="/customer/login"
                className="inline-block mt-2 font-semibold text-[#6E1E2E] underline"
              >
                Back to Customer Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-3.5 py-2 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs text-[#8B1E35]">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Simulate Password Reset
              </button>
              <p className="text-xs text-center">
                <Link to="/customer/login" className="text-[#6E1E2E] font-semibold hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
