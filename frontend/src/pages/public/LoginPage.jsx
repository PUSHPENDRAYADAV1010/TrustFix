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
            <span>Verified Professionals</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--white)',
              lineHeight: 1.2,
              marginBottom: '1rem',
              letterSpacing: '-0.025em',
            }}
          >
            Trusted professionals.
            <br />
            <span style={{ color: 'var(--primary-400)' }}>Right at your doorstep.</span>
          </h2>

          <p style={{ color: 'var(--primary-200)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Sign in to book doorstep services, track your repair technician in real-time, or manage your service requests.
          </p>

          {/* Trust Benefits Checkmarks */}
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
              <span style={{ fontWeight: 600 }}>Verified Professionals (100% Background Checked)</span>
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
              <span style={{ fontWeight: 600 }}>Transparent Pricing (₹0 Advance Deposit)</span>
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
              <span style={{ fontWeight: 600 }}>30-Day Workmanship Warranty</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-split-left-footer">
          © 2026 TrustFix. All rights reserved.
        </div>
      </div>

      {/* RIGHT 55% LOGIN FORM PANEL */}
      <div className="auth-split-right">
        <div className="auth-card-container">
          
          <div className="card" style={{ padding: '2.5rem 2rem', backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
            <div className="mb-6">
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '0.35rem' }}>
                Welcome back
              </h2>
              <p className="text-sm text-muted">
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
                <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer font-medium">
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
                  style={{ background: 'none', border: 'none', color: 'var(--primary-700)', cursor: 'pointer', fontWeight: 600 }}
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
                style={{ padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 700 }}
              >
                <span>Sign In</span>
                <ArrowRight size={15} />
              </Button>
            </form>

            {/* Quick Demo Logins Bar */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--neutral-300)' }}>
              <span className="text-2xs uppercase text-muted font-bold block mb-2" style={{ letterSpacing: '0.05em' }}>
                Quick 1-Click Demo Accounts (Select & Click Sign In)
              </span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => { setEmail('customer@trustfix.com'); setPassword('Test@123'); }}
                  className="btn btn-sm btn-light flex items-center justify-between text-xs"
                  style={{ padding: '6px 12px', textAlign: 'left' }}
                >
                  <span>👤 Customer: <strong>Aarav Sharma</strong></span>
                  <span className="text-2xs text-muted">customer@trustfix.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('rajesh@trustfix.com'); setPassword('Test@123'); }}
                  className="btn btn-sm btn-light flex items-center justify-between text-xs"
                  style={{ padding: '6px 12px', textAlign: 'left', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-800)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <span>⚡ Provider: <strong>Rajesh Kumar (Electrician)</strong></span>
                  <span className="text-2xs text-muted">rajesh@trustfix.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@trustfix.com'); setPassword('Admin@123'); }}
                  className="btn btn-sm btn-light flex items-center justify-between text-xs"
                  style={{ padding: '6px 12px', textAlign: 'left', backgroundColor: 'rgba(30, 58, 138, 0.08)', color: 'var(--primary-800)', borderColor: 'rgba(30, 58, 138, 0.2)' }}
                >
                  <span>🛡️ Platform Admin: <strong>Officer</strong></span>
                  <span className="text-2xs text-muted">admin@trustfix.com</span>
                </button>
              </div>
            </div>

            {/* Bottom Register Link */}
            <div className="text-center mt-5 text-sm text-muted pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
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
              <h4 className="font-bold">Reset Password</h4>
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
                    <p className="text-sm text-muted mb-4">
                      Enter your registered TrustFix email address and we will send you a password recovery link.
                    </p>
                    <Input
                      label="Registered Email"
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
                <Button variant="secondary" onClick={() => setForgotModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={forgotSuccess}>
                  Send Reset Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
