import React, { useState, useEffect } from 'react';
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
  Shield
} from 'lucide-react';

export const BookServicePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('serviceId') || '';
  const initialProviderId = searchParams.get('providerId') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialDate = searchParams.get('date') || '';

  const navigate = useNavigate();

  // Wizard Step State (1 to 5)
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

        // Auto-select initial service
        if (initialServiceId) {
          const foundServ = allServs.find(s => String(s.id) === String(initialServiceId));
          if (foundServ) setSelectedService(foundServ);
        } else if (allServs.length > 0) {
          setSelectedService(allServs[0]);
        }

        // Auto-select initial provider
        if (initialProviderId) {
          const foundProv = allProvs.find(p => String(p.id) === String(initialProviderId));
          if (foundProv) setSelectedProvider(foundProv);
        }
      } catch (err) {
        console.error('Failed to load booking data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    initData();
  }, [user?.id, initialServiceId, initialProviderId]);

  // When selected service changes, filter matching providers
  const availableProviders = selectedService
    ? providers.filter(p => {
        const pTrade = (p.service || '').toLowerCase();
        const sCat = (selectedService.categoryName || '').toLowerCase();
        return pTrade.includes(sCat) || sCat.includes(pTrade) || pTrade.includes('repair');
      })
    : providers;

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
      setBookingError('Please select a service address');
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
        <DashboardHeader title="Booking Confirmed" subtitle="Your service order has been placed" />
        <div className="dashboard-content">
          <div className="card" style={{ maxWidth: '640px', margin: '2rem auto', padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--white)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-100)',
                color: 'var(--success-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle2 size={36} strokeWidth={2.4} />
            </div>

            <span className="badge badge-verified mb-2" style={{ margin: '0 auto' }}>
              ₹0 Advance • Pay on Completion
            </span>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)', margin: '0.75rem 0 0.5rem 0' }}>
              Service Appointment Scheduled!
            </h2>
            <p className="text-xs text-muted mb-6">
              Booking Ref: <strong className="font-mono text-primary">{bookingSuccess.bookingReference}</strong>
            </p>

            <div
              style={{
                backgroundColor: 'var(--neutral-50)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--neutral-200)',
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <div className="flex justify-between py-1 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <span className="text-muted">Service</span>
                <strong>{selectedService?.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <span className="text-muted">Specialist</span>
                <strong>{selectedProvider?.name || 'Assigned Verified Pro'}</strong>
              </div>
              <div className="flex justify-between py-1 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <span className="text-muted">Date & Time</span>
                <strong>{formatDate(selectedDate)} at {selectedTime}</strong>
              </div>
              <div className="flex justify-between py-1 font-bold text-primary">
                <span>Total Amount Due</span>
                <span>{formatCurrency(selectedService?.basePrice || 499)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to={`/customer/bookings/${bookingSuccess.id}`} className="btn btn-primary">
                <span>View Order Details</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/customer/bookings" className="btn btn-secondary">
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Provider' },
    { num: 3, label: 'Date & Slot' },
    { num: 4, label: 'Address' },
    { num: 5, label: 'Confirm' },
  ];

  return (
    <div>
      <DashboardHeader
        title="Schedule Home Service"
        subtitle="Complete 5 simple steps to book verified doorstep technicians."
      />

      <div className="dashboard-content">
        
        {/* STEP PROGRESS INDICATOR */}
        <div className="card mb-6" style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--white)' }}>
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
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? 'var(--success-600)' : isActive ? 'var(--primary-700)' : 'var(--neutral-200)',
                      color: isDone || isActive ? '#fff' : 'var(--neutral-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '4px',
                      boxShadow: isActive ? '0 0 0 3px var(--primary-100)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : `0${s.num}`}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--primary-800)' : 'var(--neutral-600)',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1.1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* LEFT WIZARD CONTENT */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
            
            {bookingError && (
              <div className="alert alert-danger mb-4">
                <AlertCircle size={18} />
                <span>{bookingError}</span>
              </div>
            )}

            {/* STEP 1: SELECT SERVICE */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Step 01: Choose Service
                </h3>
                <p className="text-xs text-muted mb-4">Select the specific home maintenance or repair task needed.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
                  {services.map((serv) => {
                    const isSelected = selectedService?.id === serv.id;
                    return (
                      <div
                        key={serv.id}
                        onClick={() => setSelectedService(serv)}
                        className="card card-hoverable cursor-pointer"
                        style={{
                          padding: '1rem',
                          border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                          backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--white)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="badge badge-confirmed" style={{ fontSize: '10px' }}>
                            {serv.categoryName}
                          </span>
                          <strong className="text-xs text-primary">{formatCurrency(serv.basePrice || 499)}</strong>
                        </div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0' }}>{serv.name}</h5>
                        <span className="text-2xs text-muted">~{serv.durationMinutes || 60} mins</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" onClick={() => setStep(2)}>
                    <span>Continue to Provider</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT PROVIDER */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Step 02: Select Service Provider
                </h3>
                <p className="text-xs text-muted mb-4">Pick a verified expert or let TrustFix automatically assign the best nearby specialist.</p>

                {/* Option: Auto Assign */}
                <div
                  onClick={() => setSelectedProvider(null)}
                  className="card card-hoverable cursor-pointer mb-3"
                  style={{
                    padding: '1rem 1.25rem',
                    border: selectedProvider === null ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                    backgroundColor: selectedProvider === null ? 'var(--primary-50)' : 'var(--white)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--success-100)',
                          color: 'var(--success-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                          Auto-Assign Best Verified Specialist
                        </h5>
                        <span className="text-xs text-muted">Recommended • Fast Dispatch & Nearest Availability</span>
                      </div>
                    </div>
                    {selectedProvider === null && (
                      <span className="badge badge-verified">Selected</span>
                    )}
                  </div>
                </div>

                {/* List of Specific Providers */}
                <div className="flex flex-col gap-3 mb-6">
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
                          backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--white)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{p.name}</h5>
                                <span className="badge badge-verified" style={{ fontSize: '10px', padding: '1px 5px' }}>Verified</span>
                              </div>
                              <span className="text-xs text-muted">
                                {p.companyName} • ★{p.rating} ({p.experience} yrs exp)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-primary">{p.city || 'Mumbai'}</span>
                            <span className="text-2xs text-muted block">Radius: {p.serviceRadiusKm || 25} km</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button variant="primary" onClick={() => setStep(3)}>
                    <span>Continue to Schedule</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DATE & TIME */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Step 03: Select Date & Time Slot
                </h3>
                <p className="text-xs text-muted mb-4">Choose when you would like the certified specialist to arrive.</p>

                {/* Date Picker */}
                <div className="form-group mb-5">
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
                  <label className="form-label font-bold">Available Time Slots</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.label;
                      return (
                        <div
                          key={slot.label}
                          onClick={() => setSelectedTime(slot.label)}
                          className="card card-hoverable cursor-pointer"
                          style={{
                            padding: '0.875rem',
                            textAlign: 'center',
                            border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                            backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--white)',
                            cursor: 'pointer',
                          }}
                        >
                          <span className="text-2xs font-bold text-muted uppercase block">{slot.tag}</span>
                          <strong className="text-xs" style={{ color: isSelected ? 'var(--primary-900)' : 'var(--neutral-800)' }}>
                            {slot.label}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button variant="primary" onClick={() => setStep(4)}>
                    <span>Continue to Address</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: ADDRESS SELECTION */}
            {step === 4 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    Step 04: Service Address
                  </h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-light text-xs flex items-center gap-1"
                    onClick={() => setAddAddressModalOpen(true)}
                  >
                    <Plus size={13} />
                    <span>Add New Address</span>
                  </button>
                </div>
                <p className="text-xs text-muted mb-4">Select the doorstep location where the service should be performed.</p>

                {addresses.length === 0 ? (
                  <div className="card text-center py-6 mb-4" style={{ backgroundColor: 'var(--neutral-50)' }}>
                    <MapPin size={28} color="var(--neutral-400)" style={{ margin: '0 auto 8px auto' }} />
                    <p className="text-xs text-muted mb-3">No saved addresses found in your account.</p>
                    <Button variant="primary" size="sm" onClick={() => setAddAddressModalOpen(true)}>
                      <Plus size={13} />
                      <span>Add Delivery Address</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mb-6">
                    {addresses.map((addr) => {
                      const isSelected = String(selectedAddressId) === String(addr.id);
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className="card card-hoverable cursor-pointer"
                          style={{
                            padding: '1rem',
                            border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                            backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--white)',
                            cursor: 'pointer',
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2.5">
                              <MapPin size={16} color="var(--primary-700)" style={{ marginTop: '2px' }} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm font-bold">{addr.label || 'Home'}</strong>
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
                <div className="form-group mb-6">
                  <label className="form-label font-bold">Describe Your Issue or Instructions (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Living room switchboard sparking, water leak under kitchen sink..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button variant="primary" disabled={!selectedAddressId} onClick={() => setStep(5)}>
                    <span>Review & Confirm</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: FINAL CONFIRMATION */}
            {step === 5 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Step 05: Review & Confirm Booking
                </h3>
                <p className="text-xs text-muted mb-4">Verify all appointment details before submitting with zero advance deposit.</p>

                <div
                  style={{
                    backgroundColor: 'var(--neutral-50)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
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
                    <span className="text-muted">Schedule Date:</span>
                    <strong>{formatDate(selectedDate)} ({selectedTime})</strong>
                  </div>

                  <div className="flex justify-between border-bottom pb-2" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <span className="text-muted">Doorstep Address:</span>
                    <strong className="text-truncate">
                      {(() => {
                        const a = addresses.find(x => String(x.id) === String(selectedAddressId));
                        return a ? `${a.flat}, ${a.street}, ${a.city}` : 'Selected Address';
                      })()}
                    </strong>
                  </div>

                  <div className="flex justify-between pt-1 font-bold text-primary" style={{ fontSize: '1.05rem' }}>
                    <span>Estimated Total:</span>
                    <span>{formatCurrency(selectedService?.basePrice || 499)}</span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--success-50)',
                    border: '1px solid var(--success-100)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem',
                    fontSize: '11px',
                    color: 'var(--success-800)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    <ShieldCheck size={14} color="var(--success-600)" />
                    <span>TrustFix Booking Guarantee</span>
                  </div>
                  <span>100% verified technician doorstep visit. Pay securely after job completion and testing. 30-day warranty included.</span>
                </div>

                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(4)}>
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button variant="primary" loading={submitting} onClick={handleFinalBooking}>
                    <span>Confirm & Book (₹0 Advance)</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: STICKY ORDER SUMMARY */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neutral-900)' }}>
                Booking Summary
              </h4>

              {selectedService ? (
                <div>
                  <div className="flex items-center gap-3 pb-3 mb-3 border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <img
                      src={resolveServiceImage(selectedService)}
                      alt={selectedService.name}
                      style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{selectedService.name}</h5>
                      <span className="text-xs text-muted font-semibold">{selectedService.categoryName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-muted mb-4">
                    <div className="flex justify-between">
                      <span>Assigned Pro:</span>
                      <strong className="text-neutral-800">{selectedProvider?.name || 'Auto-Dispatch'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <strong className="text-neutral-800">{formatDate(selectedDate)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Slot:</span>
                      <strong className="text-neutral-800">{selectedTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Advance Fee:</span>
                      <strong className="text-success">₹0.00</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-top" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                    <span className="text-xs text-muted font-bold uppercase">Estimated Amount:</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                      {formatCurrency(selectedService.basePrice || 499)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">Please choose a service to see summary details.</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Address Modal */}
        <Modal
          isOpen={addAddressModalOpen}
          onClose={() => setAddAddressModalOpen(false)}
          title="Add New Service Address"
          footer={
            <>
              <Button variant="secondary" onClick={() => setAddAddressModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={addingAddress} onClick={handleAddAddressSubmit}>
                Save Address
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddAddressSubmit}>
            <Input
              label="Flat / House / Building"
              placeholder="e.g. Flat 402, Green Meadows"
              value={newAddress.flat}
              onChange={(e) => setNewAddress({ ...newAddress, flat: e.target.value })}
              required
            />
            <Input
              label="Street / Area / Landmark"
              placeholder="e.g. Link Road, Near Metro Station"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                required
              />
              <Input
                label="Postal Code (PIN)"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                required
              />
            </div>
          </form>
        </Modal>

      </div>
    </div>
  );
};
