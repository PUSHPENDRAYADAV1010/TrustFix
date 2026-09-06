import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { RatingStars } from '../../components/common/RatingStars';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { LoadingSpinner, ErrorMessage } from '../../components/common/FeedbackStates';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import { resolveServiceImage } from '../../utils/imageResolver';
import { ShieldCheck, Clock, CheckCircle2, Info, ArrowRight, ChevronRight, Calendar, UserCheck, Shield } from 'lucide-react';

export const ServiceDetailsPage = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [matchingProviders, setMatchingProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return formatLocalDate(today);
  });
  const [selectedTime, setSelectedTime] = useState('10:00 AM - 12:00 PM');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const serv = await categoryService.getServiceById(serviceId);
        setService(serv);

        // Fetch providers for this category
        const provs = await providerService.getProviders({
          category: (serv.categoryName || '').toLowerCase()
        });
        setMatchingProviders(provs);
        if (provs.length > 0) {
          setSelectedProviderId(provs[0].id);
        }
      } catch (err) {
        setError(err.message || 'Service not found');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleBookSubmit = (e) => {
    e.preventDefault();
    let url = `/customer/book?serviceId=${service.id}`;
    if (selectedProviderId) {
      url += `&providerId=${selectedProviderId}`;
    }
    if (selectedDate) {
      url += `&date=${selectedDate}`;
    }
    navigate(url);
  };

  if (loading) return <LoadingSpinner message="Loading service details..." />;
  if (error || !service) {
    return (
      <div className="container section-py">
        <ErrorMessage message={error || 'Service not found'} onRetry={() => navigate('/services')} />
      </div>
    );
  }

  return (
    <div className="service-details-page" style={{ padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/" style={{ color: 'var(--neutral-500)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/services" style={{ color: 'var(--neutral-500)' }}>Services</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--neutral-800)', fontWeight: 600 }}>{service.name}</span>
        </nav>

        {/* 2-Column Main Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 1fr)',
            gap: '2.5rem',
            alignItems: 'start',
            marginBottom: '3.5rem',
          }}
          className="service-details-grid"
        >
          {/* LEFT: Service Information */}
          <div>
            {/* Hero Image */}
            <div className="card mb-6" style={{ overflow: 'hidden', height: '340px' }}>
              <img
                src={resolveServiceImage(service)}
                alt={service.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Badges & Title */}
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-verified">
                <ShieldCheck size={13} strokeWidth={2.4} />
                <span>Verified Quality Standard</span>
              </span>
              <span className="badge badge-confirmed">
                {service.categoryName || 'Home Service'}
              </span>
            </div>

            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              {service.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <RatingStars rating={service.rating || 4.9} reviewCount={service.reviewCount || 38} size="md" />
              <span className="text-sm text-muted flex items-center gap-1">
                <Clock size={15} color="var(--neutral-400)" />
                <span>Est. Duration: ~{service.durationInMinutes || service.durationMinutes || 60} mins</span>
              </span>
            </div>

            {/* Description */}
            <div className="card mb-6" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Service Overview</h4>
              <p style={{ color: 'var(--neutral-700)', lineHeight: 1.65, fontSize: '0.9375rem' }}>
                {service.description}
              </p>
            </div>

            {/* Inclusions & Exclusions */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              {/* Included */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--success-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="var(--success-600)" />
                  <span>What's Included</span>
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(service.included || [
                    "Doorstep visit & complete diagnostic check",
                    "Safety inspection with calibrated tools",
                    "Certified repair execution by verified pro",
                    "30-day TrustFix workmanship warranty"
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted" style={{ lineHeight: 1.5 }}>
                      <CheckCircle2 size={14} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Excluded */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neutral-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={18} color="var(--primary-700)" />
                  <span>What's Not Included</span>
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(service.excluded || [
                    "Replacement hardware spare parts (billed on actuals)",
                    "Concealed civil/masonry structural drilling"
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted" style={{ lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--neutral-400)', fontWeight: 700 }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Matching Verified Specialists for this Service */}
            {matchingProviders.length > 0 && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                      Verified Specialists for {service.name}
                    </h3>
                    <p className="text-xs text-muted">Directly book verified experts specializing in this trade.</p>
                  </div>
                  <Link to={`/browse?category=${encodeURIComponent((service.categoryName || '').toLowerCase())}`} className="btn btn-sm btn-secondary">
                    <span>View on Map</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="flex flex-col gap-4">
                  {matchingProviders.slice(0, 3).map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Booking Card */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              className="card"
              style={{
                padding: '1.75rem',
                border: '1px solid var(--primary-200)',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: 'var(--white)',
              }}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <div>
                  <span className="text-xs text-muted block uppercase font-bold" style={{ letterSpacing: '0.04em' }}>Starting Base Price</span>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                    {formatCurrency(service.basePrice || service.price || service.startingPrice || 499)}
                  </span>
                </div>
                <span className="badge badge-verified" style={{ fontSize: '11px', padding: '4px 8px' }}>
                  ₹0 Advance
                </span>
              </div>

              <form onSubmit={handleBookSubmit} className="flex flex-col gap-4">
                {/* Select Provider */}
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '12px' }}>
                    <UserCheck size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Select Service Provider:
                  </label>
                  <select
                    className="form-control"
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                  >
                    <option value="">Any Available Verified Specialist (Auto-Assign)</option>
                    {matchingProviders.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.companyName || p.service}) • ★{p.rating}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Date */}
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '12px' }}>
                    <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Preferred Date:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={formatLocalDate(new Date())}
                    required
                  />
                </div>

                {/* Preferred Time Slot */}
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '12px' }}>
                    <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    Preferred Time Slot:
                  </label>
                  <select
                    className="form-control"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Midday)</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                    <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Late Evening)</option>
                  </select>
                </div>

                {/* Trust Guarantee Highlights */}
                <div
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-100)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem',
                    fontSize: '11px',
                    color: 'var(--primary-900)',
                  }}
                >
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    <ShieldCheck size={14} color="var(--success-600)" />
                    <span>TrustFix Booking Guarantee</span>
                  </div>
                  <p className="text-2xs text-muted mb-0" style={{ lineHeight: 1.4 }}>
                    • Pay ₹0 now — payment due after service completion.<br />
                    • Background-checked technician visits on time.<br />
                    • 30-day post-service warranty included.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ padding: '0.875rem', fontSize: '1rem', fontWeight: 700 }}
                >
                  <span>Book Service Now</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
