/**
 * ActivitiesPage.jsx — SMALL REACT CONNECTOR ONLY
 *
 * HTML structure  →  src/html/activities.html
 * CSS styles      →  src/css/activities.css + src/index.css
 * JavaScript      →  src/js/activitiesPage.js
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerOrPublicShell from '../../components/layout/CustomerOrPublicShell';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AgeCategoryBadge from '../../components/ui/AgeCategoryBadge';
import { formatCurrency } from '../../utils/currency';
import { fetchActivitiesForPage } from '../../js/activitiesPage';
import '../../css/activities.css';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivitiesForPage(setActivities, setLoading);
  }, []);

  return (
    <CustomerOrPublicShell className="activities-page min-h-screen bg-gray-50">
      <section className="activities-hero-section activities-hero bg-primary-500 text-white py-12 lg:py-16 text-center rounded-2xl lg:rounded-none mb-6 lg:mb-0">
        <h1 className="activities-hero__title text-3xl lg:text-4xl font-display font-bold mb-3">Activities in Sri Lanka</h1>
        <p className="activities-hero__subtitle text-primary-100">Choose from curated experiences across the island</p>
      </section>
      <section className="activities-grid-section activities-content max-w-7xl mx-auto py-6 lg:py-12">
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="activities-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((a) => (
              <article key={a.id} className="activity-list-card overflow-hidden">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-snug">{a.name}</h3>
                    <p className="text-sm text-primary-600 mb-2">{a.destination_name}</p>
                    <div className="mb-3"><AgeCategoryBadge category={a.age_category} /></div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{a.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-primary-500">{formatCurrency(a.price)}</span>
                      <span className="text-xs text-gray-400">{a.duration_hours}h</span>
                    </div>
                    <Link to={`/activities/${a.id}`} className="view-activity-btn w-full text-center block text-sm py-2">
                      View Details
                    </Link>
                  </div>
                  <div className="activities-card__image-wrap shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={a.image_url || a.destination_image} alt={a.name} className="activities-card__image w-full h-full object-cover" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </CustomerOrPublicShell>
  );
};

export default ActivitiesPage;
