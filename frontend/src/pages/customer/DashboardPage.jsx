/**
 * CUSTOMER - React connector (interface unchanged — matches dashboard design)
 * HTML: src/html/dashboard-page.html
 * CSS:  src/css/index.css (cards.css, buttons.css, sections.css)
 * JS:   src/js/dashboardPage.js
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import RiskBadge from '../../components/ui/RiskBadge';
import LiveBadge from '../../components/ui/LiveBadge';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { fetchDashboardForPage, loadLiveWeather, WEATHER_REFRESH_MS } from '../../js/dashboardPage';
import { destinationAPI } from '../../services/api';

const quickActions = [
  { to: '/booking', label: 'New Booking' },
  { to: '/destinations', label: 'Browse Destinations' },
  { to: '/weather-risk', label: 'Weather Check' },
  { to: '/profile', label: 'Edit Profile' },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const refreshWeather = async (destinationId) => {
    setWeatherLoading(true);
    try {
      setWeather(await loadLiveWeather(destinationId));
    } catch {
      /* keep previous weather if refresh fails */
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardForPage({
      setUpcoming,
      setRecentBookings,
      setDestinations,
      setWeather,
      setLoading,
    });

    const interval = setInterval(() => {
      destinationAPI.getAll({ active: 'true' }).then(({ data }) => {
        if (data.destinations?.length > 0) refreshWeather(data.destinations[0].id);
      });
    }, WEATHER_REFRESH_MS);

    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  const displayName = user?.full_name || user?.name || 'Traveler';
  const tempLabel = Number.isFinite(weather?.temperature)
    ? `${Math.round(weather.temperature)}°C`
    : '—°C';

  return (
    <DashboardLayout>
      <div className="dashboard-welcome-card">
        <h1 className="font-display font-bold text-2xl md:text-3xl">
          Welcome back, {displayName}!
        </h1>
        <p className="text-primary-100 mt-2">Ready for your next adventure? Here&apos;s your travel overview.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="dashboard-grid-section">
          <div className="dashboard-main-section">
            {/* Upcoming Trips — same layout as reference */}
            <div className="dashboard-upcoming-trips-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Upcoming Trips</h2>
                <Link to="/bookings" className="text-primary-500 text-sm font-semibold hover:underline">View All</Link>
              </div>
              {upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No upcoming trips yet</p>
                  <Link to="/booking" className="book-trip-btn">Book a Trip</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100"
                    >
                      <img
                        src={b.image_url}
                        alt={b.destination_name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{b.destination_name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {b.country || 'Sri Lanka'} · {b.travelers} traveler(s)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-gray-600">
                          {new Date(b.travel_date).toLocaleDateString()}
                        </p>
                        <span
                          className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize ${
                            statusColors[b.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="dashboard-recent-bookings-card">
              <h2 className="font-bold text-lg mb-4">Recent Bookings</h2>
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2">Destination</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Total</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-gray-50">
                          <td className="py-3 font-medium">{b.destination_name}</td>
                          <td className="py-3">{new Date(b.travel_date).toLocaleDateString()}</td>
                          <td className="py-3">{formatCurrency(b.total_price)}</td>
                          <td className="py-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full capitalize ${
                                statusColors[b.status] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recommended Destinations */}
            <div className="dashboard-recommended-destinations-card">
              <h2 className="font-bold text-lg mb-4">Recommended Destinations</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {destinations.map((dest) => (
                  <Link key={dest.id} to={`/destinations/${dest.id}`} className="group">
                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img
                        src={dest.image_url}
                        alt={dest.name}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-3">
                        <p className="font-semibold text-sm">{dest.name}</p>
                        <p className="text-xs text-gray-500">{dest.country || 'Sri Lanka'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar-section">
            {/* Live Weather */}
            <div className="dashboard-live-weather-card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">Live Weather</h3>
                <LiveBadge />
              </div>
              <p className="text-sm text-gray-500">{weather?.destination_name || 'Sri Lanka'}</p>
              {weatherLoading && !weather ? (
                <div className="py-4"><LoadingSpinner size="sm" /></div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-primary-600 mt-2">{tempLabel}</p>
                  <p className="text-sm text-gray-500 capitalize">{weather?.description || '—'}</p>
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div>
                      <span className="text-gray-400">Rain</span>
                      <p className="font-semibold">{weather?.rain_mm ?? 0} mm</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Wind</span>
                      <p className="font-semibold">{weather?.wind_speed_kmh ?? 0} km/h</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Risk Alert */}
            <div className="dashboard-risk-alert-card">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-bold">Risk Alert</h3>
                {weather?.risk_level && <RiskBadge level={weather.risk_level} />}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {weather?.recommendation
                  || 'Check weather risk for your destinations before traveling. Python Flask analyzes rain and wind data.'}
              </p>
              <Link to="/weather-risk" className="weather-risk-btn w-full text-center block text-sm py-2">
                Analyze Weather Risk
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-quick-actions-card">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
