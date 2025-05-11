import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, BarChart, Users, Calendar, FileText, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Link, NavLink } from 'react-router-dom';

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Staff', href: '/admin/staff', icon: Users },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'Slot Settings', href: '/admin/settings/slots', icon: Settings },
];

const staffNavItems = [
  { name: 'Dashboard', href: '/staff', icon: Home },
  { name: 'My Appointments', href: '/staff', icon: Calendar },
];

interface DashboardLayoutProps {
  role: 'admin' | 'staff';
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = role === 'admin' ? adminNavItems : staffNavItems;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex flex-col h-full">
            <div className="px-6 py-5 border-b">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-bold text-xl">Barber Shop</span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </SheetContent>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed z-40 top-4 left-4"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
      </Sheet>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r">
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">Barber Shop</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center bg-background/95 backdrop-blur border-b">
          <div className="container flex items-center justify-between">
            <div className="hidden md:block font-semibold">
              {role === 'admin' ? 'Admin Dashboard' : 'Staff Portal'}
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="default" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}