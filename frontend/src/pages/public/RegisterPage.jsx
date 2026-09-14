import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidEmail, isValidPhone } from '../../utils/validators';
import { ShieldCheck, User, Wrench, AlertCircle, CheckCircle2, ArrowRight, Info } from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    service: 'Electrical',
    serviceArea: 'Mumbai',
  });

  const [categories, setCategories] = useState([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    categoryService.getCategories().then(setCategories);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service & Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.user?.role === 'PROVIDER') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* LEFT 45% MARKETING PANEL */}
      <div className="auth-split-left">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-2">
          <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
            <ShieldCheck size={20} strokeWidth={2.4} />
          </div>
          <span style={{ color: 'var(--white)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            TrustFix
          </span>
        </div>

        {/* Centered Pitch & Benefits */}
        <div className="auth-split-left-content">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--primary-300)',
              marginBottom: '1.25rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <ShieldCheck size={14} color="var(--success-400)" />
            <span>Join the Verified Network</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.85rem, 3.2vw, 2.4rem)',
              fontWeight: 800,
              color: 'var(--white)',
              lineHeight: 1.2,
              marginBottom: '1rem',
              letterSpacing: '-0.025em',
            }}
          >
            Join TrustFix as a trusted customer or professional.
          </h2>

          <p style={{ color: 'var(--primary-200)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Experience verified doorstep maintenance, upfront fair pricing, and zero advance payment protection.
          </p>

          {/* Benefits Checkmarks */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--white)' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={15} color="var(--success-400)" />
              </div>
              <span style={{ fontWeight: 600 }}>No unnecessary advance payment</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--white)' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={15} color="var(--success-400)" />
              </div>
              <span style={{ fontWeight: 600 }}>Verified professionals & background checks</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--white)' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={15} color="var(--success-400)" />
              </div>
              <span style={{ fontWeight: 600 }}>Transparent pricing & genuine invoices</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--white)' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={15} color="var(--success-400)" />
              </div>
              <span style={{ fontWeight: 600 }}>30-Day service guarantee</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-split-left-footer">
          © 2026 TrustFix. All rights reserved.
        </div>
      </div>

      {/* RIGHT 55% REGISTRATION FORM */}
      <div className="auth-split-right">
        <div className="auth-card-container">
          
          <div className="card" style={{ padding: '2.25rem 2rem', backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
            <div className="mb-5">
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '0.35rem' }}>
                Create your account
              </h2>
              <p className="text-sm text-muted">
                Choose your role and get started with TrustFix today.
              </p>
            </div>

            {authError && (
              <div className="alert alert-danger mb-4">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="form-group mb-5">
              <label className="form-label">I want to register as:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${formData.role === 'CUSTOMER' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CUSTOMER' }))}
                  style={{ padding: '0.625rem' }}
                >
                  <User size={15} />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  className={`btn ${formData.role === 'PROVIDER' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'PROVIDER' }))}
                  style={{ padding: '0.625rem' }}
                >
                  <Wrench size={15} />
                  <span>Service Provider</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleRegister}>
              <Input
                label="Full Name / Business Name"
                name="name"
                placeholder="e.g. Aarav Sharma or Precision Services"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+91 98201 00000"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              {/* Extra fields if Provider */}
              {formData.role === 'PROVIDER' && (
                <div
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-primary uppercase" style={{ letterSpacing: '0.04em' }}>
                    <Briefcase size={14} />
                    <span>Professional Trade & Verification Details</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group mb-0">
                      <label className="form-label text-xs font-semibold">Primary Trade</label>
                      <select
                        name="service"
                        className="form-control"
                        value={formData.service}
                        onChange={handleChange}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label text-xs font-semibold">Years of Experience</label>
                      <select
                        name="experience"
                        className="form-control"
                        defaultValue="5"
                      >
                        <option value="1">1-2 Years</option>
                        <option value="3">3-5 Years</option>
                        <option value="6">6-10 Years</option>
                        <option value="10">10+ Years (Master)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label text-xs font-semibold">Primary Service Coverage Area</label>
                    <input
                      type="text"
                      name="serviceArea"
                      className="form-control"
                      placeholder="e.g. Thane, Mulund, Mumbai Western Suburbs"
                      value={formData.serviceArea}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label text-xs font-semibold">Supporting Verification Credential</label>
                    <select className="form-control" defaultValue="trade_license">
                      <option value="trade_license">Government Trade Wireman / Plumber License</option>
                      <option value="iti_cert">ITI / Polytechnic Vocational Certificate</option>
                      <option value="govt_id">Government Photo ID (Aadhaar/Voter Card)</option>
                    </select>
                  </div>

                  {/* Privacy & Trust Notice */}
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: 'var(--success-900)',
                      lineHeight: 1.45,
                      marginTop: '0.75rem',
                    }}
                  >
                    🔒 <strong>Identity Privacy Guarantee:</strong> Real Aadhaar, PAN, and sensitive numbers are never displayed publicly. Only your verified trade badge and certifications are shown on your professional profile.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              </div>

              {/* Terms checkbox */}
              <div className="form-group mb-4">
                <label className="flex items-start gap-2 text-xs text-muted cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    I agree to the <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Privacy Policy</span>.
                  </span>
                </label>
                {errors.terms && <div className="form-error">{errors.terms}</div>}
              </div>

              <Button
                type="submit"
                variant="primary"
                block
                loading={loading}
                style={{ padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 700 }}
              >
                <span>{formData.role === 'PROVIDER' ? 'Register As Service Provider' : 'Create Account'}</span>
                <ArrowRight size={15} />
              </Button>
            </form>

            <div className="text-center mt-6 text-sm text-muted pt-4 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary-800)' }}>
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
