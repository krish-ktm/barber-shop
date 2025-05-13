import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Staff } from './pages/Staff';
import { AdminAppointment } from './pages/AdminAppointment';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Slots } from './pages/Slots';
import { Reports } from './pages/Reports';
import { MainLayout } from './components/layout';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<Staff />} />
          <Route path="appointments" element={<AdminAppointment />} />
          <Route path="customers" element={<Customers />} />
          <Route path="pos" element={<POS />} />
          <Route path="slots" element={<Slots />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App