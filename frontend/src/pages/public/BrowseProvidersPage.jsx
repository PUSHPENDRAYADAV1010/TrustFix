import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { locationService } from '../../services/locationService';
import { categoryService } from '../../services/categoryService';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { MapView } from '../../components/map/MapView';
import { LoadingSpinner, EmptyState } from '../../components/common/FeedbackStates';
import {
  DEFAULT_CUSTOMER_LOCATION,
  POPULAR_LOCATIONS,
  calculateDistance,
  formatDistance
} from '../../utils/distance';
import {
  Columns,
  List,
  Map,
  RotateCcw,
  Search,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  ArrowUpDown,
  Navigation,
  Info,
  Sparkles,
  Filter,
  X
} from 'lucide-react';

export const BrowseProvidersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialRadius = searchParams.get('radius') || '25';

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Location & Radius State
  const [customerLocation, setCustomerLocation] = useState(() => {
    if (initialLocation) {
      const match = POPULAR_LOCATIONS.find(l =>
        l.name.toLowerCase().includes(initialLocation.toLowerCase()) ||
        l.city.toLowerCase().includes(initialLocation.toLowerCase())
      );
      if (match) return match;
    }
    return DEFAULT_CUSTOMER_LOCATION;
  });
  const [customLocationText, setCustomLocationText] = useState(initialLocation || DEFAULT_CUSTOMER_LOCATION.name);
  const [distanceRadius, setDistanceRadius] = useState(initialRadius); // km
  const [restrictToRadius, setRestrictToRadius] = useState(false); // DEFAULT FALSE: nearby is recommendation, not restriction!

  // Filters State
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState('0');
  const [maxPrice, setMaxPrice] = useState('2000');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'distance' | 'rating' | 'price_asc' | 'experience'

  // View Mode State: 'split' | 'list' | 'map'
  const [viewMode, setViewMode] = useState('split');
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map' on mobile screens
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProvidersAndLocations = async () => {
      setLoading(true);
      try {
        const [provs, locs] = await Promise.all([
          providerService.getProviders({
            search: searchKeyword,
            category: selectedCategory,
            minRating: Number(minRating) > 0 ? minRating : undefined,
            maxPrice: Number(maxPrice) < 2000 ? maxPrice : undefined,
            onlyAvailable,
            verifiedOnly,
          }),
          locationService.getProviderLocations({
            service: selectedCategory,
            verifiedOnly,
            search: searchKeyword,
          })
        ]);

        setProviders(provs);
        setLocations(locs);
      } finally {
        setLoading(false);
      }
    };

    fetchProvidersAndLocations();
  }, [searchKeyword, selectedCategory, minRating, maxPrice, onlyAvailable, verifiedOnly]);

  // Compute distances & sort providers
  const processedProviders = useMemo(() => {
    const radiusNum = Number(distanceRadius) || 25;

    // Attach calculated distance to each provider
    let list = providers.map((p) => {
      const dist = (customerLocation?.latitude && p.latitude)
        ? calculateDistance(customerLocation.latitude, customerLocation.longitude, p.latitude, p.longitude)
        : (p.distanceKm || 5);

      const isWithin = dist !== null ? dist <= radiusNum : true;
      return {
        ...p,
        computedDistance: dist,
        isWithinRadius: isWithin
      };
    });

    // If user explicitly checked the box to restrict to radius
    if (restrictToRadius) {
      list = list.filter(p => p.isWithinRadius);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'recommended') {
        if (a.isWithinRadius !== b.isWithinRadius) {
          return a.isWithinRadius ? -1 : 1;
        }
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'distance') {
        return (a.computedDistance || 999) - (b.computedDistance || 999);
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'price_asc') {
        return (a.startingPrice || 0) - (b.startingPrice || 0);
      } else if (sortBy === 'experience') {
        return (b.experience || 0) - (a.experience || 0);
      }
      return 0;
    });

    return list;
  }, [providers, customerLocation, distanceRadius, restrictToRadius, sortBy]);

  const nearbyCount = processedProviders.filter(p => p.isWithinRadius).length;

  const handleLocationPresetChange = (locName) => {
    const match = POPULAR_LOCATIONS.find(l => l.name === locName);
    if (match) {
      setCustomerLocation(match);
      setCustomLocationText(match.name);
    }
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setMinRating('0');
    setMaxPrice('2000');
    setDistanceRadius('25');
    setRestrictToRadius(false);
    setOnlyAvailable(false);
    setVerifiedOnly(true);
    setSortBy('recommended');
    setCustomerLocation(DEFAULT_CUSTOMER_LOCATION);
    setCustomLocationText(DEFAULT_CUSTOMER_LOCATION.name);
    setSearchParams({});
  };

  // Render Filter Form (shared between desktop sidebar and mobile modal)
  const renderFilterControls = () => (
    <div className="flex flex-col gap-5">
      {/* Category Filter */}
      <div className="form-group mb-0">
        <label className="form-label text-xs uppercase text-muted font-bold" style={{ letterSpacing: '0.04em' }}>
          Trade Category
        </label>
        <select
          className="form-control"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Trade Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Rating Filter */}
      <div className="form-group mb-0">
        <label className="form-label text-xs uppercase text-muted font-bold" style={{ letterSpacing: '0.04em' }}>
          Minimum Rating
        </label>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { val: '4.5', label: '★ 4.5+ Rating' },
            { val: '4.0', label: '★ 4.0+ Rating' },
            { val: '0', label: 'Any Rating' },
          ].map((item) => (
            <label key={item.val} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={item.val}
                checked={minRating === item.val}
                onChange={(e) => setMinRating(e.target.value)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="form-group mb-0">
        <div className="flex items-center justify-between mb-1">
          <label className="form-label mb-0 text-xs uppercase text-muted font-bold" style={{ letterSpacing: '0.04em' }}>
            Max Starting Rate
          </label>
          <span className="text-xs font-bold text-primary">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div className="flex justify-between text-2xs text-muted mt-1">
          <span>₹200</span>
          <span>₹2000+</span>
        </div>
      </div>

      {/* Verified & Available Toggles */}
      <div className="flex flex-col gap-2.5 pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          <span>Available Now</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          <span style={{ color: 'var(--success-700)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} />
            Verified Badge Only
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="browse-page" style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container">
        
        {/* Page Header */}
        <div className="mb-6">
          <span className="section-subtitle">VERIFIED TRADE NETWORK & MARKETPLACE</span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--neutral-900)', margin: '0 0 6px 0' }}>
            Find Verified Professionals
          </h1>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--neutral-600)', margin: 0 }}>
            Discover verified electricians, plumbers, and technicians with transparent rate cards, background checks, and real customer reviews.
          </p>
        </div>

        {/* Location & Radius Control Bar */}
        <div
          className="card mb-6"
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--neutral-200)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Keyword */}
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', display: 'flex', alignItems: 'center' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px', height: '46px', fontSize: '0.9375rem' }}
                placeholder="Search name, trade, or skill (e.g. Electrician, Leak Fix)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* Customer Location Selector */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center' }}>
                <MapPin size={18} />
              </div>
              <select
                className="form-control"
                style={{ paddingLeft: '38px', height: '46px', fontWeight: 650, fontSize: '0.9375rem' }}
                value={customerLocation.name}
                onChange={(e) => handleLocationPresetChange(e.target.value)}
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius Selector */}
            <div style={{ flex: '0 1 200px' }}>
              <select
                className="form-control"
                style={{ height: '46px', fontWeight: 650, fontSize: '0.9375rem' }}
                value={distanceRadius}
                onChange={(e) => setDistanceRadius(e.target.value)}
              >
                <option value="2">Radius: 2 km (Hyperlocal)</option>
                <option value="5">Radius: 5 km (Neighborhood)</option>
                <option value="10">Radius: 10 km (Suburban)</option>
                <option value="25">Radius: 25 km (Metro Area)</option>
                <option value="50">Radius: 50 km (Any Distance)</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              className="btn btn-light"
              style={{ height: '46px', padding: '0 1.25rem', fontSize: 'var(--font-size-xs)' }}
              onClick={handleClearFilters}
              title="Reset search & filters"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>

          {/* CRUCIAL RULE CALLOUT BANNER */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.875rem 1.25rem',
              backgroundColor: 'var(--primary-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-200)',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              color: 'var(--primary-900)'
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={17} color="var(--primary-750)" style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: 1.5 }}>
                <strong>Provider Selection Rule:</strong> Nearby providers within <strong>{distanceRadius} km</strong> are recommended for fast response, but <strong>NOT a restriction</strong>. You can select and book any verified specialist across the platform!
              </span>
            </div>

            <label className="flex items-center gap-2 font-semibold cursor-pointer" style={{ color: 'var(--neutral-800)', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={restrictToRadius}
                onChange={(e) => setRestrictToRadius(e.target.checked)}
              />
              <span>Show only within {distanceRadius} km</span>
            </label>
          </div>
        </div>

        {/* Mobile View Toggle Bar (< 1024px) */}
        <div className="browse-mobile-bar items-center justify-between gap-3 mb-4">
          <button
            type="button"
            className="btn btn-secondary flex items-center gap-2"
            onClick={() => setMobileFilterOpen(true)}
            style={{ flex: 1, padding: '0.625rem' }}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>

          <div className="flex items-center bg-white border rounded-lg p-1" style={{ flex: 1, border: '1px solid var(--neutral-300)' }}>
            <button
              type="button"
              className={`btn btn-sm ${mobileTab === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => setMobileTab('list')}
            >
              <List size={15} />
              <span>List ({processedProviders.length})</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mobileTab === 'map' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => setMobileTab('map')}
            >
              <Map size={15} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Desktop 3-Column / Flexible Layout */}
        <div className={`browse-page-grid view-${viewMode}`} data-mobile-tab={mobileTab}>
          {/* 1. LEFT FILTER SIDEBAR (Desktop) */}
          <aside className="card browse-filter-sidebar" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
            <div className="flex items-center justify-between pb-3 mb-4 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 750, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={17} color="var(--primary-700)" />
                <span>Filters</span>
              </h4>
              <button
                type="button"
                onClick={handleClearFilters}
                style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '13px', fontWeight: 650, cursor: 'pointer' }}
              >
                Clear all
              </button>
            </div>

            {renderFilterControls()}
          </aside>

          {/* 2. CENTER: PROVIDER RESULTS LIST */}
          <div className="browse-results-panel">
            {/* Toolbar: Count + Sort + Desktop View Mode */}
            <div
              className="card mb-4"
              style={{
                padding: '0.875rem 1.25rem',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--neutral-200)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 750, color: 'var(--neutral-900)' }}>
                  {processedProviders.length} verified professionals
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-500)', marginLeft: '8px' }}>
                  ({nearbyCount} recommended within {distanceRadius} km)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <ArrowUpDown size={14} color="var(--neutral-500)" />
                  <span className="text-muted font-medium">Sort:</span>
                  <select
                    className="form-control"
                    style={{ height: '36px', fontSize: '13px', padding: '4px 10px', minWidth: '160px' }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Recommended First</option>
                    <option value="distance">Nearest Distance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>

                {/* View Mode Toggle (Desktop only) */}
                <div className="browse-desktop-view-toggle items-center gap-1 border-left pl-2" style={{ borderLeft: '1px solid var(--neutral-200)', paddingLeft: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setViewMode('split')}
                    title="Split List & Map"
                    style={{ padding: '6px 10px' }}
                  >
                    <Columns size={14} />
                    <span>Split</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setViewMode('list')}
                    title="List View Only"
                    style={{ padding: '6px 10px' }}
                  >
                    <List size={14} />
                    <span>List</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setViewMode('map')}
                    title="Map View Only"
                    style={{ padding: '6px 10px' }}
                  >
                    <Map size={14} />
                    <span>Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Cards Listing */}
            {loading ? (
              <LoadingSpinner message="Searching verified trade professionals..." />
            ) : processedProviders.length === 0 ? (
              <EmptyState
                icon={<Search size={28} />}
                title="No professionals found matching criteria"
                message="Try adjusting your filters, expanding your search radius, or clearing keywords."
                action={
                  <button type="button" className="btn btn-primary" onClick={handleClearFilters}>
                    Reset All Filters
                  </button>
                }
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {processedProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={selectedProviderId === provider.id}
                    onSelectOnMap={(pId) => {
                      setSelectedProviderId(pId);
                      setMobileTab('map');
                    }}
                    customerLocation={customerLocation}
                    maxRadius={distanceRadius}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 3. RIGHT: MAP VIEW PANEL */}
          <div className="browse-map-panel">
            <div className="card h-full" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--neutral-300)' }}>
              <MapView
                providers={processedProviders}
                locations={locations}
                selectedProviderId={selectedProviderId}
                onSelectProvider={(pId) => setSelectedProviderId(pId)}
                customerLocation={customerLocation}
                searchRadius={Number(distanceRadius)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="modal-backdrop" onClick={() => setMobileFilterOpen(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h4 style={{ fontWeight: 750, margin: 0 }}>Filter Professionals</h4>
                <button className="btn-close" onClick={() => setMobileFilterOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                {renderFilterControls()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
                  Clear All
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setMobileFilterOpen(false)}>
                  Apply Filters ({processedProviders.length})
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
