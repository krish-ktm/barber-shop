import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme/theme-provider';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import PublicLayout from '@/components/layout/PublicLayout';

// Pages
import BookingPage from '@/pages/booking';
import AdminDashboard from '@/pages/admin';
import StaffManagement from '@/pages/admin/staff';
import BookingsManagement from '@/pages/admin/bookings';
import InvoiceSystem from '@/pages/admin/invoices';
import ReportsAnalytics from '@/pages/admin/reports';
import SlotConfiguration from '@/pages/admin/settings/slots';
import StaffPortal from '@/pages/staff';
import LandingPage from '@/pages/landing';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="barber-shop-theme">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="book" element={<BookingPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="bookings" element={<BookingsManagement />} />
          <Route path="invoices" element={<InvoiceSystem />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="settings/slots" element={<SlotConfiguration />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<DashboardLayout role="staff" />}>
          <Route index element={<StaffPortal />} />
        </Route>
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;