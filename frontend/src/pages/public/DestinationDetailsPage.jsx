import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerOrPublicShell from '../../components/layout/CustomerOrPublicShell';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AgeCategoryBadge from '../../components/ui/AgeCategoryBadge';
import { formatCurrency } from '../../utils/currency';
import { destinationAPI } from '../../services/api';

const DestinationDetailsPage = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    destinationAPI.getById(id)
      .then(({ data }) => {
        setDestination(data.destination);
        setActivities(data.activities || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <CustomerOrPublicShell>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </CustomerOrPublicShell>
    );
  }

  if (!destination) {
    return (
      <CustomerOrPublicShell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Destination not found</h2>
          <Link to="/destinations" className="back-to-destinations-btn">Back to Destinations</Link>
        </div>
      </CustomerOrPublicShell>
    );
  }

  const gallery = [destination.image_url, ...(destination.gallery || [])];

  return (
    <CustomerOrPublicShell>
      <div className="relative h-[40vh] min-h-[280px] rounded-2xl overflow-hidden mb-8">
        <img src={gallery[activeImage]} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <span className="text-white/80 text-sm">{destination.country}</span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mt-2">{destination.name}</h1>
          <p className="text-2xl md:text-3xl font-bold text-primary-300 mt-2">
            {formatCurrency(destination.price)}{' '}
            <span className="text-lg font-normal text-white/70">per person</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-primary-500 scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="destination-info-card">
            <h2 className="font-display font-bold text-2xl mb-4">About {destination.name}</h2>
            <p className="text-gray-600 leading-relaxed">{destination.description}</p>
          </div>

          <div className="destination-info-card">
            <h2 className="font-display font-bold text-2xl mb-4">Activities</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {activities.map((activity) => (
                <Link
                  key={activity.id}
                  to={`/activities/${activity.id}`}
                  className="flex items-center justify-between gap-3 p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-gray-700 block">{activity.name}</span>
                    <AgeCategoryBadge category={activity.age_category} />
                  </div>
                  <span className="text-primary-500 text-sm font-semibold shrink-0">{formatCurrency(activity.price)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="dashboard-live-weather-card">
            <h2 className="font-display font-bold text-2xl mb-4">Weather Intelligence</h2>
            <p className="text-gray-600 mb-4">
              Check weather conditions and travel risk before you book. Our smart analysis
              helps you pick the perfect travel dates.
            </p>
            <Link to={`/weather-risk?destination=${destination.id}`} className="weather-risk-link-btn inline-block">
              Check Weather Risk
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="destination-booking-sidebar-card">
            <h3 className="font-display font-bold text-xl mb-4">Book This Trip</h3>
            <p className="text-gray-500 text-sm mb-4">Starting from</p>
            <p className="text-4xl font-bold text-primary-500 mb-6">{formatCurrency(destination.price)}</p>
            <Link to={`/booking?destination=${destination.id}`} className="book-now-btn w-full text-center block mb-3">
              Book Now
            </Link>
            <Link to={`/weather-risk?destination=${destination.id}`} className="check-weather-btn w-full text-center block">
              Check Weather
            </Link>
          </div>

          {activities.length > 0 && (
            <div className="destination-activities-card">
              <h3 className="font-display font-bold text-lg mb-4">Available Activities</h3>
              {activities.map((a) => (
                <div key={a.id} className="border-b border-gray-100 py-3 last:border-0">
                  <p className="font-semibold">{a.name}</p>
                  <div className="my-1.5">
                    <AgeCategoryBadge category={a.age_category} />
                  </div>
                  <p className="text-sm text-gray-500">{a.duration_hours}h</p>
                  <p className="text-primary-500 font-bold">{formatCurrency(a.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerOrPublicShell>
  );
};

export default DestinationDetailsPage;
