/** PUBLIC SIDE - Home page | URL: / | HTML + CSS + JavaScript (React) */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import DestinationCard from '../../components/destinations/DestinationCard';
import AgeCategoryBadge from '../../components/ui/AgeCategoryBadge';
import { destinationAPI, activityAPI } from '../../services/api';

const LANDING_HERO = '/landing-hero.jpg';

const LandingPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    destinationAPI.getAll({ active: 'true' }).then(({ data }) => setDestinations(data.destinations.slice(0, 3)));
    activityAPI.getAll().then(({ data }) => setActivities(data.activities.slice(0, 4)));
  }, []);

  const testimonials = [
    { name: 'Kamani S.', text: 'The weather risk alerts saved our family trip! We rescheduled to Ella and had perfect sunny weather.', rating: 5 },
    { name: 'Ruwan J.', text: 'Best travel planner for exploring Sri Lanka. Smart recommendations and easy booking in rupees.', rating: 5 },
    { name: 'Dilani F.', text: 'Love planning trips to Sigiriya and Mirissa with this app. Highly recommend for local travel!', rating: 5 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <span className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Discover Beautiful Sri Lanka
              </span>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 leading-tight mb-6">
                Plan Your Sri Lankan Adventure with{' '}
                <span className="text-primary-500">Intelligence</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Explore Sigiriya, Ella, Mirissa and more. Book local packages in LKR and get
                real-time weather risk alerts across the island.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="start-planning-btn">Start Planning</Link>
                <Link to="/destinations" className="explore-destinations-btn">Explore Destinations</Link>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <img
                src={LANDING_HERO}
                alt="Nine Arch Bridge, Ella Sri Lanka"
                className="rounded-3xl shadow-2xl w-full h-[320px] sm:h-[420px] lg:h-[500px] object-cover object-center"
              />
              <div className="dashboard-live-weather-card p-4 animate-float">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="font-semibold text-sm">Weather Safe</p>
                    <p className="text-xs text-gray-500">Ella - Perfect conditions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Safety Features */}
      <section className="landing-features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Weather Safety Features</h2>
            <p className="section-subtitle">Travel with confidence using our intelligent weather analysis</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Live Weather', desc: 'Up-to-date forecasts for destinations across Sri Lanka.' },
              { title: 'Risk Assessment', desc: 'Clear safe, moderate, or high risk levels based on rain, wind, and conditions.' },
              { title: 'Smart Tips', desc: 'Helpful travel advice so you can plan the best time to go.' },
            ].map((feature, i) => (
              <div key={i} className="landing-feature-card">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="landing-destinations-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Featured Destinations in Sri Lanka</h2>
              <p className="section-subtitle">From ancient ruins to golden beaches across the Pearl of the Indian Ocean</p>
            </div>
            <Link to="/destinations" className="view-all-destinations-btn hidden md:inline-block">View All</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Activities */}
      <section className="landing-activities-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Popular Activities</h2>
            <p className="section-subtitle">Curated Sri Lankan experiences</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((a) => (
              <div key={a.id} className="landing-activity-preview-card">
                <h3 className="font-bold">{a.name}</h3>
                <p className="text-sm text-primary-600">{a.destination_name}</p>
                <div className="my-2">
                  <AgeCategoryBadge category={a.age_category} />
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials-section py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">What Travelers Say</h2>
            <p className="text-green-100 mt-2 text-lg">Trusted by travelers across Sri Lanka</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="landing-testimonial-card bg-white text-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-500 text-xl leading-none">&#9733;</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-primary-700">- {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="section-title mb-4">Ready to Start Your Journey?</h2>
          <p className="section-subtitle mb-8">Join thousands of smart travelers today</p>
          <Link to="/register" className="create-free-account-btn">Create Free Account</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
