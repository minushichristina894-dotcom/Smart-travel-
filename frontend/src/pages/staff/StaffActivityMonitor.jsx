import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { activityAPI, bookingAPI } from '../../services/api';
import AgeCategoryBadge from '../../components/ui/AgeCategoryBadge';
import { formatCurrency } from '../../utils/currency';

const StaffActivityMonitor = () => {
  const [activities, setActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      activityAPI.getAll(),
      bookingAPI.getAll(),
    ]).then(([actRes, bookRes]) => {
      setActivities(actRes.data.activities);
      setBookings(bookRes.data.bookings);
    }).finally(() => setLoading(false));
  }, []);

  const bookingCount = (activityId) =>
    bookings.filter((b) => b.activity_id === activityId && b.status !== 'cancelled').length;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl">Activity Monitor</h1>
        <p className="text-gray-500 mt-2">See which activities are booked most — helps staff plan support and resources.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {activities.map((a) => (
            <div key={a.id} className="staff-activity-monitor-card">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-bold">{a.name}</h3>
                  <p className="text-sm text-primary-600">{a.destination_name}</p>
                  <div className="mt-2">
                    <AgeCategoryBadge category={a.age_category} />
                  </div>
                </div>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                  {bookingCount(a.id)} booking(s)
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.description}</p>
              <div className="flex justify-between mt-3 text-sm">
                <span>{formatCurrency(a.price)} · {a.duration_hours}h</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffActivityMonitor;
