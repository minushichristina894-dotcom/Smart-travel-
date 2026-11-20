import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import RiskBadge from '../../components/ui/RiskBadge';
import { formatCurrency } from '../../utils/currency';
import { bookingAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchBookings = () => {
    bookingAPI.getAll()
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      setMessage({ type: 'success', text: 'Booking cancelled successfully.' });
      showToast('Booking cancelled successfully.', 'success');
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking.';
      setMessage({ type: 'error', text: msg });
      showToast(msg, 'error');
    }
  };

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  const paymentColors = {
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-orange-100 text-orange-700',
    refunded: 'bg-gray-100 text-gray-700',
  };

  return (
    <DashboardLayout>
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-8">View bookings, pay unpaid trips, and open trip reports</p>

      {message && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="my-bookings-empty-card">
          <h3 className="font-display font-bold text-xl mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
          <Link to="/booking" className="book-trip-btn inline-block">Book a Trip</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="my-bookings-list-card">
              <img src={booking.image_url} alt="" className="w-full md:w-32 h-32 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-display font-bold text-xl">{booking.destination_name}</h3>
                    <p className="text-gray-500">{booking.country}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${paymentColors[booking.payment_status] || paymentColors.unpaid}`}>
                      {booking.payment_status || 'unpaid'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-400">Travel Date</p>
                    <p className="font-semibold">{new Date(booking.travel_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Travelers</p>
                    <p className="font-semibold">{booking.travelers}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Price</p>
                    <p className="font-semibold text-primary-500">{formatCurrency(booking.total_price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Risk</p>
                    {booking.risk_level ? <RiskBadge level={booking.risk_level} /> : <span>—</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {booking.payment_status !== 'paid' && booking.status !== 'cancelled' && (
                  <Button btnClass="pay-now-btn" className="whitespace-nowrap" onClick={() => navigate(`/payment/${booking.id}`)}>
                    Pay Now
                  </Button>
                )}
                {(booking.status === 'confirmed' || booking.status === 'completed') && (
                  <Link to={`/trip-report/${booking.id}`}>
                    <Button btnClass="trip-report-btn" className="w-full whitespace-nowrap">Trip Report</Button>
                  </Link>
                )}
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id)}
                    className="px-4 py-2 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyBookingsPage;
