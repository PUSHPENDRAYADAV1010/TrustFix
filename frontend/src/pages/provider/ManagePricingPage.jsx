import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { providerService } from '../../services/providerService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';
import { ShieldCheck, CheckCircle2, AlertCircle, Info, DollarSign } from 'lucide-react';

export const ManagePricingPage = () => {
  const { providerProfile, updateProvider } = useAuth();
  const [startingPrice, setStartingPrice] = useState(providerProfile?.startingPrice || 399);
  const [hourlyRate, setHourlyRate] = useState(providerProfile?.hourlyRate || 350);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (providerProfile) {
      setStartingPrice(providerProfile.startingPrice || 399);
      setHourlyRate(providerProfile.hourlyRate || 350);
    }
  }, [providerProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!providerProfile?.id) return;
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await providerService.updateProviderProfile(providerProfile.id, {
        startingPrice: parseFloat(startingPrice) || 399,
        hourlyRate: parseFloat(hourlyRate) || 350,
      });
      updateProvider(updated);
      setMessage('Pricing configuration updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Manage Pricing"
        subtitle="Configure your base visit rates and hourly diagnostic fees."
      />

      <div className="dashboard-content">
        <div className="pricing-page-grid">
          {/* Pricing Form */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--neutral-900)' }}>
              Standard Labor & Visit Rates
            </h4>

            {message && (
              <div className="alert alert-success mb-4">
                <CheckCircle2 size={18} />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mb-4">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group mb-4">
                <Input
                  label="Base Doorstep Visit & Inspection Fee (₹)"
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  helperText="Covers technician travel, diagnosis, and initial assessment."
                  required
                />
              </div>

              <div className="form-group mb-6">
                <Input
                  label="Standard Hourly Labor Rate (₹/hour)"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  helperText="Applies for complex repairs extending beyond basic diagnosis."
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                <Button type="submit" variant="primary" loading={saving} style={{ padding: '0.625rem 1.5rem', fontWeight: 700 }}>
                  Save Pricing Rates
                </Button>
              </div>
            </form>
          </div>

          {/* Pricing Guidelines Sidebar */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--neutral-900)' }}>
              TrustFix Pricing Guidelines
            </h4>

            <div className="flex flex-col gap-3 text-xs text-muted">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Transparent Upfront Pricing:</strong> Customers book based on the visit fee listed on your public profile.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>No Hidden Surcharges:</strong> Any extra materials or replacement parts must be approved with the homeowner prior to installation.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Info size={16} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>₹0 Advance Policy:</strong> Never request advance deposits from customers before arriving on site.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
