import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VerificationBadge } from '../common/VerificationBadge';
import {
  LayoutDashboard,
  Search,
  Calendar,
  MapPin,
  User,
  Wrench,
  ClipboardList,
  CreditCard,
  Inbox,
  Star,
  Clock,
  Users,
  ShieldCheck,
  Layers,
  Globe,
  LogOut,
} from 'lucide-react';

export const Sidebar = ({ role = 'CUSTOMER' }) => {
  const { user, providerProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/customer/browse', label: 'Find Professionals', icon: Search },
    { to: '/customer/bookings', label: 'My Bookings', icon: Calendar },
    { to: '/customer/addresses', label: 'Saved Addresses', icon: MapPin },
    { to: '/customer/profile', label: 'Profile Settings', icon: User },
  ];

  const providerLinks = [
    { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/provider/requests', label: 'Booking Requests', icon: Inbox },
    { to: '/provider/services', label: 'My Services', icon: ClipboardList },
    { to: '/provider/pricing', label: 'Manage Pricing', icon: CreditCard },
    { to: '/provider/availability', label: 'Availability', icon: Clock },
    { to: '/provider/reviews', label: 'Reviews', icon: Star },
    { to: '/provider/profile', label: 'Profile & Area', icon: Wrench },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/providers', label: 'Provider Verification', icon: ShieldCheck },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/services', label: 'Services', icon: ClipboardList },
    { to: '/admin/bookings', label: 'All Bookings', icon: Calendar },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'PROVIDER' ? providerLinks : customerLinks;
  const portalLabel = role === 'ADMIN' ? 'Admin Portal' : role === 'PROVIDER' ? 'Provider Portal' : 'Customer Account';

  return (
    <aside className="dashboard-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon" style={{ width: '34px', height: '34px' }}>
            <ShieldCheck size={20} strokeWidth={2.4} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>TrustFix</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div style={{ padding: '0 8px 8px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {portalLabel}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => document.querySelector('.dashboard-layout')?.classList.remove('sidebar-open')}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--neutral-200)', paddingTop: '10px' }}>
          <Link
            to="/"
            onClick={() => document.querySelector('.dashboard-layout')?.classList.remove('sidebar-open')}
            className="sidebar-link"
            style={{ color: 'var(--neutral-600)' }}
          >
            <Globe size={18} strokeWidth={2} />
            <span>Back to Website</span>
          </Link>
        </div>
      </nav>

      {/* User Mini Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-mini-profile mb-3">
          <img
            src={user?.avatar || (providerProfile?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            className="user-avatar"
          />
          <div className="min-w-0 flex-1">
            <h6 className="text-truncate font-bold text-sm" style={{ margin: 0, color: 'var(--neutral-900)' }}>
              {user?.name || 'User'}
            </h6>
            <div className="flex items-center gap-1 mt-1">
              {role === 'PROVIDER' ? (
                <VerificationBadge status={providerProfile?.verificationStatus || 'PENDING'} size="sm" />
              ) : (
                <span className="badge badge-confirmed" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-sm btn-secondary btn-block"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
