import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { StaffManagement } from './pages/StaffManagement';
import { AdminAppointment } from './pages/AdminAppointment';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Slots } from './pages/Slots';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Staff Routes
import { StaffDashboard } from './pages/staff/Dashboard';
import { StaffAppointments } from './pages/staff/Appointments';
import { StaffProfile } from './pages/staff/Profile';
import { StaffLayout } from './components/layout/StaffLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff-management" element={<StaffManagement />} />
          <Route path="appointments" element={<AdminAppointment />} />
          <Route path="customers" element={<Customers />} />
          <Route path="pos" element={<POS />} />
          <Route path="slots" element={<Slots />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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