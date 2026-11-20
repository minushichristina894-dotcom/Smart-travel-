import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/currency';
import { bookingAPI } from '../../services/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchBookings = () => {
    bookingAPI.getAll()
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status);
      setMessage({ type: 'success', text: 'Status updated.' });
      fetchBookings();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update status.' });
    }
  };

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  return (
    <DashboardLayout>
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-8">Manage Bookings</h1>

      {message && <div className="mb-6"><Alert type={message.type} message={message.text} onClose={() => setMessage(null)} /></div>}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="admin-bookings-table-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Destination</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Travelers</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50">
                  <td className="py-4">#{b.id}</td>
                  <td className="py-4">
                    <p className="font-medium">{b.user_name}</p>
                    <p className="text-xs text-gray-400">{b.user_email}</p>
                  </td>
                  <td className="py-4">{b.destination_name}</td>
                  <td className="py-4">{new Date(b.travel_date).toLocaleDateString()}</td>
                  <td className="py-4">{b.travelers}</td>
                  <td className="py-4 font-semibold text-primary-500">{formatCurrency(b.total_price)}</td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="py-4">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBookings;
