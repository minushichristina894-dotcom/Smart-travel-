import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import RiskBadge from '../../components/ui/RiskBadge';
import { RiskReportIcon } from '../../components/ui/Icons';
import { formatCurrency } from '../../utils/currency';
import { bookingAPI } from '../../services/api';

const TripReportPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    bookingAPI.getReport(id)
      .then(({ data }) => setReport(data.report))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load report.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <Alert type="error" message={error || 'Report not found.'} />
        <Link to="/bookings" className="mt-4 inline-block text-primary-500 font-semibold">← Back to bookings</Link>
      </DashboardLayout>
    );
  }

  const weather = report.weather;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl">Trip Report</h1>
            <p className="text-gray-500">Booking #{report.id}</p>
          </div>
          <Button btnClass="print-report-btn" onClick={() => window.print()}>Print Report</Button>
        </div>

        <div className="trip-report-summary-card">
          <h2 className="font-bold text-xl text-primary-600 mb-4">{report.destination_name}</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-400">Customer</span><p className="font-semibold">{report.user_name}</p></div>
            <div><span className="text-gray-400">Email</span><p className="font-semibold">{report.user_email}</p></div>
            <div><span className="text-gray-400">Travel Date</span><p className="font-semibold">{new Date(report.travel_date).toLocaleDateString('en-LK')}</p></div>
            <div><span className="text-gray-400">Travelers</span><p className="font-semibold">{report.travelers}</p></div>
            <div><span className="text-gray-400">Activity</span><p className="font-semibold">{report.activity_name || '—'}</p></div>
            <div><span className="text-gray-400">Total (LKR)</span><p className="font-semibold text-primary-500">{formatCurrency(report.total_price)}</p></div>
            <div><span className="text-gray-400">Payment</span><p className="font-semibold capitalize">{report.payment_status}</p></div>
            <div><span className="text-gray-400">Booking Status</span><p className="font-semibold capitalize">{report.status}</p></div>
          </div>
        </div>

        <div className="trip-report-weather-card">
          <div className="flex items-center gap-3 mb-4">
            <RiskReportIcon level={report.risk_level} className="w-10 h-10" />
            <div>
              <h3 className="font-bold">Weather Risk Assessment</h3>
              <p className="text-sm text-gray-500">Based on live weather data</p>
            </div>
          </div>
          {report.risk_level ? (
            <>
              <RiskBadge level={report.risk_level} />
              {weather && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg text-center"><p className="text-gray-400">Temp</p><p className="font-bold">{Math.round(weather.temperature)}°C</p></div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center"><p className="text-gray-400">Rain</p><p className="font-bold">{weather.rain_mm} mm</p></div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center"><p className="text-gray-400">Wind</p><p className="font-bold">{Math.round(weather.wind_speed_kmh)} km/h</p></div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center"><p className="text-gray-400">Humidity</p><p className="font-bold">{weather.humidity}%</p></div>
                </div>
              )}
              {weather?.recommendation && <p className="mt-4 text-gray-700">{weather.recommendation}</p>}
            </>
          ) : (
            <p className="text-gray-500">No weather risk data recorded for this trip.</p>
          )}
        </div>

        {report.destination_description && (
          <div className="trip-report-details-card">
            <h3 className="font-bold mb-2">About {report.destination_name}</h3>
            <p className="text-gray-600 text-sm">{report.destination_description}</p>
          </div>
        )}

        <Link to="/bookings" className="inline-block mt-6 text-primary-500 font-semibold hover:underline">← Back to My Bookings</Link>
      </div>
    </DashboardLayout>
  );
};

export default TripReportPage;
