import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { LoadingSpinner } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  ShieldCheck,
  ClipboardList,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState({
    usersCount: 0,
    pendingProvidersCount: 0,
    servicesCount: 0,
    bookingsCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      setLoading(true);
      try {
        const [users, provProfiles, servs, books] = await Promise.all([
          adminService.getAllUsers().catch(() => []),
          adminService.getAllProviderProfiles().catch(() => []),
          adminService.getServices().catch(() => []),
          adminService.getAllBookings().catch(() => [])
        ]);

        const pendingProv = provProfiles.filter(p => p.verificationStatus === 'PENDING');

        setMetrics({
          usersCount: users.length,
          pendingProvidersCount: pendingProv.length,
          servicesCount: servs.length,
          bookingsCount: books.length,
        });

        setRecentBookings(books.slice(0, 5));
        setPendingProviders(pendingProv.slice(0, 4));
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMetrics();
  }, []);

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Admin Dashboard" subtitle="Loading platform data..." />
        <div className="dashboard-content">
          <LoadingSpinner message="Fetching platform metrics..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Platform Governance & Operations"
        subtitle="Live platform metrics, provider verifications, and marketplace monitoring."
      />

      <div className="dashboard-content">
        
        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Total Registered Users"
            value={metrics.usersCount}
            subtitle="Customers & Specialists"
            icon={<Users size={20} />}
            color="primary"
          />
          <StatCard
            title="Pending Verifications"
            value={metrics.pendingProvidersCount}
            subtitle="Requires document review"
            icon={<ShieldCheck size={20} />}
            color={metrics.pendingProvidersCount > 0 ? "warning" : "success"}
          />
          <StatCard
            title="Active Services"
            value={metrics.servicesCount}
            subtitle="Across all categories"
            icon={<ClipboardList size={20} />}
            color="info"
          />
          <StatCard
            title="Total Bookings"
            value={metrics.bookingsCount}
            subtitle="Platform transaction volume"
            icon={<Calendar size={20} />}
            color="success"
          />
        </div>

        {/* 2-COLUMN SECTION: PENDING PROVIDERS + RECENT ORDERS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Pending Verifications */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
            <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Pending Provider Approvals</h4>
                <span className="text-xs text-muted">Review credentials and activate profiles</span>
              </div>
              <Link to="/admin/providers" className="btn btn-sm btn-secondary">
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {pendingProviders.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={32} color="var(--success-600)" style={{ margin: '0 auto 8px auto' }} />
                <p className="text-xs text-muted">All provider applications have been reviewed!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingProviders.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--neutral-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <strong className="text-sm block" style={{ color: 'var(--neutral-900)' }}>
                        {p.businessName || p.userName || 'Specialist Application'}
                      </strong>
                      <span className="text-xs text-muted">{p.userEmail || p.userPhone || 'No contact email'}</span>
                    </div>

                    <Link to="/admin/providers" className="btn btn-sm btn-primary text-xs" style={{ padding: '4px 10px' }}>
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Platform Bookings */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
            <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Recent Orders Monitor</h4>
                <span className="text-xs text-muted">Live customer booking requests</span>
              </div>
              <Link to="/admin/bookings" className="btn btn-sm btn-secondary">
                <span>All Orders</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted">No bookings recorded on platform yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--neutral-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong className="text-xs block">{b.serviceName}</strong>
                      <span className="text-2xs text-muted font-mono">{b.bookingReference} • {formatDate(b.date || b.bookingDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Admin Navigation Grid */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
            Governance Shortcuts
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link
              to="/admin/users"
              className="card card-hoverable"
              style={{
                padding: '1.25rem',
                textDecoration: 'none',
                backgroundColor: 'var(--neutral-50)',
                border: '1px solid var(--neutral-200)',
              }}
            >
              <Users size={20} color="var(--primary-700)" className="mb-2" />
              <strong className="text-sm block text-neutral-900">User Management</strong>
              <span className="text-2xs text-muted">View all platform roles & accounts</span>
            </Link>

            <Link
              to="/admin/providers"
              className="card card-hoverable"
              style={{
                padding: '1.25rem',
                textDecoration: 'none',
                backgroundColor: 'var(--neutral-50)',
                border: '1px solid var(--neutral-200)',
              }}
            >
              <ShieldCheck size={20} color="var(--success-700)" className="mb-2" />
              <strong className="text-sm block text-neutral-900">Provider Verification</strong>
              <span className="text-2xs text-muted">Approve & verify specialist credentials</span>
            </Link>

            <Link
              to="/admin/categories"
              className="card card-hoverable"
              style={{
                padding: '1.25rem',
                textDecoration: 'none',
                backgroundColor: 'var(--neutral-50)',
                border: '1px solid var(--neutral-200)',
              }}
            >
              <Layers size={20} color="var(--info-700)" className="mb-2" />
              <strong className="text-sm block text-neutral-900">Category Catalog</strong>
              <span className="text-2xs text-muted">Configure trades & icons</span>
            </Link>

            <Link
              to="/admin/services"
              className="card card-hoverable"
              style={{
                padding: '1.25rem',
                textDecoration: 'none',
                backgroundColor: 'var(--neutral-50)',
                border: '1px solid var(--neutral-200)',
              }}
            >
              <ClipboardList size={20} color="var(--warning-700)" className="mb-2" />
              <strong className="text-sm block text-neutral-900">Service Catalog</strong>
              <span className="text-2xs text-muted">Manage standard offerings & base pricing</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
