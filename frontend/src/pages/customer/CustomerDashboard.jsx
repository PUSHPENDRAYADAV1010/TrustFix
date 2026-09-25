import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import { providerService } from '../../services/providerService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { LoadingSpinner, EmptyState } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  Zap,
  Wrench,
  Sparkles,
  Snowflake,
  ShieldCheck,
  Plus,
  User,
  Star,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [recommendedProviders, setRecommendedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        const [userBookings, userAddrs, topProvs] = await Promise.all([
          bookingService.getCustomerBookings(user.id),
          userService.getAddresses(user.id),
          providerService.getFeaturedProviders()
        ]);
        setBookings(userBookings);
        setAddresses(userAddrs);
        setRecommendedProviders(topProvs.slice(0, 3));
      } catch (err) {
        console.error('Error fetching customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.id]);

  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const nextAppointment = upcomingBookings[0] || null;

  const quickCategories = [
    { name: 'Electrical', icon: Zap, bg: 'var(--primary-subtle)', color: 'var(--primary-800)', link: '/services?category=Electrical' },
    { name: 'Plumbing', icon: Wrench, bg: 'var(--info-50)', color: 'var(--info-700)', link: '/services?category=Plumbing' },
    { name: 'Cleaning', icon: Sparkles, bg: 'var(--success-50)', color: 'var(--success-700)', link: '/services?category=Cleaning' },
    { name: 'AC Repair', icon: Snowflake, bg: 'var(--warning-50)', color: 'var(--warning-800)', link: '/services?category=AC%20Repair' },
  ];

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Customer Dashboard" subtitle="Loading your account..." />
        <div className="dashboard-content">
          <LoadingSpinner message="Fetching dashboard metrics..." />
        </div>
      </div>
    );
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Customer';

  return (
    <div>
      <DashboardHeader
        title={`Good morning, ${firstName}`}
        subtitle="Manage your scheduled appointments, active bookings, and trusted professionals."
      >
        <Link to="/customer/book" className="btn btn-primary" style={{ padding: '0.5rem 1.125rem' }}>
          <Plus size={16} />
          <span>Book Service</span>
        </Link>
      </DashboardHeader>

      <div className="dashboard-content">
        
        {/* ============================================================
            1. TOP METRICS / KPIS ROW
            ============================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          <StatCard
            title="Upcoming Bookings"
            value={upcomingBookings.length}
            subtitle={upcomingBookings.length > 0 ? "Scheduled specialist visits" : "No active pending visits"}
            icon={<Calendar size={22} />}
            color="primary"
          />
          <StatCard
            title="Completed Services"
            value={completedBookings.length}
            subtitle="Verified doorstep resolutions"
            icon={<CheckCircle2 size={22} />}
            color="success"
          />
          <StatCard
            title="Saved Addresses"
            value={addresses.length}
            subtitle="Configured service locations"
            icon={<MapPin size={22} />}
            color="info"
          />
        </div>

        {/* ============================================================
            2. TWO-COLUMN: UPCOMING APPOINTMENT (65%) + QUICK BOOK (35%)
            ============================================================ */}
        <div className="dashboard-two-col" style={{ marginBottom: '2.25rem' }}>
          {/* LEFT: UPCOMING APPOINTMENT CARD */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
            <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
              <div className="flex items-center gap-2">
                <Calendar size={20} color="var(--primary-700)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                  Upcoming Appointment
                </h3>
              </div>
              {nextAppointment && <StatusBadge status={nextAppointment.status} />}
            </div>

            {nextAppointment ? (
              <div>
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <h4 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '4px' }}>
                      {nextAppointment.serviceName}
                    </h4>
                    <p className="text-xs text-muted">
                      Booking Reference: <strong className="font-mono text-primary">{nextAppointment.bookingReference}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted block mb-05">Estimated Cost</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                      {formatCurrency(nextAppointment.price || nextAppointment.totalPrice || 499)}
                    </span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                    backgroundColor: 'var(--neutral-50)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={18} color="var(--primary-700)" />
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold block">Scheduled Slot</span>
                      <strong className="text-sm">{formatDate(nextAppointment.date)} at {nextAppointment.time}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <User size={18} color="var(--primary-700)" />
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold block">Assigned Specialist</span>
                      <strong className="text-sm">{nextAppointment.providerName || 'Certified Specialist'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MapPin size={18} color="var(--primary-700)" />
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold block">Doorstep Address</span>
                      <strong className="text-sm text-truncate block" style={{ maxWidth: '200px' }}>
                        {nextAppointment.address?.flat ? `${nextAppointment.address.flat}, ${nextAppointment.address.city}` : (nextAppointment.address?.city || 'Mumbai')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs text-muted flex items-center gap-1.5">
                    <ShieldCheck size={16} color="var(--success-600)" />
                    <span>₹0 advance required • Pay securely after completion</span>
                  </span>
                  <Link to={`/customer/bookings/${nextAppointment.id}`} className="btn btn-sm btn-primary">
                    <span>View Booking Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                  }}
                >
                  <Calendar size={26} />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '0.35rem', color: 'var(--neutral-900)' }}>
                  No upcoming appointments
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: '1.25rem' }}>
                  Need a verified electrician, plumber, technician or carpenter? Schedule now.
                </p>
                <Link to="/customer/browse" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                  <Plus size={16} />
                  <span>Book a New Service</span>
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: QUICK BOOK CARD */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
            <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                Quick Book
              </h3>
              <Link to="/services" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 650, color: 'var(--primary-750)' }}>
                View Full Catalog
              </Link>
            </div>

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-600)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Select a popular category for rapid doorstep scheduling with certified local specialists:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {quickCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    to={cat.link}
                    className="card card-hoverable"
                    style={{
                      padding: '1.25rem 1rem',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      backgroundColor: 'var(--neutral-50)',
                      border: '1px solid var(--neutral-200)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: cat.bg,
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================
            3. RECENT BOOKINGS TABLE
            ============================================================ */}
        <div className="card mb-8" style={{ padding: '1.75rem', backgroundColor: 'var(--white)' }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                Recent Bookings
              </h3>
              <span className="text-xs text-muted">Your doorstep service orders, dates and execution status</span>
            </div>
            <Link to="/customer/bookings" className="btn btn-sm btn-secondary">
              <span>View All Bookings</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-6 text-muted text-sm">
              No recent bookings found. When you book a service, it will appear here.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Service & Reference</th>
                    <th>Provider</th>
                    <th>Date & Slot</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ color: 'var(--neutral-900)', display: 'block' }}>{b.serviceName}</strong>
                        <span className="text-2xs text-muted font-mono">Ref: {b.bookingReference}</span>
                      </td>
                      <td>
                        <span className="font-medium text-neutral-800">{b.providerName || 'Assigned Specialist'}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block' }}>{formatDate(b.date)}</span>
                        <span className="text-2xs text-muted">{b.time}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary-900)' }}>
                          {formatCurrency(b.price || b.totalPrice || 499)}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/customer/bookings/${b.id}`} className="btn btn-sm btn-secondary">
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============================================================
            4. RECOMMENDED PROFESSIONALS
            ============================================================ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                Recommended Verified Professionals
              </h3>
              <span className="text-xs text-muted">High-rated trade specialists serving your metro area</span>
            </div>
            <Link to="/customer/browse" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 650, color: 'var(--primary-750)' }}>
              Explore All Providers
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {recommendedProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
