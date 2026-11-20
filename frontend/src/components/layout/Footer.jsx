import { Link } from 'react-router-dom';
import AppLogo from '../ui/AppLogo';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <AppLogo size="sm" variant="soft" className="mb-3" />
          <p className="text-gray-400 max-w-md">
            Sri Lanka's smart travel planner with real-time weather intelligence. Discover local
            destinations, book in LKR, and explore the island with confidence.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/destinations" className="hover:text-primary-400 transition-colors">Destinations</Link></li>
            <li><Link to="/weather-risk" className="hover:text-primary-400 transition-colors">Weather Risk</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link></li>
            <li><Link to="/bookings" className="hover:text-primary-400 transition-colors">My Bookings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-400">
            <li>support@smarttravel.lk</li>
            <li>+94 11 234 5678</li>
            <li>Colombo 03, Sri Lanka</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
        © 2026 Smart Travel Planner. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
