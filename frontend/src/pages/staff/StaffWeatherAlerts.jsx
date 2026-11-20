import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RiskBadge from '../../components/ui/RiskBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { weatherAPI } from '../../services/api';

const StaffWeatherAlerts = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('risk');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    weatherAPI.getLogs()
      .then(({ data }) => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  }, []);

  const displayed = filter === 'all'
    ? logs
    : logs.filter((l) => l.risk_level !== 'safe');

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl">Weather Alerts</h1>
        <p className="text-gray-500 mt-2">
          Staff task: Contact customers with moderate or high risk and advise rescheduling if needed.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilter('risk')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'risk' ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}
        >
          Moderate & High Risk
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}
        >
          All Logs
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : displayed.length === 0 ? (
        <div className="staff-weather-alerts-card">
          <p className="font-medium">No weather alerts yet.</p>
          <p className="text-sm mt-2">When customers run weather checks with moderate/high risk, alerts appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((log) => (
            <div
              key={log.id}
              className={`card flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
                log.risk_level === 'high' ? 'border-red-400' :
                log.risk_level === 'moderate' ? 'border-yellow-400' : 'border-green-400'
              }`}
            >
              <div>
                <p className="font-semibold text-lg">{log.destination_name}</p>
                {log.activity_name && <p className="text-sm text-primary-600">{log.activity_name}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Travel date: {new Date(log.travel_date).toLocaleDateString()} · Customer: {log.user_name || 'Guest'}
                </p>
                <p className="text-sm mt-2">{log.recommendation}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Temp {log.temperature}°C · Rain {log.rain_mm}mm · Wind {log.wind_speed_kmh} km/h
                </p>
              </div>
              <RiskBadge level={log.risk_level} />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffWeatherAlerts;
