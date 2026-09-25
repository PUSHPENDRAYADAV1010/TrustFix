import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Bell, User, Menu } from 'lucide-react';

export const DashboardHeader = ({ title, subtitle, actions }) => {
  const { user, role, providerProfile } = useAuth();

  const handleToggleSidebar = () => {
    document.querySelector('.dashboard-layout')?.classList.toggle('sidebar-open');
  };

  return (
    <header className="dashboard-header">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-light mobile-sidebar-toggle"
          onClick={handleToggleSidebar}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)', margin: 0 }}>
            {title}
          </h2>
          {subtitle && <p className="text-xs text-muted" style={{ margin: '2px 0 0 0' }}>{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {role === 'CUSTOMER' && (
          <Link to="/customer/browse" className="btn btn-sm btn-primary">
            <Plus size={14} strokeWidth={2.5} />
            <span>Book Service</span>
          </Link>
        )}

        {/* User Profile Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            backgroundColor: 'var(--neutral-100)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--neutral-200)',
          }}
        >
          <span className={`status-dot ${role === 'PROVIDER' ? (providerProfile?.available ? 'online' : 'offline') : 'online'}`} />
          <span className="text-xs font-semibold" style={{ color: 'var(--neutral-800)' }}>
            {user?.name || 'Account'}
          </span>
        </div>
      </div>
    </header>
  );
};
