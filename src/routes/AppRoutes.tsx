import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { PortalRole } from '../types';
import { PublicLayout } from '../components/layout/PublicLayout';

import { HomePage } from '../pages/public/HomePage';
import { ExplorePage } from '../pages/public/ExplorePage';
import { OffersPage } from '../pages/public/OffersPage';
import { EventsPage } from '../pages/public/EventsPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { AuthSelectionPage } from '../pages/public/AuthSelectionPage';

import {
  CustomerForgotPasswordPage,
  CustomerLoginPage,
  CustomerSignupPage,
} from '../pages/customer/CustomerAuthPages';
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';

import {
  RestaurantForgotPasswordPage,
  RestaurantLoginPage,
  RestaurantSignupPage,
} from '../pages/restaurant/RestaurantAuthPages';
import { RestaurantDashboard } from '../pages/restaurant/RestaurantDashboard';

import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PortalGuard({
  requiredRole,
  redirectTo,
  children,
}: {
  requiredRole: Exclude<PortalRole, 'guest'>;
  redirectTo: string;
  children: React.ReactNode;
}) {
  const { role } = useApp();
  if (role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public & Auth Layout Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<AuthSelectionPage />} />

          <Route path="/customer/signup" element={<CustomerSignupPage />} />
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route
            path="/customer/forgot-password"
            element={<CustomerForgotPasswordPage />}
          />

          <Route path="/restaurant/signup" element={<RestaurantSignupPage />} />
          <Route path="/restaurant/login" element={<RestaurantLoginPage />} />
          <Route
            path="/restaurant/forgot-password"
            element={<RestaurantForgotPasswordPage />}
          />
        </Route>

        {/* Separate Admin Login (not linked in public signup) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Customer Portal Routes */}
        {[
          '/customer/dashboard',
          '/customer/explore',
          '/customer/reservations',
          '/customer/bookings',
          '/customer/preorders',
          '/customer/celebrations',
          '/customer/custom-requests',
          '/customer/events',
          '/customer/payments',
          '/customer/reviews',
          '/customer/notifications',
          '/customer/offers',
          '/customer/favorites',
          '/customer/profile',
          '/customer/support',
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <PortalGuard requiredRole="customer" redirectTo="/customer/login">
                <CustomerDashboard />
              </PortalGuard>
            }
          />
        ))}

        {/* Restaurant Owner Portal Routes */}
        {[
          '/restaurant/dashboard',
          '/restaurant/profile',
          '/restaurant/gallery',
          '/restaurant/amenities',
          '/restaurant/menu',
          '/restaurant/tables',
          '/restaurant/reservations',
          '/restaurant/preorders',
          '/restaurant/celebrations',
          '/restaurant/decorations',
          '/restaurant/events',
          '/restaurant/custom-requests',
          '/restaurant/quotations',
          '/restaurant/payments',
          '/restaurant/offers',
          '/restaurant/analytics',
          '/restaurant/notifications',
          '/restaurant/settings',
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <PortalGuard
                requiredRole="restaurant"
                redirectTo="/restaurant/login"
              >
                <RestaurantDashboard />
              </PortalGuard>
            }
          />
        ))}

        {/* Internal Admin Portal Routes */}
        {[
          '/admin/dashboard',
          '/admin/customers',
          '/admin/restaurants',
          '/admin/approvals',
          '/admin/photos',
          '/admin/amenities',
          '/admin/menus',
          '/admin/celebration-packages',
          '/admin/decorations',
          '/admin/offers',
          '/admin/fees',
          '/admin/reservations',
          '/admin/preorders',
          '/admin/quotations',
          '/admin/custom-requests',
          '/admin/payments',
          '/admin/reviews',
          '/admin/support',
          '/admin/analytics',
          '/admin/settings',
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <PortalGuard requiredRole="admin" redirectTo="/admin/login">
                <AdminDashboard />
              </PortalGuard>
            }
          />
        ))}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
