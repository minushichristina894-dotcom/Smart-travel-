/** STAFF SIDE � Staff dashboard | URL: /staff | Staff login only */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import RiskBadge from '../../components/ui/RiskBadge';
import { adminAPI, bookingAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    adminAPI.getStaffStats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const confirmBooking = async (id) => {
    try {
      await bookingAPI.updateStatus(id, 'confirmed');
      showToast('Booking confirmed!', 'success');
      load();
    } catch {
      showToast('Failed to confirm booking.', 'error');
    }
  };

  const cards = stats ? [
    { label: "Today's Trips", value: stats.todaysBookings, link: '/staff/bookings' },
    { label: 'Pending (Needs Action)', value: stats.pendingBookings, link: '/staff/bookings' },
    { label: 'Completed', value: stats.completedBookings, link: '/staff/bookings' },
    { label: 'Weather Alerts', value: stats.weatherAlerts, link: '/staff/weather-alerts' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl">Staff Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Your job: confirm customer bookings, monitor weather risks, and support travelers.
        </p>
      </div>

      {loading ? <LoadingSpinner size="lg" /> : (
        <>
          <div className="staff-stats-grid-section">
            {cards.map((c) => (
              <Link key={c.label} to={c.link} className="staff-dashboard-stat-card">
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-3xl font-bold text-primary-600">{c.value}</p>
              </Link>
            ))}
          </div>

          {/* Quick actions � main staff work */}
          <div className="staff-quick-links-section">
            <Link to="/staff/bookings" className="staff-quick-link-card">
              <p className="font-semibold">Manage Bookings</p>
              <p className="text-sm text-gray-500 mt-1">Confirm, cancel, or complete customer trips</p>
            </Link>
            <Link to="/staff/weather-alerts" className="staff-quick-link-card">
              <p className="font-semibold">Weather Alerts</p>
              <p className="text-sm text-gray-500 mt-1">Review moderate & high risk travel warnings</p>
            </Link>
            <Link to="/staff/customers" className="staff-quick-link-card">
              <p className="font-semibold">View Customers</p>
              <p className="text-sm text-gray-500 mt-1">Customer contact details & booking history</p>
            </Link>
          </div>

          {/* Pending bookings � staff must act here */}
          <div className="staff-pending-bookings-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Pending Bookings � Action Required</h2>
              <Link to="/staff/bookings" className="text-sm text-primary-500 font-medium hover:underline">View all</Link>
            </div>

            {!stats?.pendingList?.length ? (
              <p className="text-gray-500 text-center py-8">No pending bookings. When customers book trips, they appear here for you to confirm.</p>
            ) : (
              <div className="space-y-3">
                {stats.pendingList.map((b) => (
                  <div key={b.id} className="staff-pending-booking-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{b.user_name} ? {b.destination_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(b.travel_date).toLocaleDateString()} � {b.travelers} traveler(s) � {formatCurrency(b.total_price)}
                      </p>
                      {b.activity_name && <p className="text-sm text-primary-600">{b.activity_name}</p>}
                      {b.risk_level && <div className="mt-2"><RiskBadge level={b.risk_level} /></div>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button btnClass="confirm-staff-booking-btn" className="text-sm py-2" onClick={() => confirmBooking(b.id)}>
                        Confirm
                      </Button>
                      <Link to="/staff/bookings">
                        <Button btnClass="staff-booking-details-btn" className="text-sm py-2">Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default StaffDashboard;
