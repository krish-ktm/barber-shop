import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calendar, CreditCard, Home, Scissors, Settings, Users, Clock, ListCheck as ListChecklist, Percent, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, isActive }) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-2 h-10',
          isActive && 'bg-accent text-accent-foreground'
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathName = location.pathname;

  const sidebarItems = [
    {
      icon: <Home size={18} />,
      label: 'Dashboard',
      href: '/admin/dashboard',
    },
    {
      icon: <Calendar size={18} />,
      label: 'Appointments',
      href: '/admin/appointments',
    },
    {
      icon: <Users size={18} />,
      label: 'Customers',
      href: '/admin/customers',
    },
    {
      icon: <Scissors size={18} />,
      label: 'Staff Management',
      href: '/admin/staff-management',
    },
    {
      icon: <ListChecklist size={18} />,
      label: 'Services',
      href: '/admin/services',
    },
    {
      icon: <Package size={18} />,
      label: 'Products',
      href: '/admin/products',
    },
    {
      icon: <CreditCard size={18} />,
      label: 'POS & Invoices',
      href: '/admin/pos',
    },
    {
      icon: <Clock size={18} />,
      label: 'Slots',
      href: '/admin/slots',
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'Reports',
      href: '/admin/reports',
    },
    {
      icon: <Settings size={18} />,
      label: 'Settings',
      href: '/admin/settings',
    },
    {
      icon: <Percent size={18} />,
      label: 'GST Settings',
      href: '/admin/gst-settings',
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="py-4 px-3 h-full flex flex-col">
        
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathName === item.href}
            />
          ))}
        </div>
        
        <div className="mt-auto pt-4 px-3">
          <div className="bg-background border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Current version</p>
            <p className="text-sm font-medium">v1.0</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};