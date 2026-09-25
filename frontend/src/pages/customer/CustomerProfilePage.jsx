import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { bookingService } from '../../services/bookingService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/FeedbackStates';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Lock,
  Bell,
  ExternalLink,
  Shield,
  FileCheck
} from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Account Preferences toggles
  const [preferences, setPreferences] = useState({
    emailUpdates: true,
    smsAlerts: true,
    technicianUpdates: true,
  });

  const [addressCount, setAddressCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user) return;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      try {
        const [addrs, bks] = await Promise.all([
          userService.getAddresses(user.id),
          bookingService.getCustomerBookings(user.id)
        ]);
        setAddressCount(addrs.length);
        setBookingCount(bks.length);
      } catch (err) {
        console.error('Error loading account metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await userService.updateUserProfile(user.id, formData);
      updateUser(updated);
      setMessage('Profile settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Profile Settings" subtitle="Loading..." />
        <div className="dashboard-content">
          <LoadingSpinner message="Fetching profile details..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Profile Settings"
        subtitle="Manage your personal information, contact credentials, and account settings."
      />

      <div className="dashboard-content">
        
        {message && (
          <div className="alert alert-success mb-6">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 2-COLUMN BALANCED SETTINGS LAYOUT */}
        <div className="settings-layout-grid">
          {/* LEFT COLUMN: EDITABLE PROFILE & CONTACT */}
          <div className="flex flex-col gap-6">
            
            {/* Personal Information Card */}
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
              
              {/* Profile Header Strip */}
              <div className="flex items-center gap-4 pb-6 mb-6 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
                    border: '2px solid var(--neutral-200)',
                    backgroundColor: 'var(--primary-subtle)',
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                    {user?.name || 'Customer'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-confirmed" style={{ fontSize: '11px' }}>
                      Customer Account
                    </span>
                    <span className="text-xs text-muted">
                      Member since 2026
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div className="mb-6">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 750, marginBottom: '1.25rem', color: 'var(--neutral-900)' }}>
                    Personal Details
                  </h4>
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-6">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 750, marginBottom: '1.25rem', color: 'var(--neutral-900)' }}>
                    Contact Information
                  </h4>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Mobile Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <Button type="submit" variant="primary" loading={saving} style={{ padding: '0.6875rem 1.75rem', fontWeight: 700 }}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* Notification & Communication Preferences */}
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <Bell size={18} color="var(--primary-700)" />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                  Notification Preferences
                </h4>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)', display: 'block' }}>
                      Service Updates & Receipts
                    </strong>
                    <span className="text-xs text-muted">Receive invoices, status confirmations, and warranty documents via email</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailUpdates}
                    onChange={() => handlePreferenceToggle('emailUpdates')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-150)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)', display: 'block' }}>
                      Technician Arrival Alerts
                    </strong>
                    <span className="text-xs text-muted">SMS notification when technician is en-route with live ETA</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsAlerts}
                    onChange={() => handlePreferenceToggle('smsAlerts')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-150)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)', display: 'block' }}>
                      WhatsApp Direct Updates
                    </strong>
                    <span className="text-xs text-muted">Instant scheduling details and verification badges sent to WhatsApp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.technicianUpdates}
                    onChange={() => handlePreferenceToggle('technicianUpdates')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ACCOUNT OVERVIEW, SAVED ADDRESSES & SECURITY */}
          <div className="flex flex-col gap-6">
            
            {/* Account Quick Stats */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 750, marginBottom: '1.25rem', color: 'var(--neutral-900)' }}>
                Account Overview
              </h4>

              <div className="flex flex-col gap-3.5">
                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} color="var(--primary-700)" />
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold block">Total Bookings</span>
                      <strong className="text-sm">{bookingCount} Orders Placed</strong>
                    </div>
                  </div>
                  <Link to="/customer/bookings" className="btn btn-sm btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                    View
                  </Link>
                </div>

                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} color="var(--primary-700)" />
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold block">Service Addresses</span>
                      <strong className="text-sm">{addressCount} Locations Saved</strong>
                    </div>
                  </div>
                  <Link to="/customer/addresses" className="btn btn-sm btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                    Manage
                  </Link>
                </div>

                <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} color="var(--success-600)" />
                    <div>
                      <span className="text-2xs text-muted uppercase font-bold block">Verification Status</span>
                      <strong className="text-sm text-success">Verified Homeowner</strong>
                    </div>
                  </div>
                  <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Data Safety */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--white)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={18} color="var(--primary-700)" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                  Security & Privacy
                </h4>
              </div>

              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-600)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Your account is protected under TrustFix strict data governance. Private identity details and phone numbers are never shared publicly or indexed by search engines.
              </p>

              <div style={{ backgroundColor: 'var(--success-50)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(5, 150, 105, 0.25)', marginBottom: '1rem' }}>
                <span className="text-xs text-success flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={14} /> Encrypted Session Active
                </span>
                <span className="text-2xs text-muted block mt-1">
                  JWT authentication protected • Role-based access control
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
