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

// Staff Routes
import { StaffDashboard } from './pages/staff/Dashboard';
import { StaffAppointments } from './pages/staff/Appointments';
import { StaffProfile } from './pages/staff/Profile';
import { StaffLayout } from './components/layout/StaffLayout';

// Public Routes
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Services as PublicServices } from './pages/public/Services';
import { Gallery } from './pages/public/Gallery';
import { Contact } from './pages/public/Contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<PublicServices />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
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
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;