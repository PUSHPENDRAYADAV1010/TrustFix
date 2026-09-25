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
  CheckCircle2,
  Lock,
  Wrench,
  Calendar,
  Sparkles,
  Users,
  Clock,
  MapPin,
  Briefcase,
  Zap,
  Navigation,
  ThumbsUp,
  UserCheck,
  Shield,
  Layers,
  PhoneCall,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_CUSTOMER_LOCATION);
  const [selectedRadius, setSelectedRadius] = useState('25');
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
          1. HERO SECTION: PROFESSIONAL IDENTITY + MARKETPLACE
          ============================================================ */}
      <section
        style={{
          background: 'linear-gradient(150deg, #07152A 0%, #0B1E3B 50%, #102B54 100%)',
          color: 'var(--white)',
          padding: '4.5rem 0 5.5rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle patterned background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.65,
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              alignItems: 'center',
              gap: '3.5rem',
            }}
          >
            {/* Left Column: Hero Text, Search & CTAs */}
            <div>
              {/* Trust Badge Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(30, 91, 181, 0.22)',
                  border: '1px solid rgba(96, 165, 250, 0.35)',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 18px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 650,
                  color: 'var(--primary-300)',
                  marginBottom: '1.5rem',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <ShieldCheck size={17} color="var(--success-400)" />
                <span>The Professional Network for Skilled Service Workers</span>
              </div>

              {/* Exact Hero Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.35rem, 4.3vw, 3.4rem)',
                  fontWeight: 800,
                  color: 'var(--white)',
                  lineHeight: 1.16,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                Skilled Professionals Deserve a Professional Identity.
              </h1>

              {/* Supporting Subtitle */}
              <p
                style={{
                  fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
                  color: 'var(--primary-200)',
                  lineHeight: 1.65,
                  marginBottom: '2rem',
                  maxWidth: '580px',
                }}
              >
                Discover verified electricians, plumbers, technicians, repairers and other skilled professionals — and connect with the right person for the job.
              </p>

              {/* Search Bar Form */}
              <form
                onSubmit={handleSearch}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  boxShadow: '0 20px 35px -8px rgba(0, 0, 0, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '620px',
                  marginBottom: '2rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ paddingLeft: '12px', display: 'flex', alignItems: 'center', color: 'var(--neutral-400)' }}>
                  <Search size={20} strokeWidth={2.2} />
                </div>
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Electrician, AC Repair)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: '1 1 220px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'var(--neutral-900)',
                    padding: '8px 4px',
                    fontWeight: 500
                  }}
                />

                {/* Location Quick Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--neutral-200)', paddingLeft: '12px' }}>
                  <MapPin size={17} color="var(--primary-700)" />
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
                      fontSize: '0.875rem',
                      fontWeight: 650,
                      color: 'var(--neutral-800)',
                      cursor: 'pointer',
                      padding: '8px 4px'
                    }}
                  >
                    {POPULAR_LOCATIONS.map((l) => (
                      <option key={l.name} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
                >
                  <span>Search Pros</span>
                </button>
              </form>

              {/* Dual Primary CTAs */}
              <div className="flex items-center gap-3.5 flex-wrap mb-8">
                <Link
                  to="/browse"
                  className="btn btn-primary"
                  style={{
                    padding: '0.8125rem 1.625rem',
                    backgroundColor: 'var(--primary-700)',
                    borderColor: 'var(--primary-700)',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  <Search size={16} />
                  <span>Find a Professional</span>
                </Link>

                <Link
                  to="/register?role=PROVIDER"
                  className="btn btn-outline-secondary"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.45)',
                    color: 'var(--white)',
                    padding: '0.8125rem 1.625rem',
                    fontWeight: 650,
                    fontSize: '1rem',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <Briefcase size={16} />
                  <span>Join as a Skilled Professional</span>
                </Link>
              </div>

              {/* Metrics Under Hero */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                  paddingTop: '1.5rem',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--primary-200)',
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} color="var(--success-400)" />
                  <span style={{ fontWeight: 650, color: 'var(--white)' }}>Verified Digital Identity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} color="var(--success-400)" />
                  <span style={{ fontWeight: 650, color: 'var(--white)' }}>Choose Any Provider</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: 650, color: 'var(--white)' }}>4.9/5 Certified Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column: LinkedIn for Skilled Trades Interactive Profile Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  color: 'var(--neutral-900)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  boxShadow: '0 24px 48px -10px rgba(0, 0, 0, 0.45)',
                  maxWidth: '460px',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  position: 'relative'
                }}
              >
                {/* Profile Header Tag */}
                <div className="flex items-center justify-between mb-4 pb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 750,
                      color: 'var(--primary-800)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Briefcase size={14} color="var(--primary-700)" />
                    Verified Digital Profile
                  </span>

                  <span className="badge badge-verified" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    <Check size={12} strokeWidth={3} />
                    Identity Verified
                  </span>
                </div>

                {/* Profile Avatar & Title */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                    alt="Rajesh Kumar"
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: 'var(--radius-lg)',
                      objectFit: 'cover',
                      border: '3px solid var(--primary-100)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                      Rajesh Kumar
                    </h3>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--primary-800)', fontWeight: 650, margin: '2px 0 2px 0' }}>
                      Certified Master Electrician & Power Specialist
                    </p>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} />
                      Thane & Mumbai Metro • 8 Years Experience
                    </span>
                  </div>
                </div>

                {/* Verification Credentials */}
                <div
                  style={{
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: '1.25rem',
                    border: '1px solid var(--neutral-200)',
                    fontSize: 'var(--font-size-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div className="flex items-center gap-2.5 text-secondary">
                    <CheckCircle2 size={16} color="var(--success-600)" style={{ flexShrink: 0 }} />
                    <span>Govt Wireman Trade License <strong>#MH-EL-4821</strong> (Verified)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-secondary">
                    <CheckCircle2 size={16} color="var(--success-600)" style={{ flexShrink: 0 }} />
                    <span>Identity Verified (Masked Aadhaar: <strong>XXXX-XXXX-4821</strong>)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-secondary">
                    <CheckCircle2 size={16} color="var(--success-600)" style={{ flexShrink: 0 }} />
                    <span>320+ Completed Jobs • 4.93 Star Verified Rating</span>
                  </div>
                </div>

                {/* Skills Chips */}
                <div className="mb-4">
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--neutral-500)',
                      fontWeight: 750,
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    Verified Trade Skills
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Short Circuit Isolation', 'MCB Distribution Boxes', 'Inverter Wiring', 'BLDC Fans'].map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          backgroundColor: 'var(--primary-subtle)',
                          color: 'var(--primary-900)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          border: '1px solid var(--primary-200)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Starting Price & Profile CTA */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--neutral-200)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--neutral-500)', fontWeight: 700, display: 'block' }}>
                      Starting Rate
                    </span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                      ₹299
                    </span>
                  </div>
                  <Link
                    to="/providers/101"
                    className="btn btn-primary"
                    style={{ padding: '0.625rem 1.25rem', fontWeight: 650 }}
                  >
                    <span>View Profile</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. POSITIONING PILLAR: PROFESSIONAL IDENTITY FOR SKILLED TRADES
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--neutral-200)' }}>
        <div className="container">
          <div className="section-header text-center" style={{ maxWidth: '820px', margin: '0 auto 3rem auto' }}>
            <span className="section-subtitle">BRIDGING THE PROFESSIONAL DIVIDE</span>
            <h2 className="section-title">
              Professional Identity for Skilled Service Workers
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
              gap: '1.75rem',
            }}
          >
            {/* Pillar 1 */}
            <div className="card card-hoverable" style={{ padding: '2rem 1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--primary-200)',
                }}
              >
                <UserCheck size={26} strokeWidth={2} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 750, marginBottom: '0.6rem', color: 'var(--neutral-900)' }}>
                Digital Professional Identity
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.65 }}>
                Every skilled worker gets a verified public profile showcasing their certifications, verified trade licenses, specialties, and full portfolio.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card card-hoverable" style={{ padding: '2rem 1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-50)',
                  color: 'var(--success-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                }}
              >
                <ShieldCheck size={26} strokeWidth={2} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 750, marginBottom: '0.6rem', color: 'var(--neutral-900)' }}>
                Verification You Can Trust
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.65 }}>
                Identity, certifications, and background are verified through structured checks — without exposing sensitive personal documents publicly.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card card-hoverable" style={{ padding: '2rem 1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-50)',
                  color: 'var(--warning-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                }}
              >
                <ThumbsUp size={26} strokeWidth={2} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 750, marginBottom: '0.6rem', color: 'var(--neutral-900)' }}>
                Customer Choice, No Restrictions
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.65 }}>
                Nearby distance is a recommendation, never an arbitrary restriction. Customers can select any provider they trust, even outside their search radius.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="card card-hoverable" style={{ padding: '2rem 1.75rem', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--primary-200)',
                }}
              >
                <Award size={26} strokeWidth={2} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 750, marginBottom: '0.6rem', color: 'var(--neutral-900)' }}>
                Reputation That Compounds
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.65 }}>
                Every verified customer review, star rating, and completed service permanently enhances the professional’s career asset and market value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. CATEGORIES SECTION: SPECIALIZED SKILLED TRADES
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--neutral-50)' }}>
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <span className="section-subtitle">SKILLED TRADES DIRECTORY</span>
              <h2 className="section-title" style={{ margin: 0 }}>
                Explore Specialized Categories
              </h2>
              <p className="section-desc mt-1">
                From electrical diagnostics to appliance maintenance — hire verified trade professionals.
              </p>
            </div>
            <Link to="/services" className="btn btn-secondary">
              <span>View All Services</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. LOCATION & RADIUS DISCOVERY ENGINE SECTION
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--white)', borderTop: '1px solid var(--neutral-200)', borderBottom: '1px solid var(--neutral-200)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left Explanation */}
            <div>
              <span className="section-subtitle">SMART DISCOVERY ENGINE</span>
              <h2 className="section-title">
                Location & Radius Discovery — Designed for Customer Choice
              </h2>
              <p className="section-desc mb-6">
                Set your search radius to identify verified professionals closest to you for rapid response. Crucially, <strong>radius is a recommendation, not a restriction</strong>. If you prefer working with a specific master specialist from across the metro, you have total liberty to book them directly.
              </p>

              <div className="flex flex-col gap-3.5 mb-6">
                <div className="flex items-start gap-3">
                  <div style={{ marginTop: '3px' }}>
                    <CheckCircle2 size={18} color="var(--primary-700)" />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>Customer Location:</strong>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-600)', marginLeft: '6px' }}>Set your neighborhood as the search center point</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div style={{ marginTop: '3px' }}>
                    <CheckCircle2 size={18} color="var(--primary-700)" />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>Selected Search Radius:</strong>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-600)', marginLeft: '6px' }}>Filter by 2 km, 5 km, 10 km, 25 km, or 50 km</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div style={{ marginTop: '3px' }}>
                    <CheckCircle2 size={18} color="var(--primary-700)" />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>Distance Calculation:</strong>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-600)', marginLeft: '6px' }}>Accurate doorstep distance calculated in kilometers</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div style={{ marginTop: '3px' }}>
                    <CheckCircle2 size={18} color="var(--success-600)" />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>Customer Choice:</strong>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-600)', marginLeft: '6px' }}>Hire any provider you prefer, inside or outside radius</span>
                  </div>
                </div>
              </div>

              <Link to="/browse" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 650 }}>
                <Navigation size={16} />
                <span>Launch Location Discovery & Map</span>
              </Link>
            </div>

            {/* Right Interactive Discovery Preview Card */}
            <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--neutral-50)', border: '1px solid var(--neutral-200)' }}>
              <div className="flex items-center justify-between pb-3 mb-4 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <div className="flex items-center gap-2">
                  <MapPin size={18} color="var(--primary-700)" />
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)' }}>Active Location: Mumbai</strong>
                </div>
                <span className="badge badge-confirmed" style={{ fontSize: '11px' }}>
                  Live Distance Active
                </span>
              </div>

              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--neutral-800)' }}>
                    Search Radius:
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--primary-800)' }}>
                    {selectedRadius} km
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>2 km (Hyperlocal)</span>
                  <span>10 km</span>
                  <span>50 km (Metro)</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--white)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-200)',
                  marginBottom: '1rem',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} color="var(--primary-700)" />
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-900)' }}>
                    9 Top Providers within {selectedRadius} km serving your locality
                  </strong>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-600)', margin: 0, lineHeight: 1.5 }}>
                  Nearby is a recommendation, but you can always select any specialist across the network!
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted">
                <span>Coordinates: 19.1136° N, 72.8697° E</span>
                <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>GPS Calibrated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. TOP-RATED PROFESSIONALS SECTION
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--neutral-50)' }}>
        <div className="container">
          <div className="section-header text-center" style={{ maxWidth: '720px', margin: '0 auto 3rem auto' }}>
            <span className="section-subtitle">VERIFIED NETWORK</span>
            <h2 className="section-title">
              Top-Rated Professionals
            </h2>
            <p className="section-desc">
              Handpicked, background-verified trade experts ready for your doorstep repair.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading verified professionals..." />
          ) : (
            <div className="providers-grid mb-8">
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

          <div className="text-center">
            <Link
              to="/browse"
              className="btn btn-primary"
              style={{ padding: '0.8125rem 2rem', fontWeight: 650, fontSize: '1rem' }}
            >
              <span>Explore All Verified Providers & Map</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. HOW TRUSTFIX WORKS (4-STEP WORKFLOW)
          ============================================================ */}
      <section
        id="how-it-works"
        className="section-py"
        style={{ backgroundColor: 'var(--white)', borderTop: '1px solid var(--neutral-200)', borderBottom: '1px solid var(--neutral-200)' }}
      >
        <div className="container">
          <div className="section-header text-center" style={{ maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <span className="section-subtitle">SIMPLE TRANSPARENT FLOW</span>
            <h2 className="section-title">
              How TrustFix Works
            </h2>
            <p className="section-desc">
              Experience seamless doorstep discovery and certified doorstep repairs in 4 simple steps.
            </p>
          </div>

          <div className="step-workflow-container mb-8">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-icon-badge">
                <Search size={24} strokeWidth={2.4} />
              </div>
              <span className="text-xs uppercase font-bold text-primary mb-1">Step 01</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Search Services
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.55 }}>
                Browse verified trade categories and transparent diagnostic rates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-icon-badge">
                <Users size={24} strokeWidth={2.4} />
              </div>
              <span className="text-xs uppercase font-bold text-primary mb-1">Step 02</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Compare & Choose
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.55 }}>
                Review real distance, verified credentials, ratings, and select any provider.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-icon-badge">
                <Calendar size={24} strokeWidth={2.4} />
              </div>
              <span className="text-xs uppercase font-bold text-primary mb-1">Step 03</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Schedule Appointment
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.55 }}>
                Pick your preferred date and slot with zero advance payment.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card step-success">
              <div className="step-icon-badge">
                <CheckCircle2 size={26} strokeWidth={2.4} />
              </div>
              <span className="text-xs uppercase font-bold text-success mb-1">Step 04</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>
                Certified Execution
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', lineHeight: 1.55 }}>
                Pay securely after completion. Guaranteed with 30-day warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. WIN-WIN ECOSYSTEM: CUSTOMERS & SKILLED PROS
          ============================================================ */}
      <section className="section-py" style={{ backgroundColor: 'var(--neutral-50)' }}>
        <div className="container">
          <div className="section-header text-center" style={{ maxWidth: '780px', margin: '0 auto 3rem auto' }}>
            <span className="section-subtitle">WIN-WIN ECOSYSTEM</span>
            <h2 className="section-title">
              Built for Customers and Skilled Professionals Alike
            </h2>
            <p className="section-desc">
              Empowering customers with trust and choice, while empowering skilled workers with professional identity and dignity.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '2rem',
            }}
          >
            {/* For Customers */}
            <div className="card" style={{ padding: '2.25rem 2rem', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-800)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                }}
              >
                <Users size={16} />
                <span>For Homeowners & Customers</span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Peace of mind with every doorstep visit
              </h3>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>100% Background & Trade Verified:</strong> Every provider undergoes government ID and certified skill verification.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>Freedom of Provider Choice:</strong> You decide who comes to your home. Select by reviews, distance, or expertise.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>Transparent Upfront Pricing:</strong> Standard rate cards with zero advance payment before service.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>30-Day Workmanship Warranty:</strong> If anything isn’t right, the pro returns and completes resolution at no extra charge.
                  </span>
                </div>
              </div>

              <Link to="/browse" className="btn btn-primary btn-block">
                <span>Browse Verified Providers</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* For Service Providers */}
            <div className="card" style={{ padding: '2.25rem 2rem', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--success-50)',
                  color: 'var(--success-800)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                }}
              >
                <Briefcase size={16} />
                <span>For Skilled Service Professionals</span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Build your enduring professional reputation
              </h3>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>A Real Digital Professional Identity:</strong> Showcase your trade skills, certifications, and years of craftsmanship on a public URL.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>Direct Customer Reputation:</strong> Collect authentic customer reviews that you own and build a lifelong career asset.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>Set Your Own Pricing & Availability:</strong> Control your rate cards, service radius, and working hours flexibly.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
                    <strong>Verified Professional Badge:</strong> Stand out from unverified workers with a trusted digital credential.
                  </span>
                </div>
              </div>

              <Link to="/register?role=PROVIDER" className="btn btn-success btn-block">
                <span>Create Your Professional Profile</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
