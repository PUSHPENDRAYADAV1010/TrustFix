import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { ServiceCard } from '../../components/service/ServiceCard';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { CategoryCard } from '../../components/category/CategoryCard';
import { LoadingSpinner } from '../../components/common/FeedbackStates';
import { DEFAULT_CUSTOMER_LOCATION, POPULAR_LOCATIONS } from '../../utils/distance';
import {
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  Star,
  Award,
  CreditCard,
  CheckCircle2,
  Lock,
  Wrench,
  Calendar,
  Sparkles,
  Users,
  Shield,
  Clock,
  MapPin,
  Briefcase,
  Zap,
  Navigation,
  ThumbsUp,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_CUSTOMER_LOCATION);
  const [selectedRadius, setSelectedRadius] = useState('10');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [cats, servs, provs] = await Promise.all([
          categoryService.getCategories(),
          categoryService.getServices(),
          providerService.getFeaturedProviders()
        ]);
        setCategories(cats);
        setPopularServices(servs.slice(0, 6));
        setFeaturedProviders(provs.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}&location=${encodeURIComponent(selectedLocation.city)}&radius=${selectedRadius}`);
    } else {
      navigate(`/browse?location=${encodeURIComponent(selectedLocation.city)}&radius=${selectedRadius}`);
    }
  };

  return (
    <div className="home-page">
      {/* ============================================================
          1. HERO SECTION: SKILLED PROFESSIONALS DESERVE A PROFESSIONAL IDENTITY
          ============================================================ */}
      <section
        style={{
          background: 'linear-gradient(145deg, #071A33 0%, #0B1E3B 55%, #0E254A 100%)',
          color: 'var(--white)',
          padding: '4.5rem 0 5.5rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle geometric pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: '3.5rem',
            }}
          >
            {/* Left Column: Core Positioning & Search */}
            <div>
              {/* Trust Badge Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(37, 99, 235, 0.18)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--primary-300)',
                  marginBottom: '1.25rem',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <ShieldCheck size={16} color="var(--success-400)" />
                <span>The Professional Network for Skilled Service Workers</span>
              </div>

              {/* Exact Hero Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 4.2vw, 3.3rem)',
                  fontWeight: 800,
                  color: 'var(--white)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                Skilled Professionals Deserve a Professional Identity.
              </h1>

              {/* Supporting Subtitle */}
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                  color: 'var(--primary-200)',
                  lineHeight: 1.65,
                  marginBottom: '1.75rem',
                  maxWidth: '560px',
                }}
              >
                Discover verified electricians, plumbers, technicians, repairers and other skilled professionals — and connect with the right person for the job.
              </p>

              {/* Search Form */}
              <form
                onSubmit={handleSearch}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px',
                  boxShadow: 'var(--shadow-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '560px',
                  marginBottom: '1.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ paddingLeft: '12px', display: 'flex', alignItems: 'center', color: 'var(--neutral-400)' }}>
                  <Search size={18} strokeWidth={2.2} />
                </div>
                <input
                  type="text"
                  placeholder="Service (e.g. Electrician, AC Repair, Plumber)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: '1 1 200px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9375rem',
                    color: 'var(--neutral-800)',
                    padding: '8px 4px',
                  }}
                />

                {/* Location Quick Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--neutral-200)', paddingLeft: '8px' }}>
                  <MapPin size={16} color="var(--primary-700)" />
                  <select
                    value={selectedLocation.name}
                    onChange={(e) => {
                      const loc = POPULAR_LOCATIONS.find(l => l.name === e.target.value);
                      if (loc) setSelectedLocation(loc);
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      outline: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--neutral-700)',
                      cursor: 'pointer',
                      padding: '6px 4px'
                    }}
                  >
                    {POPULAR_LOCATIONS.map((l) => (
                      <option key={l.name} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                  <span>Search Pros</span>
                </button>
              </form>

              {/* Dual Primary CTA */}
              <div className="flex items-center gap-3 flex-wrap mb-6">
                <Link
                  to="/browse"
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary-700)',
                    borderColor: 'var(--primary-700)',
                    fontWeight: 700
                  }}
                >
                  <Search size={15} />
                  <span>Find a Professional</span>
                </Link>

                <Link
                  to="/register?role=PROVIDER"
                  className="btn btn-outline-secondary"
                  style={{
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <Briefcase size={15} />
                  <span>Join as a Skilled Professional</span>
                </Link>
              </div>

              {/* Metrics Under Hero */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  paddingTop: '1.25rem',
                  fontSize: '0.8125rem',
                  color: 'var(--primary-200)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} color="var(--success-400)" />
                  <span style={{ fontWeight: 600, color: 'var(--white)' }}>Verified Digital Identity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} color="var(--success-400)" />
                  <span style={{ fontWeight: 600, color: 'var(--white)' }}>Choose Any Provider</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: 600, color: 'var(--white)' }}>4.9/5 Certified Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column: "LinkedIn for Skilled Trades" Profile Card Demo */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  color: 'var(--neutral-900)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
                  maxWidth: '420px',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative'
                }}
              >
                {/* Profile Badge Pill */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                      color: 'var(--primary-800)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Briefcase size={13} />
                    Verified Digital Profile
                  </span>

                  <span className="badge badge-verified" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    <Check size={11} strokeWidth={3} />
                    Identity Verified
                  </span>
                </div>

                {/* Profile Head */}
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                    alt="Rajesh Kumar"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-lg)',
                      objectFit: 'cover',
                      border: '2px solid var(--primary-700)',
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                      Rajesh Kumar
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--primary-700)', fontWeight: 600, margin: '2px 0 0 0' }}>
                      Certified Master Electrician & Power Specialist
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>
                      Thane & Mumbai Metro • 8 Years Experience
                    </span>
                  </div>
                </div>

                {/* Trust Credentials Breakdown */}
                <div
                  style={{
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    marginBottom: '1rem',
                    border: '1px solid var(--neutral-200)',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div className="flex items-center gap-2 text-muted">
                    <CheckCircle2 size={13} color="var(--success-600)" />
                    <span>Govt Wireman Trade License <strong>#MH-EL-4821</strong> (Verified)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <CheckCircle2 size={13} color="var(--success-600)" />
                    <span>Identity Verified (Masked Aadhaar: <strong>XXXX-XXXX-4821</strong>)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <CheckCircle2 size={13} color="var(--success-600)" />
                    <span>320+ Completed Jobs • 4.93 Star Verified Rating</span>
                  </div>
                </div>

                {/* Skills Showcase */}
                <div className="mb-4">
                  <span className="text-2xs uppercase text-muted font-bold block mb-1.5" style={{ letterSpacing: '0.04em' }}>
                    Verified Trade Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Short Circuit Isolation', 'MCB Distribution Boxes', 'Inverter Wiring', 'BLDC Fans'].map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-800)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          border: '1px solid var(--primary-200)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <div>
                    <span className="text-2xs text-muted uppercase font-bold block">Starting Rate</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                      ₹299
                    </span>
                  </div>
                  <Link
                    to="/providers/101"
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '13px' }}
                  >
                    <span>View Profile</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. POSITIONING PILLAR: LINKEDIN FOR SKILLED TRADES
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--neutral-200)' }}>
        <div className="container">
          <div className="section-header text-center" style={{ maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
            <span className="section-subtitle">Bridging The Professional Divide</span>
            <h2 className="section-title">
              LinkedIn for White-Collar Careers. <br />
              <span style={{ color: 'var(--primary-800)' }}>TrustFix for Skilled Service Professionals.</span>
            </h2>
            <p className="section-desc">
              Skilled electricians, plumbers, and technicians possess real expertise, years of hands-on experience, and true craftsmanship.
              TrustFix gives them the digital credibility and public identity they deserve — while giving customers transparent discovery and direct choice.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Card 1 */}
            <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <UserCheck size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Digital Professional Identity
              </h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
                Every skilled worker gets a verified public profile showcasing their certifications, verified trade licenses, specialties, and full portfolio.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-100)',
                  color: 'var(--success-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Verification Built on Trust
              </h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
                Identity, certifications, and background are verified through structured checks — without exposing sensitive personal documents publicly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-100, #FEF3C7)',
                  color: 'var(--accent-800, #92400E)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <ThumbsUp size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Customer Choice, No Restrictions
              </h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
                Nearby distance is a recommendation, never an arbitrary restriction. Customers can select any provider they trust, even outside their search radius.
              </p>
            </div>

            {/* Card 4 */}
            <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Award size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Long-Term Reputation Growth
              </h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
                Every verified customer review, star rating, and completed service permanently enhances the professional’s career asset and market value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. BROWSE BY CATEGORY SECTION
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--neutral-50)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">Skilled Trades Directory</span>
            <h2 className="section-title">Explore Specialized Categories</h2>
            <p className="section-desc">From electrical diagnostics to appliance repair and panel maintenance — hire verified trade professionals.</p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading categories..." />
          ) : (
            <div className="categories-grid">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          4. LOCATION-BASED DISCOVERY EXPERIENCE
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--white)', borderTop: '1px solid var(--neutral-200)' }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: '2.5rem',
              backgroundColor: 'var(--neutral-50)',
              border: '2px solid var(--primary-200)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              <div>
                <span className="badge badge-primary mb-2">Smart Discovery Engine</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '0.75rem' }}>
                  Location & Radius Discovery — Designed for Customer Choice
                </h3>
                <p className="text-sm text-muted mb-4" style={{ lineHeight: 1.6 }}>
                  Set your location, choose a search radius, and instantly calculate distances to verified professionals.
                  <strong> Crucially, radius is a recommendation, not a restriction</strong> — if you loved working with an electrician across town, you can book them directly anytime!
                </p>

                {/* Location Workflow Steps */}
                <div className="flex flex-col gap-2.5 mb-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</div>
                    <span><strong>Customer Location</strong> → Set your neighborhood or city</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</div>
                    <span><strong>Selected Search Radius</strong> → Filter by 2 km, 5 km, 10 km, or 25+ km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
                    <span><strong>Distance Calculation</strong> → Accurate geodesic distance displayed on every card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--success-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>4</div>
                    <span><strong>Customer Choice</strong> → Hire any provider you prefer, inside or outside the radius</span>
                  </div>
                </div>

                <Link
                  to="/browse"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
                >
                  <Navigation size={15} />
                  <span>Launch Location Discovery & Map</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* Visual Radius Interactive Preview */}
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  border: '1px solid var(--neutral-200)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} color="var(--primary-700)" />
                    <span className="font-bold text-sm">Active Location: {selectedLocation.city}</span>
                  </div>
                  <span className="badge badge-success">Live Distance Active</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Search Radius:</span>
                    <span className="font-bold text-primary">{selectedRadius} km</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="2"
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div className="flex justify-between text-2xs text-muted">
                    <span>2 km (Hyperlocal)</span>
                    <span>10 km</span>
                    <span>50 km (Metro)</span>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(37, 99, 235, 0.06)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '11px',
                      color: 'var(--primary-900)',
                      marginTop: '0.5rem',
                      lineHeight: 1.5
                    }}
                  >
                    💡 <strong>Tip:</strong> Providers within {selectedRadius} km are highlighted as recommended, but you can always select any specialist outside this radius!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. POPULAR SERVICES SECTION
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--neutral-50)' }}>
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <span className="section-subtitle">Top Booked Tasks</span>
              <h2 className="section-title" style={{ margin: 0 }}>Popular Services</h2>
            </div>
            <Link to="/services" className="btn btn-secondary">
              <span>View All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading services..." />
          ) : (
            <div className="services-grid">
              {popularServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          6. TOP-RATED PROFESSIONALS SECTION
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">Verified Network</span>
            <h2 className="section-title">Top-Rated Professionals</h2>
            <p className="section-desc">Handpicked, background-verified trade experts ready for your doorstep.</p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading verified providers..." />
          ) : (
            <div className="providers-grid">
              {featuredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  customerLocation={selectedLocation}
                  maxRadius={selectedRadius}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/browse" className="btn btn-lg btn-primary">
              <span>Explore All Verified Providers & Map</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. HOW TRUSTFIX WORKS - 4 SIMPLE STEPS
          ============================================================ */}
      <section id="how-it-works" className="section-py" style={{ backgroundColor: 'var(--neutral-100)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">Simple Transparent Flow</span>
            <h2 className="section-title">How TrustFix Works</h2>
            <p className="section-desc">Experience seamless service discovery and certified doorstep repairs in 4 steps.</p>
          </div>

          <div className="step-workflow-container">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-icon-badge">
                <Search size={22} strokeWidth={2.4} />
              </div>
              <span className="text-2xs font-bold text-primary mb-1 uppercase" style={{ letterSpacing: '0.08em' }}>Step 01</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Search Services</h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                Browse electricians, plumbers, AC technicians, and repair specialists with transparent rate cards.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-icon-badge">
                <Navigation size={22} strokeWidth={2.4} />
              </div>
              <span className="text-2xs font-bold text-primary mb-1 uppercase" style={{ letterSpacing: '0.08em' }}>Step 02</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Compare & Choose</h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                Check distance, verified credentials, rating history, and select any specific specialist you prefer.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-icon-badge">
                <Calendar size={22} strokeWidth={2.4} />
              </div>
              <span className="text-2xs font-bold text-primary mb-1 uppercase" style={{ letterSpacing: '0.08em' }}>Step 03</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Schedule Appointment</h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                Pick your preferred date and time slot with ₹0 advance deposit and instant booking confirmation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card step-success">
              <div className="step-icon-badge">
                <CheckCircle2 size={22} strokeWidth={2.4} />
              </div>
              <span className="text-2xs font-bold text-success mb-1 uppercase" style={{ letterSpacing: '0.08em' }}>Step 04</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Certified Execution</h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                The professional completes the service with standard checklist and 30-day TrustFix post-service warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          8. DUAL BENEFITS: FOR CUSTOMERS & FOR PROFESSIONALS
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">Win-Win Ecosystem</span>
            <h2 className="section-title">Built for Customers and Skilled Professionals Alike</h2>
            <p className="section-desc">Empowering customers with trust and choice, while empowering skilled workers with professional dignity.</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Left Card: Customer Benefits */}
            <div
              className="card"
              style={{
                padding: '2.25rem',
                border: '1px solid var(--neutral-200)',
                backgroundColor: 'var(--neutral-50)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-700)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                  For Homeowners & Customers
                </h3>
              </div>

              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>100% Background & Trade Verified:</strong> Every provider undergoes government ID checks and trade license verification.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Freedom of Provider Choice:</strong> You decide who comes into your home. Select by reviews, distance, or past positive experience.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Transparent Upfront Pricing:</strong> Fixed standard rates, no surprise billing, and zero advance deposit before service.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>30-Day Workmanship Warranty:</strong> If anything isn't right, TrustFix ensures complete resolution at no extra charge.
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/browse" className="btn btn-primary btn-block">
                  <span>Browse Verified Providers</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Card: Skilled Professional Benefits */}
            <div
              className="card"
              style={{
                padding: '2.25rem',
                border: '1px solid var(--neutral-200)',
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--success-600)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Briefcase size={20} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                  For Skilled Service Professionals
                </h3>
              </div>

              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>A Real Digital Professional Identity:</strong> Showcase your trade skills, certifications, and years of craftsmanship on a public URL.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Direct Customer Reputation:</strong> Collect authentic customer reviews that you own and build a long-term professional asset.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Set Your Own Pricing & Availability:</strong> Control your rate cards, service radiuses, and working hours flexibly.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Verified Professional Badge:</strong> Stand out from unverified casual workers with a trusted digital shield badge.
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/register?role=PROVIDER" className="btn btn-success btn-block">
                  <span>Create Your Professional Profile</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          9. FINAL CALL TO ACTION
          ============================================================ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #071A33 0%, #0B1E3B 60%, #1E3A8A 100%)',
          color: 'var(--white)',
          padding: '4.5rem 0',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
            Ready to Experience the New Standard in Home Services?
          </h2>
          <p style={{ color: 'var(--primary-200)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Whether you need emergency repairs or want to build your digital trade profile — TrustFix connects you with trust, dignity, and verified expertise.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/browse"
              className="btn btn-primary"
              style={{
                padding: '0.85rem 1.8rem',
                backgroundColor: 'var(--primary-600)',
                fontWeight: 700,
                fontSize: '1rem'
              }}
            >
              <span>Find a Professional Now</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/register?role=PROVIDER"
              className="btn btn-secondary"
              style={{
                padding: '0.85rem 1.8rem',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              <span>Register as a Specialist</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
