import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { providerService } from '../../services/providerService';
import { locationService } from '../../services/locationService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { MapView } from '../../components/map/MapView';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';
import { ShieldCheck, CheckCircle2, AlertCircle, MapPin, Wrench } from 'lucide-react';

export const ProviderProfilePage = () => {
  const { user, providerProfile, updateProvider } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    service: 'Electrical',
    experience: 5,
    bio: '',
    serviceArea: 'Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    serviceRadiusKm: 25,
  });

  const [providerLocation, setProviderLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (providerProfile) {
      setFormData({
        businessName: providerProfile.companyName || providerProfile.businessName || '',
        service: providerProfile.service || 'Electrical',
        experience: providerProfile.experience || 5,
        bio: providerProfile.bio || '',
        serviceArea: providerProfile.serviceArea || 'Mumbai',
        city: providerProfile.city || 'Mumbai',
        state: providerProfile.state || 'Maharashtra',
        serviceRadiusKm: providerProfile.serviceRadiusKm || 25,
      });

      locationService.getLocationByProviderId(providerProfile.id).then(setProviderLocation);
    }
  }, [providerProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!providerProfile?.id) return;
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await providerService.updateProviderProfile(providerProfile.id, formData);
      updateProvider(updated);
      setMessage('Provider profile and service area saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update provider profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Provider Profile & Area"
        subtitle="Manage your business information, trade certifications, and service area radius."
      />

      <div className="dashboard-content">
        
        <div className="provider-profile-grid">
          {/* LEFT: Profile Form */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
            
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
              {/* Business Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                    Business & Professional Details
                  </h4>
                  <VerificationBadge status={providerProfile?.verificationStatus || 'PENDING'} />
                </div>

                <Input
                  label="Registered Company / Brand Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Electrical Solutions"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Primary Trade Specialization"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Years of Experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Professional Bio / Overview</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describe your background, skills, and commitment to quality..."
                  />
                </div>
              </div>

              {/* Service Area */}
              <div className="mb-6 pt-4 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                  Service Coverage & Area
                </h4>

                <Input
                  label="Service Localities / Zones"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, Andheri, Bandra, Thane"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Operating City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Service Radius (KM)"
                    name="serviceRadiusKm"
                    type="number"
                    value={formData.serviceRadiusKm}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                <Button type="submit" variant="primary" loading={saving} style={{ padding: '0.625rem 1.5rem', fontWeight: 700 }}>
                  Save Profile Settings
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT: Profile Preview Card & Service Radius Map */}
          <div className="flex flex-col gap-6">
            
            {/* Preview Card */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Public Profile Card Preview
              </h4>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={providerProfile?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=120&auto=format&fit=crop&q=80'}
                  alt={formData.businessName}
                  style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                    {formData.businessName || user?.name}
                  </h5>
                  <span className="text-xs text-primary font-semibold">{formData.service} Specialist</span>
                </div>
              </div>

              <p className="text-xs text-muted mb-3" style={{ lineHeight: 1.5 }}>
                {formData.bio || 'Verified doorstep service professional.'}
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                <span>Experience: <strong>{formData.experience} Years</strong></span>
                <span>Radius: <strong>{formData.serviceRadiusKm} km</strong></span>
              </div>
            </div>

            {/* Service Radius Map Preview */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Operational Map Radius
              </h4>
              <p className="text-xs text-muted mb-3">
                Active coverage in <strong>{formData.city}</strong> (~{formData.serviceRadiusKm} km)
              </p>

              <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
                <MapView
                  locations={providerLocation ? [providerLocation] : []}
                  selectedProviderId={providerProfile?.id}
                  height="240px"
                  showServiceRadius={true}
                  interactive={true}
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
