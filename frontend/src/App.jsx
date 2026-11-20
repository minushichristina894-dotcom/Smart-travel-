import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * ============================================================
 * APP ROUTES — Smart Travel Planner
 * Technology: React (JavaScript) + HTML + CSS
 * Backend: Node.js (JavaScript) | Weather: Python + Flask
 * Database: MySQL
 * ============================================================
 *
 * FOLDER GUIDE (frontend/src/pages/):
 *   public/   → Anyone can open (no login)
 *   customer/ → Logged-in user / customer only
 *   staff/    → Staff login only
 *   admin/    → Admin login only
 */

// ===== PUBLIC PAGES (no login needed) =====
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import ActivitiesPage from './pages/public/ActivitiesPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';
import RegisterSuccessPage from './pages/public/RegisterSuccessPage';
import DestinationsPage from './pages/public/DestinationsPage';
import DestinationDetailsPage from './pages/public/DestinationDetailsPage';
import ActivityDetailsPage from './pages/public/ActivityDetailsPage';

// ===== CUSTOMER PAGES (user side — login required) =====
import DashboardPage from './pages/customer/DashboardPage';
import BookingPage from './pages/customer/BookingPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import PaymentPage from './pages/customer/PaymentPage';
import TripReportPage from './pages/customer/TripReportPage';
import WeatherRiskPage from './pages/customer/WeatherRiskPage';
import ProfilePage from './pages/customer/ProfilePage';

// ===== STAFF PAGES (staff login required) =====
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffBookings from './pages/staff/StaffBookings';
import StaffCustomers from './pages/staff/StaffCustomers';
import StaffWeatherAlerts from './pages/staff/StaffWeatherAlerts';
import StaffActivityMonitor from './pages/staff/StaffActivityMonitor';

// ===== ADMIN PAGES (admin login required) =====
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStaff from './pages/admin/AdminStaff';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminActivities from './pages/admin/AdminActivities';
import AdminBookings from './pages/admin/AdminBookings';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Routes>
      {/* PUBLIC — anyone can visit */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/activities" element={<ActivitiesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-success" element={<RegisterSuccessPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
      <Route path="/activities/:id" element={<ActivityDetailsPage />} />

      {/* CUSTOMER — user must login as customer */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['customer']}><DashboardPage /></ProtectedRoute>} />
      <Route path="/booking" element={<ProtectedRoute roles={['customer']}><BookingPage /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute roles={['customer']}><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/payment/:id" element={<ProtectedRoute roles={['customer']}><PaymentPage /></ProtectedRoute>} />
      <Route path="/trip-report/:id" element={<ProtectedRoute roles={['customer', 'staff', 'admin']}><TripReportPage /></ProtectedRoute>} />
      <Route path="/weather-risk" element={<ProtectedRoute roles={['customer']}><WeatherRiskPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={['customer']}><ProfilePage /></ProtectedRoute>} />

      {/* STAFF — user must login as staff */}
      <Route path="/staff" element={<ProtectedRoute roles={['staff']}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/bookings" element={<ProtectedRoute roles={['staff']}><StaffBookings /></ProtectedRoute>} />
      <Route path="/staff/customers" element={<ProtectedRoute roles={['staff']}><StaffCustomers /></ProtectedRoute>} />
      <Route path="/staff/weather-alerts" element={<ProtectedRoute roles={['staff']}><StaffWeatherAlerts /></ProtectedRoute>} />
      <Route path="/staff/activities" element={<ProtectedRoute roles={['staff']}><StaffActivityMonitor /></ProtectedRoute>} />

      {/* ADMIN — user must login as admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute roles={['admin']}><AdminStaff /></ProtectedRoute>} />
      <Route path="/admin/destinations" element={<ProtectedRoute roles={['admin']}><AdminDestinations /></ProtectedRoute>} />
      <Route path="/admin/activities" element={<ProtectedRoute roles={['admin']}><AdminActivities /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />
    </Routes>
  );
}
