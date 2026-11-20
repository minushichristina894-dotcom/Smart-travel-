import { useEffect, useState } from 'react';
import CustomerOrPublicShell from '../../components/layout/CustomerOrPublicShell';
import DestinationCard from '../../components/destinations/DestinationCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { destinationAPI } from '../../services/api';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    destinationAPI.getAll({ active: 'true' })
      .then(({ data }) => setDestinations(data.destinations))
      .finally(() => setLoading(false));
  }, []);

  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CustomerOrPublicShell>
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12 lg:py-16 rounded-2xl lg:rounded-none -mx-4 lg:mx-0 px-4 lg:px-0 mb-6 lg:mb-0">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">Explore Sri Lanka</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Discover the Pearl of the Indian Ocean — from Sigiriya to Mirissa, all prices in Sri Lankan Rupees
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 lg:px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search destinations or countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="destination-search-field max-w-md"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500 py-20">No destinations found matching your search.</p>
        )}
      </div>
    </CustomerOrPublicShell>
  );
};

export default DestinationsPage;
