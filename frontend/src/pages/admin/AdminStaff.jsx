/**
 * ============================================================
 * ADMIN - Manage Staff (create staff accounts)
 * Form: Full Name, Username, Email, Password, Phone, Department
 * ============================================================
 */
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { FormField, Input } from '../../components/ui/FormField';
import { adminAPI } from '../../services/api';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: '', username: '', email: '', password: '', phone: '', department: 'Operations',
  });
  const [msg, setMsg] = useState(null);

  const load = () => adminAPI.getStaff().then(({ data }) => setStaff(data.staff));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createStaff(form);
      setMsg({ type: 'success', text: 'Staff member created.' });
      setShowForm(false);
      load();
    } catch {
      setMsg({ type: 'error', text: 'Failed to create staff.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-page-header-section">
        <h1 className="font-display font-bold text-3xl">Manage Staff</h1>
        <Button btnClass="add-staff-btn" className="text-sm" onClick={() => setShowForm(true)}>
          + Add Staff
        </Button>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} />}

      {/* ===== ADD STAFF FORM ===== */}
      {showForm && (
        <form onSubmit={handleCreate} className="admin-staff-form-card admin-staff-form-section">
          <FormField label="Full Name" required>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </FormField>
          <FormField label="Username" required>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </FormField>
          <FormField label="Email" required>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </FormField>
          <FormField label="Password" required>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </FormField>
          <FormField label="Department">
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </FormField>

          <Button type="submit" btnClass="create-staff-btn" className="sm:col-span-2">
            Create Staff
          </Button>
        </form>
      )}

      <div className="admin-staff-table-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Username</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-gray-50">
                <td className="py-3">{s.full_name}</td>
                <td className="py-3">{s.username}</td>
                <td className="py-3">{s.email}</td>
                <td className="py-3">{s.department}</td>
                <td className="py-3">{s.is_active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AdminStaff;
