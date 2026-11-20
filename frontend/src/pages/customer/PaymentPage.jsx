import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { formatCurrency } from '../../utils/currency';
import { bookingAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    card_name: '',
    card_number: '',
    expiry: '',
    cvv: '',
    method: 'card',
  });

  useEffect(() => {
    bookingAPI.getAll()
      .then(({ data }) => {
        const found = data.bookings.find((b) => b.id === parseInt(id, 10));
        if (!found) throw new Error('Booking not found');
        setBooking(found);
      })
      .catch(() => setError('Booking not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setPaying(true);
    try {
      const { data } = await bookingAPI.pay(id, form);
      setSuccess(true);
      showToast(data.message, 'success');
      setTimeout(() => navigate('/bookings'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <Alert type="error" message={error || 'Booking not found.'} />
        <Link to="/bookings" className="back-to-bookings-btn inline-block mt-4">Back to Bookings</Link>
      </DashboardLayout>
    );
  }

  if (booking.payment_status === 'paid' || success) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto card text-center py-12">
          <h1 className="font-display font-bold text-2xl text-primary-600 mb-2">Payment Successful</h1>
          <p className="text-gray-500 mb-6">Your booking is pending staff confirmation. A confirmation email was sent.</p>
          <Link to="/bookings"><Button btnClass="view-my-bookings-btn">View My Bookings</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="font-display font-bold text-3xl mb-2">Payment</h1>
        <p className="text-gray-500 mb-6">Step 4 of 4 — Complete payment for your trip</p>

        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

        <div className="payment-summary-card">
          <h2 className="font-bold text-lg">{booking.destination_name}</h2>
          <p className="text-gray-500 text-sm">{booking.activity_name || 'No activity'}</p>
          <p className="text-3xl font-bold text-primary-500 mt-3">{formatCurrency(booking.total_price)}</p>
          <p className="text-xs text-gray-400 mt-1">Demo payment — no real charge (university project)</p>
        </div>

        <form onSubmit={handlePay} className="payment-form-card payment-form-section">
          <FormField label="Payment Method">
            <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="card">Credit / Debit Card</option>
              <option value="bank">Bank Transfer (Demo)</option>
            </Select>
          </FormField>

          <FormField label="Name on Card" required>
            <Input value={form.card_name} onChange={(e) => setForm({ ...form, card_name: e.target.value })} placeholder="Nimal Perera" required />
          </FormField>

          <FormField label="Card Number" required>
            <Input value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value.replace(/\D/g, '').slice(0, 16) })} placeholder="4111111111111111" required />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Expiry (MM/YY)" required>
              <Input value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} placeholder="12/28" required />
            </FormField>
            <FormField label="CVV" required>
              <Input type="password" maxLength={4} value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '') })} placeholder="123" required />
            </FormField>
          </div>

          <Button type="submit" btnClass="payment-btn" className="w-full" loading={paying}>
            Pay {formatCurrency(booking.total_price)}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPage;
