import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchUsers = () => {
    adminAPI.getUsers().then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try {
      await adminAPI.deleteUser(id);
      setMessage({ type: 'success', text: 'Customer deleted.' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete.' });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="font-display font-bold text-3xl mb-8">Manage Users (Customers)</h1>
      {message && <Alert type={message.type} message={message.text} />}
      {loading ? <LoadingSpinner size="lg" /> : (
        <div className="admin-users-table-card">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Full Name</th><th className="pb-3">Username</th><th className="pb-3">Email</th><th className="pb-3">Phone</th><th className="pb-3">Actions</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-3 font-medium">{u.full_name}</td>
                  <td className="py-3">{u.username}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.phone}</td>
                  <td className="py-3">
                    <button onClick={() => handleDelete(u.id, u.full_name)} className="text-red-500 text-sm font-medium">Delete</button>
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

export default AdminUsers;
