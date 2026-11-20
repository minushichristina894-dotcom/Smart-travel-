import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Customers keep the dashboard sidebar.
 * Guests (and staff/admin) get the public Navbar + Footer.
 */
const CustomerOrPublicShell = ({ children, className = 'min-h-screen bg-gray-50' }) => {
  const { user, isAuthenticated } = useAuth();
  const inCustomerDashboard = isAuthenticated && user?.role === 'customer';

  if (inCustomerDashboard) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <div className={className}>
      <Navbar />
      <div className="pt-16">{children}</div>
      <Footer />
    </div>
  );
};

export default CustomerOrPublicShell;
