import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Menu, X, User, LogOut, Check, Search, ArrowRight } from 'lucide-react';

export const PublicNavbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'PROVIDER') return '/provider/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/customer/dashboard';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const handleHowItWorksClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Left: Brand Logo with Shield */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>
          <span>TrustFix</span>
          <span className="brand-badge">
            <Check size={11} strokeWidth={3} />
            Verified Pros
          </span>
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Find Professionals
              </NavLink>
            </li>
            <li>
              <a href="/#how-it-works" onClick={handleHowItWorksClick} className="nav-link">
                How It Works
              </a>
            </li>
          </ul>
        </nav>

        {/* Right: Search / Auth / Profile Actions */}
        <div className="nav-actions">
          {/* Quick Search Input */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="text"
                className="form-control"
                style={{ height: '38px', fontSize: '14px', width: '190px', padding: '6px 12px' }}
                placeholder="Search trade or pro..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                style={{ padding: '6px 10px' }}
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={15} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ padding: '7px 11px', borderRadius: 'var(--radius-md)' }}
              onClick={() => setSearchOpen(true)}
              title="Search services and professionals"
              aria-label="Search"
            >
              <Search size={15} />
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link to={getDashboardPath()} className="btn btn-sm btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <User size={15} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary" title="Log out">
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-secondary" style={{ padding: '0.5rem 1.125rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <NavLink
            to="/"
            className="nav-link font-semibold"
            onClick={() => setMobileMenuOpen(false)}
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/services"
            className="nav-link font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </NavLink>
          <NavLink
            to="/browse"
            className="nav-link font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Professionals
          </NavLink>
          <a
            href="/#how-it-works"
            className="nav-link font-semibold"
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleHowItWorksClick(e);
            }}
          >
            How It Works
          </a>

          <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '1.5rem', marginTop: 'auto' }}>
            {isAuthenticated ? (
              <div className="flex flex-col gap-2.5">
                <Link
                  to={getDashboardPath()}
                  className="btn btn-primary btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="btn btn-secondary btn-block"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="btn btn-secondary btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
