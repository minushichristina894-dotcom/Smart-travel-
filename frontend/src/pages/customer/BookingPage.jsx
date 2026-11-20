/** USER/CUSTOMER SIDE � Book a trip | URL: /booking | Login required */
/**
 * BOOKING PAGE - 4 Step Flow
 * Step 1: Select destination + activity + date
 * Step 2: OpenWeatherMap ? Python weather risk check
 * Step 3: Confirm booking (creates pending booking)
 * Step 4: Payment (redirect to /payment/:id)
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import RiskBadge from '../../components/ui/RiskBadge';
import LiveBadge from '../../components/ui/LiveBadge';
import { RiskReportIcon, WeatherStatIcon } from '../../components/ui/Icons';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { formatCurrency } from '../../utils/currency';
import { destinationAPI, activityAPI, bookingAPI, weatherAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // current step: 1, 2, or 3
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);

  // Booking form data
  const [form, setForm] = useState({
    destination_id: searchParams.get('destination') || '',
    activity_id: searchParams.get('activity') || '',
    travelers: 1,
    travel_date: '',
  });

  const [weatherResult, setWeatherResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { showToast } = useToast();

  // Load all Sri Lankan destinations on page open
  useEffect(() => {
    destinationAPI.getAll({ active: 'true' })
      .then(({ data }) => setDestinations(data.destinations));
  }, []);

  // Load activities when destination is selected (clear stale list first)
  useEffect(() => {
    if (!form.destination_id) {
      setActivities([]);
      return;
    }
    setActivities([]);
    activityAPI.getAll({ destination_id: form.destination_id })
      .then(({ data }) => setActivities(data.activities || []))
      .catch(() => setActivities([]));
  }, [form.destination_id]);

  // Calculate total price = (destination + activity) � travelers
  const selectedDest = destinations.find((d) => String(d.id) === String(form.destination_id));
  const selectedAct = activities.find(
    (a) => String(a.id) === String(form.activity_id)
      && String(a.destination_id) === String(form.destination_id)
  );
  const travelerCount = Math.max(1, Number(form.travelers) || 1);
  const destPrice = Number(selectedDest?.price) || 0;
  const actPrice = Number(selectedAct?.price) || 0;
  const destSubtotal = destPrice * travelerCount;
  const actSubtotal = actPrice * travelerCount;
  const totalPrice = destSubtotal + actSubtotal;

  /**
   * Step 2: Call weather API
   * Flow: OpenWeatherMap ? Node.js ? Python ? risk result
   */
  const handleWeatherCheck = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await weatherAPI.analyze({
        destination_id: parseInt(form.destination_id),
        activity_id: form.activity_id ? parseInt(form.activity_id) : null,
        travel_date: form.travel_date,
      });
      setWeatherResult(data);
      setStep(2);
      showToast('Weather analysis completed. Review risk level before booking.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Weather check failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3: Save booking to database
   */
  const handleBook = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.create({
        destination_id: parseInt(form.destination_id),
        activity_id: form.activity_id ? parseInt(form.activity_id) : null,
        travelers: parseInt(form.travelers),
        travel_date: form.travel_date,
        risk_level: weatherResult?.analysis?.risk_level,
      });
      setStep(3);
      showToast('Booking created! Proceed to payment.', 'success');
      setTimeout(() => navigate(`/payment/${data.booking.id}`), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-3xl mb-2">Book Your Trip</h1>
        <p className="text-gray-500 mb-6">Step {step} of 4</p>

        {/* Progress bar - 4 steps */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-primary-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

        {/* ========== STEP 1: Booking Form ========== */}
        {step === 1 && (
          <div className="booking-form-card booking-form-section">

            {/* Destination dropdown */}
            <FormField label="Select Destination" required>
              <Select
                value={form.destination_id}
                onChange={(e) => setForm({ ...form, destination_id: e.target.value, activity_id: '' })}
                required
              >
                <option value="">Choose destination...</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {formatCurrency(d.price)}</option>
                ))}
              </Select>
            </FormField>

            {/* Activity dropdown (optional) */}
            <FormField label="Select Activity">
              <Select
                value={form.activity_id}
                onChange={(e) => setForm({ ...form, activity_id: e.target.value })}
                disabled={!form.destination_id || activities.length === 0}
              >
                <option value="">
                  {!form.destination_id
                    ? 'Select a destination first'
                    : activities.length === 0
                    ? 'Loading activities...'
                    : 'Optional — choose activity'}
                </option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} (+{formatCurrency(a.price)} per person)</option>
                ))}
              </Select>
            </FormField>

            {/* Number of travelers */}
            <FormField label="Number of Travelers" required>
              <Input
                type="number" min="1" max="20"
                value={form.travelers}
                onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                required
              />
            </FormField>

            {/* Travel date picker */}
            <FormField label="Travel Date" required>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.travel_date}
                onChange={(e) => setForm({ ...form, travel_date: e.target.value })}
                required
              />
            </FormField>

            {/* Price summary */}
            <div className="bg-gray-50 p-4 rounded-xl">
              {selectedDest ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{selectedDest.name} × {travelerCount}</span>
                    <span className="font-semibold">{formatCurrency(destSubtotal)}</span>
                  </div>
                  {selectedAct && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{selectedAct.name} × {travelerCount}</span>
                      <span className="font-semibold text-primary-600">+ {formatCurrency(actSubtotal)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Estimated Total (LKR)</span>
                    <span className="text-2xl font-bold text-primary-500">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Estimated Total (LKR)</p>
                  <p className="text-2xl font-bold text-primary-500">{formatCurrency(0)}</p>
                </>
              )}
            </div>

            {/* Button: go to weather check — solid green like design */}
            <Button
              btnClass="check-weather-btn"
              className="w-full"
              loading={loading}
              onClick={() => {
                if (!form.destination_id || !form.travel_date) {
                  const msg = 'Select destination and travel date.';
                  setError(msg);
                  showToast(msg, 'warning');
                  return;
                }
                handleWeatherCheck();
              }}
            >
              Check Weather Risk →
            </Button>
          </div>
        )}

        {/* ========== STEP 2: Weather Result + Confirm ========== */}
        {step === 2 && weatherResult && (
          <div className="space-y-6">

            {/* Weather data from OpenWeatherMap */}
            <div className="booking-weather-result-card">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-xl">{weatherResult.destination.name}</h2>
                <LiveBadge source="Live Weather" fetchedAt={weatherResult.weather?.fetchedAt} />
              </div>

              {/* Weather readings grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Temperature', value: `${Math.round(weatherResult.weather.temperature)}°C` },
                  { label: 'Rainfall', value: `${weatherResult.weather.rain_mm} mm` },
                  { label: 'Humidity', value: `${weatherResult.weather.humidity}%` },
                  { label: 'Wind Speed', value: `${Math.round(weatherResult.weather.wind_speed_kmh)} km/h` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                    <div className="flex justify-center mb-1"><WeatherStatIcon label={item.label} className="w-5 h-5 text-primary-500" /></div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-bold">{item.value}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 capitalize mb-4">
                Condition: {weatherResult.weather.description}
              </p>

              {/* Python risk result */}
              <div className="text-center border-t border-gray-100 pt-4">
                <RiskReportIcon level={weatherResult.analysis.risk_level} className="w-12 h-12" />
                <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Travel Risk Report</p>
                <RiskBadge level={weatherResult.analysis.risk_level} />
                <p className="mt-3 font-medium">{weatherResult.analysis.recommendation}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-2xl font-bold text-primary-500">{formatCurrency(totalPrice)}</p>
            </div>

            {/* Confirm booking button */}
            <Button btnClass="confirm-booking-btn" className="w-full" loading={loading} onClick={handleBook}>
              Confirm & Proceed to Payment — {formatCurrency(totalPrice)}
            </Button>

            {/* Back button */}
            <Button btnClass="back-to-booking-form-btn" className="w-full" onClick={() => setStep(1)}>
              ← Back to Edit
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="booking-success-card">
            <h2 className="font-bold text-xl text-primary-600 mb-2">Booking Saved</h2>
            <p className="text-gray-500">Redirecting to payment...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookingPage;
