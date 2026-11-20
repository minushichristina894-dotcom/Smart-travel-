/** ADMIN SIDE � Admin dashboard | URL: /admin | Admin login only */
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Total Staff', value: stats.totalStaff },
    { label: 'Destinations', value: stats.totalDestinations },
    { label: 'Activities', value: stats.totalActivities },
    { label: 'Bookings', value: stats.totalBookings },
  ] : [];

  return (
    <DashboardLayout>
      <h1 className="font-display font-bold text-3xl mb-8">Admin Dashboard</h1>
      {loading ? <LoadingSpinner size="lg" /> : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {cards.map((c) => (
              <div key={c.label} className="admin-stats-card">
                <div><p className="text-sm text-gray-500">{c.label}</p><p className="text-2xl font-bold">{c.value}</p></div>
              </div>
            ))}
          </div>
          <div className="admin-overview-card">
            <h2 className="font-bold text-lg mb-4">Recent Bookings</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Customer</th><th className="pb-2">Destination</th><th className="pb-2">Date</th><th className="pb-2">Total</th><th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {(stats.recentBookings || []).map((b) => (
                  <tr key={b.id} className="border-b border-gray-50">
                    <td className="py-2">{b.user_name}</td>
                    <td className="py-2">{b.destination_name}</td>
                    <td className="py-2">{new Date(b.travel_date).toLocaleDateString()}</td>
                    <td className="py-2">{formatCurrency(b.total_price)}</td>
                    <td className="py-2 capitalize">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
