import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ClipboardCheck,
  CalendarCheck,
  PartyPopper,
  Tag,
  Grid,
  LifeBuoy,
  BarChart3,
  Settings,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { DEMO_ANALYTICS_WEEKLY, POPULAR_CUISINES } from '../../data/mockData';
import type { Restaurant } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Restaurants', to: '/admin/restaurants', icon: Store },
  { label: 'Restaurant Approvals', to: '/admin/approvals', icon: ClipboardCheck },
  { label: 'Reservations', to: '/admin/reservations', icon: CalendarCheck },
  { label: 'Event Bookings', to: '/admin/events', icon: PartyPopper },
  { label: 'Offers', to: '/admin/offers', icon: Tag },
  { label: 'Categories', to: '/admin/categories', icon: Grid },
  { label: 'Support Tickets', to: '/admin/support', icon: LifeBuoy },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function AdminDashboard() {
  const location = useLocation();
  const {
    customers,
    updateCustomerStatus,
    restaurants,
    updateRestaurantApproval,
    reservations,
    eventInquiries,
    offers,
    toggleOfferActive,
    tickets,
    updateTicketStatus,
    addToast,
  } = useApp();

  const [custQuery, setCustQuery] = useState('');
  const [custFilter, setCustFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [resStatusFilter, setResStatusFilter] = useState<string>('All');
  const [inspectRest, setInspectRest] = useState<Restaurant | null>(null);

  const path = location.pathname;
  const activeSection =
    path.includes('/admin/customers')
      ? 'customers'
      : path.includes('/admin/restaurants')
        ? 'restaurants'
        : path.includes('/admin/approvals')
          ? 'approvals'
          : path.includes('/admin/reservations')
            ? 'reservations'
            : path.includes('/admin/events')
              ? 'events'
              : path.includes('/admin/offers')
                ? 'offers'
                : path.includes('/admin/categories')
                  ? 'categories'
                  : path.includes('/admin/support')
                    ? 'support'
                    : path.includes('/admin/analytics')
                      ? 'analytics'
                      : path.includes('/admin/settings')
                        ? 'settings'
                        : 'overview';

  const pendingApprovals = restaurants.filter((r) => r.approvalStatus === 'Pending');
  const approvedRestaurants = restaurants.filter((r) => r.approvalStatus === 'Approved');

  const filteredCustomers = customers.filter((c) => {
    const matchesQ =
      !custQuery.trim() ||
      c.fullName.toLowerCase().includes(custQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(custQuery.toLowerCase());
    const matchesStatus = custFilter === 'All' || c.status === custFilter;
    return matchesQ && matchesStatus;
  });

  return (
    <DashboardLayout
      portalRole="admin"
      portalLabel="Internal Admin Portal"
      userTitle="Varanasi Operations Desk"
      userSubtitle="DEMO DATA · Internal Preview"
      navItems={ADMIN_NAV}
    >
      <div className="space-y-6">
        <DemoBanner
          title="Internal Admin Demo Mode"
          message="All platform statistics, customer records, restaurant approvals, and sample revenue metrics are simulated DEMO DATA in local frontend state."
        />

        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                DineRestro Operations Overview
              </h1>
              <p className="text-sm text-[#6B5F5C] mt-1">
                Varanasi launch city metrics and onboarding queue (DEMO DATA).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Customers', val: customers.length },
                { label: 'Total Restaurants', val: restaurants.length },
                { label: 'Pending Approvals', val: pendingApprovals.length },
                { label: 'Approved Restaurants', val: approvedRestaurants.length },
                { label: 'Total Bookings', val: reservations.length },
                { label: 'Event Inquiries', val: eventInquiries.length },
                { label: 'Open Support Tickets', val: tickets.filter((t) => t.status !== 'Resolved').length },
                { label: 'Sample Platform Revenue (Demo)', val: formatINR(641500) },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                  <p className="text-xs text-[#6B5F5C]">{stat.label}</p>
                  <p className="text-2xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Platform Demo Bookings (7 Days)"
                subtitle="Simulated daily reservation volume across Varanasi"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Sample Platform GMV Trend (Demo)"
                subtitle="Simulated dining value in ₹ thousands (not actual revenue)"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({
                  label: d.label,
                  value: Math.round(d.revenue / 1000),
                }))}
                formatValue={(v) => `₹${v}k`}
                barColor="#292321"
              />
            </div>

            {/* Quick Pending Approvals */}
            <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
              <h2 className="text-lg font-semibold text-[#292321]">
                Pending Restaurant Approvals ({pendingApprovals.length})
              </h2>
              {pendingApprovals.length === 0 ? (
                <p className="text-sm text-[#6B5F5C]">All registered venues have been reviewed.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#E8DDD1] text-xs text-[#6B5F5C]">
                        <th className="py-2.5 pr-4 font-semibold">Restaurant</th>
                        <th className="py-2.5 px-4 font-semibold">Owner</th>
                        <th className="py-2.5 px-4 font-semibold">City &amp; Cuisine</th>
                        <th className="py-2.5 pl-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DDD1]">
                      {pendingApprovals.map((r) => (
                        <tr key={r.id}>
                          <td className="py-3 pr-4 font-semibold text-[#292321]">{r.name}</td>
                          <td className="py-3 px-4 text-xs text-[#6B5F5C]">{r.ownerName}</td>
                          <td className="py-3 px-4 text-xs text-[#6B5F5C]">
                            {r.city} · {r.primaryCuisine}
                          </td>
                          <td className="py-3 pl-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => updateRestaurantApproval(r.id, 'Approved')}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRestaurantApproval(r.id, 'Rejected')}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'approvals' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Restaurant Approvals Queue
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Approve or reject partner applications in local demo state. Approved restaurants appear on the public Explore page.
              </p>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Restaurant Name</th>
                    <th className="py-3 px-4 font-semibold">Owner Name</th>
                    <th className="py-3 px-4 font-semibold">City</th>
                    <th className="py-3 px-4 font-semibold">Cuisine</th>
                    <th className="py-3 px-4 font-semibold">Registration Date</th>
                    <th className="py-3 px-4 font-semibold">Approval Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {restaurants.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FFF6E9]/40">
                      <td className="py-3 px-4 font-semibold text-[#292321]">{r.name}</td>
                      <td className="py-3 px-4 text-xs text-[#6B5F5C]">{r.ownerName}</td>
                      <td className="py-3 px-4 text-xs">{r.city}</td>
                      <td className="py-3 px-4 text-xs">{r.primaryCuisine}</td>
                      <td className="py-3 px-4 text-xs tabular-nums">
                        {formatDisplayDate(r.registrationDate)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.approvalStatus} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectRest(r)}
                          className="px-2.5 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRestaurantApproval(r.id, 'Approved')}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded hover:opacity-85"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRestaurantApproval(r.id, 'Rejected')}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded hover:opacity-85"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'customers' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Customer Management (Demo)
              </h1>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B5F5C] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={custQuery}
                    onChange={(e) => setCustQuery(e.target.value)}
                    placeholder="Search customer..."
                    className="pl-9 pr-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <select
                  value={custFilter}
                  onChange={(e) => setCustFilter(e.target.value as typeof custFilter)}
                  className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Full Name</th>
                    <th className="py-3 px-4 font-semibold">Contact</th>
                    <th className="py-3 px-4 font-semibold">Preferred Cuisine</th>
                    <th className="py-3 px-4 font-semibold text-right">Bookings</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FFF6E9]/40">
                      <td className="py-3 px-4 font-semibold text-[#292321]">{c.fullName}</td>
                      <td className="py-3 px-4 text-xs text-[#6B5F5C]">
                        <div>{c.email}</div>
                        <div className="tabular-nums">{c.mobile}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">{c.preferredCuisine}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{c.totalBookings}</td>
                      <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            updateCustomerStatus(
                              c.id,
                              c.status === 'Active' ? 'Suspended' : 'Active'
                            )
                          }
                          className="px-3 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                        >
                          {c.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'restaurants' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Registered Varanasi Restaurants
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants.map((r) => (
                <div key={r.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#292321]">{r.name}</h3>
                    <StatusBadge status={r.approvalStatus} />
                  </div>
                  <p className="text-xs text-[#6B5F5C]">
                    {r.area}, {r.city} · Owner: {r.ownerName} · {r.cuisines.join(', ')}
                  </p>
                  <p className="text-xs text-[#6B5F5C]">{r.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'reservations' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                All Platform Reservations (Demo)
              </h1>
              <select
                value={resStatusFilter}
                onChange={(e) => setResStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Ref ID</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Restaurant</th>
                    <th className="py-3 px-4 font-semibold">Schedule</th>
                    <th className="py-3 px-4 font-semibold text-right">Guests</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {reservations
                    .filter((r) => resStatusFilter === 'All' || r.status === resStatusFilter)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-[#FFF6E9]/40">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#702C3A]">{r.id}</td>
                        <td className="py-3 px-4 font-medium">{r.customerName}</td>
                        <td className="py-3 px-4 text-xs text-[#6B5F5C]">{r.restaurantName}</td>
                        <td className="py-3 px-4 text-xs tabular-nums">
                          {formatDisplayDate(r.date)} · {r.time}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">{r.guests}</td>
                        <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'events' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Platform Event Inquiries
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventInquiries.map((ev) => (
                <div key={ev.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#702C3A]">{ev.id}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#292321]">{ev.eventType}</h3>
                  <p className="text-xs text-[#6B5F5C]">
                    {ev.customerName} · {ev.restaurantName} · {ev.guests} Guests · {ev.budgetRange}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'offers' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Active Platform Offers
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((o) => (
                <div key={o.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono font-semibold text-[#702C3A]">{o.code} · {o.discountLabel}</p>
                    <h3 className="text-base font-semibold text-[#292321]">{o.title}</h3>
                    <p className="text-xs text-[#6B5F5C]">{o.restaurantName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleOfferActive(o.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border ${
                      o.active ? 'bg-[#E7EFD9] border-[#C8D8AC]' : 'bg-[#FFF6E9] border-[#E8DDD1]'
                    }`}
                  >
                    {o.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'categories' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Cuisine Categories
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {POPULAR_CUISINES.map((c) => (
                <div key={c.name} className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                  <h3 className="text-base font-semibold text-[#292321]">{c.name}</h3>
                  <p className="text-xs text-[#6B5F5C] mt-1">{c.tagline}</p>
                  <p className="text-xs font-mono tabular-nums text-[#702C3A] mt-2">
                    {c.spotsCount} sample listings
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Support Tickets Queue (Demo)
            </h1>
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-[#702C3A]">{t.id}</span>
                      <span className="text-[#6B5F5C]">· {t.userName} ({t.userRole})</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#292321]">{t.subject}</h3>
                    <p className="text-xs text-[#6B5F5C]">{t.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={t.status} />
                    {t.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(t.id, 'Resolved')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Platform Analytics (DEMO DATA)
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                All metrics and revenue numbers shown below are simulated sample data for Phase 1 evaluation.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Weekly Reservation Demand"
                subtitle="Simulated bookings across Varanasi localities"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Projected Dining Value (DEMO DATA)"
                subtitle="Sample INR thousands (not actual platform revenue)"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({
                  label: d.label,
                  value: Math.round(d.revenue / 1000),
                }))}
                formatValue={(v) => `₹${v}k`}
                barColor="#292321"
              />
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="max-w-xl bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Platform Configuration (Demo)
            </h1>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-[#E8DDD1]">
                <span className="text-[#6B5F5C]">Active Launch City</span>
                <span className="font-semibold">Varanasi, Uttar Pradesh</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E8DDD1]">
                <span className="text-[#6B5F5C]">Backend Mode</span>
                <span className="font-mono text-xs text-[#702C3A]">Phase 1 Frontend Simulation</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  addToast({
                    type: 'info',
                    title: 'Settings Preview Saved',
                    description: 'Phase 2 Supabase integration pending.',
                  })
                }
                className="px-5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Save Demo Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant Approval Detail Modal */}
      {inspectRest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E8DDD1] rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#292321]">{inspectRest.name}</h3>
              <button type="button" onClick={() => setInspectRest(null)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#6B5F5C]">Owner:</span> {inspectRest.ownerName} ({inspectRest.ownerEmail})</p>
              <p><span className="text-[#6B5F5C]">Address:</span> {inspectRest.address}, {inspectRest.city} - {inspectRest.pinCode}</p>
              <p><span className="text-[#6B5F5C]">Contact:</span> {inspectRest.contactNumber}</p>
              <p><span className="text-[#6B5F5C]">Cuisine:</span> {inspectRest.cuisines.join(', ')}</p>
              <p className="text-xs text-[#6B5F5C] pt-1">{inspectRest.description}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  updateRestaurantApproval(inspectRest.id, 'Approved');
                  setInspectRest(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded-lg"
              >
                Approve Venue
              </button>
              <button
                type="button"
                onClick={() => {
                  updateRestaurantApproval(inspectRest.id, 'Rejected');
                  setInspectRest(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded-lg"
              >
                Reject Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
