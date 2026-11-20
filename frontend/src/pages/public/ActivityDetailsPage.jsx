import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerOrPublicShell from '../../components/layout/CustomerOrPublicShell';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AgeCategoryBadge from '../../components/ui/AgeCategoryBadge';
import { formatCurrency } from '../../utils/currency';
import { activityAPI } from '../../services/api';

const ActivityDetailsPage = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityAPI.getById(id).then(({ data }) => setActivity(data.activity)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <CustomerOrPublicShell>
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      </CustomerOrPublicShell>
    );
  }

  if (!activity) {
    return (
      <CustomerOrPublicShell>
        <p className="text-center py-20">Activity not found</p>
      </CustomerOrPublicShell>
    );
  }

  return (
    <CustomerOrPublicShell>
      <div className="max-w-4xl mx-auto">
        <div className="activity-details-card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl overflow-hidden h-56 md:h-full min-h-[220px] border border-gray-100">
              <img
                src={activity.image_url || activity.destination_image}
                alt={activity.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-primary-600 text-sm mb-2">{activity.destination_name}, {activity.country}</p>
              <h1 className="text-3xl font-display font-bold mb-3">{activity.name}</h1>
              <div className="mb-4">
                <AgeCategoryBadge category={activity.age_category} size="lg" showHint />
              </div>
              <p className="text-gray-600">{activity.description}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div>
              <p className="text-sm text-gray-400">Price</p>
              <p className="font-bold text-primary-500 text-xl">{formatCurrency(activity.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Duration</p>
              <p className="font-bold">{activity.duration_hours} hours</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Age Category</p>
              <div className="mt-1">
                <AgeCategoryBadge category={activity.age_category} size="lg" />
              </div>
            </div>
          </div>

          <Link to={`/booking?destination=${activity.destination_id}&activity=${activity.id}`} className="book-activity-btn inline-block">
            Book This Activity
          </Link>
        </div>
      </div>
    </CustomerOrPublicShell>
  );
};

export default ActivityDetailsPage;
