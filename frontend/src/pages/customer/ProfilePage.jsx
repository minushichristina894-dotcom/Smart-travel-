/**
 * ============================================================
 * PROFILE PAGE - Customer update profile form
 * Fields: Full Name, Email, Phone, Password (optional)
 * ============================================================
 */
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { FormField, Input } from '../../components/ui/FormField';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Load current user data from API when page opens
  useEffect(() => {
    userAPI.getProfile().then(({ data }) => {
      setForm({
        full_name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone,
        password: '',
        confirmPassword: '',
      });
    });
  }, []);

  // Save profile changes to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      showToast('Passwords do not match.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = { full_name: form.full_name, email: form.email, phone: form.phone };
      if (form.password) payload.password = form.password; // only send if user typed new password

      const { data } = await userAPI.updateProfile(payload);
      updateUser({ ...user, ...data.user });
      setMessage({ type: 'success', text: 'Profile updated!' });
      showToast('Profile updated successfully!', 'success');
    } catch {
      setMessage({ type: 'error', text: 'Update failed.' });
      showToast('Profile update failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="font-display font-bold text-3xl mb-8">My Profile</h1>

        {message && <Alert type={message.type} message={message.text} />}

        {/* ===== PROFILE UPDATE FORM ===== */}
        <form onSubmit={handleSubmit} className="profile-form-card profile-form-section">

          {/* Username cannot be changed */}
          <FormField label="Username">
            <Input value={user?.username || ''} disabled className="bg-gray-50" />
          </FormField>

          <FormField label="Full Name" required>
            <Input
              name="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Phone" required>
            <Input
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </FormField>

          <FormField label="New Password">
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </FormField>

          <FormField label="Confirm Password">
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </FormField>

          {/* Save button */}
          <Button type="submit" btnClass="save-profile-btn" loading={loading} className="w-full">
            Save Changes
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
