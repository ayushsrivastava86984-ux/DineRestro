import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarClock,
  Armchair,
  UtensilsCrossed,
  Store,
  PartyPopper,
  Tag,
  BarChart3,
  Bell,
  Settings,
  Plus,
  Pencil,
  Trash2,
  X,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout, type DashboardNavItem } from '../../components/layout/DashboardLayout';
import { DemoBanner } from '../../components/common/DemoBanner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { SafeImage } from '../../components/common/SafeImage';
import { DEMO_ANALYTICS_WEEKLY, IMAGES } from '../../data/mockData';
import type { DiningTable, MenuItem, Reservation } from '../../types';
import { formatDisplayDate, formatINR } from '../../utils/formatters';

const RESTAURANT_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/restaurant/dashboard', icon: LayoutDashboard },
  { label: 'Reservations', to: '/restaurant/reservations', icon: CalendarClock },
  { label: 'Tables', to: '/restaurant/tables', icon: Armchair },
  { label: 'Menu Management', to: '/restaurant/menu', icon: UtensilsCrossed },
  { label: 'Restaurant Profile', to: '/restaurant/profile', icon: Store },
  { label: 'Event Bookings', to: '/restaurant/events', icon: PartyPopper },
  { label: 'Offers', to: '/restaurant/offers', icon: Tag },
  { label: 'Analytics', to: '/restaurant/analytics', icon: BarChart3 },
  { label: 'Notifications', to: '/restaurant/notifications', icon: Bell },
  { label: 'Settings', to: '/restaurant/settings', icon: Settings },
];

export function RestaurantDashboard() {
  const location = useLocation();
  const {
    activeRestaurant,
    updateActiveRestaurantProfile,
    reservations,
    updateReservationStatus,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    tables,
    updateTableStatus,
    addTable,
    eventInquiries,
    updateEventInquiryStatus,
    offers,
    addOffer,
    toggleOfferActive,
    notifications,
    markAllNotificationsRead,
    addToast,
  } = useApp();

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [resFilter, setResFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Rejected'>('All');

  // Menu form state
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Main Course');
  const [dishPrice, setDishPrice] = useState(450);
  const [dishDesc, setDishDesc] = useState('');
  const [dishAvailable, setDishAvailable] = useState(true);

  // New Table state
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);
  const [newTableZone, setNewTableZone] = useState<DiningTable['zone']>('Rooftop');

  // Profile form state
  const [profName, setProfName] = useState(activeRestaurant.name);
  const [profAddress, setProfAddress] = useState(activeRestaurant.address);
  const [profHours, setProfHours] = useState(activeRestaurant.openingHours);
  const [profContact, setProfContact] = useState(activeRestaurant.contactNumber);
  const [profDesc, setProfDesc] = useState(activeRestaurant.description);

  // New offer state
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerLabel, setOfferLabel] = useState('Flat 15% Off');
  const [offerTerms, setOfferTerms] = useState('');

  const path = location.pathname;
  const activeSection =
    path.includes('/restaurant/reservations')
      ? 'reservations'
      : path.includes('/restaurant/tables')
        ? 'tables'
        : path.includes('/restaurant/menu')
          ? 'menu'
          : path.includes('/restaurant/profile')
            ? 'profile'
            : path.includes('/restaurant/events')
              ? 'events'
              : path.includes('/restaurant/offers')
                ? 'offers'
                : path.includes('/restaurant/analytics')
                  ? 'analytics'
                  : path.includes('/restaurant/notifications')
                    ? 'notifications'
                    : path.includes('/restaurant/settings')
                      ? 'settings'
                      : 'overview';

  const restReservations = reservations.filter(
    (r) => r.restaurantId === activeRestaurant.id || activeRestaurant.id === 'rest-kashi-terrace' && r.restaurantId === 'rest-kashi-terrace'
  );
  const displayReservations = restReservations.length > 0 ? restReservations : reservations.slice(0, 4);
  const pendingCount = displayReservations.filter((r) => r.status === 'Pending').length;
  const confirmedCount = displayReservations.filter((r) => r.status === 'Confirmed').length;
  const completedCount = displayReservations.filter((r) => r.status === 'Completed').length;

  const restMenu = menuItems.filter((m) => m.restaurantId === activeRestaurant.id);
  const displayMenu = restMenu.length > 0 ? restMenu : menuItems;
  const restTables = tables.filter((t) => t.restaurantId === activeRestaurant.id);
  const displayTables = restTables.length > 0 ? restTables : tables;
  const restOffers = offers.filter((o) => o.restaurantId === activeRestaurant.id);
  const restNotifications = notifications.filter((n) => n.role === 'restaurant');

  const openAddMenu = () => {
    setEditingMenuId(null);
    setDishName('');
    setDishCategory('Main Course');
    setDishPrice(450);
    setDishDesc('');
    setDishAvailable(true);
    setMenuFormOpen(true);
  };

  const openEditMenu = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setDishName(item.name);
    setDishCategory(item.category);
    setDishPrice(item.price);
    setDishDesc(item.description);
    setDishAvailable(item.available);
    setMenuFormOpen(true);
  };

  const handleMenuSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    if (editingMenuId) {
      updateMenuItem(editingMenuId, {
        name: dishName.trim(),
        category: dishCategory,
        price: Number(dishPrice),
        description: dishDesc.trim(),
        available: dishAvailable,
      });
    } else {
      addMenuItem({
        name: dishName.trim(),
        category: dishCategory,
        price: Number(dishPrice),
        description: dishDesc.trim() || 'Chef signature seasonal preparation.',
        image: IMAGES.northIndian,
        isVeg: true,
        available: dishAvailable,
      });
    }
    setMenuFormOpen(false);
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;
    addTable({
      tableNumber: newTableNum.trim().toUpperCase(),
      capacity: Number(newTableCap),
      zone: newTableZone,
      status: 'Available',
    });
    setNewTableNum('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveRestaurantProfile({
      name: profName.trim() || activeRestaurant.name,
      address: profAddress.trim() || activeRestaurant.address,
      openingHours: profHours.trim() || activeRestaurant.openingHours,
      contactNumber: profContact.trim() || activeRestaurant.contactNumber,
      description: profDesc.trim() || activeRestaurant.description,
    });
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !offerCode.trim()) return;
    addOffer({
      title: offerTitle.trim(),
      code: offerCode.trim().toUpperCase(),
      discountLabel: offerLabel,
      restaurantId: activeRestaurant.id,
      restaurantName: activeRestaurant.name,
      area: activeRestaurant.area,
      validUntil: '2026-12-31',
      terms: offerTerms.trim() || 'Valid on DineRestro demo table bookings.',
      active: true,
      category: 'Flat Discount',
    });
    setOfferTitle('');
    setOfferCode('');
    setOfferTerms('');
  };

  return (
    <DashboardLayout
      portalRole="restaurant"
      portalLabel="Restaurant Partner Portal"
      userTitle={activeRestaurant.name}
      userSubtitle={`${activeRestaurant.area}, ${activeRestaurant.city} · ${activeRestaurant.ownerName}`}
      navItems={RESTAURANT_NAV}
    >
      <div className="space-y-6">
        {activeRestaurant.approvalStatus === 'Pending' && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#FFF6E9] border border-[#702C3A]/30 text-sm text-[#292321]">
            <Clock className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#702C3A]">
                Your restaurant registration is pending approval.{' '}
              </span>
              <span className="text-xs text-[#6B5F5C]">
                (Phase 1 Demo Status — an Internal Admin can approve or reject this venue in the Admin Demo Portal.)
              </span>
            </div>
          </div>
        )}

        <DemoBanner message="Restaurant Owner Portal operates on simulated Phase 1 local state. Analytics and sample revenue figures are DEMO DATA." />

        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292321]">
                  {activeRestaurant.name} Overview
                </h1>
                <p className="text-sm text-[#6B5F5C] mt-1">
                  Sample hospitality operations, table requests, and dining revenue metrics.
                </p>
              </div>
              <StatusBadge status={activeRestaurant.approvalStatus} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Reservations', val: displayReservations.length },
                { label: 'Pending', val: pendingCount },
                { label: 'Confirmed', val: confirmedCount },
                { label: 'Completed', val: completedCount },
                { label: 'Event Inquiries', val: eventInquiries.length },
                { label: 'Sample Revenue (Demo)', val: formatINR(184500) },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-[#E8DDD1] rounded-lg p-4">
                  <p className="text-xs text-[#6B5F5C]">{stat.label}</p>
                  <p className="text-xl font-semibold font-mono tabular-nums text-[#292321] mt-1">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Weekly Demo Reservations"
                subtitle="Simulated daily table turns across dinner & lunch"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Weekly Sample Revenue (INR)"
                subtitle="Estimated demo dining cover revenue (not actual revenue)"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({
                  label: d.label,
                  value: Math.round(d.revenue / 1000),
                }))}
                formatValue={(v) => `₹${v}k`}
                barColor="#292321"
              />
            </div>

            {/* Recent Reservations Preview */}
            <div className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-4">
              <h2 className="text-lg font-semibold text-[#292321]">
                Latest Table Requests (Demo)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DDD1] text-xs text-[#6B5F5C]">
                      <th className="py-2.5 pr-4 font-semibold">Guest</th>
                      <th className="py-2.5 px-4 font-semibold">Date &amp; Time</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Guests</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 pl-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDD1]">
                    {displayReservations.slice(0, 4).map((res) => (
                      <tr key={res.id}>
                        <td className="py-3 pr-4 font-medium text-[#292321]">{res.customerName}</td>
                        <td className="py-3 px-4 text-xs tabular-nums text-[#6B5F5C]">
                          {formatDisplayDate(res.date)} · {res.time}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">{res.guests}</td>
                        <td className="py-3 px-4"><StatusBadge status={res.status} /></td>
                        <td className="py-3 pl-4 text-right space-x-2 whitespace-nowrap">
                          {res.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateReservationStatus(res.id, 'Confirmed')}
                                className="px-2.5 py-1 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded hover:opacity-85"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => updateReservationStatus(res.id, 'Rejected')}
                                className="px-2.5 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded hover:opacity-85"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedReservation(res)}
                            className="px-2.5 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'reservations' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Reservation Management
              </h1>
              <div className="flex flex-wrap gap-1.5 bg-white border border-[#E8DDD1] p-1 rounded-lg">
                {(['All', 'Pending', 'Confirmed', 'Completed', 'Rejected'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setResFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded ${
                      resFilter === status
                        ? 'bg-[#702C3A] text-white'
                        : 'text-[#292321] hover:bg-[#FFF6E9]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E8DDD1] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8DDD1] bg-[#FFF6E9] text-xs text-[#6B5F5C]">
                    <th className="py-3 px-4 font-semibold">Customer Name</th>
                    <th className="py-3 px-4 font-semibold">Booking Date</th>
                    <th className="py-3 px-4 font-semibold">Booking Time</th>
                    <th className="py-3 px-4 font-semibold text-right">Guests</th>
                    <th className="py-3 px-4 font-semibold">Booking Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD1]">
                  {displayReservations
                    .filter((r) => resFilter === 'All' || r.status === resFilter)
                    .map((res) => (
                      <tr key={res.id} className="hover:bg-[#FFF6E9]/40">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#292321]">{res.customerName}</p>
                          <p className="text-xs text-[#6B5F5C] tabular-nums">{res.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 tabular-nums text-xs">{formatDisplayDate(res.date)}</td>
                        <td className="py-3 px-4 tabular-nums text-xs">{res.time}</td>
                        <td className="py-3 px-4 text-right tabular-nums">{res.guests}</td>
                        <td className="py-3 px-4"><StatusBadge status={res.status} /></td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Confirmed')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded hover:opacity-85"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReservationStatus(res.id, 'Rejected')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded hover:opacity-85"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedReservation(res)}
                            className="px-2.5 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'tables' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  Floor &amp; Table Management
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Click a status control to toggle table readiness in local demo state.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleAddTable}
              className="bg-white border border-[#E8DDD1] rounded-lg p-4 flex flex-wrap items-end gap-3"
            >
              <div>
                <label className="block text-xs font-semibold text-[#292321] mb-1">Table No.</label>
                <input
                  type="text"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="RT-04"
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg w-28"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#292321] mb-1">Capacity</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={newTableCap}
                  onChange={(e) => setNewTableCap(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg w-24 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#292321] mb-1">Zone</label>
                <select
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value as DiningTable['zone'])}
                  className="px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                >
                  <option>Rooftop</option>
                  <option>Courtyard</option>
                  <option>Indoor AC</option>
                  <option>Private Lounge</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Table</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTables.map((tbl) => (
                <div key={tbl.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-semibold text-[#292321]">
                      {tbl.tableNumber}
                    </span>
                    <StatusBadge status={tbl.status} />
                  </div>
                  <p className="text-xs text-[#6B5F5C] tabular-nums">
                    {tbl.zone} · Seats {tbl.capacity} guests
                  </p>
                  <div className="flex gap-2 pt-1">
                    {(['Available', 'Reserved', 'Occupied'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateTableStatus(tbl.id, st)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                          tbl.status === st
                            ? 'bg-[#702C3A] text-white border-[#702C3A]'
                            : 'border-[#E8DDD1] text-[#292321] hover:bg-[#FFF6E9]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'menu' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[#292321]">
                  Menu Management
                </h1>
                <p className="text-sm text-[#6B5F5C]">
                  Add, edit, or delete sample dishes in local demo state.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddMenu}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Menu Item</span>
              </button>
            </div>

            {menuFormOpen && (
              <form
                onSubmit={handleMenuSave}
                className="bg-white border border-[#702C3A] rounded-lg p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#292321]">
                    {editingMenuId ? 'Edit Dish' : 'Add New Sample Dish'}
                  </h2>
                  <button type="button" onClick={() => setMenuFormOpen(false)} aria-label="Close form">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Category</label>
                    <select
                      value={dishCategory}
                      onChange={(e) => setDishCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg"
                    >
                      <option>Starters</option>
                      <option>Main Course</option>
                      <option>Continental</option>
                      <option>Breads</option>
                      <option>Desserts</option>
                      <option>Beverages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min={50}
                      value={dishPrice}
                      onChange={(e) => setDishPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg tabular-nums"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    value={dishDesc}
                    onChange={(e) => setDishDesc(e.target.value)}
                    placeholder="Key ingredients and preparation style"
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={dishAvailable}
                    onChange={(e) => setDishAvailable(e.target.checked)}
                    className="accent-[#702C3A]"
                  />
                  <span>Available for guests</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
                  >
                    {editingMenuId ? 'Save Changes' : 'Add Dish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFormOpen(false)}
                    className="px-4 py-2 text-xs font-medium border border-[#E8DDD1] rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayMenu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E8DDD1] rounded-lg p-4 flex gap-4 items-center"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fallbackTitle={item.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#292321] truncate">{item.name}</h3>
                      <span className="font-mono text-sm font-semibold text-[#702C3A] tabular-nums">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B5F5C]">
                      {item.category} · {item.available ? 'Available' : 'Unavailable'}
                    </p>
                    <p className="text-xs text-[#6B5F5C] line-clamp-1 mt-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => openEditMenu(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#702C3A] border border-[#F4A6B8] rounded hover:bg-[#FDECEF]"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-2xl bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Restaurant Profile (Demo)
            </h1>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={profHours}
                    onChange={(e) => setProfHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Host Desk Phone</label>
                  <input
                    type="tel"
                    value={profContact}
                    onChange={(e) => setProfContact(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={profDesc}
                  onChange={(e) => setProfDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
              >
                Save Restaurant Details (Demo)
              </button>
            </form>
          </div>
        )}

        {activeSection === 'events' && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Event Bookings &amp; Celebration Inquiries
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventInquiries.map((ev) => (
                <div key={ev.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#702C3A]">{ev.id}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#292321]">{ev.eventType}</h3>
                  <p className="text-xs text-[#6B5F5C]">
                    Host: {ev.customerName} ({ev.customerPhone}) · {formatDisplayDate(ev.preferredDate)} · {ev.guests} Guests
                  </p>
                  <p className="text-xs text-[#292321]">{ev.notes}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => updateEventInquiryStatus(ev.id, 'Proposal Sent')}
                      className="px-3 py-1.5 text-xs font-semibold border border-[#E8DDD1] rounded hover:bg-[#FFF6E9]"
                    >
                      Send Proposal
                    </button>
                    <button
                      type="button"
                      onClick={() => updateEventInquiryStatus(ev.id, 'Confirmed')}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#E7EFD9] text-[#292321] rounded"
                    >
                      Confirm Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => updateEventInquiryStatus(ev.id, 'Declined')}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#FDECEF] text-[#702C3A] rounded"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'offers' && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Venue Offers &amp; Deals
            </h1>
            <form
              onSubmit={handleCreateOffer}
              className="bg-white border border-[#E8DDD1] rounded-lg p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-semibold mb-1">Offer Title</label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Monsoon Rooftop Special"
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Promo Code</label>
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  placeholder="GHAT20"
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Discount Label</label>
                <input
                  type="text"
                  value={offerLabel}
                  onChange={(e) => setOfferLabel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Publish Offer (Demo)
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(restOffers.length > 0 ? restOffers : offers.slice(0, 2)).map((o) => (
                <div key={o.id} className="bg-white border border-[#E8DDD1] rounded-lg p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono font-semibold text-[#702C3A]">{o.code} · {o.discountLabel}</p>
                    <h3 className="text-base font-semibold text-[#292321] mt-0.5">{o.title}</h3>
                    <p className="text-xs text-[#6B5F5C] mt-0.5">{o.terms}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleOfferActive(o.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border ${
                      o.active
                        ? 'bg-[#E7EFD9] text-[#292321] border-[#C8D8AC]'
                        : 'bg-[#FFF6E9] text-[#6B5F5C] border-[#E8DDD1]'
                    }`}
                  >
                    {o.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Sample Venue Analytics (DEMO DATA)
              </h1>
              <p className="text-sm text-[#6B5F5C]">
                Simulated reservation trends and projected dining cover values for demonstration only.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Bookings by Day of Week"
                subtitle="Simulated weekly reservation counts"
                data={DEMO_ANALYTICS_WEEKLY.map((d) => ({ label: d.label, value: d.bookings }))}
              />
              <SimpleBarChart
                title="Estimated Cover Revenue (Demo)"
                subtitle="Sample figures in thousands (INR)"
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

        {activeSection === 'notifications' && (
          <div className="bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-semibold text-[#292321]">
                Partner Notifications
              </h1>
              <button
                type="button"
                onClick={() => markAllNotificationsRead('restaurant')}
                className="text-xs font-semibold text-[#702C3A] hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="divide-y divide-[#E8DDD1]">
              {restNotifications.map((n) => (
                <div key={n.id} className="py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#292321]">{n.title}</p>
                    <span className="text-xs text-[#6B5F5C]">{n.timeAgo}</span>
                  </div>
                  <p className="text-xs text-[#6B5F5C] mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="max-w-xl bg-white border border-[#E8DDD1] rounded-lg p-6 space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[#292321]">
              Partner Settings (Demo)
            </h1>
            <p className="text-xs text-[#6B5F5C]">
              Configure simulated booking preferences for your Varanasi dining room.
            </p>
            <div className="space-y-3 pt-2 text-sm">
              <label className="flex items-center justify-between py-2 border-b border-[#E8DDD1]">
                <span>Auto-hold table requests for 15 minutes</span>
                <input type="checkbox" defaultChecked className="accent-[#702C3A]" />
              </label>
              <label className="flex items-center justify-between py-2 border-b border-[#E8DDD1]">
                <span>Accept birthday &amp; anniversary inquiries</span>
                <input type="checkbox" defaultChecked className="accent-[#702C3A]" />
              </label>
              <button
                type="button"
                onClick={() =>
                  addToast({ type: 'success', title: 'Demo Settings Saved Locally' })
                }
                className="px-5 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E8DDD1] rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#292321]">
                Reservation {selectedReservation.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                aria-label="Close detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#6B5F5C]">Guest:</span> {selectedReservation.customerName}</p>
              <p><span className="text-[#6B5F5C]">Phone:</span> {selectedReservation.customerPhone}</p>
              <p><span className="text-[#6B5F5C]">Schedule:</span> {formatDisplayDate(selectedReservation.date)} at {selectedReservation.time}</p>
              <p><span className="text-[#6B5F5C]">Party Size:</span> {selectedReservation.guests} Guests</p>
              <p><span className="text-[#6B5F5C]">Occasion:</span> {selectedReservation.occasion || 'Standard Dining'}</p>
              <p><span className="text-[#6B5F5C]">Notes:</span> {selectedReservation.specialRequest || 'None'}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  updateReservationStatus(selectedReservation.id, 'Confirmed');
                  setSelectedReservation(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#702C3A] text-white rounded-lg"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-2 text-xs font-medium border border-[#E8DDD1] rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
