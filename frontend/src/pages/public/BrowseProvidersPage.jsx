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
  Filter
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
      const match = POPULAR_LOCATIONS.find(l => l.name.toLowerCase().includes(initialLocation.toLowerCase()) || l.city.toLowerCase().includes(initialLocation.toLowerCase()));
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

  // View Mode State
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'list' | 'map'
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

    // If user explicitly asked to restrict to radius
    if (restrictToRadius) {
      list = list.filter(p => p.isWithinRadius);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'recommended') {
        // Recommended within radius first, then by rating
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
  const outsideCount = processedProviders.filter(p => !p.isWithinRadius).length;

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

  return (
    <div className="browse-page" style={{ padding: '2rem 0 3.5rem 0' }}>
      <div className="container">
        
        {/* Page Header */}
        <div className="mb-6">
          <span className="section-subtitle">Verified Trade Network & Marketplace</span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--neutral-900)', margin: '0 0 4px 0' }}>
            Find Verified Professionals
          </h1>
          <p className="text-sm text-muted">
            Discover verified electricians, plumbers, and technicians with transparent rate cards, background checks, and real customer reviews.
          </p>
        </div>

        {/* Location & Radius Control Bar */}
        <div
          className="card mb-6"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--neutral-200)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Keyword */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', display: 'flex', alignItems: 'center' }}>
                <Search size={16} />
              </div>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder="Search name, trade, or skill (e.g. Electrician, MCB, Leak Fix)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* Customer Location Selector */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center' }}>
                <MapPin size={16} />
              </div>
              <select
                className="form-control"
                style={{ paddingLeft: '36px', fontWeight: 600 }}
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
            <div style={{ flex: '0 1 180px' }}>
              <select
                className="form-control"
                style={{ fontWeight: 600 }}
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

            <button
              type="button"
              className="btn btn-light text-xs flex items-center gap-1"
              onClick={handleClearFilters}
              title="Reset search & filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* CRUCIAL RULE CALLOUT BANNER */}
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(37, 99, 235, 0.07)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              color: 'var(--primary-900)'
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} color="var(--primary-700)" style={{ flexShrink: 0 }} />
              <span>
                <strong>Provider Selection Rule:</strong> Nearby providers within <strong>{distanceRadius} km</strong> are recommended for fast response, but <strong>NOT a restriction</strong>. You can select and book any verified specialist across the platform!
              </span>
            </div>

            <label className="flex items-center gap-2 font-semibold cursor-pointer text-xs" style={{ color: 'var(--neutral-800)' }}>
              <input
                type="checkbox"
                checked={restrictToRadius}
                onChange={(e) => setRestrictToRadius(e.target.checked)}
              />
              <span>Show only within {distanceRadius} km</span>
            </label>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(250px, 280px) minmax(0, 1fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="browse-layout-grid"
        >
          {/* LEFT FILTER SIDEBAR */}
          <aside className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
            <div className="flex items-center justify-between pb-3 mb-4 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={16} color="var(--primary-700)" />
                <span>Filters</span>
              </h4>
              <button
                type="button"
                onClick={handleClearFilters}
                style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear all
              </button>
            </div>

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

              {/* Minimum Rating */}
              <div className="form-group mb-0">
                <label className="form-label text-xs uppercase text-muted font-bold" style={{ letterSpacing: '0.04em' }}>
                  Minimum Rating
                </label>
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === '4.5'}
                      onChange={() => setMinRating('4.5')}
                    />
                    <span className="flex items-center gap-1 font-semibold">
                      <Star size={13} fill="#F59E0B" color="#F59E0B" /> 4.5+ Rating
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === '4.0'}
                      onChange={() => setMinRating('4.0')}
                    />
                    <span className="flex items-center gap-1 font-semibold">
                      <Star size={13} fill="#F59E0B" color="#F59E0B" /> 4.0+ Rating
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === '0'}
                      onChange={() => setMinRating('0')}
                    />
                    <span>Any Rating</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
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
                  style={{ width: '100%' }}
                />
                <div className="flex justify-between text-2xs text-muted mt-1">
                  <span>₹200</span>
                  <span>₹2000+</span>
                </div>
              </div>

              {/* Verified & Available Toggles */}
              <div className="flex flex-col gap-2 pt-2 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
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
                  <span style={{ color: 'var(--success-700)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={13} />
                    Verified Badge Only
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* RIGHT RESULTS AREA */}
          <div>
            {/* Toolbar: Count + Sort + Views */}
            <div
              className="flex items-center justify-between flex-wrap gap-3 mb-4 bg-white p-3 rounded-lg border"
              style={{ backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)' }}
            >
              <div>
                <span className="text-sm font-bold" style={{ color: 'var(--neutral-900)' }}>
                  {processedProviders.length} verified professionals found
                </span>
                <span className="text-xs text-muted ml-2">
                  ({nearbyCount} within {distanceRadius} km recommendation)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowUpDown size={13} color="var(--neutral-500)" />
                  <span className="text-muted">Sort:</span>
                  <select
                    className="form-control"
                    style={{ height: '32px', fontSize: '12px', padding: '2px 8px', width: '150px' }}
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

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1" style={{ borderLeft: '1px solid var(--neutral-200)', paddingLeft: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setViewMode('split')}
                    title="Split List and Map"
                    style={{ padding: '4px 8px' }}
                  >
                    <Columns size={13} />
                    <span className="hidden sm:inline">Split</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                    style={{ padding: '4px 8px' }}
                  >
                    <List size={13} />
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setViewMode('map')}
                    title="Map View"
                    style={{ padding: '4px 8px' }}
                  >
                    <Map size={13} />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Results */}
            {loading ? (
              <LoadingSpinner message="Locating verified professionals in your area..." />
            ) : processedProviders.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No verified providers match your filters"
                description="Try expanding your radius, clearing keyword filters, or choosing a different trade category."
                action={
                  <button className="btn btn-primary" onClick={handleClearFilters}>
                    Reset All Filters
                  </button>
                }
              />
            ) : (
              <div>
                {/* Split View */}
                {viewMode === 'split' && (
                  <div className="discovery-container split-view">
                    <div className="discovery-list-col flex flex-col gap-4">
                      {processedProviders.map((p) => (
                        <ProviderCard
                          key={p.id}
                          provider={p}
                          isSelected={selectedProviderId === p.id}
                          customerLocation={customerLocation}
                          maxRadius={distanceRadius}
                          onSelectOnMap={(id) => setSelectedProviderId(id)}
                        />
                      ))}
                    </div>

                    <div className="discovery-map-col">
                      <MapView
                        locations={locations}
                        selectedProviderId={selectedProviderId}
                        onSelectProvider={(id) => setSelectedProviderId(id)}
                        height="100%"
                      />
                    </div>
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="flex flex-col gap-4">
                    {processedProviders.map((p) => (
                      <ProviderCard
                        key={p.id}
                        provider={p}
                        customerLocation={customerLocation}
                        maxRadius={distanceRadius}
                        onSelectOnMap={(id) => { setSelectedProviderId(id); setViewMode('split'); }}
                      />
                    ))}
                  </div>
                )}

                {/* Map View */}
                {viewMode === 'map' && (
                  <div style={{ height: '650px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
                    <MapView
                      locations={locations}
                      selectedProviderId={selectedProviderId}
                      onSelectProvider={(id) => setSelectedProviderId(id)}
                      height="100%"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
