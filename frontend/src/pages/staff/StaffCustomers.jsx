import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';

const StaffCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getCustomers()
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl">Customers</h1>
        <p className="text-gray-500 mt-2">View registered customers and contact them about bookings or weather alerts.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="staff-customers-table-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th>
                <th className="pb-3">Username</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium">{u.full_name}</td>
                  <td className="py-3">{u.username}</td>
                  <td className="py-3">
                    <a href={`mailto:${u.email}`} className="text-primary-600 hover:underline">{u.email}</a>
                  </td>
                  <td className="py-3">
                    <a href={`tel:${u.phone}`} className="text-primary-600 hover:underline">{u.phone}</a>
                  </td>
                  <td className="py-3 font-semibold">{u.booking_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-gray-500 py-8">No customers registered yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffCustomers;
