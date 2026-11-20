/**
 * AdminActivities.jsx — SMALL REACT CONNECTOR ONLY
 *
 * HTML structure  →  src/html/admin-activities.html
 * CSS styles      →  src/index.css
 * JavaScript      →  src/js/adminActivitiesPage.js
 */
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import AgeCategoryBadge from '../../components/ui/AgeCategoryBadge';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { formatCurrency } from '../../utils/currency';
import { AGE_CATEGORIES, DEFAULT_AGE_CATEGORY } from '../../utils/ageCategory';
import {
  loadAdminActivities,
  loadAdminDestinations,
  createActivity,
  DEFAULT_ACTIVITY_FORM,
} from '../../js/adminActivitiesPage';

const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_ACTIVITY_FORM });

  const load = () => loadAdminActivities().then(setActivities);

  useEffect(() => {
    load();
    loadAdminDestinations().then(setDestinations);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createActivity({
      ...form,
      price: parseFloat(form.price),
      duration_hours: parseInt(form.duration_hours, 10),
    });
    setShowForm(false);
    setForm({ ...DEFAULT_ACTIVITY_FORM });
    load();
  };

  return (
    <DashboardLayout>
      <div className="admin-page-header-section">
        <h1 className="font-display font-bold text-3xl">Manage Activities</h1>
        <Button btnClass="add-activity-btn" className="text-sm" onClick={() => setShowForm(true)}>
          + Add Activity
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-activity-form-card admin-activity-form-section">
          <FormField label="Destination" required>
            <Select value={form.destination_id} onChange={(e) => setForm({ ...form, destination_id: e.target.value })} required>
              <option value="">Select...</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>

          <FormField label="Activity Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FormField>

          <FormField label="Description">
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Price (LKR)" required>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </FormField>

            <FormField label="Duration (hours)">
              <Input type="number" value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: e.target.value })} />
            </FormField>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Age Category" required>
              <Select value={form.age_category} onChange={(e) => setForm({ ...form, age_category: e.target.value })} required>
                {AGE_CATEGORIES.map((age) => (
                  <option key={age.value} value={age.value}>
                    {age.label} — {age.hint}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Image URL">
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </FormField>
          </div>

          {form.image_url && (
            <div className="flex items-center gap-3">
              <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
              <span className="text-xs text-gray-500">Image preview</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" btnClass="create-activity-btn">Create</Button>
            <Button type="button" btnClass="cancel-activity-form-btn" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="admin-activities-table-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3 pr-4">Photo</th>
              <th className="pb-3">Activity</th>
              <th className="pb-3">Destination</th>
              <th className="pb-3">Age Category</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id} className="border-b border-gray-50">
                <td className="py-3 pr-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-100 shrink-0">
                    <img
                      src={a.image_url || a.destination_image}
                      alt={a.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 font-medium">{a.name}</td>
                <td className="py-3">{a.destination_name}</td>
                <td className="py-3">
                  <AgeCategoryBadge category={a.age_category} />
                </td>
                <td className="py-3">{formatCurrency(a.price)}</td>
                <td className="py-3">{a.duration_hours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AdminActivities;
