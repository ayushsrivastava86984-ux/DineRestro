import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import type { PortalRole } from '../../types';

export interface DashboardNavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  portalRole: Exclude<PortalRole, 'guest'>;
  portalLabel: string;
  userTitle: string;
  userSubtitle: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}

export function DashboardLayout({
  portalRole,
  portalLabel,
  userTitle,
  userSubtitle,
  navItems,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, markAllNotificationsRead, logoutPortal } = useApp();
  const navigate = useNavigate();

  const roleNotifs = notifications.filter((n) => n.role === portalRole);
  const unreadCount = roleNotifs.filter((n) => !n.read).length;

  const handleLogout = () => {
    logoutPortal();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF6E9]/45 text-[#292321] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#E8DDD1] flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-5 border-b border-[#E8DDD1] flex items-center justify-between shrink-0">
          <Link to="/" aria-label="DineRestro Home" className="inline-flex items-center">
            <BrandLogo variant="compact" />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#FFF6E9]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3.5 border-b border-[#E8DDD1] bg-[#FFF6E9]/60">
          <p className="text-[11px] font-semibold text-[#702C3A] tracking-wide">
            {portalLabel}
          </p>
          <p className="text-sm font-semibold text-[#292321] truncate mt-0.5">
            {userTitle}
          </p>
          <p className="text-xs text-[#6B5F5C] truncate">{userSubtitle}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label={`${portalLabel} navigation`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith('/dashboard')}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#702C3A] text-white'
                      : 'text-[#292321] hover:bg-[#FFF6E9] hover:text-[#702C3A]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#E8DDD1] space-y-1.5 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#6B5F5C] hover:bg-[#FFF6E9] hover:text-[#292321] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>View Public Site</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#702C3A] hover:bg-[#FDECEF] transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E8DDD1] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E8DDD1] text-[#292321] hover:bg-[#FFF6E9]"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#292321] truncate">
                {portalLabel}
              </p>
              <p className="text-xs text-[#6B5F5C] truncate">
                DEMO MODE · Simulated Frontend State
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                if (!notifOpen && unreadCount > 0) {
                  markAllNotificationsRead(portalRole);
                }
              }}
              className="relative p-2 rounded-lg border border-[#E8DDD1] text-[#292321] hover:bg-[#FFF6E9] transition-colors"
              aria-label="Toggle notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#702C3A] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-[#E8DDD1] rounded-lg shadow-md z-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-[#FFF6E9] border-b border-[#E8DDD1] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292321]">
                    Demo Notifications
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-[#702C3A] font-medium"
                  >
                    Close
                  </button>
                </div>
                <div className="divide-y divide-[#E8DDD1] max-h-72 overflow-y-auto">
                  {roleNotifs.length === 0 ? (
                    <p className="p-4 text-xs text-[#6B5F5C]">No notifications yet.</p>
                  ) : (
                    roleNotifs.map((n) => (
                      <div key={n.id} className="p-3.5 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#292321]">{n.title}</span>
                          <span className="text-[11px] text-[#6B5F5C]">{n.timeAgo}</span>
                        </div>
                        <p className="text-[#6B5F5C] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#702C3A] border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9] transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
