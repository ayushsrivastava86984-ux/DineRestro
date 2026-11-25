import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POPULAR_CUISINES } from '../../data/mockData';
import type { CuisineType } from '../../types';
import { DemoBanner } from '../../components/common/DemoBanner';
import {
  validateEmail,
  validateIndianMobile,
  validatePinCode,
} from '../../utils/formatters';

export function RestaurantSignupPage() {
  const { signupRestaurantDemo, selectedCity, cities, activeCityConfig } = useApp();
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(selectedCity);
  const [area, setArea] = useState(activeCityConfig.neighbourhoods[0] || 'Gomti Nagar');
  const [stateName, setStateName] = useState(activeCityConfig.state || 'Uttar Pradesh');
  const [pinCode, setPinCode] = useState('226001');
  const [cuisine, setCuisine] = useState<CuisineType>('North Indian');
  const [contactNumber, setContactNumber] = useState('');
  const [restaurantEmail, setRestaurantEmail] = useState('');
  const [description, setDescription] = useState('');

  const matchedCityConfig = cities.find(
    (c) => c.name.toLowerCase() === city.trim().toLowerCase()
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ownerName.trim() || !restaurantName.trim() || !address.trim()) {
      setError('Please complete all required owner and restaurant fields.');
      return;
    }
    if (!validateEmail(ownerEmail) || !validateEmail(restaurantEmail)) {
      setError('Please provide valid email addresses for owner and restaurant.');
      return;
    }
    if (!validateIndianMobile(mobile) || !validateIndianMobile(contactNumber)) {
      setError('Please provide valid 10-digit Indian contact numbers.');
      return;
    }
    if (!validatePinCode(pinCode)) {
      setError('Please enter a valid 6-digit PIN code (e.g., 226001).');
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
    if (description.trim().length < 15) {
      setError('Please write a brief restaurant description (minimum 15 characters).');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signupRestaurantDemo({
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
        mobile: mobile.trim(),
        restaurantName: restaurantName.trim(),
        address: address.trim(),
        area: area.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pinCode: pinCode.trim(),
        cuisine,
        contactNumber: contactNumber.trim(),
        restaurantEmail: restaurantEmail.trim(),
        description: description.trim(),
      });
      navigate('/restaurant/dashboard');
    }, 600);
  };

  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-wide mb-1">
              Restaurant Partner Onboarding · DEMO MODE
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              Register Your Restaurant
            </h1>
            <p className="text-sm text-[#57534E] mt-1">
              Join DineRestro in {selectedCity} to accept table bookings, upload photo menus, and host celebrations.
            </p>
          </div>

          <DemoBanner message="Phase 1 demo onboarding only. Submitting creates a simulated restaurant record in Pending Approval status inside local state." />

          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#1C1917] pb-2 border-b border-[#E5E0D8]">
                01. Owner Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Raghavendra Mishra"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@restaurant.in"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
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
                    placeholder="+91 98390 41201"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full pl-3 pr-10 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
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
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#1C1917] pb-2 border-b border-[#E5E0D8]">
                02. Restaurant Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g., Awadhi Heritage Kitchen"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Primary Cuisine Type *
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value as CuisineType)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  >
                    {POPULAR_CUISINES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Restaurant Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, or Neighbourhood (e.g., Gomti Nagar)"
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    list="rest-city-options"
                    value={city}
                    onChange={(e) => {
                      const nextCity = e.target.value;
                      setCity(nextCity);
                      const found = cities.find(
                        (c) => c.name.toLowerCase() === nextCity.trim().toLowerCase()
                      );
                      if (found) {
                        setStateName(found.state);
                        if (found.neighbourhoods.length > 0) {
                          setArea(found.neighbourhoods[0]);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                  <datalist id="rest-city-options">
                    {cities.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Neighbourhood / Area *
                  </label>
                  {matchedCityConfig && matchedCityConfig.neighbourhoods.length > 0 ? (
                    <select
                      value={
                        matchedCityConfig.neighbourhoods.includes(area)
                          ? area
                          : matchedCityConfig.neighbourhoods[0]
                      }
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    >
                      {matchedCityConfig.neighbourhoods.map((nb) => (
                        <option key={nb} value={nb}>
                          {nb}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Neighbourhood"
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E] tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Restaurant Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98390 00000"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Restaurant Official Email *
                  </label>
                  <input
                    type="email"
                    value={restaurantEmail}
                    onChange={(e) => setRestaurantEmail(e.target.value)}
                    placeholder="reservations@venue.in"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Restaurant Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your ambiance, seating zones, signature dishes, and celebration capabilities..."
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522] transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {loading
                  ? 'Submitting Demo Registration...'
                  : 'Register Restaurant & Open Dashboard (Demo)'}
              </span>
            </button>
          </form>

          <p className="text-xs text-center text-[#57534E]">
            Already registered a partner venue?{' '}
            <Link to="/restaurant/login" className="font-semibold text-[#6E1E2E] hover:underline">
              Restaurant Partner Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RestaurantLoginPage() {
  const { loginRestaurantDemo } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('raghav@kashiterrace.in');
  const [password, setPassword] = useState('partner123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid partner email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your demo password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginRestaurantDemo(email.trim());
      navigate('/restaurant/dashboard');
    }, 450);
  };

  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-wide mb-1">
              Restaurant Partner Portal · DEMO MODE
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Restaurant Owner Login
            </h1>
            <p className="text-sm text-[#57534E] mt-1">
              Manage sample table bookings, menu photos, celebration packages, and floor tables.
            </p>
          </div>

          <DemoBanner message="Demo partner credentials are pre-filled. Authentication is simulated on the frontend only." />

          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-[#FDF2F4] border border-[#EAC4CC] text-xs font-medium text-[#8B1E35]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Partner Email
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
                to="/restaurant/forgot-password"
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
              <span>{loading ? 'Opening Partner Portal...' : 'Login to Partner Dashboard (Demo)'}</span>
            </button>
          </form>

          <p className="text-xs text-center text-[#57534E]">
            Want to list your restaurant?{' '}
            <Link to="/restaurant/signup" className="font-semibold text-[#6E1E2E] hover:underline">
              Register your venue
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RestaurantForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    setSent(true);
  };

  return (
    <div className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#6E1E2E] tracking-wide mb-1">
              Partner Portal · DEMO MODE
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#1C1917]">
              Partner Password Recovery
            </h1>
            <p className="text-sm text-[#57534E] mt-1">
              Simulated reset flow for Phase 1 demonstration.
            </p>
          </div>
          {sent ? (
            <div className="p-4 rounded-lg bg-[#ECF4EE] border border-[#BBD6C3] text-xs text-[#1C1917] space-y-2">
              <p className="font-semibold">Simulated Reset Request Logged</p>
              <p>Return to partner login to continue exploring with demo credentials.</p>
              <Link to="/restaurant/login" className="inline-block font-semibold text-[#6E1E2E] underline">
                Back to Partner Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Partner Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="raghav@kashiterrace.in"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#6E1E2E]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold text-white bg-[#6E1E2E] rounded-lg hover:bg-[#541522]"
              >
                Simulate Recovery Link
              </button>
              <p className="text-xs text-center">
                <Link to="/restaurant/login" className="text-[#6E1E2E] font-semibold hover:underline">
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
