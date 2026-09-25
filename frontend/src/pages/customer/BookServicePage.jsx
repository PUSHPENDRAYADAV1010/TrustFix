import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { providerService } from '../../services/providerService';
import { userService } from '../../services/userService';
import { bookingService } from '../../services/bookingService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner, EmptyState } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate, formatLocalDate } from '../../utils/formatters';
import { resolveServiceImage } from '../../utils/imageResolver';
import {
  Wrench,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Plus,
  AlertCircle,
  Check,
  Shield,
  Sparkles,
  Info
} from 'lucide-react';

export const BookServicePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('serviceId') || '';
  const initialProviderId = searchParams.get('providerId') || '';
  const initialDate = searchParams.get('date') || '';

  const navigate = useNavigate();

  // 4 Modern Steps
  const [step, setStep] = useState(initialServiceId ? (initialProviderId ? 3 : 2) : 1);

  // Data State
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selected Booking Form State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) return initialDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  });
  const [selectedTime, setSelectedTime] = useState('10:00 AM - 12:00 PM');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [showAllProviders, setShowAllProviders] = useState(false);

  // Add Address Modal State
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    flat: '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    label: 'Home',
  });
  const [addingAddress, setAddingAddress] = useState(false);

  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Fetch Services, Providers, Addresses
  useEffect(() => {
    const initData = async () => {
      setLoadingData(true);
      try {
        const [allServs, allProvs, userAddrs] = await Promise.all([
          categoryService.getServices(),
          providerService.getVerifiedProviders(),
          user?.id ? userService.getAddresses(user.id) : Promise.resolve([])
        ]);

        setServices(allServs);
        setProviders(allProvs);
        setAddresses(userAddrs);

        if (userAddrs.length > 0) {
          const defaultAddr = userAddrs.find(a => a.isDefault) || userAddrs[0];
          setSelectedAddressId(defaultAddr.id);
        }

        // Auto-select initial provider
        let foundProv = null;
        if (initialProviderId) {
          foundProv = allProvs.find(p => String(p.id) === String(initialProviderId));
          if (foundProv) setSelectedProvider(foundProv);
        }

        // Auto-select initial service
        if (initialServiceId) {
          const foundServ = allServs.find(s => String(s.id) === String(initialServiceId));
          if (foundServ) setSelectedService(foundServ);
        } else if (foundProv && allServs.length > 0) {
          const pTrade = (foundProv.service || foundProv.trade || foundProv.companyName || '').toLowerCase();
          const matchingServ = allServs.find(s => {
            const sCat = (s.categoryName || '').toLowerCase();
            const sName = (s.name || '').toLowerCase();
            return pTrade.includes(sCat) || sCat.includes(pTrade) || pTrade.includes(sName);
          });
          setSelectedService(matchingServ || allServs[0]);
        } else if (allServs.length > 0) {
          setSelectedService(allServs[0]);
        }
      } catch (err) {
        console.error('Failed to load booking data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    initData();
  }, [user?.id, initialServiceId, initialProviderId]);

  // When selected service changes, filter matching providers, or allow searching all platform providers
  const availableProviders = useMemo(() => {
    let list = providers;
    if (!showAllProviders && selectedService) {
      list = list.filter(p => {
        const pTrade = (p.service || '').toLowerCase();
        const sCat = (selectedService.categoryName || '').toLowerCase();
        return pTrade.includes(sCat) || sCat.includes(pTrade) || pTrade.includes('repair');
      });
    }

    if (providerSearchQuery.trim()) {
      const q = providerSearchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.companyName || '').toLowerCase().includes(q) ||
        (p.service || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [providers, selectedService, showAllProviders, providerSearchQuery]);

  const timeSlots = [
    { label: '09:00 AM - 11:00 AM', tag: 'Morning' },
    { label: '11:00 AM - 01:00 PM', tag: 'Midday' },
    { label: '02:00 PM - 04:00 PM', tag: 'Afternoon' },
    { label: '04:00 PM - 06:00 PM', tag: 'Evening' },
    { label: '06:00 PM - 08:00 PM', tag: 'Late Evening' },
  ];

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.flat.trim()) return;
    setAddingAddress(true);
    try {
      const created = await userService.addAddress(user.id, newAddress);
      setAddresses(prev => [...prev, created]);
      setSelectedAddressId(created.id);
      setAddAddressModalOpen(false);
      setNewAddress({ flat: '', street: '', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', label: 'Home' });
    } catch (err) {
      alert(err.message || 'Failed to add address');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleFinalBooking = async () => {
    if (!selectedService) {
      setBookingError('Please select a service');
      return;
    }
    if (!selectedAddressId) {
      setBookingError('Please select a doorstep service address');
      return;
    }

    setSubmitting(true);
    setBookingError('');

    try {
      const payload = {
        customerId: user.id,
        serviceId: selectedService.id,
        providerId: selectedProvider?.id || undefined,
        addressId: selectedAddressId,
        date: selectedDate,
        time: selectedTime,
        price: selectedService.basePrice || selectedService.price || 499,
        description: issueDescription || `${selectedService.name} booking request`,
      };

      const result = await bookingService.createBooking(payload);
      setBookingSuccess(result);
    } catch (err) {
      setBookingError(err.message || 'Failed to place booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <DashboardHeader title="Book a Service" subtitle="Loading booking wizard..." />
        <div className="dashboard-content">
          <LoadingSpinner message="Preparing service scheduling catalog..." />
        </div>
      </div>
    );
  }

  // SUCCESS SCREEN
  if (bookingSuccess) {
    return (
      <div>
        <DashboardHeader title="Booking Confirmed" subtitle="Your service order has been successfully placed" />
        <div className="dashboard-content">
          <div className="card" style={{ maxWidth: '640px', margin: '2rem auto', padding: '2.75rem', textAlign: 'center', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-50)',
                color: 'var(--success-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                border: '2px solid rgba(5, 150, 105, 0.2)'
              }}
            >
              <CheckCircle2 size={40} strokeWidth={2.4} />
            </div>

            <span className="badge badge-verified mb-2" style={{ margin: '0 auto' }}>
              ₹0 Advance • Pay on Completion
            </span>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--neutral-900)', margin: '0.75rem 0 0.5rem 0' }}>
              Service Appointment Scheduled!
            </h2>
            <p className="text-xs text-muted mb-6">
              Booking Ref: <strong className="font-mono text-primary">{bookingSuccess.bookingReference}</strong>
            </p>

            <div
              style={{
                backgroundColor: 'var(--neutral-50)',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--neutral-200)',
                textAlign: 'left',
                marginBottom: '1.75rem',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div className="flex justify-between py-1.5 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <span className="text-muted">Service</span>
                <strong>{selectedService?.name}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <span className="text-muted">Specialist</span>
                <strong>{selectedProvider?.name || 'Auto-Assigned Verified Pro'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <span className="text-muted">Date & Time</span>
                <strong>{formatDate(selectedDate)} at {selectedTime}</strong>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-primary" style={{ fontSize: '1.05rem' }}>
                <span>Total Amount Due</span>
                <span>{formatCurrency(selectedService?.basePrice || 499)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to={`/customer/bookings/${bookingSuccess.id}`} className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
                <span>View Order Details</span>
                <ArrowRight size={15} />
              </Link>
              <Link to="/customer/bookings" className="btn btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4 Steps Definition
  const stepsList = [
    { num: 1, label: 'Select Service' },
    { num: 2, label: 'Choose Professional' },
    { num: 3, label: 'Date & Time' },
    { num: 4, label: 'Address & Confirmation' },
  ];

  return (
    <div>
      <DashboardHeader
        title="Schedule Doorstep Service"
        subtitle="Follow 4 clear steps to book certified trade specialists."
      />

      <div className="dashboard-content">
        
        {/* STEP PROGRESS INDICATOR */}
        <div className="card mb-6" style={{ padding: '1.25rem 1.75rem', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              maxWidth: '780px',
              margin: '0 auto',
            }}
          >
            {stepsList.map((s, idx) => {
              const isDone = step > s.num;
              const isActive = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => s.num < step && setStep(s.num)}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: s.num <= step ? 'pointer' : 'default',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? 'var(--success-600)' : isActive ? 'var(--primary-800)' : 'var(--neutral-200)',
                      color: isDone || isActive ? '#fff' : 'var(--neutral-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      boxShadow: isActive ? '0 0 0 3px var(--primary-100)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isDone ? <Check size={18} strokeWidth={3} /> : `0${s.num}`}
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: isActive ? 750 : 500,
                      color: isActive ? 'var(--primary-900)' : 'var(--neutral-600)',
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-COLUMN WIZARD LAYOUT */}
        <div className="booking-wizard-grid" style={{ marginBottom: '2.5rem' }}>
          {/* LEFT WIZARD CONTENT */}
          <div className="card" style={{ padding: '2.25rem 2rem', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
            
            {bookingError && (
              <div className="alert alert-danger mb-4">
                <AlertCircle size={18} />
                <span>{bookingError}</span>
              </div>
            )}

            {/* STEP 1: SELECT SERVICE */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--neutral-900)' }}>
                  Step 01: Select Service
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: '1.5rem' }}>
                  Select the specific home maintenance or repair task needed.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '1.75rem' }}>
                  {services.map((serv) => {
                    const isSelected = selectedService?.id === serv.id;
                    return (
                      <div
                        key={serv.id}
                        onClick={() => setSelectedService(serv)}
                        className="card card-hoverable cursor-pointer"
                        style={{
                          padding: '1.25rem',
                          border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                          backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--white)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="badge badge-confirmed" style={{ fontSize: '11px' }}>
                            {serv.categoryName}
                          </span>
                          <strong style={{ fontSize: '1rem', color: 'var(--primary-900)' }}>{formatCurrency(serv.basePrice || 499)}</strong>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 750, margin: '6px 0 4px 0', color: 'var(--neutral-900)' }}>
                          {serv.name}
                        </h4>
                        <span className="text-xs text-muted">~{serv.durationMinutes || 60} mins execution</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <Button variant="primary" onClick={() => setStep(2)} style={{ padding: '0.6875rem 1.5rem', fontWeight: 700 }}>
                    <span>Continue to Choose Professional</span>
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE PROFESSIONAL */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--neutral-900)' }}>
                  Step 02: Choose Professional
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: '1.25rem' }}>
                  Choose any verified specialist you trust, or let TrustFix automatically assign the best nearby technician.
                </p>

                {/* Banner */}
                <div
                  style={{
                    backgroundColor: 'var(--primary-subtle)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--primary-900)',
                    marginBottom: '1.25rem',
                    lineHeight: 1.5,
                  }}
                >
                  💡 <strong>Provider Selection Freedom:</strong> Nearby distance is a recommendation, <strong>NOT a restriction</strong>. You can choose any verified specialist you prefer across the platform!
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div style={{ flex: '1 1 240px', position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search specialist by name or trade..."
                      value={providerSearchQuery}
                      onChange={(e) => setProviderSearchQuery(e.target.value)}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-muted">
                    <input
                      type="checkbox"
                      checked={showAllProviders}
                      onChange={(e) => setShowAllProviders(e.target.checked)}
                    />
                    <span>Show all platform specialists ({providers.length})</span>
                  </label>
                </div>

                {/* Auto Assign Option */}
                <div
                  onClick={() => setSelectedProvider(null)}
                  className="card card-hoverable cursor-pointer mb-3"
                  style={{
                    padding: '1.125rem 1.25rem',
                    border: selectedProvider === null ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                    backgroundColor: selectedProvider === null ? 'var(--primary-subtle)' : 'var(--white)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--success-50)',
                          color: 'var(--success-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(5, 150, 105, 0.25)'
                        }}
                      >
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>
                          Auto-Assign Best Verified Specialist
                        </h4>
                        <span className="text-xs text-muted">Recommended • Nearest availability and instant dispatch</span>
                      </div>
                    </div>
                    {selectedProvider === null && (
                      <span className="badge badge-verified">Selected</span>
                    )}
                  </div>
                </div>

                {/* Provider List */}
                <div className="flex flex-col gap-3 mb-6" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {availableProviders.map((p) => {
                    const isSelected = selectedProvider?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProvider(p)}
                        className="card card-hoverable cursor-pointer"
                        style={{
                          padding: '1rem 1.25rem',
                          border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                          backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--white)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 style={{ fontSize: '1rem', fontWeight: 750, margin: 0, color: 'var(--neutral-900)' }}>{p.name}</h4>
                                <span className="badge badge-verified" style={{ fontSize: '10px', padding: '2px 6px' }}>Verified</span>
                              </div>
                              <span className="text-xs text-muted">
                                {p.companyName || p.service} • ★{p.rating} ({p.experience || 5} yrs exp)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-primary">{p.city || 'Mumbai'}</span>
                            <span className="text-2xs text-muted block">Area: {p.serviceArea || 'Metro Area'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button variant="primary" onClick={() => setStep(3)} style={{ fontWeight: 700 }}>
                    <span>Continue to Date & Time</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DATE & TIME */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--neutral-900)' }}>
                  Step 03: Date & Time
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: '1.5rem' }}>
                  Choose when you would like the certified specialist to arrive at your doorstep.
                </p>

                {/* Date Picker */}
                <div className="form-group mb-6">
                  <label className="form-label font-bold">Appointment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={formatLocalDate(new Date())}
                    required
                  />
                </div>

                {/* Time Slots */}
                <div className="form-group mb-6">
                  <label className="form-label font-bold">Available Arrival Slots</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.label;
                      return (
                        <div
                          key={slot.label}
                          onClick={() => setSelectedTime(slot.label)}
                          className="card card-hoverable cursor-pointer"
                          style={{
                            padding: '1rem',
                            textAlign: 'center',
                            border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                            backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--white)',
                            cursor: 'pointer',
                          }}
                        >
                          <span className="text-2xs font-bold text-muted uppercase block mb-1">{slot.tag}</span>
                          <strong className="text-xs" style={{ color: isSelected ? 'var(--primary-900)' : 'var(--neutral-800)' }}>
                            {slot.label}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button variant="primary" onClick={() => setStep(4)} style={{ fontWeight: 700 }}>
                    <span>Continue to Address & Confirmation</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: ADDRESS & CONFIRMATION */}
            {step === 4 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>
                    Step 04: Address & Confirmation
                  </h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-light flex items-center gap-1"
                    onClick={() => setAddAddressModalOpen(true)}
                  >
                    <Plus size={14} />
                    <span>Add New Address</span>
                  </button>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: '1.25rem' }}>
                  Select the doorstep location and review your appointment details.
                </p>

                {addresses.length === 0 ? (
                  <div className="card text-center py-6 mb-5" style={{ backgroundColor: 'var(--neutral-50)' }}>
                    <MapPin size={32} color="var(--neutral-400)" style={{ margin: '0 auto 8px auto' }} />
                    <p className="text-xs text-muted mb-3">No saved addresses found in your account.</p>
                    <Button variant="primary" size="sm" onClick={() => setAddAddressModalOpen(true)}>
                      <Plus size={14} />
                      <span>Add Delivery Address</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mb-5">
                    {addresses.map((addr) => {
                      const isSelected = String(selectedAddressId) === String(addr.id);
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className="card card-hoverable cursor-pointer"
                          style={{
                            padding: '1.125rem',
                            border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                            backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--white)',
                            cursor: 'pointer',
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <MapPin size={18} color="var(--primary-700)" style={{ marginTop: '2px' }} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm font-bold text-neutral-900">{addr.label || 'Home'}</strong>
                                  {addr.isDefault && <span className="badge badge-confirmed" style={{ fontSize: '10px' }}>Default</span>}
                                </div>
                                <p className="text-xs text-muted mb-0 mt-1">
                                  {addr.flat}, {addr.street}, {addr.city} - {addr.pincode}
                                </p>
                              </div>
                            </div>
                            {isSelected && <span className="badge badge-verified">Selected</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Issue Notes */}
                <div className="form-group mb-5">
                  <label className="form-label font-bold">Describe Your Issue or Instructions (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Switchboard sparking in living room, water leak under kitchen sink..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                </div>

                {/* Final Order Review Summary Box */}
                <div
                  style={{
                    backgroundColor: 'var(--neutral-50)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                    fontSize: 'var(--font-size-sm)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div className="flex justify-between border-bottom pb-2" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <span className="text-muted">Selected Service:</span>
                    <strong>{selectedService?.name}</strong>
                  </div>

                  <div className="flex justify-between border-bottom pb-2" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <span className="text-muted">Specialist:</span>
                    <strong>{selectedProvider?.name || 'Auto-Assigned Verified Specialist'}</strong>
                  </div>

                  <div className="flex justify-between border-bottom pb-2" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <span className="text-muted">Scheduled Slot:</span>
                    <strong>{formatDate(selectedDate)} ({selectedTime})</strong>
                  </div>

                  <div className="flex justify-between pt-1 font-bold text-primary" style={{ fontSize: '1.15rem' }}>
                    <span>Estimated Total:</span>
                    <span>{formatCurrency(selectedService?.basePrice || 499)}</span>
                  </div>
                </div>

                {/* Guarantee Banner */}
                <div
                  style={{
                    backgroundColor: 'var(--success-50)',
                    border: '1px solid rgba(5, 150, 105, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--success-900)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldCheck size={16} color="var(--success-600)" />
                    <span>TrustFix Booking Guarantee</span>
                  </div>
                  <span>₹0 advance required. 100% verified technician doorstep visit. Pay securely after job completion and testing. 30-day workmanship warranty included.</span>
                </div>

                <div className="flex justify-between pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!selectedAddressId}
                    loading={submitting}
                    onClick={handleFinalBooking}
                    style={{ padding: '0.75rem 1.75rem', fontWeight: 700 }}
                  >
                    <span>Confirm & Schedule Visit</span>
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: STICKY ORDER SUMMARY PANEL */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-200)' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '1.25rem', color: 'var(--neutral-900)' }}>
                Booking Summary
              </h4>

              {selectedService ? (
                <div>
                  <div className="flex items-center gap-3 pb-3 mb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary-800)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Wrench size={22} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '1rem', fontWeight: 750, margin: 0 }}>{selectedService.name}</h5>
                      <span className="text-xs text-muted">{selectedService.categoryName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs text-muted mb-4">
                    <div className="flex justify-between">
                      <span>Assigned Specialist:</span>
                      <strong className="text-neutral-900">{selectedProvider?.name || 'Auto-Assign Best Pro'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Schedule:</span>
                      <strong className="text-neutral-900">{selectedDate} ({selectedTime.split(' - ')[0]})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Advance Deposit:</span>
                      <strong className="text-success font-bold">₹0 (Pay Later)</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-top mb-4" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-sm text-neutral-900">Total Due on Visit:</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                        {formatCurrency(selectedService.basePrice || selectedService.price || 499)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-neutral-50 text-xs text-muted flex items-start gap-2">
                    <ShieldCheck size={16} color="var(--success-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Includes 30-day TrustFix warranty and certified inspection.</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-xs">Select a service to view rate breakdown.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Address Modal */}
      {addAddressModalOpen && (
        <Modal
          isOpen={addAddressModalOpen}
          onClose={() => setAddAddressModalOpen(false)}
          title="Add New Service Address"
        >
          <form onSubmit={handleAddAddressSubmit}>
            <Input
              label="Flat / House / Suite No."
              value={newAddress.flat}
              onChange={(e) => setNewAddress(prev => ({ ...prev, flat: e.target.value }))}
              placeholder="e.g. Flat 402, Greenfield Apts"
              required
            />
            <Input
              label="Street / Landmark"
              value={newAddress.street}
              onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
              placeholder="e.g. Linking Road, Bandra West"
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Input
                label="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                required
              />
              <Input
                label="Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setAddAddressModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={addingAddress}>
                Save Address
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
