import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import RiskBadge from '../../components/ui/RiskBadge';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { bookingAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

const StaffBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    bookingAPI.getAll()
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status);
      showToast(`Booking marked as ${status}.`, 'success');
      load();
    } catch {
      showToast('Failed to update booking.', 'error');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl">Manage Bookings</h1>
        <p className="text-gray-500 mt-2">Confirm new trips, update status, and check weather risk before approving.</p>
      </div>

      <Alert type="info" message="Staff work: Review pending bookings → Confirm if safe → Mark completed after trip." />

      <div className="flex flex-wrap gap-2 my-6">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-50'
            }`}
          >
            {f.label} ({f.key === 'all' ? bookings.length : bookings.filter((b) => b.status === f.key).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="staff-bookings-empty-card">
          <p className="font-medium">No bookings in this category.</p>
          <p className="text-sm mt-2">When customers book from their dashboard, pending trips appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className={`my-bookings-list-card ${b.status === 'pending' ? 'border-l-4 border-yellow-400' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex gap-4">
                  {b.image_url && (
                    <img src={b.image_url} alt="" className="w-20 h-20 rounded-xl object-cover hidden sm:block" />
                  )}
                  <div>
                    <p className="font-bold text-lg">{b.destination_name}</p>
                    <p className="text-sm text-gray-500">{b.user_name} · {b.user_email} · {b.user_phone}</p>
                    {b.activity_name && <p className="text-sm text-primary-600 mt-1">Activity: {b.activity_name}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      Travel: {new Date(b.travel_date).toLocaleDateString()} · {b.travelers} traveler(s) · {formatCurrency(b.total_price)}
                    </p>
                    <div className="flex gap-2 mt-2 items-center">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>{b.status}</span>
                      {b.risk_level && <RiskBadge level={b.risk_level} />}
                      <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                        b.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>{b.payment_status || 'unpaid'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {b.status === 'pending' && (
                    <>
                      <Button btnClass="confirm-staff-booking-btn" className="text-sm" onClick={() => updateStatus(b.id, 'confirmed')}>
                        Confirm Trip
                      </Button>
                      <Button btnClass="cancel-booking-btn" className="text-sm" onClick={() => updateStatus(b.id, 'cancelled')}>
                        Reject
                      </Button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <Button btnClass="complete-booking-btn" className="text-sm" onClick={() => updateStatus(b.id, 'completed')}>
                      Mark Completed
                    </Button>
                  )}
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="text-sm border border-gray-200 rounded-xl px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffBookings;
