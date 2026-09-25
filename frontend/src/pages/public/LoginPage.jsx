import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidEmail } from '../../utils/validators';
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, X, Lock } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : null;

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.user?.role === 'PROVIDER') {
        navigate(from || '/provider/dashboard');
      } else if (res.user?.role === 'ADMIN') {
        navigate(from || '/admin/dashboard');
      } else {
        navigate(from || '/customer/dashboard');
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotEmail && isValidEmail(forgotEmail)) {
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotSuccess(false);
        setForgotEmail('');
      }, 2000);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* LEFT 46% MARKETING PANEL */}
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
            <span>Verified Professionals</span>
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
            Trusted professionals.
            <br />
            <span style={{ color: 'var(--primary-300)' }}>Right at your doorstep.</span>
          </h2>

          <p style={{ color: 'var(--primary-200)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2.25rem' }}>
            Sign in to book doorstep services, track your repair technician in real-time, or manage your service requests.
          </p>

          {/* Trust Benefits Checkmarks */}
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
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Verified Professionals (100% Background Checked)</span>
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
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Transparent Pricing (₹0 Advance Deposit)</span>
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
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>30-Day Workmanship Warranty</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-split-left-footer">
          © 2026 TrustFix. All rights reserved.
        </div>
      </div>

      {/* RIGHT 54% LOGIN FORM PANEL */}
      <div className="auth-split-right">
        <div className="auth-card-container">
          
          <div className="card" style={{ padding: '2.75rem 2.25rem', backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--neutral-200)' }}>
            <div className="mb-6">
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '0.35rem' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', margin: 0 }}>
                Sign in to your TrustFix account.
              </p>
            </div>

            {authError && (
              <div className="alert alert-danger mb-4">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. customer@trustfix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />

              <div className="flex items-center justify-between mb-5">
                <label className="flex items-center gap-2 text-xs text-muted cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="btn-link text-xs"
                  style={{ background: 'none', border: 'none', color: 'var(--primary-750)', cursor: 'pointer', fontWeight: 650 }}
                  onClick={() => setForgotModalOpen(true)}
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                block
                loading={loading}
                style={{ padding: '0.8125rem', fontSize: '1rem', fontWeight: 700 }}
              >
                <span>Sign In</span>
                <ArrowRight size={16} />
              </Button>
            </form>

            {/* Bottom Register Link */}
            <div className="text-center mt-6 text-sm text-muted pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary-800)' }}>
                Register
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="modal-backdrop" onClick={() => setForgotModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 style={{ fontWeight: 750, margin: 0 }}>Reset Password</h4>
              <button className="btn-close" onClick={() => setForgotModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleForgotSubmit}>
              <div className="modal-body">
                {forgotSuccess ? (
                  <div className="alert alert-success">
                    <CheckCircle2 size={18} />
                    <span>Password reset link sent to your email!</span>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: '1.25rem' }}>
                      Enter your account email and we'll send a secure password reset link.
                    </p>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setForgotModalOpen(false)}>
                  Cancel
                </button>
                {!forgotSuccess && (
                  <button type="submit" className="btn btn-primary">
                    Send Reset Link
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
