import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidEmail, isValidPhone } from '../../utils/validators';
import {
  ShieldCheck,
  User,
  Wrench,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Lock,
  Sparkles,
  Award
} from 'lucide-react';

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
      {/* LEFT 46% MARKETING & TRUST PANEL */}
      <div className="auth-split-left">
        {/* Brand Logo Header */}
        <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
          <div className="brand-icon" style={{ width: '40px', height: '40px' }}>
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>
          <span style={{ color: 'var(--white)', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            TrustFix
          </span>
        </Link>

        {/* Centered Pitch & Benefits */}
        <div className="auth-split-left-content">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(30, 91, 181, 0.22)',
              border: '1px solid rgba(96, 165, 250, 0.35)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              color: 'var(--primary-300)',
              marginBottom: '1.5rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <ShieldCheck size={15} color="var(--success-400)" />
            <span>Join the Verified Network</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.6rem)',
              fontWeight: 800,
              color: 'var(--white)',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              letterSpacing: '-0.025em',
            }}
          >
            {formData.role === 'PROVIDER'
              ? 'Build your professional trade identity.'
              : 'Join TrustFix as a trusted customer.'}
          </h2>

          <p style={{ color: 'var(--primary-200)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2.25rem' }}>
            {formData.role === 'PROVIDER'
              ? 'Showcase verified licenses, collect permanent customer ratings, and establish your public trade profile.'
              : 'Experience verified doorstep maintenance, upfront fair pricing, and zero advance payment protection.'}
          </p>

          {/* Benefits Checkmarks */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--white)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 150, 105, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={16} color="var(--success-400)" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                {formData.role === 'PROVIDER' ? 'Direct customer bookings without middleman commissions' : 'No unnecessary advance payment required'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--white)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 150, 105, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={16} color="var(--success-400)" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                {formData.role === 'PROVIDER' ? 'Official verified trade badge on public profile' : '100% Verified professionals & background checks'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--white)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 150, 105, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={16} color="var(--success-400)" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                Transparent pricing & 30-day workmanship warranty
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-split-left-footer">
          © 2026 TrustFix. All rights reserved.
        </div>
      </div>

      {/* RIGHT 54% REGISTRATION FORM PANEL */}
      <div className="auth-split-right">
        <div className="auth-card-container">
          
          <div className="card" style={{ padding: '2.5rem 2.25rem', backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--neutral-200)' }}>
            <div className="mb-5">
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '0.35rem' }}>
                Create your account
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', margin: 0 }}>
                Choose your role to get started with TrustFix today.
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
                  style={{
                    padding: '0.75rem',
                    flexDirection: 'row',
                    gap: '8px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <User size={18} />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  className={`btn ${formData.role === 'PROVIDER' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'PROVIDER' }))}
                  style={{
                    padding: '0.75rem',
                    flexDirection: 'row',
                    gap: '8px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Wrench size={18} />
                  <span>Service Provider</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleRegister}>
              <Input
                label={formData.role === 'PROVIDER' ? "Full Name / Business Title" : "Full Name"}
                name="name"
                placeholder={formData.role === 'PROVIDER' ? "e.g. Rajesh Kumar or Apex Electricals" : "e.g. Aarav Sharma"}
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
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              {formData.role === 'PROVIDER' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Trade</label>
                    <select
                      className="form-control"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary City / Hub</label>
                    <select
                      className="form-control"
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleChange}
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Thane">Thane</option>
                      <option value="Navi Mumbai">Navi Mumbai</option>
                      <option value="Pune">Pune</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

              {/* Terms Checkbox */}
              <div className="form-group mb-5">
                <label className="flex items-start gap-2.5 text-xs text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    I agree to the <span style={{ color: 'var(--primary-750)', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: 'var(--primary-750)', fontWeight: 600 }}>Privacy Policy</span>.
                  </span>
                </label>
                {errors.terms && <div className="form-error">{errors.terms}</div>}
              </div>

              <Button
                type="submit"
                variant="primary"
                block
                loading={loading}
                style={{ padding: '0.8125rem', fontSize: '1rem', fontWeight: 700 }}
              >
                <span>Create Account</span>
                <ArrowRight size={16} />
              </Button>
            </form>

            <div className="text-center mt-5 text-sm text-muted pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
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
