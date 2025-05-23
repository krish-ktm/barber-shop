import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { StaffManagement } from './pages/StaffManagement';
import { AdminAppointment } from './pages/AdminAppointment';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Slots } from './pages/Slots';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Services } from './pages/Services';
import { GSTSettings } from './pages/GSTSettings';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProductsPage } from '@/features/admin/products/ProductsPage';

// Staff Routes
import { StaffDashboard } from './pages/staff/Dashboard';
import { StaffAppointments } from './pages/staff/Appointments';
import { StaffProfile } from './pages/staff/Profile';
import { StaffLayout } from './components/layout/StaffLayout';

// Billing Routes
import { BillingLayout } from './components/layout/BillingLayout';
import { BillingDashboard } from './pages/billing/Dashboard';
import { BillingPOS } from './pages/billing/POS';

// Public Routes
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Services as PublicServices } from './pages/public/Services';
import { Gallery } from './pages/public/Gallery';
import { Contact } from './pages/public/Contact';
import { Booking } from './pages/public/Booking';
import { Barbers } from './pages/public/Barbers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<PublicServices />} />
          <Route path="barbers" element={<Barbers />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="booking" element={<Booking />} />
        </Route>

        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff-management" element={<StaffManagement />} />
          <Route path="appointments" element={<AdminAppointment />} />
          <Route path="customers" element={<Customers />} />
          <Route path="services" element={<Services />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="pos" element={<POS />} />
          <Route path="slots" element={<Slots />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="gst-settings" element={<GSTSettings />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
        </Route>

        {/* Billing Routes */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredRole="billing">
              <BillingLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/billing/dashboard" replace />} />
          <Route path="dashboard" element={<BillingDashboard />} />
          <Route path="pos" element={<BillingPOS />} />
          <Route path="*" element={<Navigate to="/billing/pos" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;