/**
 * ============================================================
 * ADMIN - Manage Destinations (add / edit / delete)
 * Form: Name, Country, Price, Image, Lat/Lng, Description, Gallery
 * ============================================================
 */
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/currency';
import { destinationAPI } from '../../services/api';
import { FormField, Input, TextArea } from '../../components/ui/FormField';
import { useToast } from '../../context/ToastContext';

const emptyForm = {
  name: '', country: '', description: '', image_url: '',
  price: '', latitude: '', longitude: '',
  gallery: '',
};

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const { showToast } = useToast();

  const fetchDestinations = () => {
    destinationAPI.getAll()
      .then(({ data }) => setDestinations(data.destinations))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDestinations(); }, []);

  // Create or update destination
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      gallery: form.gallery ? form.gallery.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    try {
      if (editingId) {
        await destinationAPI.update(editingId, payload);
        setMessage({ type: 'success', text: 'Destination updated.' });
        showToast('Destination updated successfully!', 'success');
      } else {
        await destinationAPI.create(payload);
        setMessage({ type: 'success', text: 'Destination created.' });
        showToast('Destination created successfully!', 'success');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchDestinations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed.';
      setMessage({ type: 'error', text: msg });
      showToast(msg, 'error');
    }
  };

  const handleEdit = (dest) => {
    setEditingId(dest.id);
    setForm({
      name: dest.name,
      country: dest.country,
      description: dest.description,
      image_url: dest.image_url,
      price: dest.price,
      latitude: dest.latitude || '',
      longitude: dest.longitude || '',
      gallery: (dest.gallery || []).join(', '),
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await destinationAPI.delete(id);
      setMessage({ type: 'success', text: 'Destination deleted.' });
      fetchDestinations();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete destination.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-page-header-section">
        <h1 className="font-display font-bold text-3xl text-gray-900">Manage Destinations</h1>
        <Button btnClass="add-destination-btn" className="text-sm" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          + Add Destination
        </Button>
      </div>

      {message && <div className="mb-6"><Alert type={message.type} message={message.text} onClose={() => setMessage(null)} /></div>}

      {/* ===== DESTINATION FORM (Add / Edit) ===== */}
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-destination-form-card admin-destination-form-section">
          <h3 className="font-bold text-lg">{editingId ? 'Edit' : 'Add'} Destination</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label="Country" required>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            </FormField>
            <FormField label="Price (LKR)" required>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </FormField>
            <FormField label="Image URL" required>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} required />
              <p className="text-xs text-gray-400 mt-1">Paste full image link (Unsplash or Pexels). Manage trip activities in Admin → Activities.</p>
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="mt-3 w-full h-40 object-cover rounded-xl border border-gray-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </FormField>
            <FormField label="Latitude">
              <Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            </FormField>
            <FormField label="Longitude">
              <Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Description" required>
            <TextArea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </FormField>

          <FormField label="Gallery URLs (comma separated)">
            <Input value={form.gallery} onChange={(e) => setForm({ ...form, gallery: e.target.value })} />
          </FormField>

          <div className="flex gap-3">
            <Button type="submit" btnClass="save-destination-btn" className="text-sm">
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" btnClass="cancel-destination-form-btn" className="text-sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div key={dest.id} className="admin-destination-grid-card">
              <img src={dest.image_url} alt={dest.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-bold">{dest.name}</h3>
                <p className="text-sm text-gray-500">{dest.country} · {formatCurrency(dest.price)}</p>
                <div className="flex gap-2 mt-3">
                  <Button btnClass="edit-destination-btn" className="text-xs flex-1" onClick={() => handleEdit(dest)}>Edit</Button>
                  <Button btnClass="delete-destination-btn" className="text-xs flex-1" onClick={() => handleDelete(dest.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDestinations;
