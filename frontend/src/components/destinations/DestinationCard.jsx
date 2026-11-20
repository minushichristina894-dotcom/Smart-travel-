import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

const DestinationCard = ({ destination }) => (
  <div className="destination-list-card group overflow-hidden p-0">
    <div className="relative h-48 overflow-hidden">
      <img
        src={destination.image_url}
        alt={destination.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary-600 font-bold text-sm">
        {formatCurrency(destination.price)}
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-500">{destination.country}</span>
      </div>
      <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{destination.name}</h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{destination.description}</p>
      <Link
        to={`/destinations/${destination.id}`}
        className="view-destination-details-btn w-full text-center block text-sm py-2.5"
      >
        View Details
      </Link>
    </div>
  </div>
);

export default DestinationCard;
