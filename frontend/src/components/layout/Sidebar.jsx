import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from './LogoutButton';
import AppLogo from '../ui/AppLogo';
import {
  IconHome, IconGlobe, IconClipboard, IconCalendar, IconCloudSun,
  IconUsers, IconSettings, IconMapPin,
} from '../ui/Icons';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role;

  const links = {
    customer: [
      { to: '/dashboard', label: 'Dashboard', Icon: IconHome },
      { to: '/destinations', label: 'Destinations', Icon: IconGlobe },
      { to: '/activities', label: 'Activities', Icon: IconMapPin },
      { to: '/booking', label: 'Book Trip', Icon: IconCalendar },
      { to: '/bookings', label: 'My Bookings', Icon: IconClipboard },
      { to: '/weather-risk', label: 'Weather Risk', Icon: IconCloudSun },
      { to: '/profile', label: 'Profile', Icon: IconUsers },
    ],
    staff: [
      { to: '/staff', label: 'Dashboard', Icon: IconHome },
      { to: '/staff/bookings', label: 'Bookings', Icon: IconClipboard },
      { to: '/staff/customers', label: 'Customers', Icon: IconUsers },
      { to: '/staff/weather-alerts', label: 'Weather Alerts', Icon: IconCloudSun },
      { to: '/staff/activities', label: 'Activity Monitor', Icon: IconMapPin },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard', Icon: IconHome },
      { to: '/admin/users', label: 'Manage Users', Icon: IconUsers },
      { to: '/admin/staff', label: 'Manage Staff', Icon: IconUsers },
      { to: '/admin/destinations', label: 'Destinations', Icon: IconGlobe },
      { to: '/admin/activities', label: 'Activities', Icon: IconMapPin },
      { to: '/admin/bookings', label: 'Bookings', Icon: IconClipboard },
      { to: '/admin/settings', label: 'System Settings', Icon: IconSettings },
    ],
  };

  const menu = links[role] || links.customer;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b">
          <Link to="/" onClick={onClose} className="flex justify-center py-1">
            <AppLogo size="sm" variant="soft" />
          </Link>
        </div>
        <div className="p-4">
          <div className="p-3 bg-primary-50 rounded-xl mb-4">
            <p className="font-semibold text-sm">{user?.full_name || user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
          <nav className="space-y-1">
            {menu.map(({ to, label, Icon }) => {
              const isRoot = to === '/dashboard' || to === '/staff' || to === '/admin';
              const active = isRoot
                ? location.pathname === to
                : location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  active ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-primary-50'
                }`}
              >
                <Icon className={active ? 'text-white' : 'text-primary-500'} />
                {label}
              </Link>
              );
            })}
          </nav>
          <LogoutButton className="mt-6" />        </div>
      </aside>
    </>
  );
};

export default Sidebar;
