import React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StaffList } from '@/features/staff/StaffList';

export const Staff: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="View and manage your barber shop staff"
        action={{
          label: "Add Staff",
          onClick: () => {
            // Handle add staff action
            alert('Add staff clicked');
          },
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />
      
      <StaffList />
    </div>
  );
};