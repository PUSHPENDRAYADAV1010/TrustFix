import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/FeedbackStates';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Calendar, Search, CheckCircle2, XCircle, ArrowRight, User } from 'lucide-react';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Status Change Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [targetStatus, setTargetStatus] = useState('CONFIRMED');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load platform bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenStatusModal = (b) => {
    setSelectedBooking(b);
    setTargetStatus(b.status || 'CONFIRMED');
    setModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedBooking?.id) return;
    setActionLoading(true);
    try {
      await adminService.updateBookingStatus(selectedBooking.id, targetStatus);
      setModalOpen(false);
      await fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const ref = (b.bookingReference || '').toLowerCase();
    const cust = (b.customerName || '').toLowerCase();
    const serv = (b.serviceName || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || ref.includes(q) || cust.includes(q) || serv.includes(q);
    return matchesStatus && matchesSearch;
  });

  const filterTabs = [
    { label: 'All', value: 'ALL', count: bookings.length },
    { label: 'Pending', value: 'PENDING', count: bookings.filter(b => b.status === 'PENDING').length },
    { label: 'Confirmed', value: 'CONFIRMED', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { label: 'In Progress', value: 'IN_PROGRESS', count: bookings.filter(b => b.status === 'IN_PROGRESS').length },
    { label: 'Completed', value: 'COMPLETED', count: bookings.filter(b => b.status === 'COMPLETED').length },
    { label: 'Cancelled', value: 'CANCELLED', count: bookings.filter(b => b.status === 'CANCELLED').length },
  ];

  return (
    <div>
      <DashboardHeader
        title="Platform Bookings Monitor"
        subtitle="Live tracking and lifecycle supervision of all home service orders."
      />

      <div className="dashboard-content">
        
        {/* Controls Card */}
        <div className="card mb-6" style={{ padding: '1rem', backgroundColor: 'var(--white)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`btn btn-sm ${filterStatus === tab.value ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setFilterStatus(tab.value)}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      backgroundColor: filterStatus === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--neutral-200)',
                      color: filterStatus === tab.value ? '#fff' : 'var(--neutral-700)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '32px', fontSize: '13px' }}
                placeholder="Search reference, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <LoadingSpinner message="Loading platform bookings..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings match filter"
            description="No transaction records found matching your current filter or search."
          />
        ) : (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--white)' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref & Service</th>
                    <th>Customer</th>
                    <th>Provider</th>
                    <th>Date & Slot</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong className="text-sm block" style={{ color: 'var(--neutral-900)' }}>
                          {b.serviceName}
                        </strong>
                        <span className="text-2xs text-muted font-mono">{b.bookingReference || `BK-${b.id}`}</span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold block">{b.customerName}</span>
                        <span className="text-2xs text-muted">{b.customerPhone || b.customerEmail || ''}</span>
                      </td>
                      <td>
                        <span className="text-xs font-medium">{b.providerName || b.providerBusinessName || 'Auto-Dispatch'}</span>
                      </td>
                      <td>
                        <span className="text-xs block">{formatDate(b.date || b.bookingDate)}</span>
                        <span className="text-2xs text-muted">{b.time || b.bookingTime}</span>
                      </td>
                      <td>
                        <strong className="text-sm text-primary">
                          {formatCurrency(b.price || b.totalPrice || b.totalAmount || 499)}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleOpenStatusModal(b)}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Update Status: ${selectedBooking?.bookingReference || ''}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={actionLoading} onClick={handleConfirmStatusUpdate}>
                Save Status
              </Button>
            </>
          }
        >
          <div>
            <div className="form-group mb-4">
              <label className="form-label font-bold">New Booking Status</label>
              <select
                className="form-control"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
              >
                <option value="PENDING">PENDING (Awaiting Dispatch)</option>
                <option value="CONFIRMED">CONFIRMED (Provider Accepted)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Technician on Site)</option>
                <option value="COMPLETED">COMPLETED (Service Finished)</option>
                <option value="CANCELLED">CANCELLED (Void / Cancelled)</option>
              </select>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
};
